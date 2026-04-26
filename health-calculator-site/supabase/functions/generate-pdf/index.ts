import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabase-client.ts'
import { buildMealPlan } from './planner.ts'
import { renderChunk1, renderChunk2, renderChunk3 } from '../_shared/template.ts'

// ── helpers ───────────────────────────────────────────────────────────────────

async function htmlToPdfBytes(html: string, token: string): Promise<Uint8Array> {
  const res = await fetch(
    `https://chrome.browserless.io/pdf?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html,
        options: {
          printBackground: true,
          format: 'A4',
          margin: { top: '0', bottom: '0', left: '0', right: '0' },
        },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Browserless failed (${res.status}): ${err}`)
  }
  return new Uint8Array(await res.arrayBuffer())
}

async function mergePdfs(chunks: Uint8Array[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()
  for (const bytes of chunks) {
    const src = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(src, src.getPageIndices())
    pages.forEach(p => merged.addPage(p))
  }
  return merged.save()
}

// ── main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let user_plan_id: string | null = null

  try {
    const body = await req.json()
    user_plan_id = body.user_plan_id

    if (!user_plan_id) {
      return new Response(
        JSON.stringify({ error: 'user_plan_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Fetch plan from DB
    const { data: plan, error: planError } = await supabaseAdmin
      .from('user_plans')
      .select('id, goal, intake_data, status')
      .eq('id', user_plan_id)
      .single()

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Build meal plan data
    console.log(`Building meal plan for ${user_plan_id}, goal: ${plan.goal}`)
    const mealPlan = await buildMealPlan(plan.intake_data, plan.goal)

    // 3. Render 3 HTML chunks (≈3 pages each, ~95k chars each)
    const intake = plan.intake_data
    const [html1, html2, html3] = [
      renderChunk1(mealPlan, intake),
      renderChunk2(mealPlan, intake),
      renderChunk3(mealPlan, intake),
    ]
    console.log(`Chunks rendered: ${html1.length} / ${html2.length} / ${html3.length} chars`)

    // 4. Convert each chunk to PDF via Browserless (sequential to respect rate limits)
    const browserlessToken = Deno.env.get('BROWSERLESS_API_TOKEN')!
    console.log('Generating PDF chunk 1…')
    const pdf1 = await htmlToPdfBytes(html1, browserlessToken)
    console.log(`Chunk 1 PDF: ${pdf1.byteLength} bytes`)

    console.log('Generating PDF chunk 2…')
    const pdf2 = await htmlToPdfBytes(html2, browserlessToken)
    console.log(`Chunk 2 PDF: ${pdf2.byteLength} bytes`)

    console.log('Generating PDF chunk 3…')
    const pdf3 = await htmlToPdfBytes(html3, browserlessToken)
    console.log(`Chunk 3 PDF: ${pdf3.byteLength} bytes`)

    // 5. Merge all three PDFs into one
    console.log('Merging PDFs…')
    const merged = await mergePdfs([pdf1, pdf2, pdf3])
    console.log(`Merged PDF: ${merged.byteLength} bytes`)

    // 6. Upload to Supabase Storage
    const pdfPath = `plans/${user_plan_id}.pdf`
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('meal-plans')
      .upload(pdfPath, merged, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // 7. Generate signed URL (24 hours)
    const { data: signedData, error: signedError } = await supabaseAdmin
      .storage
      .from('meal-plans')
      .createSignedUrl(pdfPath, 86400)

    if (signedError || !signedData?.signedUrl) {
      throw new Error(`Signed URL generation failed: ${signedError?.message}`)
    }

    // 8. Update user_plans record
    await supabaseAdmin
      .from('user_plans')
      .update({
        status:   'ready',
        pdf_url:  signedData.signedUrl,
        pdf_path: pdfPath,
      })
      .eq('id', user_plan_id)

    console.log(`Plan ${user_plan_id} complete — status: ready`)

    return new Response(
      JSON.stringify({ success: true, pdf_url: signedData.signedUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('generate-pdf fatal error:', err)

    if (user_plan_id) {
      await supabaseAdmin
        .from('user_plans')
        .update({ status: 'failed' })
        .eq('id', user_plan_id)
        .catch(() => {})
    }

    return new Response(
      JSON.stringify({ error: 'PDF generation failed', detail: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
