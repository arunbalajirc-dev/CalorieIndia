'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { deficitFaqs } from '@/lib/calculator-faqs';

export { deficitFaqs };

interface DeficitResult {
  target: number;
  deficit: number;
  weeklyLoss: string;
  targetSub: string;
}

interface TimelineRow { label: string; weeks: number; date: string; isGoal: boolean; }
interface FAQState { [key: number]: boolean; }

export default function CalorieDeficitClient() {
  const [tdee, setTdee] = useState('');
  const [goalDeficit, setGoalDeficit] = useState('500');
  const [kgToLose, setKgToLose] = useState('');
  const [result, setResult] = useState<DeficitResult | null>(null);
  const [timeline, setTimeline] = useState<TimelineRow[]>([]);
  const [faqOpen, setFaqOpen] = useState<FAQState>({});

  function calcDeficit() {
    const t = parseFloat(tdee);
    const deficit = parseFloat(goalDeficit);
    if (!t) { alert('Please enter your TDEE.'); return; }
    const target = Math.round(t - deficit);
    const weeklyLoss = (deficit * 7 / 7700).toFixed(2);
    setResult({ target, deficit, weeklyLoss, targetSub: `calories per day (${deficit} kcal below your TDEE of ${t})` });

    const kg = parseFloat(kgToLose);
    if (kg && kg > 0) {
      const weeksTotal = kg / parseFloat(weeklyLoss);
      const rows: TimelineRow[] = [0.25, 0.5, 1].map(frac => {
        const fracKg = (kg * frac).toFixed(1);
        const weeks = Math.round(weeksTotal * frac);
        const d = new Date(); d.setDate(d.getDate() + weeks * 7);
        const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return { label: `Lose ${fracKg} kg (${Math.round(frac * 100)}%)`, weeks, date, isGoal: false };
      });
      const totalWeeks = Math.round(weeksTotal);
      const d2 = new Date(); d2.setDate(d2.getDate() + totalWeeks * 7);
      const date2 = d2.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      rows.push({ label: `Full goal (${kg} kg)`, weeks: totalWeeks, date: date2, isGoal: true });
      setTimeline(rows);
    } else {
      setTimeline([]);
    }
  }

  function toggleFAQ(idx: number) {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <>
      <Navbar />

      <div className="deficit-hero">
        <div className="breadcrumb">
          <Link href="/calculator" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link> &rsaquo; Calorie Deficit Calculator
        </div>
        <span className="hero-emoji">🧮</span>
        <h1>Calorie Deficit <span>Calculator</span></h1>
        <p>Enter your TDEE and weight loss goal to find your exact daily calorie target — with a realistic timeline for reaching your goal weight.</p>
      </div>

      <section className="deficit-calc-section">
        <div className="deficit-calc-card">
          <h2>Find Your Daily Calorie Target</h2>
          <div className="deficit-form-group">
            <label>Your TDEE (calories/day)</label>
            <input type="number" placeholder="e.g. 2100 — use TDEE calculator above" min={1000} max={5000} value={tdee} onChange={e => setTdee(e.target.value)} />
          </div>
          <div className="deficit-form-group">
            <label>Weight Loss Goal</label>
            <select value={goalDeficit} onChange={e => setGoalDeficit(e.target.value)}>
              <option value="250">Slow — 0.25 kg/week (most sustainable)</option>
              <option value="500">Moderate — 0.5 kg/week (recommended)</option>
              <option value="750">Fast — 0.75 kg/week</option>
              <option value="1000">Aggressive — 1 kg/week (use caution)</option>
            </select>
          </div>
          <div className="deficit-form-group">
            <label>Kg to Lose (optional — for timeline)</label>
            <input type="number" placeholder="e.g. 10" min={0.5} max={100} value={kgToLose} onChange={e => setKgToLose(e.target.value)} />
          </div>
          <button className="deficit-calc-btn" onClick={calcDeficit}>Calculate My Target &rarr;</button>

          {result && (
            <div style={{ marginTop: '32px' }}>
              <div className="deficit-result-grid">
                <div className="deficit-r-box main">
                  <div className="r-label">Daily Calorie Target</div>
                  <div className="r-val">{result.target}</div>
                  <div className="r-sub">{result.targetSub}</div>
                </div>
                <div className="deficit-r-box purple-box">
                  <div className="r-label">Daily Deficit</div>
                  <div className="r-val">{result.deficit}</div>
                  <div className="r-sub">calories below TDEE</div>
                </div>
                <div className="deficit-r-box green-box">
                  <div className="r-label">Weekly Loss</div>
                  <div className="r-val">{result.weeklyLoss} kg</div>
                  <div className="r-sub">kg per week</div>
                </div>
              </div>
              {timeline.length > 0 && (
                <div className="deficit-timeline">
                  <h4>📅 Your Weight Loss Timeline</h4>
                  {timeline.map((row, i) => (
                    <div key={i} className={`tl-row${row.isGoal ? ' goal-row' : ''}`}>
                      <span>{row.isGoal ? '🎯 ' : ''}{row.label}</span>
                      <strong>~{row.weeks} weeks — {row.date}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="content-wrap">
        <div className="deficit-section">
          <h2>What is a Calorie Deficit?</h2>
          <p>A <strong>calorie deficit</strong> means you are consuming fewer calories than your body burns each day. Your body needs energy to function, and when it doesn&apos;t get enough from food, it turns to stored body fat to make up the difference — this is how weight loss happens.</p>
          <p>The math is straightforward: approximately 7,700 calories of deficit equals roughly 1 kg of fat loss. So a consistent deficit of 500 calories per day produces about 0.5 kg of weight loss per week. This is known as the &ldquo;energy balance&rdquo; model of weight management, and while it has some nuances, it holds up extremely well in clinical practice.</p>
          <div className="deficit-formula-box">
            Daily Calorie Target = TDEE &minus; Deficit<br />
            Weight Loss Rate = Deficit &divide; 7,700 kg per week
          </div>
        </div>

        <div className="deficit-section">
          <h2>How Much Deficit Should You Create?</h2>
          <table className="deficit-table">
            <thead><tr><th>Deficit Level</th><th>Daily Deficit</th><th>Expected Loss</th><th>Best For</th></tr></thead>
            <tbody>
              <tr><td>Conservative</td><td>250 kcal/day</td><td>~0.25 kg/week</td><td>Beginners, people close to goal weight</td></tr>
              <tr><td>Moderate ✓</td><td>500 kcal/day</td><td>~0.5 kg/week</td><td>Most people — best balance of results + sustainability</td></tr>
              <tr><td>Aggressive</td><td>750 kcal/day</td><td>~0.75 kg/week</td><td>Significantly overweight, short-term use</td></tr>
              <tr><td>Very Aggressive</td><td>1000 kcal/day</td><td>~1 kg/week</td><td>Medically supervised only; high muscle loss risk</td></tr>
            </tbody>
          </table>
          <div className="deficit-highlight">
            <strong>The sweet spot for most Indians:</strong> A 400–500 kcal/day deficit. This is aggressive enough to produce visible results within a month, yet sustainable enough that you don&apos;t lose significant muscle or feel miserable.
          </div>
          <div className="deficit-warning">
            <strong>⚠️ Warning:</strong> Do not go below 1200 kcal/day (women) or 1400 kcal/day (men). Very low calorie diets cause significant muscle loss, nutrient deficiencies, extreme fatigue, and often lead to &ldquo;rebound&rdquo; weight gain when normal eating resumes.
          </div>
        </div>

        <div className="deficit-section">
          <h2>How to Create a Calorie Deficit Through Indian Food</h2>
          <p>You don&apos;t need to eat bland food or give up rice to create a calorie deficit. The key is understanding where calories are hiding in typical Indian meals and making smart swaps:</p>
          <h3>High-Calorie Culprits in Indian Cooking</h3>
          <table className="deficit-table">
            <thead><tr><th>Food / Habit</th><th>Calories</th><th>Smart Swap</th><th>Saved</th></tr></thead>
            <tbody>
              <tr><td>2 tbsp ghee in dal</td><td>240 kcal</td><td>1 tsp ghee for flavour</td><td>180 kcal</td></tr>
              <tr><td>Deep-fried samosa (2 pcs)</td><td>300 kcal</td><td>Baked or air-fried version</td><td>150 kcal</td></tr>
              <tr><td>Full-fat paneer (100g)</td><td>265 kcal</td><td>Low-fat paneer (100g)</td><td>80 kcal</td></tr>
              <tr><td>Coconut milk curry (1 bowl)</td><td>250 kcal</td><td>Tomato-based gravy</td><td>120 kcal</td></tr>
              <tr><td>White rice (2 cups cooked)</td><td>420 kcal</td><td>1 cup rice + 1 cup dal</td><td>100 kcal</td></tr>
              <tr><td>Masala chai with 2 tsp sugar (3x/day)</td><td>120 kcal</td><td>1 tsp sugar, less milk</td><td>60 kcal</td></tr>
            </tbody>
          </table>
          <h3>Volume Eating: Indian Foods That Fill You Up for Few Calories</h3>
          <p>The secret weapon of sustainable calorie deficits is <strong>volume eating</strong> — eating large quantities of low-calorie, high-fibre, high-water foods. In Indian cuisine, excellent choices include:</p>
          <p>Buttermilk (chaas) — only 35 kcal per glass. Moong dal — 100 kcal per 100g cooked and very filling. All sabzis (vegetable dishes made with less oil) — typically 60–100 kcal per serving. Cucumber raita — 50–70 kcal per bowl. Sprouts chaat — 120 kcal and packed with protein and fibre.</p>
        </div>

        <div className="deficit-section">
          <h2>Calorie Deficit and Exercise</h2>
          <p>You can create a calorie deficit through diet alone, exercise alone, or a combination. Research consistently shows that <strong>diet is more powerful than exercise for creating a calorie deficit</strong> — it&apos;s much easier to not eat 500 calories than to burn 500 calories through exercise. However, exercise has crucial benefits that go beyond calorie burning:</p>
          <h3>Why Exercise Still Matters Even If You Diet</h3>
          <p><strong>Preserves muscle during weight loss.</strong> Without resistance training, 25–35% of weight lost in a deficit comes from muscle. With strength training, this drops to under 10%. Protecting muscle keeps your metabolism higher.</p>
          <p><strong>Improves insulin sensitivity.</strong> Both cardio and resistance training make cells more responsive to insulin — critical for Indians who have high genetic risk for Type 2 diabetes.</p>
          <p><strong>Increases NEAT.</strong> Regular exercisers tend to move more throughout the day — they&apos;re more likely to take stairs, walk more, and fidget — raising their total calorie burn beyond just the workout itself.</p>
          <p><strong>Mental health and consistency.</strong> Exercise significantly reduces stress, anxiety, and cravings, making it much easier to stick to your calorie target long-term.</p>
        </div>

        <div className="deficit-section">
          <h2>Why Calorie Deficits Slow Down Over Time</h2>
          <p>This is one of the most frustrating phenomena in weight loss — you&apos;re eating the same amount and the weight stops moving. Here&apos;s what&apos;s happening:</p>
          <h3>Metabolic Adaptation</h3>
          <p>As you lose weight, your body becomes more efficient. A lighter body burns fewer calories doing the same activities. Your BMR decreases (you&apos;re smaller now), and your TDEE drops. This is why you need to <strong>recalculate your TDEE every 4–6 weeks</strong> during a weight loss phase and adjust your calorie target downward.</p>
          <h3>Adaptive Thermogenesis</h3>
          <p>Beyond what the math predicts, the body also actively reduces energy expenditure when it senses prolonged calorie restriction — this is sometimes called &ldquo;metabolic damage,&rdquo; though &ldquo;metabolic adaptation&rdquo; is more accurate. Strategies to combat this include diet breaks (eating at maintenance for 1–2 weeks), refeeds (a day or two at maintenance calories), and prioritising resistance training.</p>
          <div className="deficit-highlight">
            <strong>Practical tip:</strong> When weight loss stalls for more than 3 weeks despite being consistent, don&apos;t cut calories drastically. First check that your tracking is accurate (people typically underestimate by 20–30%), then consider reducing by 100–150 kcal or adding 10–15 min of daily walking.
          </div>
        </div>

        <div className="deficit-cta-bar">
          <h3>Want to Know Your Protein, Carbs &amp; Fat Split?</h3>
          <p>Use our Macro Calculator to break your calorie target into optimal macronutrient ratios for weight loss.</p>
          <Link href="/macro-calculator">Try Macro Calculator &rarr;</Link>
        </div>

        <div className="deficit-section">
          <h2>Frequently Asked Questions</h2>
          {deficitFaqs.map((faq, i) => (
            <div key={i} className="deficit-faq-item">
              <div className="deficit-faq-q" onClick={() => toggleFAQ(i)}>
                {faq.q}
                <span className={`deficit-faq-icon${faqOpen[i] ? ' open' : ''}`}>+</span>
              </div>
              <div className={`deficit-faq-a${faqOpen[i] ? ' open' : ''}`}>
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
