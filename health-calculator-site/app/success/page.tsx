'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [ready, setReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const poll = useCallback(async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/check-plan?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.ready && data.downloadUrl) {
        setReady(true);
        setDownloadUrl(data.downloadUrl);
      }
    } catch {
      // silently retry
    }
    setAttempts((n) => n + 1);
  }, [email]);

  useEffect(() => {
    poll();
    const interval = setInterval(() => {
      if (!ready) poll();
    }, 5000);
    return () => clearInterval(interval);
  }, [poll, ready]);

  return (
    <>
      <Navbar />

      <div className="content-wrap" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px', color: '#1a1a1a' }}>
          Payment Successful!
        </h1>

        {!ready ? (
          <>
            <p style={{ fontSize: '1.1rem', color: '#555', maxWidth: '480px', lineHeight: 1.7, marginBottom: '12px' }}>
              Your personalised 7-day Indian meal plan is being generated. This usually takes under a minute.
            </p>
            <p style={{ fontSize: '0.95rem', color: '#888', marginBottom: '32px' }}>
              We&apos;ll also send the download link to <strong>{email || 'your email'}</strong>.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2e7d32', fontWeight: 600 }}>
              <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid #2e7d32', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Generating your plan{attempts > 0 ? ` (checking… ${attempts})` : ''}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        ) : (
          <>
            <p style={{ fontSize: '1.1rem', color: '#2e7d32', fontWeight: 600, marginBottom: '24px' }}>
              Your meal plan is ready!
            </p>
            <a
              href={downloadUrl ?? '#'}
              download="your-meal-plan.pdf"
              className="btn-calc"
              style={{ display: 'inline-block', textDecoration: 'none', fontSize: '1rem' }}
            >
              Download Your Meal Plan (PDF) →
            </a>
          </>
        )}

        <Link href="/" style={{ marginTop: '48px', color: '#888', fontSize: '0.9rem' }}>
          ← Back to home
        </Link>
      </div>

      <Footer />
    </>
  );
}
