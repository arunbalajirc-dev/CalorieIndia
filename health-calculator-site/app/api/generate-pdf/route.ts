import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { buildMealPlan } from '@/lib/planner';
import { renderTemplate } from '@/lib/template';

export const maxDuration = 60;
export const runtime = 'nodejs';

async function htmlToPdf(html: string): Promise<Buffer> {
  const token = process.env.BROWSERLESS_API_TOKEN;
  if (!token) throw new Error('BROWSERLESS_API_TOKEN not configured');

  const res = await fetch(`https://chrome.browserless.io/pdf?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html,
      options: {
        printBackground: true,
        format: 'A4',
        margin: { top: '15mm', bottom: '15mm', left: '20mm', right: '20mm' },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Browserless error ${res.status}: ${await res.text()}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  let user_plan_id: string | undefined;

  try {
    ({ user_plan_id } = await req.json());

    if (!user_plan_id) {
      return NextResponse.json({ error: 'user_plan_id required' }, { status: 400 });
    }

    // Fetch the plan row
    const { data: planRow, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('id', user_plan_id)
      .single();

    if (planError || !planRow) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const intakeData = planRow.intake_data ?? planRow;
    const goal: string = planRow.goal ?? intakeData.goal ?? 'lose';

    // Build meal plan with safe deficit logic
    const mealPlan = await buildMealPlan(intakeData, goal);

    // Render 7-page HTML
    const html = renderTemplate(mealPlan, intakeData);

    // Single Browserless call → PDF
    const pdfBuffer = await htmlToPdf(html);

    const pdfPath = `plans/${user_plan_id}.pdf`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('meal-plans')
      .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

    if (uploadError) throw uploadError;

    // Create signed URL (24 hours)
    const { data: signed } = await supabase.storage
      .from('meal-plans')
      .createSignedUrl(pdfPath, 60 * 60 * 24);

    await supabase
      .from('user_plans')
      .update({ status: 'ready', pdf_url: signed?.signedUrl ?? null, pdf_path: pdfPath })
      .eq('id', user_plan_id);

    return NextResponse.json({ success: true, pdf_url: signed?.signedUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[generate-pdf]', msg);
    if (user_plan_id) {
      await supabase.from('user_plans').update({ status: 'failed' }).eq('id', user_plan_id);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
