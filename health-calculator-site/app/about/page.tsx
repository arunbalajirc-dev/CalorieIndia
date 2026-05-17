import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About NutritionTracker.in — Built for Indian Bodies',
  description: 'Learn why we built NutritionTracker.in — India-specific calorie counts, Asian BMI standards, and health calculators designed for Indian bodies and lifestyles.',
};

const BG = '#0D1A0F';
const BG2 = '#111F13';
const CARD = '#16201A';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#F1F5F2';
const MUTED = '#7A9A80';
const AMBER = '#F59E0B';
const GREEN = '#22C55E';

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': 'https://nutritiontracker.in/about',
      url: 'https://nutritiontracker.in/about',
      name: 'About NutritionTracker.in',
      description: 'India-specific nutrition tracking and health calculators built for Indian bodies, diets, and lifestyles.',
      isPartOf: { '@id': 'https://nutritiontracker.in/#website' },
      publisher: { '@id': 'https://nutritiontracker.in/#organization' },
    },
    {
      '@type': 'Organization',
      '@id': 'https://nutritiontracker.in/#organization',
      name: 'NutritionTracker.in',
      url: 'https://nutritiontracker.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nutritiontracker.in/images/nutrition-tracker-logo.png',
      },
      sameAs: [],
    },
  ],
};

const TOOLS = [
  { name: 'TDEE Calculator', desc: 'Total Daily Energy Expenditure with Indian activity-level defaults', href: '/tdee-calculator' },
  { name: 'BMI Calculator', desc: 'Asian BMI cutoffs (23 overweight, 25 obese) — not the incorrect Western thresholds', href: '/bmi-calculator' },
  { name: 'Calorie Calculator', desc: 'Maintenance + deficit targets using Mifflin-St Jeor, adjusted for South Asian metabolism', href: '/calculator' },
  { name: 'Macro Calculator', desc: 'Protein, carb, and fat splits calibrated to Indian dietary patterns', href: '/calculator' },
  { name: 'Ideal Weight Calculator', desc: 'Healthy weight ranges based on Asian-specific research, not Western population data', href: '/calculator' },
  { name: 'Calorie Deficit Calculator', desc: 'Safe, sustainable deficit ranges with Indian body composition in mind', href: '/calculator' },
  { name: 'Food Database', desc: 'Thousands of Indian foods — dal, sabzi, regional dishes — with verified calorie data', href: '/food-database' },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ background: BG, padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(34,197,94,0.12)',
            color: GREEN,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '6px 16px',
            borderRadius: 100,
            marginBottom: 24,
          }}>
            About Us
          </div>
          <h1 style={{
            fontFamily: 'var(--font-barlow, sans-serif)',
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            color: TEXT,
            lineHeight: 1.15,
            margin: '0 0 20px',
          }}>
            Built for Indian Bodies.<br />By People Who Needed It.
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '1.1rem',
            color: MUTED,
            lineHeight: 1.7,
            margin: 0,
          }}>
            Every calorie tracker we tried was built for the West. The food database had no dal. The BMI chart called healthy Indians overweight by the wrong standard. We built NutritionTracker.in to fix that.
          </p>
        </div>
      </section>

      {/* ── 01 The Problem ── */}
      <section style={{ background: BG2, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <span style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: AMBER,
              background: 'rgba(245,158,11,0.12)',
              padding: '4px 12px',
              borderRadius: 100,
              letterSpacing: '0.1em',
            }}>01</span>
            <h2 style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: TEXT,
              margin: 0,
            }}>The Problem With Generic Tools</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                title: 'Wrong Food Data',
                body: 'Most apps have zero entries for idli, poha, or sambar. You end up logging "rice" and guessing the rest. That\'s not tracking — that\'s fiction.',
              },
              {
                title: 'Wrong BMI Cutoffs',
                body: 'The Western BMI chart says 24.9 is healthy. But South Asian research shows Indians face metabolic risk from BMI 23. Using the wrong chart gives you a false sense of safety.',
              },
              {
                title: 'Wrong Metabolic Assumptions',
                body: 'TDEE formulas were built on Western populations. Indians on average have lower muscle mass and different metabolic rates — a one-size-fits-all calculator will be off.',
              },
            ].map((card) => (
              <div key={card.title} style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: 28,
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-barlow, sans-serif)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: TEXT,
                  margin: '0 0 12px',
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '0.95rem',
                  color: MUTED,
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 02 What We Built ── */}
      <section style={{ background: BG, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <span style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: AMBER,
              background: 'rgba(245,158,11,0.12)',
              padding: '4px 12px',
              borderRadius: 100,
              letterSpacing: '0.1em',
            }}>02</span>
            <h2 style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: TEXT,
              margin: 0,
            }}>What We Built</h2>
          </div>
          <p style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '1rem',
            color: MUTED,
            marginBottom: 32,
            maxWidth: 640,
          }}>
            A suite of free tools calibrated to Indian bodies, Indian food, and Indian research — no login, no paywall.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOOLS.map((tool) => (
              <Link key={tool.name} href={tool.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 20,
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: GREEN,
                    marginTop: 8,
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-barlow, sans-serif)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: TEXT,
                      marginBottom: 4,
                    }}>
                      {tool.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans, sans-serif)',
                      fontSize: '0.9rem',
                      color: MUTED,
                      lineHeight: 1.5,
                    }}>
                      {tool.desc}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 Data Sources ── */}
      <section style={{ background: BG2, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <span style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: AMBER,
              background: 'rgba(245,158,11,0.12)',
              padding: '4px 12px',
              borderRadius: 100,
              letterSpacing: '0.1em',
            }}>03</span>
            <h2 style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: TEXT,
              margin: 0,
            }}>Our Data Sources</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                title: 'ICMR & NIN Food Composition Tables',
                body: 'Our food database draws from the Indian Council of Medical Research and National Institute of Nutrition tables — the gold standard for Indian food composition data.',
              },
              {
                title: 'WHO Asian BMI Expert Panel',
                body: 'BMI cutoffs follow the WHO Expert Consultation on BMI for Asian Populations (2004) and subsequent Indian-specific research from AIIMS and PGI Chandigarh.',
              },
              {
                title: 'Peer-Reviewed South Asian Research',
                body: 'TDEE and metabolic formulas are cross-referenced against South Asian cohort studies published in The Lancet, JAPI, and Indian Journal of Endocrinology.',
              },
            ].map((card) => (
              <div key={card.title} style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: 28,
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-barlow, sans-serif)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: GREEN,
                  margin: '0 0 12px',
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '0.95rem',
                  color: MUTED,
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 Who This Is For ── */}
      <section style={{ background: BG, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <span style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: AMBER,
              background: 'rgba(245,158,11,0.12)',
              padding: '4px 12px',
              borderRadius: 100,
              letterSpacing: '0.1em',
            }}>04</span>
            <h2 style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: TEXT,
              margin: 0,
            }}>Who This Is For</h2>
          </div>
          <div style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            padding: '36px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 28,
          }}>
            {[
              'Indians who eat home-cooked meals and need accurate data for dal, roti, sabzi, and rice dishes',
              'People told they\'re "overweight" by Western BMI charts and want an accurate Indian-standard assessment',
              'Anyone whose doctor has asked them to track calories but every app feels built for someone else',
              'Fitness beginners who want simple, jargon-free tools that just work',
              'NRIs and diaspora who still eat Indian food and want nutrition data that reflects it',
              'Anyone tired of paying for apps that don\'t have idli in their food database',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: GREEN, fontSize: '1.1rem', marginTop: 2, flexShrink: 0 }}>✓</span>
                <p style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '0.92rem',
                  color: MUTED,
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 Our Commitment ── */}
      <section style={{ background: BG2, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <span style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: AMBER,
              background: 'rgba(245,158,11,0.12)',
              padding: '4px 12px',
              borderRadius: 100,
              letterSpacing: '0.1em',
            }}>05</span>
            <h2 style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: TEXT,
              margin: 0,
            }}>Our Commitment</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                title: 'Always Free',
                body: 'Every calculator, every food lookup, every tool on this site is free — no account required, no paywall, no trial that expires. We cover costs through non-intrusive advertising.',
              },
              {
                title: 'No Pseudoscience',
                body: 'We don\'t sell detox plans, miracle supplements, or crash diets. Every recommendation we make is backed by peer-reviewed research and standard clinical guidelines.',
              },
              {
                title: 'India-First',
                body: 'When new research emerges on South Asian nutrition or metabolic health, we update our calculators to reflect it. This site will always be built around Indian bodies — not adapted from Western defaults.',
              },
            ].map((card) => (
              <div key={card.title} style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: 28,
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-barlow, sans-serif)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: TEXT,
                  margin: '0 0 12px',
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '0.95rem',
                  color: MUTED,
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 Meal Plan CTA ── */}
      <section style={{ background: BG, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(245,158,11,0.08) 100%)',
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            padding: '56px 40px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 800,
              color: TEXT,
              margin: '0 0 16px',
            }}>
              Want a Personalised Indian Meal Plan?
            </h2>
            <p style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '1rem',
              color: MUTED,
              lineHeight: 1.65,
              margin: '0 0 32px',
            }}>
              Get a custom weekly meal plan built around your TDEE, your food preferences, and real Indian ingredients — delivered free to your inbox.
            </p>
            <Link href="/get-your-meal-plan" style={{
              display: 'inline-block',
              background: GREEN,
              color: '#0D1A0F',
              fontFamily: 'var(--font-barlow, sans-serif)',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '14px 32px',
              borderRadius: 10,
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}>
              Get My Meal Plan →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 07 Contact ── */}
      <section style={{ background: BG2, padding: '80px 24px 100px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-barlow, sans-serif)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: TEXT,
            margin: '0 0 16px',
          }}>
            Get in Touch
          </h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '1rem',
            color: MUTED,
            lineHeight: 1.65,
            margin: '0 0 12px',
          }}>
            Found an error in our food data? Have a suggestion for a new calculator? We read every message.
          </p>
          <p style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '1rem',
            color: MUTED,
            margin: '0 0 32px',
          }}>
            Email us at{' '}
            <a href="mailto:hello@nutritiontracker.in" style={{ color: GREEN, textDecoration: 'none' }}>
              hello@nutritiontracker.in
            </a>
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/disclaimer" style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '0.9rem',
              color: MUTED,
              textDecoration: 'none',
            }}>
              Medical Disclaimer
            </Link>
            <span style={{ color: BORDER }}>·</span>
            <Link href="/privacy-policy" style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '0.9rem',
              color: MUTED,
              textDecoration: 'none',
            }}>
              Privacy Policy
            </Link>
            <span style={{ color: BORDER }}>·</span>
            <Link href="/terms-of-use" style={{
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '0.9rem',
              color: MUTED,
              textDecoration: 'none',
            }}>
              Terms of Use
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
