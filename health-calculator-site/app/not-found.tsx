import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '60px 20px', color: '#1a1a1a' }}>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>404</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' }}>Page not found</h1>
        <p style={{ color: '#666', marginBottom: '32px', maxWidth: '400px' }}>
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-calc" style={{ display: 'inline-block', textDecoration: 'none' }}>
          ← Back to home
        </Link>
      </div>
      <Footer />
    </>
  );
}
