// DEPRECATED: This route is no longer called by the payment flow.
// PDF generation is handled by the Supabase Edge Function:
// https://clutyaynlukgsumnopkf.supabase.co/functions/v1/generate-pdf
// See app/api/handle-payment/route.ts for the active PDF trigger.

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  let user_plan_id: string | undefined;

  try {
    ({ user_plan_id } = await req.json());

    if (!user_plan_id) {
      return NextResponse.json({ error: 'user_plan_id required' }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('id', user_plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const browserlessToken = process.env.BROWSERLESS_API_TOKEN;
    if (!browserlessToken) {
      throw new Error('Browserless token not configured');
    }

    // Generate HTML for the PDF
    const html = buildPlanHtml(plan);

    // Call Browserless to convert HTML → PDF
    const pdfRes = await fetch(
      `https://chrome.browserless.io/pdf?token=${browserlessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          options: { format: 'A4', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' } },
        }),
      },
    );

    if (!pdfRes.ok) {
      throw new Error(`Browserless error: ${await pdfRes.text()}`);
    }

    const pdfBytes = await pdfRes.arrayBuffer();
    const pdfPath = `plans/${user_plan_id}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('meal-plans')
      .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) throw uploadError;

    const { data: signed } = await supabase.storage
      .from('meal-plans')
      .createSignedUrl(pdfPath, 60 * 60 * 24); // 24 hours

    await supabase
      .from('user_plans')
      .update({ status: 'ready', pdf_url: signed?.signedUrl ?? null, pdf_path: pdfPath })
      .eq('id', user_plan_id);

    return NextResponse.json({ success: true, pdf_url: signed?.signedUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (user_plan_id) {
      await supabase.from('user_plans').update({ status: 'failed' }).eq('id', user_plan_id);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildPlanHtml(plan: Record<string, unknown>): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #1a1a1a; }
  h1 { color: #2e7d32; }
  .label { font-size: 12px; color: #666; text-transform: uppercase; }
</style>
</head>
<body>
  <h1>Your 7-Day Indian Meal Plan</h1>
  <p class="label">Generated for plan ID: ${String(plan.id)}</p>
  <p>Your personalised meal plan is being prepared. Please check back shortly.</p>
</body>
</html>`;
}
