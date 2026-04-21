'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '40px', color: '#1a1a1a' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠️</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' }}>Something went wrong</h1>
        <p style={{ color: '#666', marginBottom: '32px', maxWidth: '400px' }}>
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={reset}
            style={{ padding: '12px 24px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Try again
          </button>
          <Link href="/" style={{ padding: '12px 24px', border: '2px solid #2e7d32', color: '#2e7d32', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
