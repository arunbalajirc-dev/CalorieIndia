import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabase-client.ts'
import { buildMealPlan } from './planner.ts'
import { renderTemplate } from './template.ts'

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

    // 2. Build meal plan
    console.log(`Building meal plan for ${user_plan_id}, goal: ${plan.goal}`)
    const mealPlan = await buildMealPlan(plan.intake_data, plan.goal)

    // 3. Render HTML template
    const html = renderTemplate(mealPlan)
    console.log(`HTML rendered, length: ${html.length} chars`)

    // 4. Call Browserless to generate PDF
    const browserlessToken = Deno.env.get('BROWSERLESS_API_TOKEN')!
    const browserlessRes = await fetch(
      `https://chrome.browserless.io/pdf?token=${browserlessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          options: {
            printBackground: true,
            format:          'A4',
            margin: {
              top:    '15mm',
              bottom: '15mm',
              left:   '20mm',
              right:  '20mm'
            }
          }
        })
      }
    )

    if (!browserlessRes.ok) {
      const errText = await browserlessRes.text()
      console.error('Browserless error:', errText)
      throw new Error(`Browserless failed: ${browserlessRes.status} ${errText}`)
    }

    const pdfBytes = await browserlessRes.arrayBuffer()
    console.log(`PDF generated, size: ${pdfBytes.byteLength} bytes`)

    // 5. Upload to Supabase Storage
    const pdfPath = `plans/${user_plan_id}.pdf`
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('meal-plans')
      .upload(pdfPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert:      true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // 6. Generate signed URL (24 hours)
    const { data: signedData, error: signedError } = await supabaseAdmin
      .storage
      .from('meal-plans')
      .createSignedUrl(pdfPath, 86400)

    if (signedError || !signedData?.signedUrl) {
      throw new Error(`Signed URL generation failed: ${signedError?.message}`)
    }

    // 7. Update user_plans
    await supabaseAdmin
      .from('user_plans')
      .update({
        status:   'ready',
        pdf_url:  signedData.signedUrl,
        pdf_path: pdfPath
      })
      .eq('id', user_plan_id)

    console.log(`Plan ${user_plan_id} complete — status: ready`)

    return new Response(
      JSON.stringify({ success: true, pdf_url: signedData.signedUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('generate-pdf fatal error:', err)

    // Mark plan as failed so frontend can show retry
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
