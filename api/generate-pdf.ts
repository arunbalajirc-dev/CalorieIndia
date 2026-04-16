import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { buildMealPlan } from './lib/planner'
import { renderTemplate } from './lib/template'

const ALLOWED_ORIGINS = [
  'https://calorieIndia.in',
  'http://localhost:3000',
]

function getCorsHeaders(origin: string | undefined): Record<string, string> {
  const allowed =
    ALLOWED_ORIGINS.includes(origin ?? '') ||
    /^https:\/\/.*\.vercel\.app$/.test(origin ?? '')
      ? origin!
      : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined
  const corsHeaders = getCorsHeaders(origin)

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_plan_id } = req.body ?? {}

  if (!user_plan_id) {
    return res.status(400).json({ error: 'user_plan_id is required' })
  }

  const db = supabase()

  // ── 1. Fetch plan from user_plans ────────────────────────────────────────
  const { data: plan, error: planError } = await db
    .from('user_plans')
    .select('*')
    .eq('id', user_plan_id)
    .single()

  if (planError || !plan) {
    return res.status(404).json({
      error: 'Plan not found',
      detail: planError?.message ?? 'No row returned',
    })
  }

  try {
    // ── 2. Build meal plan ──────────────────────────────────────────────────
    const mealPlan = await buildMealPlan(plan.intake_data, plan.goal)

    // ── 3. Render HTML ──────────────────────────────────────────────────────
    const html = renderTemplate(mealPlan, plan.intake_data)

    // ── 4. Generate PDF via Browserless ────────────────────────────────────
    const browserlessRes = await fetch(
      `https://chrome.browserless.io/pdf?token=${process.env.BROWSERLESS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          options: {
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
          },
        }),
      }
    )

    if (!browserlessRes.ok) {
      const detail = await browserlessRes.text()
      throw new Error(`Browserless error ${browserlessRes.status}: ${detail}`)
    }

    const pdfBuffer = Buffer.from(await browserlessRes.arrayBuffer())

    // ── 5. Upload PDF to Supabase Storage ───────────────────────────────────
    const pdfPath = `plans/${user_plan_id}.pdf`

    const { error: uploadError } = await db.storage
      .from('meal-plans')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // ── 6. Generate signed URL (24 h) ───────────────────────────────────────
    const { data: signedData, error: signedError } = await db.storage
      .from('meal-plans')
      .createSignedUrl(pdfPath, 86400)

    if (signedError || !signedData?.signedUrl) {
      throw new Error(`Signed URL failed: ${signedError?.message ?? 'no URL returned'}`)
    }

    const pdfUrl = signedData.signedUrl

    // ── 7. Update user_plans ─────────────────────────────────────────────────
    const { error: updateError } = await db
      .from('user_plans')
      .update({
        status: 'ready',
        pdf_url: pdfUrl,
        pdf_path: pdfPath,
      })
      .eq('id', user_plan_id)

    if (updateError) {
      throw new Error(`DB update failed: ${updateError.message}`)
    }

    return res.status(200).json({ success: true, pdf_url: pdfUrl })
  } catch (err: any) {
    console.error('[generate-pdf] error:', err)

    // Mark plan as failed — best-effort, don't throw again
    await db
      .from('user_plans')
      .update({ status: 'failed' })
      .eq('id', user_plan_id)
      .then()

    return res.status(500).json({
      error: 'PDF generation failed',
      detail: err?.message ?? String(err),
    })
  }
}
