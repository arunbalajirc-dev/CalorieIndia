'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trackCalc } from '@/lib/analytics';
import PaymentButton from '@/components/PaymentButton';

interface CalcResults {
  tdee: { val: string; bmr: number; lose: number; gain: number } | null;
  bmi: { val: string; cat: string } | null;
  deficit: { val: string; weeks: string } | null;
  macro: { p: string; c: string; f: string } | null;
  idealWeight: { val: string } | null;
  burn: { val: string } | null;
}

const EMPTY: CalcResults = {
  tdee: null, bmi: null, deficit: null, macro: null, idealWeight: null, burn: null,
};

export default function CalculatorPage() {
  const [r, setR] = useState<CalcResults>(EMPTY);

  // ── TDEE ──
  const [tdeeAge, setTdeeAge] = useState('28');
  const [tdeeGender, setTdeeGender] = useState('m');
  const [tdeeWeight, setTdeeWeight] = useState('72');
  const [tdeeHeight, setTdeeHeight] = useState('168');
  const [tdeeActivity, setTdeeActivity] = useState('1.375');

  function calcTDEE() {
    const age = +tdeeAge, g = tdeeGender, w = +tdeeWeight, h = +tdeeHeight, act = +tdeeActivity;
    const bmr = g === 'm' ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
    const tdee = Math.round(bmr * act);
    const res = { val: tdee + ' cal/day', bmr: Math.round(bmr), lose: tdee - 500, gain: tdee + 500 };
    setR((prev) => ({ ...prev, tdee: res }));
    trackCalc('tdee', { age, gender: g, weight: w, height: h, activity: act }, res.val, { bmr: res.bmr, lose: res.lose, gain: res.gain });
  }

  // ── BMI ──
  const [bmiWeight, setBmiWeight] = useState('72');
  const [bmiHeight, setBmiHeight] = useState('168');

  function calcBMI() {
    const w = +bmiWeight, h = +bmiHeight / 100;
    const bmi = (w / (h * h)).toFixed(1);
    let cat = '';
    if (+bmi < 18.5) cat = 'Underweight';
    else if (+bmi < 23) cat = 'Normal weight (Asian range)';
    else if (+bmi < 25) cat = 'Overweight';
    else cat = 'Obese';
    setR((prev) => ({ ...prev, bmi: { val: 'BMI ' + bmi, cat } }));
    trackCalc('bmi', { weight: w, height: h * 100 }, 'BMI ' + bmi, { category: cat });
  }

  // ── Deficit ──
  const [defTdee, setDefTdee] = useState('2200');
  const [defGoal, setDefGoal] = useState('500');

  function calcDeficit() {
    const tdee = +defTdee, def = +defGoal;
    const target = tdee - def;
    const weeks = Math.round((5 * 7700) / (def * 7));
    setR((prev) => ({
      ...prev,
      deficit: { val: target + ' cal/day', weeks: `At this deficit, you'll lose ~5 kg in ${weeks} weeks.` },
    }));
    trackCalc('deficit', {}, target + ' cal/day', { tdee, deficit: def, weeks });
  }

  // ── Macro ──
  const [macCal, setMacCal] = useState('1700');
  const [macGoal, setMacGoal] = useState('loss');

  function calcMacro() {
    const cal = +macCal, goal = macGoal;
    let pPct = 0.35, cPct = 0.4, fPct = 0.25;
    if (goal === 'maintain') { pPct = 0.25; cPct = 0.5; fPct = 0.25; }
    else if (goal === 'gain') { pPct = 0.3; cPct = 0.5; fPct = 0.2; }
    const p = Math.round(cal * pPct / 4), c = Math.round(cal * cPct / 4), f = Math.round(cal * fPct / 9);
    setR((prev) => ({ ...prev, macro: { p: p + 'g', c: c + 'g', f: f + 'g' } }));
    trackCalc('macro', {}, `P:${p}g C:${c}g F:${f}g`, { calories: cal, goal, protein: p, carbs: c, fat: f });
  }

  // ── Ideal Weight ──
  const [iwHeight, setIwHeight] = useState('168');
  const [iwGender, setIwGender] = useState('m');

  function calcIdealWeight() {
    const h = +iwHeight, g = iwGender;
    const hm = h / 100;
    const low = Math.round(18.5 * hm * hm), high = Math.round(22.9 * hm * hm);
    setR((prev) => ({ ...prev, idealWeight: { val: `${low} – ${high} kg` } }));
    trackCalc('ideal_weight', { height: h, gender: g }, `${low}–${high} kg`, { low, high });
  }

  // ── Calorie Burn ──
  const [cbWeight, setCbWeight] = useState('72');
  const [cbActivity, setCbActivity] = useState('3.5');
  const [cbMins, setCbMins] = useState('45');

  function calcBurn() {
    const w = +cbWeight, met = +cbActivity, mins = +cbMins;
    const cal = Math.round(met * w * mins / 60);
    setR((prev) => ({ ...prev, burn: { val: cal + ' calories' } }));
    trackCalc('calorie_burn', { weight: w }, cal + ' calories', { duration_mins: mins, calories_burned: cal });
  }

  return (
    <>
      <Navbar />

      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="section-badge">Free tools</div>
          <h1>Calorie &amp; Health Calculators</h1>
          <p>All tools are free, require no login, and are built with Indian body types and food culture in mind.</p>
        </div>
      </div>

      <div className="calcs-section">
        <div className="calc-grid">

          {/* TDEE */}
          <div className="calc-block" id="tdee">
            <div className="calc-block-header">
              <div className="calc-block-icon">🔥</div>
              <div><h2>TDEE Calculator</h2><p>Total Daily Energy Expenditure</p></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age (years)</label>
                <input className="form-input" type="number" value={tdeeAge} onChange={(e) => setTdeeAge(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={tdeeGender} onChange={(e) => setTdeeGender(e.target.value)}>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" type="number" value={tdeeWeight} onChange={(e) => setTdeeWeight(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input className="form-input" type="number" value={tdeeHeight} onChange={(e) => setTdeeHeight(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Activity Level</label>
              <select className="form-select" value={tdeeActivity} onChange={(e) => setTdeeActivity(e.target.value)}>
                <option value="1.2">Sedentary (desk job, little exercise)</option>
                <option value="1.375">Lightly active (1–3 days/week)</option>
                <option value="1.55">Moderately active (3–5 days/week)</option>
                <option value="1.725">Very active (6–7 days/week)</option>
                <option value="1.9">Super active (physical job + exercise)</option>
              </select>
            </div>
            <button className="btn-calc" onClick={calcTDEE}>Calculate TDEE →</button>
            {r.tdee && (
              <div className="cb-result-box">
                <div className="result-main">{r.tdee.val}</div>
                <div className="result-label">calories/day to maintain your current weight</div>
                <div className="result-row">
                  <div className="result-mini"><div className="val">{r.tdee.lose}</div><div className="lbl">Lose 0.5kg/wk</div></div>
                  <div className="result-mini"><div className="val">{r.tdee.bmr}</div><div className="lbl">BMR</div></div>
                  <div className="result-mini"><div className="val">{r.tdee.gain}</div><div className="lbl">Gain 0.5kg/wk</div></div>
                </div>
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border, #e0e0e0)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
                    Get your personalised 7-day Indian meal plan based on these numbers.
                  </p>
                  <PaymentButton
                    amount={249}
                    planData={{ tdee: r.tdee, age: tdeeAge, gender: tdeeGender, weight: tdeeWeight, height: tdeeHeight, activity: tdeeActivity }}
                    label="Get My Meal Plan — ₹249 →"
                  />
                </div>
              </div>
            )}
          </div>

          {/* BMI */}
          <div className="calc-block" id="bmi">
            <div className="calc-block-header">
              <div className="calc-block-icon">⚖️</div>
              <div><h2>BMI Calculator</h2><p>Asian BMI ranges included</p></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input className="form-input" type="number" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input className="form-input" type="number" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} />
              </div>
            </div>
            <button className="btn-calc" onClick={calcBMI}>Calculate BMI →</button>
            {r.bmi && (
              <div className="cb-result-box">
                <div className="result-main">{r.bmi.val}</div>
                <div className="result-label">{r.bmi.cat}</div>
                <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--muted)' }}>
                  Asian BMI ranges: Underweight &lt;18.5 · Normal 18.5–22.9 · Overweight 23–24.9 · Obese ≥25
                </div>
              </div>
            )}
          </div>

          {/* Calorie Deficit */}
          <div className="calc-block" id="deficit">
            <div className="calc-block-header">
              <div className="calc-block-icon">🧮</div>
              <div><h2>Calorie Deficit Calculator</h2><p>Find your weight loss target</p></div>
            </div>
            <div className="form-group">
              <label className="form-label">Your TDEE (calories/day)</label>
              <input className="form-input" type="number" value={defTdee} placeholder="Use TDEE calculator above" onChange={(e) => setDefTdee(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight loss goal</label>
              <select className="form-select" value={defGoal} onChange={(e) => setDefGoal(e.target.value)}>
                <option value="250">Slow (0.25 kg/week) — most sustainable</option>
                <option value="500">Moderate (0.5 kg/week) — recommended</option>
                <option value="750">Fast (0.75 kg/week)</option>
                <option value="1000">Aggressive (1 kg/week) — not recommended long-term</option>
              </select>
            </div>
            <button className="btn-calc" onClick={calcDeficit}>Calculate →</button>
            {r.deficit && (
              <div className="cb-result-box">
                <div className="result-main">{r.deficit.val}</div>
                <div className="result-label">calories/day to reach your goal</div>
                <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--muted)' }}>{r.deficit.weeks}</div>
              </div>
            )}
          </div>

          {/* Macro Calculator */}
          <div className="calc-block" id="macro">
            <div className="calc-block-header">
              <div className="calc-block-icon">🥗</div>
              <div><h2>Macro Calculator</h2><p>Protein, carbs &amp; fat split</p></div>
            </div>
            <div className="form-group">
              <label className="form-label">Daily calorie target</label>
              <input className="form-input" type="number" value={macCal} placeholder="e.g. 1700" onChange={(e) => setMacCal(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Goal</label>
              <select className="form-select" value={macGoal} onChange={(e) => setMacGoal(e.target.value)}>
                <option value="loss">Weight Loss (high protein)</option>
                <option value="maintain">Maintain Weight (balanced)</option>
                <option value="gain">Muscle Gain (high protein + carbs)</option>
              </select>
            </div>
            <button className="btn-calc" onClick={calcMacro}>Calculate Macros →</button>
            {r.macro && (
              <div className="cb-result-box">
                <div className="result-row">
                  <div className="result-mini"><div className="val">{r.macro.p}</div><div className="lbl">Protein (g)</div></div>
                  <div className="result-mini"><div className="val">{r.macro.c}</div><div className="lbl">Carbs (g)</div></div>
                  <div className="result-mini"><div className="val">{r.macro.f}</div><div className="lbl">Fat (g)</div></div>
                </div>
              </div>
            )}
          </div>

          {/* Ideal Weight */}
          <div className="calc-block" id="ideal">
            <div className="calc-block-header">
              <div className="calc-block-icon">💛</div>
              <div><h2>Ideal Weight Calculator</h2><p>Your healthy weight range</p></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input className="form-input" type="number" value={iwHeight} onChange={(e) => setIwHeight(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={iwGender} onChange={(e) => setIwGender(e.target.value)}>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
              </div>
            </div>
            <button className="btn-calc" onClick={calcIdealWeight}>Calculate →</button>
            {r.idealWeight && (
              <div className="cb-result-box">
                <div className="result-main">{r.idealWeight.val}</div>
                <div className="result-label">healthy weight range for your height (Asian standard)</div>
              </div>
            )}
          </div>

          {/* Calorie Burn */}
          <div className="calc-block" id="burn">
            <div className="calc-block-header">
              <div className="calc-block-icon">🏃</div>
              <div><h2>Calorie Burn Calculator</h2><p>How much does exercise burn?</p></div>
            </div>
            <div className="form-group">
              <label className="form-label">Your weight (kg)</label>
              <input className="form-input" type="number" value={cbWeight} onChange={(e) => setCbWeight(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Activity</label>
              <select className="form-select" value={cbActivity} onChange={(e) => setCbActivity(e.target.value)}>
                <option value="3.5">Walking (moderate pace)</option>
                <option value="7">Running (6 min/km)</option>
                <option value="8">Cycling (moderate)</option>
                <option value="5">Swimming</option>
                <option value="4">Yoga</option>
                <option value="6">Zumba / Dance</option>
                <option value="5">Weight Training</option>
                <option value="9">HIIT / Circuit Training</option>
                <option value="4">Cricket</option>
                <option value="7">Badminton</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input className="form-input" type="number" value={cbMins} onChange={(e) => setCbMins(e.target.value)} />
            </div>
            <button className="btn-calc" onClick={calcBurn}>Calculate →</button>
            {r.burn && (
              <div className="cb-result-box">
                <div className="result-main">{r.burn.val}</div>
                <div className="result-label">calories burned</div>
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
