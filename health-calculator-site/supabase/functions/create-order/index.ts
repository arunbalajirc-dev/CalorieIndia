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

    // Verify user_plan exists and is in draft status
    const { data: plan, error: planError } = await supabaseAdmin
      .from('user_plans')
      .select('id, status, email')
      .eq('id', user_plan_id)
      .single()

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (plan.status !== 'draft') {
      return new Response(
        JSON.stringify({ error: `Plan is already in status: ${plan.status}` }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Razorpay order
    const razorpayKeyId     = Deno.env.get('RAZORPAY_KEY_ID')!
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
    const credentials       = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 25000,           // ₹250 in paise
        currency: 'INR',
        receipt: user_plan_id.slice(0, 40),
        notes: {
          user_plan_id,          // ← critical: links Razorpay payment back to plan
          email: plan.email
        }
      })
    })

    if (!razorpayRes.ok) {
      const err = await razorpayRes.text()
      console.error('Razorpay order creation failed:', err)
      return new Response(
        JSON.stringify({ error: 'Failed to create payment order' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const order = await razorpayRes.json()

    return new Response(
      JSON.stringify({
        razorpay_order_id: order.id,
        amount:            order.amount,
        currency:          order.currency,
        razorpay_key_id:   razorpayKeyId   // safe to return — this is the public key
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('create-order error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
