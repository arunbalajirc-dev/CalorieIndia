import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabase-client.ts'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { event, payload } = body

    // Only handle payment captured events
    if (event !== 'payment.captured') {
      return new Response(JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const payment           = payload.payment.entity
    const razorpayOrderId   = payment.order_id
    const razorpayPaymentId = payment.id
    const razorpaySignature = req.headers.get('x-razorpay-signature') ?? ''

    // Verify webhook signature
    const secret    = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!
    const bodyText  = JSON.stringify(body)
    const expected  = createHmac('sha256', secret)
                        .update(bodyText)
                        .digest('hex')

    if (expected !== razorpaySignature) {
      console.error('Invalid Razorpay webhook signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Extract user_plan_id from order notes
    const userPlanId = payment.notes?.user_plan_id
    if (!userPlanId) {
      console.error('No user_plan_id in payment notes')
      return new Response(JSON.stringify({ error: 'Missing user_plan_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Insert into payments table
    const { data: paymentRow, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_plan_id:        userPlanId,
        razorpay_order_id:   razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        amount_paise:        payment.amount,
        currency:            payment.currency,
        verified:            true
      })
      .select('id')
      .single()

    if (paymentError) {
      console.error('Failed to insert payment:', paymentError)
      return new Response(JSON.stringify({ error: 'DB insert failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Update user_plans status to generating
    await supabaseAdmin
      .from('user_plans')
      .update({
        status:     'generating',
        payment_id: paymentRow.id
      })
      .eq('id', userPlanId)

    // Fire-and-forget: invoke Vercel generate-pdf
    fetch('https://nutritiontracker.in/api/generate-pdf', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_plan_id: userPlanId })
    }).catch(err => console.error('Failed to invoke generate-pdf:', err))

    // Return 200 immediately — Razorpay requires fast response
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('handle-payment error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
