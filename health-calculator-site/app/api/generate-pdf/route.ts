export const maxDuration = 60
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildMealPlan } from './planner'
import { renderTemplate } from './template'

async function htmlToPdf(html: string): Promise<Buffer> {
  const token = process.env.BROWSERLESS_API_TOKEN
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
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Browserless failed: ${res.status} ${err}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  let user_plan_id: string | undefined

  try {
    ;({ user_plan_id } = await req.json())

    if (!user_plan_id) {
      return NextResponse.json({ error: 'user_plan_id required' }, { status: 400 })
    }

    const { data: plan, error: planError } = await supabase
      .from('user_plans')
      .select('id, goal, intake_data, status')
      .eq('id', user_plan_id)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const mealPlan = await buildMealPlan(plan.intake_data, plan.goal)
    const html = renderTemplate(mealPlan, plan.intake_data)
    const pdfBytes = await htmlToPdf(html)

    const pdfPath = `plans/${user_plan_id}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('meal-plans')
      .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: true })

    if (uploadError) throw uploadError

    const { data: signed } = await supabase.storage
      .from('meal-plans')
      .createSignedUrl(pdfPath, 86400)

    await supabase
      .from('user_plans')
      .update({ status: 'ready', pdf_url: signed?.signedUrl ?? null, pdf_path: pdfPath })
      .eq('id', user_plan_id)

    return NextResponse.json({ success: true, pdf_url: signed?.signedUrl })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    if (user_plan_id) {
      await supabase.from('user_plans').update({ status: 'failed' }).eq('id', user_plan_id)
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
