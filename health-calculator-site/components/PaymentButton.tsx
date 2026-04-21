'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface PaymentButtonProps {
  amount: number;
  planData: Record<string, unknown>;
  userEmail?: string;
  label?: string;
}

export default function PaymentButton({ amount, planData, userEmail, label = 'Get My Meal Plan — ₹249' }: PaymentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt: `receipt_${Date.now()}`, user_plan_id: planData.user_plan_id }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error ?? 'Failed to create order');
      }

      const order = await orderRes.json();

      const options: RazorpayOptions = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency ?? 'INR',
        name: 'NutritionTracker.in',
        description: 'Personalized 7-Day Indian Meal Plan',
        order_id: order.id,
        prefill: { email: userEmail },
        theme: { color: '#2e7d32' },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/handle-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planData,
              }),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error ?? 'Payment verification failed');
            }

            router.push(`/success?email=${encodeURIComponent(userEmail ?? '')}`);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div>
        <button
          className="btn-calc"
          onClick={handleClick}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Processing…' : label}
        </button>
        {error && (
          <p style={{ color: '#c62828', fontSize: '13px', marginTop: '8px' }}>{error}</p>
        )}
      </div>
    </>
  );
}
