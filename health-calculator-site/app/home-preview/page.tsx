'use client'
// PREVIEW ONLY — do not merge until audited
// Route: /home-preview

import Link from 'next/link'
import Image from 'next/image'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import { getAllPosts } from '@/lib/blog'

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-barlow',
  display: 'swap',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCENT   = '#f59e0b'
const GREEN    = '#22c55e'
const BG       = '#0d1a0f'
const BG2      = '#111f13'
const BG3      = '#162019'
const BORDER   = 'rgba(255,255,255,0.08)'
const MUTED    = '#7a9a80'

const CALCULATORS = [
  { label: 'TDEE CALCULATOR',    href: '/tdee-calculator' },
  { label: 'CALORIE DEFICIT',    href: '/calorie-deficit-calculator' },
  { label: 'BMI CALCULATOR',     href: '/bmi-calculator' },
  { label: 'IDEAL WEIGHT',       href: '/ideal-weight-calculator' },
  { label: 'MACRO CALCULATOR',   href: '/macro-calculator' },
]

const CAT_LABEL: Record<string, string> = {
  diet:    'INDIAN DIET',
  calorie: 'CALORIE GUIDE',
  fitness: 'FITNESS',
  weight:  'WEIGHT LOSS',
  yoga:    'YOGA',
  fasting: 'FASTING',
  recipe:  'RECIPE',
}

// ── Data ──────────────────────────────────────────────────────────────────────

function getLatest3() {
  return getAllPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePreview() {
  const posts = getLatest3()

  return (
    <div
      className={`${barlow.variable} ${dmSans.variable}`}
      style={{ background: BG, color: '#f1f5f2', fontFamily: 'var(--font-dm-sans, sans-serif)', minHeight: '100vh' }}
    >
      <Nav />
      <Hero />
      <FreeTools />
      <BlogSection posts={posts} />
      <LeadMagnet />
      <SiteFooter />
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(13,26,15,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/images/Nt-logo.png" alt="Nutrition Tracker" width={36} height={36} style={{ borderRadius: 8 }} />
          <span style={{ fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '.02em' }}>
            Nutrition Tracker
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { label: 'Home',        href: '/' },
            { label: 'Calculators', href: '/tdee-calculator' },
            { label: 'Database',    href: '/food-lookup' },
            { label: 'Blog',        href: '/blog' },
          ].map(l => (
            <Link key={l.label} href={l.href} style={{ color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link href="/get-your-meal-plan" style={{
          background: ACCENT, color: '#000', fontFamily: 'var(--font-barlow, sans-serif)',
          fontSize: 13, fontWeight: 800, letterSpacing: '.08em',
          padding: '10px 20px', borderRadius: 8, textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          GET MY MEAL PLAN →
        </Link>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 64 }}>

      {/* Background image */}
      <Image
        src="/images/Home page section 1.png"
        alt="Hero background"
        fill
        priority
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(120deg, rgba(13,26,15,0.96) 0%, rgba(13,26,15,0.82) 55%, rgba(13,26,15,0.45) 100%)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '80px 24px', width: '100%' }}>
        <div style={{ maxWidth: 680 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,197,94,0.12)', border: `1px solid rgba(34,197,94,0.3)`,
            borderRadius: 99, padding: '6px 14px', marginBottom: 28,
          }}>
            <span style={{ fontSize: 14 }}>🇮🇳</span>
            <span style={{ color: GREEN, fontSize: 12, fontWeight: 600, letterSpacing: '.1em' }}>
              FREE · BUILT FOR INDIAN BODIES
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 'clamp(48px, 7vw, 80px)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-.01em',
            textTransform: 'uppercase', color: '#fff', margin: '0 0 8px',
          }}>
            EAT RIGHT<br />FOR YOUR BODY.
          </h1>

          {/* Sub-headline */}
          <h2 style={{
            fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: '-.01em',
            textTransform: 'uppercase', margin: '0 0 28px',
          }}>
            LOSE WEIGHT THAT{' '}
            <span style={{ color: ACCENT }}>STAYS LOST.</span>
          </h2>

          {/* Body */}
          <p style={{
            fontSize: 17, lineHeight: 1.7, color: 'rgba(241,245,242,0.72)',
            maxWidth: 520, margin: '0 0 40px',
          }}>
            Science-backed calorie calculators, Indian diet guides, and practical weight loss advice — built for Indian bodies.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/get-your-meal-plan" style={{
              background: ACCENT, color: '#000',
              fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 15, fontWeight: 800, letterSpacing: '.08em',
              padding: '16px 32px', borderRadius: 10, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              GET MY MEAL PLAN →
            </Link>
            <Link href="/blog" style={{
              background: 'transparent', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.35)',
              fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 15, fontWeight: 700, letterSpacing: '.08em',
              padding: '16px 32px', borderRadius: 10, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              BROWSE FREE GUIDES →
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, marginTop: 52, flexWrap: 'wrap' }}>
            {[
              { num: '12,400+', label: 'Calories calculated' },
              { num: '8',       label: 'Free tools' },
              { num: '100%',    label: 'Indian food data' },
            ].map(s => (
              <div key={s.num}>
                <div style={{ fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 28, fontWeight: 900, color: ACCENT, lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4, letterSpacing: '.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Free Tools ────────────────────────────────────────────────────────────────

function FreeTools() {
  return (
    <section style={{ background: BG2, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 560 }}>

        {/* Left — image */}
        <div style={{ position: 'relative', minHeight: 480 }}>
          <Image
            src="/images/salad-home-page.png"
            alt="Healthy Indian food"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 70%, rgba(17,31,19,0.9) 100%)' }} />
        </div>

        {/* Right — card */}
        <div style={{ padding: '64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* Labels */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: ACCENT }}>
              START HERE — FREE TOOLS
            </span>
            <span style={{
              background: 'rgba(34,197,94,0.15)', border: `1px solid rgba(34,197,94,0.3)`,
              color: GREEN, fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
              padding: '3px 10px', borderRadius: 99,
            }}>
              NO LOGIN REQUIRED
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 'clamp(28px, 3vw, 40px)',
            fontWeight: 800, lineHeight: 1.15, color: '#fff', margin: '0 0 32px',
          }}>
            Everything you need to<br />manage your weight
          </h2>

          {/* Calculator buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CALCULATORS.map(calc => (
              <Link key={calc.href} href={calc.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: BG3, border: `1px solid ${BORDER}`,
                  borderRadius: 10, padding: '14px 20px',
                  transition: 'border-color .2s, background .2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = ACCENT
                    el.style.background = 'rgba(245,158,11,0.06)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = BORDER
                    el.style.background = BG3
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 15, fontWeight: 700,
                    letterSpacing: '.06em', color: '#f1f5f2',
                  }}>
                    {calc.label}
                  </span>
                  <span style={{ color: ACCENT, fontSize: 18, fontWeight: 700 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Blog Section ──────────────────────────────────────────────────────────────

function BlogSection({ posts }: { posts: ReturnType<typeof getLatest3> }) {
  return (
    <section style={{ background: BG, padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 900, color: ACCENT, margin: '0 0 8px', lineHeight: 1.1,
            }}>
              Weight loss guides for Indian bodies
            </h2>
            <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>
              Evidence-based articles for the Indian context.
            </p>
          </div>
          <Link href="/blog" style={{
            color: ACCENT, fontSize: 14, fontWeight: 600, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}>
            View all articles →
          </Link>
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BlogCard({ post }: { post: ReturnType<typeof getLatest3>[number] }) {
  const catLabel = CAT_LABEL[post.category] ?? post.category.toUpperCase()
  const dateStr  = new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <article style={{
      background: BG2, border: `1px solid ${BORDER}`, borderRadius: 14,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'border-color .2s, transform .2s',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(245,158,11,0.35)'
        el.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = BORDER
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 200, flexShrink: 0 }}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          style={{ objectFit: 'cover' }}
        />
        {/* Category badge */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{
            background: 'rgba(245,158,11,0.9)', color: '#000',
            fontSize: 10, fontWeight: 800, letterSpacing: '.1em',
            padding: '4px 10px', borderRadius: 99,
          }}>
            {catLabel}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 11, color: MUTED, margin: '0 0 10px' }}>
          {dateStr} · {post.readTime} min read
        </p>

        <h3 style={{
          fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 18, fontWeight: 700,
          color: '#f1f5f2', lineHeight: 1.3, margin: '0 0 10px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.title}
        </h3>

        <p style={{
          fontSize: 13, color: MUTED, lineHeight: 1.6, margin: '0 0 20px', flex: 1,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.excerpt}
        </p>

        <Link href={`/blog/${post.id}`} style={{
          color: ACCENT, fontSize: 13, fontWeight: 600, textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          Read more →
        </Link>
      </div>
    </article>
  )
}

// ── Lead Magnet ───────────────────────────────────────────────────────────────

function LeadMagnet() {
  return (
    <section style={{ background: BG3, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

        {/* Left — text */}
        <div>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '.15em', color: GREEN,
            display: 'block', marginBottom: 16,
          }}>
            FREE DOWNLOAD
          </span>

          <h2 style={{
            fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 'clamp(28px, 3.5vw, 44px)',
            fontWeight: 900, lineHeight: 1.1, color: '#fff', margin: '0 0 16px',
          }}>
            Your free 7-day<br />
            <span style={{ color: ACCENT }}>Indian meal plan</span>
          </h2>

          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.7, margin: '0 0 32px', maxWidth: 420 }}>
            Calorie-counted Indian meals for 7 days. No crash dieting. Real food your family will love.
          </p>

          {/* Email form */}
          <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 440 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="email"
                placeholder="Enter your email address"
                style={{
                  flex: 1, background: BG, border: `1px solid rgba(255,255,255,0.15)`,
                  borderRadius: 8, padding: '14px 16px', color: '#f1f5f2',
                  fontSize: 14, outline: 'none',
                }}
              />
              <button type="submit" style={{
                background: ACCENT, color: '#000', border: 'none',
                fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 13, fontWeight: 800, letterSpacing: '.07em',
                padding: '14px 20px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                SEND ME THE FREE PLAN →
              </button>
            </div>
            <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
              🔒 No Spam. Unsubscribe anytime.
            </p>
          </form>
        </div>

        {/* Right — booklet image */}
        <div style={{ position: 'relative', height: 420, borderRadius: 16, overflow: 'hidden' }}>
          <Image
            src="/images/Meal-Booklet.jpg"
            alt="7-day Indian meal plan booklet"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function SiteFooter() {
  return (
    <footer style={{ background: '#080f09', borderTop: `1px solid ${BORDER}`, padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/images/Nt-logo.png" alt="Nutrition Tracker" width={28} height={28} style={{ borderRadius: 6 }} />
          <span style={{ fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 15, fontWeight: 700, color: '#fff' }}>
            Nutrition Tracker
          </span>
        </div>
        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
          © {new Date().getFullYear()} NutritionTracker.in · For informational purposes only
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Privacy',    href: '/privacy-policy' },
            { label: 'Terms',      href: '/terms-of-use' },
            { label: 'Disclaimer', href: '/disclaimer' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ color: MUTED, fontSize: 12, textDecoration: 'none' }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
