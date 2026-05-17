'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { burnFaqs } from '@/lib/calculator-faqs';

export { burnFaqs };

const FOOD_EQUIV = [
  { max: 100, food: 'a small banana' },
  { max: 180, food: '1 chapati with dal' },
  { max: 280, food: 'a samosa (2 pcs)' },
  { max: 420, food: 'a cup of cooked rice' },
  { max: 600, food: 'a plate of dal rice' },
  { max: 900, food: 'a full thali meal' },
  { max: Infinity, food: 'more than a full meal' },
];

interface BurnResult {
  calories: number;
  perMin: string;
  fatG: string;
  foodEq: string;
  actLabel: string;
  duration: number;
  weight: number;
}

interface FAQState { [key: number]: boolean; }

export default function CalorieBurnClient() {
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');
  const [activity, setActivity] = useState('3.5');
  const [actLabel, setActLabel] = useState('Walking — moderate pace (5 km/h)');
  const [result, setResult] = useState<BurnResult | null>(null);
  const [faqOpen, setFaqOpen] = useState<FAQState>({});

  function calcBurn() {
    const w = parseFloat(weight);
    const d = parseFloat(duration);
    const met = parseFloat(activity);
    if (!w || !d) { alert('Please fill all fields.'); return; }
    const calories = Math.round(met * w * (d / 60));
    const perMin = (calories / d).toFixed(1);
    const fatG = (calories / 7700 * 1000).toFixed(1);
    const eq = FOOD_EQUIV.find(f => calories <= f.max);
    const foodEq = eq ? `≈ ${eq.food}` : 'a full meal';
    setResult({ calories, perMin, fatG, foodEq, actLabel: actLabel.split('—')[0].trim(), duration: d, weight: w });
  }

  function toggleFAQ(idx: number) {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <>
      <Navbar />

      <div className="burn-hero">
        <div className="breadcrumb">
          <Link href="/calculator" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link> &rsaquo; Calorie Burn Calculator
        </div>
        <span className="hero-emoji">🏃</span>
        <h1>Calorie Burn <span>Calculator</span></h1>
        <p>Find out how many calories you burn during exercise — from morning walks to HIIT, cricket to Zumba. Powered by MET values for accurate results.</p>
      </div>

      <section className="burn-calc-section">
        <div className="burn-calc-card">
          <h2>Calculate Calories Burned by Activity</h2>
          <div className="form-grid">
            <div className="burn-form-group">
              <label>Your Weight (kg)</label>
              <input type="number" placeholder="e.g. 70" min={30} max={200} value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div className="burn-form-group">
              <label>Duration (minutes)</label>
              <input type="number" placeholder="e.g. 45" min={1} max={300} value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div className="burn-form-group full">
              <label>Activity</label>
              <select value={activity} onChange={e => { setActivity(e.target.value); setActLabel(e.target.options[e.target.selectedIndex].text); }}>
                <option value="3.5">Walking — moderate pace (5 km/h)</option>
                <option value="4.5">Walking — brisk pace (6 km/h)</option>
                <option value="9.8">Running — 6 min/km pace</option>
                <option value="11.5">Running — 5 min/km pace</option>
                <option value="5.8">Cycling — moderate (15–20 km/h)</option>
                <option value="8.5">Cycling — fast (25–30 km/h)</option>
                <option value="7.0">Swimming — moderate</option>
                <option value="3.0">Yoga — gentle/Hatha</option>
                <option value="4.5">Yoga — Vinyasa/Power yoga</option>
                <option value="6.0">Zumba / Dance fitness</option>
                <option value="5.0">Weight training — moderate</option>
                <option value="8.0">HIIT / Circuit training</option>
                <option value="5.0">Cricket — batting/fielding</option>
                <option value="4.0">Badminton — recreational</option>
                <option value="7.0">Badminton — competitive</option>
                <option value="4.5">Kabaddi</option>
                <option value="5.5">Football / Soccer</option>
                <option value="6.0">Basketball</option>
                <option value="3.5">Stair climbing — slow</option>
                <option value="8.5">Stair climbing — fast</option>
                <option value="2.5">Household cleaning — general</option>
                <option value="3.0">Gardening</option>
              </select>
            </div>
          </div>
          <button className="burn-calc-btn" onClick={calcBurn}>Calculate Calories Burned &rarr;</button>

          {result && (
            <div style={{ marginTop: '32px' }}>
              <div className="burn-result-main">
                <div className="label">Calories Burned</div>
                <div className="value">{result.calories}</div>
                <div className="sub">{result.duration} min of {result.actLabel} at {result.weight} kg</div>
              </div>
              <div className="burn-result-grid">
                <div className="burn-r-box">
                  <div className="r-label">Per minute</div>
                  <div className="r-val">{result.perMin}</div>
                  <div className="r-sub">kcal/min</div>
                </div>
                <div className="burn-r-box" style={{ borderColor: '#ffcc80', background: '#fff8e1' }}>
                  <div className="r-label">Equivalent food</div>
                  <div className="r-val" style={{ color: '#e65100', fontSize: '1rem', paddingTop: '4px' }}>{result.foodEq}</div>
                  <div className="r-sub"></div>
                </div>
                <div className="burn-r-box" style={{ borderColor: '#a5d6a7', background: '#e8f5e9' }}>
                  <div className="r-label">Fat burned (approx)</div>
                  <div className="r-val" style={{ color: '#2e7d32' }}>{result.fatG}</div>
                  <div className="r-sub">grams</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="content-wrap">
        <div className="burn-section">
          <h2>How Are Calories Burned Calculated?</h2>
          <p>This calculator uses the <strong>MET (Metabolic Equivalent of Task) method</strong>, which is the scientifically validated standard for estimating exercise energy expenditure. The formula is:</p>
          <div className="burn-formula-box">
            Calories Burned = MET &times; Weight (kg) &times; Duration (hours)
          </div>
          <p>MET values represent how much energy an activity requires relative to sitting at rest (which has a MET of 1.0). Walking at a moderate pace has a MET of about 3.5 — meaning it burns 3.5&times; more energy per minute than sitting still. Running has a MET of 9–12 depending on pace.</p>
          <div className="burn-highlight">
            <strong>Why this formula is more accurate:</strong> It accounts for your body weight, because heavier people burn more calories doing the same activity. A 90 kg person burns about 30% more calories walking the same distance as a 70 kg person — a factor most simplistic calculators ignore.
          </div>
        </div>

        <div className="burn-section">
          <h2>Calories Burned by Popular Indian Activities</h2>
          <p>The table below shows estimated calories burned by a 70 kg Indian adult for 60 minutes of activity:</p>
          <table className="burn-table">
            <thead><tr><th>Activity</th><th>MET</th><th>60 min (70 kg)</th><th>30 min (70 kg)</th></tr></thead>
            <tbody>
              <tr><td>🚶 Walking (moderate, 5 km/h)</td><td>3.5</td><td>245 kcal</td><td>123 kcal</td></tr>
              <tr><td>🚶 Brisk walk (6 km/h)</td><td>4.5</td><td>315 kcal</td><td>158 kcal</td></tr>
              <tr><td>🏃 Running (6 min/km)</td><td>9.8</td><td>686 kcal</td><td>343 kcal</td></tr>
              <tr><td>🚴 Cycling (moderate)</td><td>5.8</td><td>406 kcal</td><td>203 kcal</td></tr>
              <tr><td>🏊 Swimming</td><td>7.0</td><td>490 kcal</td><td>245 kcal</td></tr>
              <tr><td>🧘 Yoga (Hatha)</td><td>3.0</td><td>210 kcal</td><td>105 kcal</td></tr>
              <tr><td>💃 Zumba / Dance fitness</td><td>6.0</td><td>420 kcal</td><td>210 kcal</td></tr>
              <tr><td>🏋️ Weight training</td><td>5.0</td><td>350 kcal</td><td>175 kcal</td></tr>
              <tr><td>⚡ HIIT / Circuit</td><td>8.0</td><td>560 kcal</td><td>280 kcal</td></tr>
              <tr><td>🏏 Cricket (batting/bowling)</td><td>5.0</td><td>350 kcal</td><td>175 kcal</td></tr>
              <tr><td>🏸 Badminton (recreational)</td><td>4.0</td><td>280 kcal</td><td>140 kcal</td></tr>
              <tr><td>🏸 Badminton (competitive)</td><td>7.0</td><td>490 kcal</td><td>245 kcal</td></tr>
            </tbody>
          </table>
        </div>

        <div className="burn-section">
          <h2>Walking: The Most Underrated Calorie-Burning Activity in India</h2>
          <p>Walking is India&apos;s most accessible form of exercise — no gym, no equipment, no special clothing. And its calorie-burning potential is often severely underestimated. Consider:</p>
          <p>A 70 kg person walking briskly for just 45 minutes burns approximately 235 calories. Do this every morning for a month and you&apos;ve burned roughly 7,050 calories — close to 1 kg of fat, without ever going to a gym.</p>
          <h3>Tips to Burn More Calories Walking</h3>
          <p><strong>Increase pace.</strong> Going from 5 km/h to 6.5 km/h increases calorie burn by about 30%. You don&apos;t need to run — just walk faster than you&apos;re comfortable.</p>
          <p><strong>Add incline.</strong> Walking uphill (or on a treadmill at 5–8% incline) dramatically increases calorie burn. A 5% incline increases calories burned by approximately 50%.</p>
          <p><strong>Add weight.</strong> Carrying a backpack with 5–8 kg adds 10–15% to calorie burn without the joint stress of running.</p>
          <p><strong>Walk after meals.</strong> A 15–20 minute post-meal walk significantly blunts blood sugar spikes — particularly valuable for Indians with high diabetes risk.</p>
        </div>

        <div className="burn-section">
          <h2>HIIT vs. Steady-State Cardio: Which Burns More Calories?</h2>
          <p>This is one of the most common fitness debates. The short answer: it depends on your goal and time available.</p>
          <h3>HIIT (High-Intensity Interval Training)</h3>
          <p>HIIT involves alternating between maximum-effort bursts and recovery periods. A 20–30 minute HIIT session can burn similar calories to 40–50 minutes of moderate jogging, and triggers the <strong>afterburn effect</strong> (Excess Post-Exercise Oxygen Consumption, or EPOC) — your body continues burning elevated calories for 12–24 hours post-workout as it recovers. However, HIIT is demanding and requires 48 hours of recovery between sessions.</p>
          <h3>Steady-State Cardio (Walking, Jogging, Cycling)</h3>
          <p>Lower intensity, longer duration. Burns calories during the activity but minimal afterburn. More sustainable for daily use, lower injury risk, easier to recover from. Walking daily is more practical as a long-term habit than HIIT every day for most people.</p>
          <div className="burn-highlight">
            <strong>Best approach for Indians:</strong> 2–3 HIIT or strength sessions per week + daily low-intensity activity (walking, cycling). The daily movement keeps your NEAT (Non-Exercise Activity Thermogenesis) high, while HIIT/strength training builds the muscle that elevates your resting metabolism.
          </div>
        </div>

        <div className="burn-section">
          <h2>Why Exercise Alone Rarely Leads to Weight Loss</h2>
          <p>This is a counterintuitive but well-supported finding in exercise science: most people who start exercising without changing their diet do not lose significant weight. There are several reasons:</p>
          <h3>Caloric Compensation</h3>
          <p>After exercise, appetite increases. Studies show that many people subconsciously eat back most or all of the calories they burned — sometimes more. The brain is very good at defending body weight by increasing hunger when energy expenditure goes up.</p>
          <h3>The Math Is Unforgiving</h3>
          <p>Running 5 km burns about 350–400 calories for a 70 kg person. That&apos;s roughly the caloric equivalent of one samosa or half a plate of biryani. You cannot out-exercise a poor diet.</p>
          <h3>Exercise Still Matters — But for Different Reasons</h3>
          <p>Exercise is essential for health — cardiovascular function, insulin sensitivity, mental health, muscle preservation, bone density. But its primary role in weight management is not burning large numbers of calories during workouts. It&apos;s about building muscle (which raises resting metabolism), improving insulin sensitivity (which reduces fat storage tendency), and supporting the lifestyle behaviours that make calorie restriction easier to maintain.</p>
          <p>The winning combination for weight loss: <strong>nutrition for the calorie deficit + exercise for the body composition and metabolic benefits</strong>.</p>
        </div>

        <div className="burn-cta-bar">
          <h3>Now Calculate How to Use These Calories</h3>
          <p>Use our TDEE Calculator to incorporate your exercise into your daily calorie target.</p>
          <Link href="/tdee-calculator">TDEE Calculator &rarr;</Link>
        </div>

        <div className="burn-section">
          <h2>Frequently Asked Questions</h2>
          {burnFaqs.map((faq, i) => (
            <div key={i} className="burn-faq-item">
              <div className="burn-faq-q" onClick={() => toggleFAQ(i)}>
                {faq.q}
                <span className={`burn-faq-icon${faqOpen[i] ? ' open' : ''}`}>+</span>
              </div>
              <div className={`burn-faq-a${faqOpen[i] ? ' open' : ''}`}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
