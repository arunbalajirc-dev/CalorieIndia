import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

async function hmacSHA256Hex(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      return json({ error: 'Payment configuration missing' }, 500);
    }

    const expected = await hmacSHA256Hex(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      keySecret,
    );

    if (expected !== razorpay_signature) {
      return json({ error: 'Invalid signature' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({ status: 'paid', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('user_plan_id')
      .single();

    if (updateError || !payment) {
      return json({ error: 'Failed to update payment record' }, 500);
    }

    // Fire-and-forget PDF generation — payment is already confirmed
    supabase.functions
      .invoke('generate-pdf', { body: { user_plan_id: payment.user_plan_id } })
      .catch(() => {/* PDF errors are handled separately */});

    return json({ success: true, payment_id: razorpay_payment_id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return json({ error: msg }, 500);
  }
});
