import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { amount, receipt, user_plan_id } = await req.json();

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Payment configuration missing' }, { status: 500 });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'INR',
        receipt,
        payment_capture: 1,
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.text();
      return NextResponse.json({ error: err }, { status: rzpRes.status });
    }

    const order = await rzpRes.json();

    const supabase = createServerClient();
    await supabase.from('payments').insert({
      user_plan_id,
      razorpay_order_id: order.id,
      amount: 249,
      status: 'created',
    });

    return NextResponse.json({ ...order, key_id: keyId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
