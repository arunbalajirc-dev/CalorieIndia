import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: 'Payment configuration missing' }, { status: 500 });
    }

    const expected = createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({ status: 'paid', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('user_plan_id')
      .single();

    if (updateError || !payment) {
      return NextResponse.json({ error: 'Failed to update payment record' }, { status: 500 });
    }

    // Fire-and-forget PDF generation via Vercel API route
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nutritiontracker.in';
    fetch(`${siteUrl}/api/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_plan_id: payment.user_plan_id }),
    }).catch(() => { /* PDF errors logged inside generate-pdf route */ });

    return NextResponse.json({ success: true, payment_id: razorpay_payment_id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
