'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';


const SUPABASE_URL = 'https://clutyaynlukgsumnopkf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdXR5YXlubHVrZ3N1bW5vcGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTAwMzcsImV4cCI6MjA5MDUyNjAzN30.rhWn8jZI0KegFiOrCG8aVDpNVnDhLxrSz-0R62jxja0';
const CREATE_ORDER_URL = 'https://nutritiontracker.in/api/create-order';
const HANDLE_PAYMENT_URL = 'https://nutritiontracker.in/api/handle-payment';
const GENERATE_PDF_URL = 'https://nutritiontracker.in/api/generate-pdf';
const POLL_RPC_URL = 'https://clutyaynlukgsumnopkf.supabase.co/rest/v1/rpc/get_payment_status';

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary', lightly_active: 'Lightly active',
  moderately_active: 'Moderately active', very_active: 'Very active', extra_active: 'Extra active',
};
const GOAL_LABELS: Record<string, string> = { lose: '🔥 Lose Weight', maintain: '⚖️ Maintain Weight', gain: '💪 Gain Muscle' };
const DIET_LABELS: Record<string, string> = { veg: 'Veg', 'non-veg': 'Non-Veg', both: 'Both' };
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extra_active: 1.9,
};

interface PlanData {
  name: string; email: string; age: number; gender: string;
  weight_kg: number; height_cm: number; activity_level: string;
  goal: string; cuisine: string[]; is_vegetarian: boolean; is_vegan: boolean;
  diet_type: string; allergens: string[]; target_weight_kg: number | null;
  tdee: number; target_calories: number; deficit_kcal: number;
  deficit_mode: string; months_to_goal: number; bmi: number;
  protein_g: number; carbs_g: number; fat_g: number;
}

interface FormErrors {
  name?: string; email?: string; age?: string; gender?: string;
  weight?: string; height?: string; activity?: string; goal?: string;
  targetWeight?: string; diet?: string;
}

function calcBMR(weight: number, height: number, age: number, gender: string) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  return base - 78;
}

function calcTDEE(weight: number, height: number, age: number, gender: string, activity: string) {
  return Math.round(calcBMR(weight, height, age, gender) * (ACTIVITY_MULTIPLIERS[activity] || 1.2));
}

function calcBMI(weight: number, height: number) {
  return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
}

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', cls: 'mp-bmi-underweight' };
  if (bmi < 25) return { label: 'Normal weight', cls: 'mp-bmi-normal' };
  if (bmi < 30) return { label: 'Overweight', cls: 'mp-bmi-overweight' };
  return { label: 'Obese', cls: 'mp-bmi-obese' };
}

function calculateSafeCalories(tdee: number, bmr: number, gender: string, weight: number, targetWeight: number | null, goal: string) {
  if (goal === 'maintain') return { target: tdee, deficit: 0, mode: 'Maintenance', months: 0 };
  if (goal === 'gain') return { target: tdee + 300, deficit: -300, mode: 'Lean Surplus +300', months: 0 };

  const kgToLose = targetWeight ? Math.max(0, weight - targetWeight) : 5;
  let pct: number, mode: string;
  if (tdee < 1600)        { pct = 0.15; mode = 'Conservative 15%'; }
  else if (kgToLose <= 5) { pct = 0.10; mode = 'Conservative 10%'; }
  else if (kgToLose <= 15){ pct = 0.20; mode = 'Standard 20%'; }
  else                    { pct = 0.25; mode = 'Aggressive 25%'; }

  let deficit = Math.round(tdee * pct);
  if (pct === 0.25 && deficit > 750) deficit = 750;

  let target = tdee - deficit;
  const absFloor = gender === 'male' ? 1500 : 1200;
  const floor = Math.max(absFloor, Math.round(bmr) + 100);
  if (target < floor) { target = floor; deficit = tdee - target; }

  const months = kgToLose > 0 && deficit > 0
    ? Math.round((kgToLose * 7700) / (deficit * 7) / 4.33)
    : 0;
  return { target, deficit, mode, months };
}

export default function MealPlanClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleLayerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [planData, setPlanData] = useState<PlanData | null>(null);

  // form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('');
  const [goal, setGoal] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [diet, setDiet] = useState('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [showCaution, setShowCaution] = useState(false);

  // payment states
  type PaymentState = 'idle' | 'saving' | 'creating' | 'loading' | 'fallback' | 'error';
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [paymentError, setPaymentError] = useState('');
  const [loadingText, setLoadingText] = useState('Confirming payment…');
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [summaryEmail, setSummaryEmail] = useState('');

  // canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ORBS = [
      { xP: 0.15, yP: 0.20, r: 320, c: 'rgba(245,197,24,0.055)', dx: 0.6, dy: 0.30 },
      { xP: 0.82, yP: 0.60, r: 260, c: 'rgba(61,220,132,0.04)', dx: -0.5, dy: -0.25 },
      { xP: 0.50, yP: 0.85, r: 200, c: 'rgba(245,197,24,0.035)', dx: 0.4, dy: -0.35 },
      { xP: 0.72, yP: 0.10, r: 180, c: 'rgba(61,220,132,0.03)', dx: -0.35, dy: 0.45 },
    ];
    let W = 0, H = 0, t = 0, raf = 0;
    let rsz: ReturnType<typeof setTimeout>;
    function resize() { if (!canvas) return; W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    function draw() {
      if (!ctx || !canvas) return;
      t += 0.004;
      ctx.fillStyle = '#0a0a08';
      ctx.fillRect(0, 0, W, H);
      for (const o of ORBS) {
        const cx = o.xP * W + Math.sin(t * o.dx) * 55;
        const cy = o.yP * H + Math.cos(t * o.dy) * 45;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
        g.addColorStop(0, o.c); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, o.r, 0, Math.PI * 2); ctx.fill();
      }
      const gx = W / 14, gy = H / 8;
      const ox = (t * 45) % gx, oy = (t * 28) % gy;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = -gx + ox; x < W + gx; x += gx) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = -gy + oy; y < H + gy; y += gy) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      const sx = ((t * 80) % (W + 300)) - 150;
      const sg = ctx.createLinearGradient(sx - 150, 0, sx + 150, 0);
      sg.addColorStop(0, 'rgba(245,197,24,0)'); sg.addColorStop(0.5, 'rgba(245,197,24,0.018)'); sg.addColorStop(1, 'rgba(245,197,24,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx - 150, 0, 300, H);
      raf = requestAnimationFrame(draw);
    }
    draw();
    function onResize() { clearTimeout(rsz); rsz = setTimeout(resize, 120); }
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); clearTimeout(rsz); window.removeEventListener('resize', onResize); };
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

  // browser back support
  useEffect(() => {
    function onPop(e: PopStateEvent) {
      const s = (e.state && e.state.step) ? e.state.step : 1;
      if (s === 1) sessionStorage.removeItem('nutritiontracker_plan_id');
      setStep(s);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.addEventListener('popstate', onPop);
    if (window.location.pathname.includes('step-2') && !sessionStorage.getItem('nutritiontracker_plan_id')) {
      history.replaceState({ step: 1 }, '', '/meal-plan');
    }
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function showStep(n: number, pushUrl = true) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pushUrl) {
      if (n === 1) history.pushState({ step: 1 }, '', '/meal-plan');
      if (n === 2) history.pushState({ step: 2 }, '', '/meal-plan/step-2');
    }
  }

  function toggleAllergen(val: string) {
    setAllergens(prev => prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val]);
  }

  function checkCaution(w: string, tw: string) {
    const wv = parseFloat(w), twv = parseFloat(tw);
    if (!isNaN(wv) && !isNaN(twv)) {
      const diff = wv - twv;
      setShowCaution(diff >= 1 && diff <= 3);
    } else setShowCaution(false);
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Please enter your name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address.';
    const ageN = parseInt(age, 10);
    if (isNaN(ageN) || ageN < 10 || ageN > 100) errs.age = 'Age must be between 10 and 100.';
    if (!gender) errs.gender = 'Please select a gender.';
    const wN = parseFloat(weight);
    if (isNaN(wN) || wN < 20 || wN > 300) errs.weight = 'Weight must be between 20 and 300 kg.';
    const hN = parseFloat(height);
    if (isNaN(hN) || hN < 100 || hN > 250) errs.height = 'Height must be between 100 and 250 cm.';
    if (!activity) errs.activity = 'Please select your activity level.';
    if (!goal) errs.goal = 'Please select a goal.';
    if (goal === 'lose') {
      const twN = parseFloat(targetWeight);
      if (isNaN(twN) || twN < 20 || twN >= wN) errs.targetWeight = 'Target weight must be less than your current weight.';
    }
    if (!diet) errs.diet = 'Please select a diet type.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleStep1Submit() {
    setFormError('');
    if (!validate()) return;

    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age, 10);
    const tw = goal === 'lose' && targetWeight ? parseFloat(targetWeight) : null;
    const tdee = calcTDEE(w, h, a, gender, activity);
    const bmr = calcBMR(w, h, a, gender);
    const safe = calculateSafeCalories(tdee, bmr, gender, w, tw, goal);
    const bmi = calcBMI(w, h);
    const proteinG = Math.round(goal === 'gain' ? w * 2 : w * 1.6);
    const fatG = Math.round((safe.target * 0.25) / 9);
    const carbG = Math.round((safe.target - proteinG * 4 - fatG * 9) / 4);

    setPlanData({
      name: name.trim(), email: email.trim(), age: a, gender,
      weight_kg: w, height_cm: h, activity_level: activity, goal,
      cuisine: ['indian'], is_vegetarian: diet !== 'non-veg', is_vegan: false,
      diet_type: diet, allergens, target_weight_kg: tw,
      tdee, target_calories: safe.target, deficit_kcal: safe.deficit,
      deficit_mode: safe.mode, months_to_goal: safe.months, bmi,
      protein_g: proteinG, carbs_g: carbG, fat_g: fatG,
    });
    setSummaryEmail(email.trim());
    showStep(2);
  }

  async function handleStep2Submit() {
    if (!planData) return;
    setPaymentState('idle');
    setPaymentError('');

    const existingId = sessionStorage.getItem('nutritiontracker_plan_id');
    if (existingId) {
      startPayment(planData, existingId);
      return;
    }

    setPaymentState('saving');
    try {
      const payload = {
        email: planData.email, goal: planData.goal,
        intake_data: {
          name: planData.name, age: planData.age, gender: planData.gender,
          weight_kg: planData.weight_kg, height_cm: planData.height_cm,
          activity_level: planData.activity_level, cuisine: ['indian'],
          is_vegetarian: planData.is_vegetarian, is_vegan: false,
          diet_type: planData.diet_type, allergens: planData.allergens,
          tdee: planData.tdee, target_calories: planData.target_calories,
          deficit_kcal: planData.deficit_kcal, deficit_mode: planData.deficit_mode,
          months_to_goal: planData.months_to_goal,
          protein_target: planData.protein_g, carbs_target: planData.carbs_g, fat_target: planData.fat_g,
          bmi: planData.bmi, target_weight: planData.target_weight_kg, target_weight_kg: planData.target_weight_kg,
        },
        status: 'draft',
      };
      const res = await fetch(SUPABASE_URL + '/rest/v1/user_plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'Prefer': 'return=representation' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || 'Failed to save your plan. Please try again.');
      const rows = await res.json();
      const planId = rows[0]?.id ?? null;
      if (planId) sessionStorage.setItem('nutritiontracker_plan_id', planId);
      sessionStorage.setItem('nutritiontracker_email', planData.email);
      setPaymentState('idle');
      startPayment(planData, planId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      setPaymentState('error');
      setPaymentError(msg);
    }
  }

  async function startPayment(pd: PlanData, planId: string) {
    if (!planId) { setPaymentState('error'); setPaymentError('Plan ID not found. Please go back and try again.'); return; }
    setPaymentState('creating');
    setPaymentError('');
    try {
      const res = await fetch(CREATE_ORDER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
        body: JSON.stringify({ amount: 249, receipt: planId.substring(0, 40), user_plan_id: planId }),
      });
      const order = await res.json();
      if (!res.ok || order.error) throw new Error(order.error || 'Failed to create payment order.');
      setPaymentState('idle');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency, order_id: order.id,
        name: 'Nutrition Tracker', description: '7-Day Personalised Indian Meal Plan',
        prefill: { name: pd.name, email: pd.email },
        theme: { color: '#2d7a4f' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          setPaymentState('loading'); setLoadingText('Confirming payment…');
          try {
            const verifyRes = await fetch(HANDLE_PAYMENT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
              body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }),
            });
            const result = await verifyRes.json();
            if (result.success) {
              pollPaymentStatus(response.razorpay_order_id, planId);
            } else {
              setPaymentState('error');
              setPaymentError('Payment verification failed. Contact support with Payment ID: ' + response.razorpay_payment_id);
            }
          } catch {
            setPaymentState('error');
            setPaymentError('Payment received but verification failed. Please contact support.');
          }
        },
        modal: { ondismiss: () => setPaymentState('idle') },
      });
      rzp.open();
    } catch (e) {
      setPaymentState('error');
      setPaymentError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  }

  function pollPaymentStatus(orderId: string, planId: string) {
    let attempts = 0, settled = false;
    const interval = setInterval(async () => {
      if (settled) return;
      attempts++;
      try {
        const res = await fetch(POLL_RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
          body: JSON.stringify({ p_order_id: orderId }),
        });
        const raw = await res.json();
        const status = Array.isArray(raw) ? raw[0] : raw;
        if (status === 'paid') {
          settled = true; clearInterval(interval); clearTimeout(timeout);
          setLoadingText('Generating your PDF…');
          triggerPdfDownload(planId);
        }
      } catch { /* network blip */ }
      if (!settled && attempts >= 20) {
        settled = true; clearInterval(interval); clearTimeout(timeout);
        const em = planData?.email || sessionStorage.getItem('nutritiontracker_email') || '';
        setFallbackEmail(em);
        setPaymentState('fallback');
      }
    }, 3000);
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true; clearInterval(interval);
      const em = planData?.email || sessionStorage.getItem('nutritiontracker_email') || '';
      setFallbackEmail(em);
      setPaymentState('fallback');
    }, 60000);
  }

  async function triggerPdfDownload(planId: string) {
    try {
      const res = await fetch(GENERATE_PDF_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_plan_id: planId }),
      });
      const data = await res.json();
      if (res.ok && data.pdf_url) {
        const em = planData?.email || sessionStorage.getItem('nutritiontracker_email') || '';
        window.location.href = '/thank-you?pdf=' + encodeURIComponent(data.pdf_url) + '&email=' + encodeURIComponent(em);
      } else {
        const em = planData?.email || sessionStorage.getItem('nutritiontracker_email') || '';
        setFallbackEmail(em);
        setPaymentState('fallback');
      }
    } catch {
      const em = planData?.email || sessionStorage.getItem('nutritiontracker_email') || '';
      setFallbackEmail(em);
      setPaymentState('fallback');
    }
  }

  const bmi = planData ? calcBMI(planData.weight_kg, planData.height_cm) : 0;
  const bmiInfo = planData ? bmiCategory(bmi) : null;

  const targetNote = planData
    ? planData.goal === 'lose'
      ? (planData.deficit_mode ? planData.deficit_mode + ' (−' + planData.deficit_kcal + ' kcal)' : 'Safe deficit (−' + planData.deficit_kcal + ' kcal)')
      : planData.goal === 'gain' ? 'TDEE + 300 kcal' : 'Maintenance'
    : '';

  const isPaymentActive = paymentState === 'idle' || paymentState === 'saving' || paymentState === 'creating';

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'block' }} aria-hidden="true" />
      <div ref={particleLayerRef} style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true" />

      <section className="mp-page-hero">
        <h1>Your personalised <em>Indian meal plan</em></h1>
        <p>Tell us about yourself and we&apos;ll generate a 7-day calorie-counted plan built for your goal.</p>
      </section>

      <div className="mp-progress-wrap">
        <div className="mp-progress-steps">
          <div className="mp-progress-fill" style={{ width: step === 2 ? '100%' : '0%' }} />
          {[1, 2].map(n => (
            <div key={n} className={`mp-step-dot${step === n ? ' active' : step > n ? ' done' : ''}`}>
              {step > n ? '✓' : n}
            </div>
          ))}
        </div>
        <div className="mp-step-labels">
          <div className={`mp-step-label${step === 1 ? ' active' : ''}`}>Your Details</div>
          <div className={`mp-step-label${step === 2 ? ' active' : ''}`}>Preview &amp; Pay</div>
        </div>
      </div>

      <div className="mp-steps-container">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="mp-card">
            <div className="mp-step-title">Tell us about yourself</div>
            <div className="mp-step-subtitle">Step 1 of 2 — Your Details</div>

            {formError && <div className="mp-inline-error">{formError}</div>}

            <div className="mp-form-section-label">Personal Details</div>

            <div className="mp-form-row">
              <div className="mp-form-group">
                <label className="mp-form-label" htmlFor="f-name">Name <span className="mp-req">*</span></label>
                <input className={`mp-form-input${errors.name ? ' error' : ''}`} id="f-name" type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <div className="mp-field-error">{errors.name}</div>}
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label" htmlFor="f-email">Email <span className="mp-req">*</span></label>
                <input className={`mp-form-input${errors.email ? ' error' : ''}`} id="f-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
                {errors.email && <div className="mp-field-error">{errors.email}</div>}
              </div>
            </div>

            <div className="mp-form-row">
              <div className="mp-form-group">
                <label className="mp-form-label" htmlFor="f-age">Age <span className="mp-req">*</span></label>
                <input className={`mp-form-input${errors.age ? ' error' : ''}`} id="f-age" type="number" min={10} max={100} value={age} onChange={e => setAge(e.target.value)} />
                {errors.age && <div className="mp-field-error">{errors.age}</div>}
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label">Gender <span className="mp-req">*</span></label>
                <div className="mp-radio-group" style={{ marginTop: 8 }}>
                  {['male', 'female', 'other'].map(g => (
                    <label key={g} className="mp-radio-item">
                      <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} />
                      <span>{g.charAt(0).toUpperCase() + g.slice(1)}</span>
                    </label>
                  ))}
                </div>
                {errors.gender && <div className="mp-field-error">{errors.gender}</div>}
              </div>
            </div>

            <div className="mp-form-row">
              <div className="mp-form-group">
                <label className="mp-form-label" htmlFor="f-weight">Weight (kg) <span className="mp-req">*</span></label>
                <input className={`mp-form-input${errors.weight ? ' error' : ''}`} id="f-weight" type="number" min={20} max={300} step={0.1} value={weight} onChange={e => { setWeight(e.target.value); checkCaution(e.target.value, targetWeight); }} />
                {errors.weight && <div className="mp-field-error">{errors.weight}</div>}
              </div>
              <div className="mp-form-group">
                <label className="mp-form-label" htmlFor="f-height">Height (cm) <span className="mp-req">*</span></label>
                <input className={`mp-form-input${errors.height ? ' error' : ''}`} id="f-height" type="number" min={100} max={250} step={0.1} value={height} onChange={e => setHeight(e.target.value)} />
                {errors.height && <div className="mp-field-error">{errors.height}</div>}
              </div>
            </div>

            <div className="mp-form-section-label">Your Goals</div>

            <div className="mp-form-group">
              <label className="mp-form-label" htmlFor="f-activity">Activity Level <span className="mp-req">*</span></label>
              <select className={`mp-form-select${errors.activity ? ' error' : ''}`} id="f-activity" value={activity} onChange={e => setActivity(e.target.value)}>
                <option value="">Select your activity level…</option>
                <option value="sedentary">Sedentary (desk job, little exercise)</option>
                <option value="lightly_active">Lightly active (light exercise 1–3 days/week)</option>
                <option value="moderately_active">Moderately active (moderate exercise 3–5 days/week)</option>
                <option value="very_active">Very active (hard exercise 6–7 days/week)</option>
                <option value="extra_active">Extra active (physical job + hard exercise)</option>
              </select>
              {errors.activity && <div className="mp-field-error">{errors.activity}</div>}
            </div>

            <div className="mp-form-group">
              <label className="mp-form-label">Goal <span className="mp-req">*</span></label>
              <div className="mp-goal-cards">
                {[{ val: 'lose', emoji: '🔥', label: 'Lose Weight' }, { val: 'maintain', emoji: '⚖️', label: 'Maintain Weight' }, { val: 'gain', emoji: '💪', label: 'Gain Muscle' }].map(g => (
                  <label key={g.val} className={`mp-goal-card-label${goal === g.val ? ' selected' : ''}`}>
                    <input type="radio" name="goal" value={g.val} checked={goal === g.val} onChange={() => setGoal(g.val)} style={{ display: 'none' }} />
                    <span className="mp-goal-emoji">{g.emoji}</span>
                    <span className="mp-goal-text">{g.label}</span>
                  </label>
                ))}
              </div>
              {errors.goal && <div className="mp-field-error">{errors.goal}</div>}
            </div>

            {goal === 'lose' && (
              <div className="mp-form-group">
                <label className="mp-form-label" htmlFor="f-target-weight">Target Weight (kg) <span className="mp-req">*</span></label>
                <input
                  className={`mp-form-input${errors.targetWeight ? ' error' : ''}`}
                  id="f-target-weight" type="number" min={20} max={300} step={0.1}
                  value={targetWeight}
                  onChange={e => { setTargetWeight(e.target.value); checkCaution(weight, e.target.value); }}
                />
                {errors.targetWeight && <div className="mp-field-error">{errors.targetWeight}</div>}
                {showCaution && (
                  <div style={{ marginTop: 6, padding: '10px 14px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, fontSize: 13, color: '#854d0e' }}>
                    ⚠️ A difference of 1–3 kg is very small. Consider choosing <strong>Maintain Weight</strong> as your goal instead.
                  </div>
                )}
              </div>
            )}

            <div className="mp-form-section-label">Food Preferences</div>

            <div className="mp-form-group">
              <label className="mp-form-label">Diet Type <span className="mp-req">*</span></label>
              <div className="mp-radio-group">
                {[{ val: 'veg', label: 'Veg' }, { val: 'non-veg', label: 'Non-Veg' }, { val: 'both', label: 'Both' }].map(d => (
                  <label key={d.val} className="mp-radio-item">
                    <input type="radio" name="diet" value={d.val} checked={diet === d.val} onChange={() => setDiet(d.val)} />
                    <span>{d.label}</span>
                  </label>
                ))}
              </div>
              {errors.diet && <div className="mp-field-error">{errors.diet}</div>}
            </div>

            <div className="mp-form-group">
              <label className="mp-form-label">Allergens <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>(optional)</span></label>
              <div className="mp-checkbox-group">
                {['soy', 'dairy', 'eggs', 'fish', 'chicken'].map(a => (
                  <label key={a} className="mp-checkbox-item">
                    <input type="checkbox" name="allergen" value={a} checked={allergens.includes(a)} onChange={() => toggleAllergen(a)} />
                    <span>{a.charAt(0).toUpperCase() + a.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="mp-btn-primary mp-btn-primary-full" onClick={handleStep1Submit} style={{ marginTop: 8 }}>
              Preview My Plan →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && planData && (
          <div className="mp-card">
            <div className="mp-step-title">Your Plan Preview</div>
            <div className="mp-step-subtitle">Step 2 of 2 — Review &amp; Pay</div>

            <div className="mp-summary-grid">
              <div className="mp-summary-panel">
                <div className="mp-summary-panel-title">Your Profile</div>
                {[
                  ['Name', planData.name], ['Age', planData.age + ' years'],
                  ['Gender', { male: 'Male', female: 'Female', other: 'Other' }[planData.gender] || planData.gender],
                  ['Weight', planData.weight_kg + ' kg'], ['Height', planData.height_cm + ' cm'],
                  ['Activity', ACTIVITY_LABELS[planData.activity_level]],
                  ['Goal', { lose: 'Lose Weight', maintain: 'Maintain Weight', gain: 'Gain Muscle' }[planData.goal] || planData.goal],
                  ...(planData.target_weight_kg ? [['Target Weight', planData.target_weight_kg + ' kg']] : []),
                  ['Diet', DIET_LABELS[planData.diet_type] || planData.diet_type],
                  ['Allergens', planData.allergens.length > 0 ? planData.allergens.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ') : 'None'],
                ].map(([k, v]) => (
                  <div key={k as string} className="mp-summary-row">
                    <span className="mp-summary-key">{k}</span>
                    <span className="mp-summary-val">{k === 'BMI' ? null : v as string}</span>
                  </div>
                ))}
                <div className="mp-summary-row">
                  <span className="mp-summary-key">BMI</span>
                  <span className="mp-summary-val">
                    {planData.bmi} <span className={`mp-bmi-badge ${bmiInfo?.cls}`}>{bmiInfo?.label}</span>
                  </span>
                </div>
              </div>

              <div className="mp-summary-panel">
                <div className="mp-summary-panel-title">Your Calorie Targets</div>
                <div className="mp-calorie-box">
                  <div>
                    <div className="mp-calorie-box-label">Your TDEE</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Maintenance calories</div>
                  </div>
                  <div><span className="mp-calorie-box-value">{planData.tdee.toLocaleString()}</span> <span className="mp-calorie-box-unit">kcal/day</span></div>
                </div>
                <div className="mp-calorie-box">
                  <div>
                    <div className="mp-calorie-box-label">Your Target</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{targetNote}</div>
                  </div>
                  <div><span className="mp-calorie-box-value">{planData.target_calories.toLocaleString()}</span> <span className="mp-calorie-box-unit">kcal/day</span></div>
                </div>
                <div className="mp-macro-row"><span className="mp-macro-label">Protein target</span><span className="mp-macro-value">{planData.protein_g} g/day</span></div>
                <div className="mp-macro-row"><span className="mp-macro-label">Carb target</span><span className="mp-macro-value">{planData.carbs_g} g/day</span></div>
                <div className="mp-macro-row"><span className="mp-macro-label">Fat target</span><span className="mp-macro-value">{planData.fat_g} g/day</span></div>
                <ul className="mp-plan-includes">
                  <div className="mp-plan-includes-title">Plan includes</div>
                  <li>7-day personalised meal plan</li>
                  <li>Breakfast, lunch, dinner + snacks</li>
                  <li>Indian recipes</li>
                  <li>{(DIET_LABELS[planData.diet_type] || planData.diet_type) + ' options'}</li>
                  <li>Downloadable PDF</li>
                </ul>
              </div>
            </div>

            {paymentState === 'error' && paymentError && (
              <div className="mp-inline-error" style={{ display: 'block' }}>{paymentError}</div>
            )}

            <div className="mp-step2-footer">
              {isPaymentActive && (
                <div id="payment-action">
                  <button
                    className="mp-btn-primary mp-btn-primary-full"
                    onClick={handleStep2Submit}
                    disabled={paymentState === 'saving' || paymentState === 'creating'}
                  >
                    {paymentState === 'saving' ? 'Saving your plan…' : paymentState === 'creating' ? 'Creating order…' : 'Generate My Plan — ₹249'}
                  </button>
                  <div className="mp-sub-note">One-time payment · Instant PDF download · No subscription</div>
                </div>
              )}

              {paymentState === 'loading' && (
                <div style={{ background: 'rgba(61,220,132,0.10)', border: '1px solid rgba(61,220,132,0.25)', borderRadius: 12, padding: '28px 24px', textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, margin: '0 auto 12px', border: '3px solid rgba(61,220,132,0.20)', borderTopColor: '#3ddc84', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#3ddc84', marginBottom: 4 }}>{loadingText}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>Please wait — this usually takes a few seconds.</div>
                </div>
              )}

              {paymentState === 'fallback' && (
                <div style={{ background: 'rgba(245,197,24,0.10)', border: '1px solid rgba(245,197,24,0.30)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>Your plan is being prepared.</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>You&apos;ll receive a download link at <strong>{fallbackEmail}</strong> shortly.</div>
                </div>
              )}

              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 6, marginTop: 8 }}>₹249 · Secure payment via Razorpay</div>
              <div className="mp-payment-trust">
                <p>🔒 Your data is stored securely.</p>
                <p>📄 PDF will download automatically after payment.</p>
                <p>📧 A copy will be emailed to <strong>{summaryEmail}</strong>.</p>
              </div>
              <span className="mp-back-link" onClick={() => { sessionStorage.removeItem('nutritiontracker_plan_id'); showStep(1); }}>← Edit my details</span>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: '#111813', color: 'rgba(255,255,255,.4)', textAlign: 'center', padding: '20px 24px', fontSize: 12, fontFamily: "'DM Sans',sans-serif", borderTop: '1px solid rgba(255,255,255,.07)', position: 'relative', zIndex: 2 }}>
        <p>© 2026 Nutrition Tracker. All rights reserved. &nbsp;|&nbsp;
          <a href="/privacy-policy" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Privacy Policy</a> &nbsp;|&nbsp;
          <a href="/terms-of-use" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Terms of Use</a> &nbsp;|&nbsp;
          <a href="/disclaimer" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Disclaimer</a>
        </p>
      </footer>
    </>
  );
}
