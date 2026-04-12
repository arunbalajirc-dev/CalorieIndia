import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabase-client.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_plan_id } = await req.json()

    if (!user_plan_id) {
      return new Response(
        JSON.stringify({ error: 'user_plan_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: planner + template + browserless logic comes in feat/pdf-template
    // For now, just verify the plan exists and return scaffold response
    const { data: plan, error } = await supabaseAdmin
      .from('user_plans')
      .select('id, status, intake_data, goal')
      .eq('id', user_plan_id)
      .single()

    if (error || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`generate-pdf scaffold called for plan ${user_plan_id}, goal: ${plan.goal}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'generate-pdf scaffold OK — full implementation in feat/pdf-template',
        plan_id: user_plan_id,
        goal:    plan.goal
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('generate-pdf error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
