'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface TDEEResult {
  tdee: number;
  bmr: number;
  lose: number;
  gain: number;
}

interface FAQState {
  [key: number]: boolean;
}

export default function TDEECalculatorPage() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('1.55');
  const [result, setResult] = useState<TDEEResult | null>(null);
  const [faqOpen, setFaqOpen] = useState<FAQState>({});

  function calcTDEE() {
    const a = parseFloat(age), w = parseFloat(weight), h = parseFloat(height), act = parseFloat(activity);
    if (!a || !w || !h) { alert('Please fill all fields.'); return; }
    let bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = Math.round(bmr * act);
    bmr = Math.round(bmr);
    setResult({ tdee, bmr, lose: tdee - 500, gain: tdee + 500 });
  }

  function toggleFAQ(idx: number) {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  const faqs = [
    {
      q: 'What is the difference between BMR and TDEE?',
      a: 'BMR (Basal Metabolic Rate) is the calories your body burns at complete rest — just keeping your organs running. TDEE is BMR multiplied by your activity level. TDEE is always higher than BMR and is the more practical number for planning your diet.',
    },
    {
      q: 'How accurate is the TDEE calculator?',
      a: 'The Mifflin-St Jeor formula used here has about ±10% accuracy for most people. Track your weight for 2–3 weeks while eating at your calculated TDEE, then adjust based on what actually happens.',
    },
    {
      q: 'Should I eat my TDEE calories on rest days?',
      a: "Your TDEE already accounts for your weekly average activity. You don't need to eat less on rest days unless you calculated using a very high activity multiplier.",
    },
    {
      q: 'Why is my actual weight loss slower than my calorie deficit predicts?',
      a: "Several reasons: water retention (especially early on), the body's metabolic adaptation to lower calorie intake, slight inaccuracies in food tracking. Be patient — consistent 4-week trends matter more than weekly fluctuations.",
    },
    {
      q: 'Can I use TDEE for a vegetarian Indian diet?',
      a: "Absolutely. TDEE is calorie-based, not diet-specific. The key difference is that vegetarians need to be more intentional about protein — combining dal, paneer, curd, tofu, and legumes to hit protein goals.",
    },
    {
      q: 'How often should I recalculate my TDEE?',
      a: 'Recalculate every 4–6 weeks during a weight loss phase, or whenever your weight changes by more than 3–4 kg. As you lose weight, your BMR decreases, so your calorie target must adjust downward.',
    },
    {
      q: 'Is TDEE different for Indians compared to Western populations?',
      a: "The formula is the same, but on average Indians tend to have a higher body fat percentage at the same BMI. Starting conservatively (one step lower on the activity scale) and adjusting empirically is a good approach.",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="tdee-hero">
        <div className="breadcrumb">
          <Link href="/calculator" className="tdee-hero" style={{ color: 'rgba(255,255,255,0.7)', background: 'none', padding: 0 }}>Home</Link> › TDEE Calculator
        </div>
        <span className="hero-emoji">🔥</span>
        <h1>TDEE Calculator <span>for Indians</span></h1>
        <p>
          Find out exactly how many calories your body burns every day — and use that
          number to lose weight, gain muscle, or simply eat right.
        </p>
      </div>

      <section className="tdee-calc-section">
        <div className="tdee-calc-card">
          <h2>Calculate Your Total Daily Energy Expenditure</h2>
          <div className="form-grid">
            <div className="tdee-form-group">
              <label>Age (years)</label>
              <input type="number" placeholder="e.g. 28" min={10} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="tdee-form-group">
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="tdee-form-group">
              <label>Weight (kg)</label>
              <input type="number" placeholder="e.g. 70" min={30} max={200} value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="tdee-form-group">
              <label>Height (cm)</label>
              <input type="number" placeholder="e.g. 170" min={100} max={230} value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div className="tdee-form-group full" style={{ gridColumn: '1 / -1' }}>
              <label>Activity Level</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value)}>
                <option value="1.2">Sedentary – desk job, little or no exercise</option>
                <option value="1.375">Lightly active – exercise 1–3 days/week</option>
                <option value="1.55">Moderately active – exercise 3–5 days/week</option>
                <option value="1.725">Very active – exercise 6–7 days/week</option>
                <option value="1.9">Super active – physical job + daily exercise</option>
              </select>
            </div>
          </div>
          <button className="tdee-calc-btn" onClick={calcTDEE}>Calculate My TDEE →</button>

          {result && (
            <div style={{ marginTop: '32px' }}>
              <div className="tdee-result-main">
                <div className="label">Your Daily TDEE (Maintenance Calories)</div>
                <div className="value">{result.tdee}</div>
                <div className="sub">calories per day to maintain your current weight</div>
              </div>
              <div className="tdee-result-grid">
                <div className="tdee-result-box">
                  <div className="r-label">BMR</div>
                  <div className="r-val">{result.bmr}</div>
                  <div className="r-sub">calories at rest</div>
                </div>
                <div className="tdee-result-box green-box">
                  <div className="r-label">Lose 0.5 kg/week</div>
                  <div className="r-val">{result.lose}</div>
                  <div className="r-sub">−500 cal/day deficit</div>
                </div>
                <div className="tdee-result-box">
                  <div className="r-label">Gain 0.5 kg/week</div>
                  <div className="r-val">{result.gain}</div>
                  <div className="r-sub">+500 cal/day surplus</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="content-wrap">
        <div className="tdee-section">
          <h2>What is TDEE? A Complete Guide</h2>
          <p>
            <strong>TDEE (Total Daily Energy Expenditure)</strong> is the total number of calories your body burns in a
            24-hour period. It&apos;s the single most important number for anyone who wants to manage their weight.
          </p>
          <p>
            Think of your TDEE as your body&apos;s daily energy budget. Every calorie you eat either goes toward fuelling
            your body (matching your TDEE) or becomes a surplus (stored as fat) or a deficit (burned from stored fat).
          </p>
          <div className="fire-highlight-box">
            <strong>The Simple Rule:</strong> Eat at TDEE → Maintain weight. Eat below TDEE → Lose weight. Eat above TDEE → Gain weight.
          </div>
        </div>

        <div className="tdee-section">
          <h2>How is TDEE Calculated? The Science Behind It</h2>
          <p>Your TDEE is calculated in two steps: first your BMR, then multiplied by an activity factor.</p>
          <h3>Step 1: Calculate BMR (Basal Metabolic Rate)</h3>
          <p>We use the <strong>Mifflin-St Jeor equation</strong>, which is the most accurate formula for most people:</p>
          <div className="formula-box">
            <div className="formula-title">Mifflin-St Jeor Equation</div>
            For Men:<br />
            BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5<br /><br />
            For Women:<br />
            BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161
          </div>
          <h3>Step 2: Multiply by Activity Multiplier</h3>
          <table className="tdee-table">
            <thead><tr><th>Activity Level</th><th>Multiplier</th><th>Who This Fits</th></tr></thead>
            <tbody>
              <tr><td>Sedentary</td><td>1.2×</td><td>Office jobs, minimal walking, no exercise</td></tr>
              <tr><td>Lightly Active</td><td>1.375×</td><td>Light exercise 1–3 days/week, some daily walking</td></tr>
              <tr><td>Moderately Active</td><td>1.55×</td><td>Gym 3–5 days/week, active lifestyle</td></tr>
              <tr><td>Very Active</td><td>1.725×</td><td>Hard exercise 6–7 days/week, physically demanding job</td></tr>
              <tr><td>Super Active</td><td>1.9×</td><td>Athlete-level training, physically intense occupation</td></tr>
            </tbody>
          </table>
          <p>
            Most working Indians fall in the <strong>Sedentary to Lightly Active</strong> range — especially those in IT,
            education, or office-based roles. Don&apos;t overestimate your activity level; this is the most common mistake.
          </p>
        </div>

        <div className="tdee-section">
          <h2>What Are Calories and Why Do They Matter?</h2>
          <table className="tdee-table">
            <thead><tr><th>Macronutrient</th><th>Calories per gram</th><th>Common Indian Sources</th></tr></thead>
            <tbody>
              <tr><td>Carbohydrates</td><td>4 kcal/g</td><td>Rice, roti, dosa, poha, bread</td></tr>
              <tr><td>Protein</td><td>4 kcal/g</td><td>Dal, paneer, chicken, eggs, curd</td></tr>
              <tr><td>Fat</td><td>9 kcal/g</td><td>Ghee, oil, nuts, coconut</td></tr>
              <tr><td>Alcohol</td><td>7 kcal/g</td><td>Beer, whisky, wine</td></tr>
              <tr><td>Fibre / Water</td><td>~0 kcal/g</td><td>Vegetables, salads</td></tr>
            </tbody>
          </table>
        </div>

        <div className="tdee-section">
          <h2>TDEE and Weight Loss: How to Use This Number</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-body">
                <h4>Calculate your TDEE</h4>
                <p>Use the calculator above. This is your maintenance number.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-body">
                <h4>Choose your goal and set a deficit or surplus</h4>
                <p>For weight loss: subtract 300–500 calories from TDEE. For muscle gain: add 200–300 calories.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-body">
                <h4>Track your food for 2–3 weeks</h4>
                <p>Use an app like HealthifyMe or Cronometer to log meals.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div className="step-body">
                <h4>Adjust based on real results</h4>
                <p>If you&apos;re not losing weight after 2 weeks, reduce by another 100–150 calories.</p>
              </div>
            </div>
          </div>
          <h3>How Much Weight Can You Lose?</h3>
          <table className="tdee-table">
            <thead><tr><th>Daily Deficit</th><th>Weekly Loss</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td>250 kcal/day</td><td>~0.25 kg</td><td>Very sustainable, ideal for beginners</td></tr>
              <tr><td>500 kcal/day</td><td>~0.5 kg</td><td>Recommended sweet spot</td></tr>
              <tr><td>750 kcal/day</td><td>~0.75 kg</td><td>Aggressive but doable for overweight individuals</td></tr>
              <tr><td>1000 kcal/day</td><td>~1 kg</td><td>Only for supervised weight loss; risk of muscle loss</td></tr>
            </tbody>
          </table>
          <div className="fire-highlight-box">
            <strong>Tip for Indians:</strong> 0.5 kg/week is the gold standard. Faster loss often leads to muscle loss,
            metabolic adaptation, and the dreaded weight regain.
          </div>
        </div>

        <div className="tdee-section">
          <h2>Why TDEE Varies Between Individuals</h2>
          <h3>Muscle Mass</h3>
          <p>Muscle burns 3× more calories at rest than fat tissue. Resistance training raises your TDEE permanently.</p>
          <h3>Thyroid Function</h3>
          <p>
            Hypothyroidism is very common in India, especially among women, and can reduce BMR by 15–20%. If you&apos;re
            eating well below your calculated TDEE and still not losing weight, a thyroid test is a good idea.
          </p>
          <h3>Age</h3>
          <p>BMR drops roughly 1–2% per decade after age 20, largely due to gradual muscle loss (sarcopenia).</p>
          <h3>NEAT (Non-Exercise Activity Thermogenesis)</h3>
          <p>
            NEAT is the energy burned from all non-exercise movement. It can vary by 600–800 kcal/day between individuals
            and is a huge hidden factor in TDEE.
          </p>
        </div>

        <div className="tdee-section">
          <h2>TDEE for Common Indian Lifestyles</h2>
          <table className="tdee-table">
            <thead><tr><th>Profile</th><th>Approx. TDEE</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td>25-yr male, 70 kg, IT job, no gym</td><td>~1900–2000 kcal</td><td>Sedentary multiplier</td></tr>
              <tr><td>25-yr female, 58 kg, IT job, no gym</td><td>~1550–1650 kcal</td><td>Sedentary multiplier</td></tr>
              <tr><td>30-yr male, 75 kg, IT job + gym 4x/week</td><td>~2500–2650 kcal</td><td>Moderately active</td></tr>
              <tr><td>30-yr female, 62 kg, teacher + walks daily</td><td>~1900–2050 kcal</td><td>Lightly to moderately active</td></tr>
              <tr><td>35-yr male, 80 kg, field sales job</td><td>~2600–2800 kcal</td><td>Very active</td></tr>
            </tbody>
          </table>
        </div>

        <div className="fire-cta-bar">
          <h3>Ready to Take Action?</h3>
          <p>Use our Calorie Deficit Calculator to get your exact weight loss target based on your TDEE.</p>
          <Link href="/calorie-deficit-calculator">Try Deficit Calculator →</Link>
        </div>

        <div className="tdee-section">
          <h2>Frequently Asked Questions About TDEE</h2>
          {faqs.map((faq, i) => (
            <div key={i} className="tdee-faq-item">
              <div className="tdee-faq-q" onClick={() => toggleFAQ(i)}>
                {faq.q}
                <span className={`tdee-faq-icon${faqOpen[i] ? ' open' : ''}`}>+</span>
              </div>
              <div className={`tdee-faq-a${faqOpen[i] ? ' open' : ''}`}>
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
