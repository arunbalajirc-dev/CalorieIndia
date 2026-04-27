'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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

const ACCENT = '#f59e0b'
const GREEN  = '#22c55e'
const BG     = '#0d1a0f'
const BG2    = '#111f13'
const BG3    = '#162019'
const BORDER = 'rgba(255,255,255,0.08)'
const MUTED  = '#7a9a80'

const CALCULATORS = [
  { label: 'TDEE CALCULATOR',  href: '/tdee-calculator' },
  { label: 'CALORIE DEFICIT',  href: '/calorie-deficit-calculator' },
  { label: 'BMI CALCULATOR',   href: '/bmi-calculator' },
  { label: 'IDEAL WEIGHT',     href: '/ideal-weight-calculator' },
  { label: 'MACRO CALCULATOR', href: '/macro-calculator' },
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

function getLatest3() {
  return getAllPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
}

export default function HomePage() {
  const posts = getLatest3()

  return (
    <div
      className={`${barlow.variable} ${dmSans.variable}`}
      style={{ background: BG, color: '#f1f5f2', fontFamily: 'var(--font-dm-sans, sans-serif)', minHeight: '100vh' }}
    >
      <Navbar />
      <Hero />
      <FreeTools />
      <BlogSection posts={posts} />
      <LeadMagnet />
      <Footer />
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 64 }}>

      <Image
        src="/images/Home page section 1.png"
        alt="Hero background"
        fill
        priority
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(120deg, rgba(13,26,15,0.96) 0%, rgba(13,26,15,0.82) 55%, rgba(13,26,15,0.45) 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <div style={{ maxWidth: 680 }}>

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

          <h1 style={{
            fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 'clamp(48px, 7vw, 80px)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-.01em',
            textTransform: 'uppercase', color: '#fff', margin: '0 0 8px',
          }}>
            EAT RIGHT<br />FOR YOUR BODY.
          </h1>

          <h2 style={{
            fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: '-.01em',
            textTransform: 'uppercase', margin: '0 0 28px',
          }}>
            LOSE WEIGHT THAT{' '}
            <span style={{ color: ACCENT }}>STAYS LOST.</span>
          </h2>

          <p style={{
            fontSize: 17, lineHeight: 1.7, color: 'rgba(241,245,242,0.72)',
            maxWidth: 520, margin: '0 0 40px',
          }}>
            Science-backed calorie calculators, Indian diet guides, and practical weight loss advice — built for Indian bodies.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link
              href="/get-your-meal-plan"
              style={{
                background: ACCENT, color: '#000',
                fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 15, fontWeight: 800, letterSpacing: '.08em',
                padding: '16px 32px', borderRadius: 10, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = `0 8px 28px rgba(245,158,11,0.45)`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              GET MY MEAL PLAN →
            </Link>
            <Link
              href="/blog"
              style={{
                background: 'transparent', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 15, fontWeight: 700, letterSpacing: '.08em',
                padding: '16px 32px', borderRadius: 10, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = 'rgba(34,197,94,0.12)'
                el.style.borderColor = GREEN
                el.style.color = GREEN
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.background = 'transparent'
                el.style.borderColor = 'rgba(255,255,255,0.35)'
                el.style.color = '#fff'
              }}
            >
              BROWSE FREE GUIDES →
            </Link>
          </div>

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

        <div style={{ position: 'relative', minHeight: 480 }}>
          <Image
            src="/images/salad-home-page.png"
            alt="Healthy Indian food"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 70%, rgba(17,31,19,0.9) 100%)' }} />
        </div>

        <div style={{ padding: '64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CALCULATORS.map(calc => (
              <Link key={calc.href} href={calc.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: BG3, border: `1px solid ${BORDER}`,
                  borderRadius: 10, padding: '14px 20px', cursor: 'pointer',
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
          <Link
            href="/blog"
            style={{
              color: ACCENT, fontSize: 14, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              transition: 'gap 0.18s ease, opacity 0.18s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.gap = '12px'
              el.style.opacity = '0.85'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.gap = '6px'
              el.style.opacity = '1'
            }}
          >
            View all articles →
          </Link>
        </div>

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
    <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none', display: 'block' }}>
    <article style={{
      background: BG2, border: `1px solid ${BORDER}`, borderRadius: 14,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'border-color 0.18s ease, transform 0.18s ease', cursor: 'pointer',
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
      <div style={{ position: 'relative', height: 200, flexShrink: 0 }}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          style={{ objectFit: 'cover' }}
        />
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

        <span style={{
          color: ACCENT, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          Read more →
        </span>
      </div>
    </article>
    </Link>
  )
}

// ── Lead Magnet ───────────────────────────────────────────────────────────────

function LeadMagnet() {
  return (
    <section style={{ background: BG3, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{
              background: ACCENT, color: '#000',
              fontSize: 13, fontWeight: 800, letterSpacing: '.1em',
              padding: '5px 14px', borderRadius: 99,
            }}>
              ₹249
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.15em', color: GREEN }}>
              PERSONALISED PLAN
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 'clamp(28px, 3.5vw, 44px)',
            fontWeight: 900, lineHeight: 1.1, color: '#fff', margin: '0 0 16px',
          }}>
            Your <span style={{ color: ACCENT }}>personalised</span><br />
            7-day Indian meal plan
          </h2>

          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.7, margin: '0 0 32px', maxWidth: 420 }}>
            Calorie-counted Indian meals built around your weight, goal, and lifestyle. No crash dieting. Real food your family will love.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 440 }}>
            <Link
              href="/get-your-meal-plan"
              style={{
                background: ACCENT, color: '#000', border: 'none',
                fontFamily: 'var(--font-barlow, sans-serif)', fontSize: 15, fontWeight: 800, letterSpacing: '.07em',
                padding: '16px 32px', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = `0 8px 28px rgba(245,158,11,0.45)`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              GET MY MEAL PLAN →
            </Link>
            <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
              🔒 Instant download after checkout. One-time payment.
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', height: 460, borderRadius: 16, overflow: 'hidden' }}>
          <Image
            src="/images/Meal-booklet.png"
            alt="Personalised Indian meal plan booklet"
            fill
            style={{ objectFit: 'contain', objectPosition: 'center' }}
          />
        </div>
      </div>
    </section>
  )
}
