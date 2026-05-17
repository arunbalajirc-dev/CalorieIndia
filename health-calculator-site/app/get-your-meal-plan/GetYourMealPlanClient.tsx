'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: '👤', name: 'Your Body Analysis',
    tagline: 'Know your numbers before you change them',
    img: '/images/feat-body-analysis.png', imgPos: 'center 65%',
    bullets: [
      { label: 'BMI (Asian Standard)', desc: 'Calibrated for Indian body types, not Western averages' },
      { label: 'BMR & TDEE', desc: 'Your resting burn vs. true daily burn. Your plan is built around the gap' },
      { label: 'Weight Loss Projection', desc: 'Month-by-month timeline showing exactly when you hit your target' },
      { label: 'Exercise Burn Target', desc: 'The exact kcal you need to move daily to hit 0.5 kg/week' },
    ],
  },
  {
    icon: '⚙️', name: 'Indian Meal Library',
    tagline: '150+ real Indian meals. All calorie-verified.',
    img: '/images/feat-meal-library.png', imgPos: 'center center',
    bullets: [
      { label: '4 meal slots', desc: 'Breakfast, Lunch, Snacks, Dinner. Each slot budget pre-calculated for your target' },
      { label: '7 options per slot', desc: 'Mutton Biryani, Fish Curry, Chicken Tikka, Egg Bhurji and more — rotate daily' },
      { label: 'Mix & match', desc: 'Every item is interchangeable within its slot. Same calories, different meal. No boredom' },
      { label: 'Data source', desc: 'IFCT 2017 · NIN India. Not estimated — verified' },
    ],
  },
  {
    icon: '🗓️', name: '7-Day Meal Plan',
    tagline: 'Every day planned. Every gram calculated.',
    img: '/images/feat-7day-plan.png', imgPos: 'center bottom',
    bullets: [
      { label: 'Complete Mon–Sun schedule', desc: 'All four slots filled with meal name, gram weight, and calories' },
      { label: 'Macro breakdown per day', desc: 'Protein, Carbs, Fat listed for every single day' },
      { label: '3-Phase Fitness Roadmap', desc: 'Consistency → Strength training → Maintenance across 52 weeks' },
      { label: 'Beginner-friendly', desc: 'Standard Indian home and restaurant food. No complex cooking' },
    ],
  },
  {
    icon: '🔥', name: 'Fat Loss Engine',
    tagline: 'The science behind why this actually works',
    img: '/images/feat-fat-loss.png', imgPos: 'center center',
    bullets: [
      { label: '500 kcal total deficit', desc: '323 from diet + 177 from exercise. Clinically recommended split' },
      { label: 'BMR floor protection', desc: 'Your plan never drops below BMR. Muscle stays. Only fat burns' },
      { label: '0.5 kg/week', desc: 'Safe rate. 1 kg of fat every 24 days. The math is inside your plan' },
      { label: '80/20 rule', desc: '80% food, 20% movement. No crash diets, no extreme workouts' },
    ],
  },
];

const PRICING_ITEMS = [
  { img: '/images/Diet planner master page section 4 image 2.png', label: 'Mutton Biryani', price: '₹300 – 350', highlight: false },
  { img: '/images/Diet planner master page section 4 image 1.png', label: 'Dietitian consultation', price: '₹1000+', highlight: false },
  { img: '/images/nutrition-tracker-logo.png', label: 'Your Plan', price: '₹249', highlight: true },
];

const TRUST_ITEMS = ['🔒 Razorpay Secure', '⚡ Instant Delivery', '❤️ Built for Indian Bodies', '📄 IFCT 2017 Data'];

const STATS = [
  { num: '150', label: 'Indian Meals' },
  { num: '7', label: 'Day Plan' },
  { num: '90', label: 'Day Roadmap' },
  { num: '₹249', label: 'One-Time Price' },
];

const CHECKLIST = [
  'Daily calorie target (based on your body)',
  'Macro breakdown (Protein, Carbs, Fat)',
  '7-day Indian meal plan',
  'Weight loss timeline',
  'Food swaps (eat smarter, not less)',
  'Activity & calorie burn guide',
];

export default function GetYourMealPlanClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleLayerRef = useRef<HTMLDivElement>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BG = '#0a0a08';
    const ORBS = [
      { xP: 0.15, yP: 0.20, r: 320, c: 'rgba(245,197,24,0.055)', dx: 0.6, dy: 0.3 },
      { xP: 0.82, yP: 0.60, r: 260, c: 'rgba(61,220,132,0.04)', dx: -0.5, dy: -0.25 },
      { xP: 0.50, yP: 0.85, r: 200, c: 'rgba(245,197,24,0.035)', dx: 0.4, dy: -0.35 },
      { xP: 0.72, yP: 0.10, r: 180, c: 'rgba(61,220,132,0.03)', dx: -0.35, dy: 0.45 },
    ];
    let W = 0, H = 0, t = 0, raf = 0;
    let rsz: ReturnType<typeof setTimeout>;

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();

    function draw() {
      if (!ctx || !canvas) return;
      t += 0.004;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      for (const o of ORBS) {
        const cx = o.xP * W + Math.sin(t * o.dx) * 60;
        const cy = o.yP * H + Math.cos(t * o.dy) * 50;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
        g.addColorStop(0, o.c);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
        ctx.fill();
      }
      const gx = W / 14, gy = H / 8;
      const ox = (t * 45) % gx, oy = (t * 28) % gy;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = -gx + ox; x < W + gx; x += gx) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = -gy + oy; y < H + gy; y += gy) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      const sx = ((t * 80) % (W + 300)) - 150;
      const sg = ctx.createLinearGradient(sx - 150, 0, sx + 150, 0);
      sg.addColorStop(0, 'rgba(245,197,24,0)');
      sg.addColorStop(0.5, 'rgba(245,197,24,0.018)');
      sg.addColorStop(1, 'rgba(245,197,24,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(sx - 150, 0, 300, H);
      raf = requestAnimationFrame(draw);
    }
    draw();

    function onResize() {
      clearTimeout(rsz);
      rsz = setTimeout(resize, 120);
    }
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rsz);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const layer = particleLayerRef.current;
    if (!layer) return;
    const COLORS: [number, number, string][] = [
      [0.25, 0.70, 'rgba(245,197,24,'],
      [0.20, 0.60, 'rgba(61,220,132,'],
      [0.15, 0.50, 'rgba(255,255,255,'],
    ];
    for (let i = 0; i < 50; i++) {
      const roll = Math.random();
      const [lo, hi, base] = roll < 0.45 ? COLORS[0] : roll < 0.75 ? COLORS[1] : COLORS[2];
      const alpha = (lo + Math.random() * (hi - lo)).toFixed(2);
      const size = (1.5 + Math.random() * 4).toFixed(1);
      const dur = (3.5 + Math.random() * 6.5).toFixed(1);
      const delay = (Math.random() * 10).toFixed(1);
      const left = (Math.random() * 100).toFixed(1);
      const anim = Math.random() < 0.55 ? 'floatSway' : 'floatUp';
      const p = document.createElement('div');
      p.style.cssText = `position:absolute;bottom:0;left:${left}%;width:${size}px;height:${size}px;`
        + `border-radius:50%;background:${base}${alpha});`
        + `animation:${anim} ${dur}s ${delay}s infinite linear;will-change:transform,opacity;`;
      layer.appendChild(p);
    }
    return () => { layer.innerHTML = ''; };
  }, []);

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentTab(prev => (prev + 1) % FEATURES.length);
    }, 5000);
  }

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTabClick(idx: number) {
    if (idx === currentTab) return;
    setCurrentTab(idx);
    startTimer();
  }

  const feat = FEATURES[currentTab];

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'block' }} aria-hidden="true" />
      <div ref={particleLayerRef} style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true" />

      <section className="gymp-hero">
        <div className="gymp-hero-inner">
          <div className="gymp-hero-text">
            <h1>Get Your Personalized Indian Diet Plan in 5 Minutes</h1>
            <p>Calorie-accurate, macro-balanced meal plans tailored to your weight, height, and lifestyle — no guesswork.</p>
            <Link href="/meal-plan" className="gymp-cta-btn">GET MY PLAN FOR ₹249</Link>
          </div>
          <div className="gymp-hero-image">
            <video className="gymp-hero-video" autoPlay muted loop playsInline>
              <source src="/videos/nutrition-tracker-planner.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="gymp-included">
        <div className="gymp-included-inner">
          <div className="gymp-included-card">
            <h2>Your Personalized Diet Plan Includes</h2>
            <ul className="gymp-checklist">
              {CHECKLIST.map(item => (
                <li key={item}><span className="gymp-check-icon">✓</span>{item}</li>
              ))}
            </ul>
          </div>
          <div className="gymp-included-image">
            <img src="/images/Diet planner master page section 2 image 1.png" alt="Diet plan on phone" />
          </div>
        </div>
      </section>

      <section className="gymp-features">
        <div className="gymp-features-inner">
          <h2 className="gymp-features-heading">Everything inside your <span>₹249 plan</span></h2>
          <div className="gymp-features-layout">
            <div className="gymp-feat-selectors">
              {FEATURES.map((f, i) => (
                <div key={i} className={`gymp-feat-tab${i === currentTab ? ' active' : ''}`} onClick={() => handleTabClick(i)}>
                  <div className="gymp-feat-tab-header">
                    <span className="gymp-feat-tab-icon">{f.icon}</span>
                    <span className="gymp-feat-tab-title">{f.name}</span>
                  </div>
                  <div className="gymp-feat-tab-sub">{f.tagline}</div>
                  {i === currentTab && <div key={`progress-${currentTab}`} className="gymp-feat-progress" />}
                </div>
              ))}
            </div>
            <div className="gymp-feat-panel">
              <div className="gymp-feat-img-wrap">
                <img src={feat.img} alt={feat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: feat.imgPos }} />
              </div>
              <div className="gymp-feat-content">
                <div className="gymp-feat-content-title">
                  <span className="gymp-feat-content-icon">{feat.icon}</span>
                  <span className="gymp-feat-content-name">{feat.name}</span>
                </div>
                <p className="gymp-feat-content-tagline">{feat.tagline}</p>
                <ul className="gymp-feat-bullets">
                  {feat.bullets.map((b, j) => (
                    <li key={j}>
                      <span className="gymp-feat-bullet-dot" />
                      <span><strong>{b.label}</strong> — {b.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gymp-pricing">
        <div className="gymp-pricing-inner">
          <div className="gymp-pricing-row1">
            <div className="gymp-pricing-headline">
              <div className="gymp-pricing-badge">LIMITED OFFER · ₹249 ONLY</div>
              <div className="gymp-pricing-big-text">
                LESS THAN<br />
                <span className="gymp-yellow">1 MEAL.</span><br />
                <span className="gymp-underline-yellow">90 DAYS</span> OF<br />
                RESULTS.
              </div>
              <p className="gymp-pricing-desc">
                A dietitian charges ₹1000+ for one session. Mutton biryani costs ₹350.
                Your personalised Indian meal plan — calorie-precise, macro-balanced —
                is just <strong>₹249</strong>. One-time. Forever yours.
              </p>
            </div>
            <div className="gymp-pricing-circles">
              <div className="gymp-pricing-cards">
                {PRICING_ITEMS.map(item => (
                  <div key={item.label} className="gymp-pricing-item">
                    <div className={`gymp-pricing-circle${item.highlight ? ' logo-circle' : ''}`}>
                      <img src={item.img} alt={item.label} />
                    </div>
                    <div className="gymp-pricing-label">{item.label}</div>
                    <div className={`gymp-pricing-price${item.highlight ? ' highlight' : ''}`}>{item.price}</div>
                  </div>
                ))}
              </div>
              <p className="gymp-pricing-tagline">Less than 1 meal — but guides your next 90 days</p>
            </div>
          </div>

          <div className="gymp-pricing-row2">
            <div className="gymp-pricing-price-line">
              <span className="gymp-pricing-strike">₹999</span>
              <span className="gymp-pricing-main">₹249</span>
            </div>
            <p className="gymp-pricing-sub">One-time payment · <strong>Instant PDF download</strong> · No subscription</p>
            <Link href="/meal-plan" className="gymp-pricing-cta-btn">GET MY MEAL PLAN →</Link>
            <div className="gymp-pricing-trust">
              {TRUST_ITEMS.map(item => (
                <span key={item} className="gymp-trust-item">{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="gymp-pricing-stats">
          {STATS.map(s => (
            <div key={s.label} className="gymp-stat-col">
              <div className="gymp-stat-num">{s.num}</div>
              <div className="gymp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
