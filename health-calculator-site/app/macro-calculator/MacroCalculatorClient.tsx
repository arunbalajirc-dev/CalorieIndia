'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { macroFaqs } from '@/lib/calculator-faqs';

export { macroFaqs };

interface MacroResult {
  proG: number;
  carbG: number;
  fatG: number;
  proKcal: number;
  carbKcal: number;
  fatKcal: number;
  proP: number;
  carbP: number;
  fatP: number;
  label: string;
}

interface FAQState { [key: number]: boolean; }

export default function MacroCalculatorClient() {
  const [calories, setCalories] = useState('');
  const [goal, setGoal] = useState('loss');
  const [diet, setDiet] = useState('any');
  const [result, setResult] = useState<MacroResult | null>(null);
  const [faqOpen, setFaqOpen] = useState<FAQState>({});

  function calcMacros() {
    const cal = parseFloat(calories);
    if (!cal) { alert('Please enter your daily calorie target.'); return; }
    let proP: number, carbP: number, fatP: number, label: string;
    if (goal === 'loss') { proP = 0.35; carbP = 0.35; fatP = 0.30; label = 'Weight Loss (35% protein / 35% carbs / 30% fat)'; }
    else if (goal === 'maintain') { proP = 0.25; carbP = 0.45; fatP = 0.30; label = 'Maintenance (25% protein / 45% carbs / 30% fat)'; }
    else { proP = 0.30; carbP = 0.45; fatP = 0.25; label = 'Muscle Gain (30% protein / 45% carbs / 25% fat)'; }
    const proG = Math.round((cal * proP) / 4);
    const carbG = Math.round((cal * carbP) / 4);
    const fatG = Math.round((cal * fatP) / 9);
    setResult({ proG, carbG, fatG, proKcal: Math.round(proG * 4), carbKcal: Math.round(carbG * 4), fatKcal: Math.round(fatG * 9), proP, carbP, fatP, label });
  }

  function toggleFAQ(idx: number) {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <>
      <Navbar />

      <div className="macro-hero">
        <div className="breadcrumb">
          <Link href="/calculator">Home</Link> &rsaquo; Macro Calculator
        </div>
        <span className="hero-emoji">🥗</span>
        <h1>Macro Calculator <span>for Indians</span></h1>
        <p>Get your personalised protein, carbohydrates, and fat targets — with an Indian food guide for hitting each macro daily.</p>
      </div>

      <section className="macro-calc-section">
        <div className="macro-calc-card">
          <h2>Calculate Your Daily Macros</h2>
          <div className="form-grid">
            <div className="macro-form-group">
              <label>Daily Calorie Target</label>
              <input type="number" placeholder="e.g. 1800 (use TDEE - deficit)" min={800} max={5000} value={calories} onChange={e => setCalories(e.target.value)} />
            </div>
            <div className="macro-form-group">
              <label>Your Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value)}>
                <option value="loss">Weight Loss (High Protein)</option>
                <option value="maintain">Maintain Weight (Balanced)</option>
                <option value="gain">Muscle Gain (High Protein + Carbs)</option>
              </select>
            </div>
            <div className="macro-form-group full">
              <label>Diet Type</label>
              <select value={diet} onChange={e => setDiet(e.target.value)}>
                <option value="any">Omnivore (veg + non-veg)</option>
                <option value="veg">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>
          <button className="macro-calc-btn" onClick={calcMacros}>Calculate My Macros &rarr;</button>

          {result && (
            <div style={{ marginTop: '32px' }}>
              <div className="macro-result-grid">
                <div className="macro-box pro">
                  <div className="m-label">🥩 Protein</div>
                  <div className="m-val">{result.proG}g</div>
                  <div className="m-kcal">{result.proKcal} kcal &middot; {Math.round(result.proP * 100)}% of calories</div>
                </div>
                <div className="macro-box carb">
                  <div className="m-label">🌾 Carbs</div>
                  <div className="m-val">{result.carbG}g</div>
                  <div className="m-kcal">{result.carbKcal} kcal &middot; {Math.round(result.carbP * 100)}% of calories</div>
                </div>
                <div className="macro-box fat">
                  <div className="m-label">🥑 Fat</div>
                  <div className="m-val">{result.fatG}g</div>
                  <div className="m-kcal">{result.fatKcal} kcal &middot; {Math.round(result.fatP * 100)}% of calories</div>
                </div>
              </div>
              <div className="macro-split-note">Macro split: {result.label}</div>
            </div>
          )}
        </div>
      </section>

      <div className="content-wrap">
        <div className="macro-section">
          <h2>What Are Macronutrients?</h2>
          <p><strong>Macronutrients</strong> (or &ldquo;macros&rdquo;) are the three main categories of nutrients that provide energy (calories): protein, carbohydrates, and fat. They&apos;re called &ldquo;macro&rdquo; because we need them in large quantities, as opposed to micronutrients (vitamins and minerals) which are needed in tiny amounts.</p>
          <p>Once you know your daily calorie target, the next question is: how should those calories be distributed across protein, carbs, and fat? This is what macro tracking answers — and it makes a significant difference in body composition, energy levels, and how sustainable your diet feels.</p>
          <table className="macro-table">
            <thead><tr><th>Macronutrient</th><th>Calories/gram</th><th>Primary Role</th></tr></thead>
            <tbody>
              <tr><td>Protein</td><td>4 kcal/g</td><td>Builds and repairs muscle; satiety; immune function</td></tr>
              <tr><td>Carbohydrates</td><td>4 kcal/g</td><td>Primary energy source; brain fuel; fibre for gut health</td></tr>
              <tr><td>Fat</td><td>9 kcal/g</td><td>Hormone production; fat-soluble vitamin absorption; satiety</td></tr>
            </tbody>
          </table>
        </div>

        <div className="macro-section">
          <h2>How Macros Are Split by Goal</h2>
          <h3>Weight Loss (High Protein)</h3>
          <p>For fat loss while preserving muscle: approximately 35% protein, 35% carbohydrates, 30% fat. High protein is crucial during a calorie deficit — it keeps you full longer (highest satiety of all macros), preserves lean muscle mass, and has the highest &ldquo;thermic effect&rdquo; (your body burns 25–30% of protein calories just digesting it, vs. 5–10% for carbs and 0–3% for fat).</p>
          <h3>Maintenance (Balanced)</h3>
          <p>For body recomposition or weight maintenance: approximately 25% protein, 45% carbohydrates, 30% fat. A more moderate protein intake that&apos;s still above average, with room for carbohydrates to fuel activity and fat for hormonal health.</p>
          <h3>Muscle Gain (High Protein + Carbs)</h3>
          <p>For building muscle in a calorie surplus: approximately 30% protein, 45% carbohydrates, 25% fat. Carbohydrates are critical for fuelling intense training and post-workout glycogen replenishment. Protein remains high to maximise muscle protein synthesis.</p>
          <div className="macro-highlight">
            <strong>The one non-negotiable macro:</strong> Protein. Whether your goal is weight loss, muscle gain, or maintenance — virtually every nutrition expert agrees that most Indians eat too little protein. The average Indian diet provides 30–50g/day; optimal is closer to 100–150g depending on your body weight.
          </div>
        </div>

        <div className="macro-section">
          <h2>Protein: The Most Important Macro for Indians</h2>
          <p>India faces what researchers call a &ldquo;protein paradox&rdquo; — a vegetarian-leaning culture with widespread protein deficiency. A 2017 survey by the Indian Market Research Bureau found that <strong>84% of Indians are protein deficient</strong>, consuming less than the recommended amount. This has widespread consequences: poor muscle mass, slower metabolism, impaired immunity, and difficulty with weight management.</p>
          <h3>How Much Protein Do You Need?</h3>
          <table className="macro-table">
            <thead><tr><th>Goal</th><th>Protein Target</th><th>For a 65 kg person</th></tr></thead>
            <tbody>
              <tr><td>Sedentary (general health)</td><td>0.8 g per kg body weight</td><td>52 g/day</td></tr>
              <tr><td>Active adult (light exercise)</td><td>1.2–1.4 g/kg</td><td>78–91 g/day</td></tr>
              <tr><td>Weight loss (preserving muscle)</td><td>1.6–2.0 g/kg</td><td>104–130 g/day</td></tr>
              <tr><td>Muscle building</td><td>1.8–2.2 g/kg</td><td>117–143 g/day</td></tr>
              <tr><td>Older adults (45+)</td><td>1.4–1.8 g/kg</td><td>91–117 g/day</td></tr>
            </tbody>
          </table>
          <h3>Vegetarian Protein Sources for Indians</h3>
          <div className="food-card">
            <h4>🌿 High-Protein Vegetarian Foods (Indian)</h4>
            <table className="macro-table">
              <thead><tr><th>Food</th><th>Serving</th><th>Protein</th></tr></thead>
              <tbody>
                <tr><td>Paneer (low-fat)</td><td>100g</td><td>18–22g</td></tr>
                <tr><td>Curd / Greek yogurt</td><td>200g</td><td>12–20g</td></tr>
                <tr><td>Soya chunks (cooked)</td><td>100g</td><td>17g</td></tr>
                <tr><td>Moong dal (cooked)</td><td>1 cup</td><td>14g</td></tr>
                <tr><td>Rajma / Chickpeas</td><td>1 cup cooked</td><td>12–15g</td></tr>
                <tr><td>Tofu (firm)</td><td>100g</td><td>8–17g</td></tr>
                <tr><td>Whole eggs</td><td>2 eggs</td><td>12g</td></tr>
                <tr><td>Milk (full-fat)</td><td>250ml</td><td>8g</td></tr>
                <tr><td>Peanut butter</td><td>2 tbsp</td><td>8g</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Complete vs. Incomplete Proteins</h3>
          <p>Plant proteins are often &ldquo;incomplete&rdquo; — they lack one or more of the 9 essential amino acids. The solution is combining complementary proteins throughout the day: rice + dal (a classic Indian combination) provides a complete amino acid profile. You don&apos;t need to eat them at the same meal — just throughout the same day. Soya, quinoa, and dairy are complete proteins even individually.</p>
        </div>

        <div className="macro-section">
          <h2>Carbohydrates in an Indian Context</h2>
          <p>Carbohydrates are demonised in many popular diets, but they&apos;re the body&apos;s preferred fuel — especially for the brain and high-intensity exercise. The problem in Indian diets isn&apos;t carbohydrates per se, but <strong>refined carbohydrates and portion sizes</strong>.</p>
          <h3>Refined vs. Complex Carbs</h3>
          <p>White rice, maida (refined flour), white bread, and sugary sweets cause rapid blood sugar spikes followed by crashes — increasing hunger, fat storage (via insulin), and long-term diabetes risk. Complex carbohydrates from millets (jowar, bajra, ragi), brown rice, oats, and whole wheat digest slowly, providing steady energy and better blood sugar control.</p>
          <p>Fibre — a type of indigestible carbohydrate — is particularly important and most Indians are severely deficient. Aim for 25–35g of fibre daily from sabzis, legumes, whole grains, and fruits.</p>
          <h3>Low-GI Carb Swaps for Indian Cooking</h3>
          <table className="macro-table">
            <thead><tr><th>High-GI Option</th><th>Lower-GI Swap</th><th>Benefit</th></tr></thead>
            <tbody>
              <tr><td>White rice (2 cups)</td><td>1 cup rice + millet or reduce portion</td><td>Lower spike, more fibre</td></tr>
              <tr><td>Maida roti / naan</td><td>Whole wheat roti</td><td>More fibre, slower digestion</td></tr>
              <tr><td>White bread</td><td>Multigrain / millet bread</td><td>Higher protein and fibre</td></tr>
              <tr><td>Sugary chai (3/day)</td><td>Unsweetened or 1 tsp sugar max</td><td>Saves 80–120 kcal/day</td></tr>
            </tbody>
          </table>
        </div>

        <div className="macro-section">
          <h2>Dietary Fats: The Good and the Bad</h2>
          <p>Fat is not the enemy — but the <em>type</em> of fat matters enormously. Indian cooking uses a variety of fats, from traditional ghee and coconut oil to refined vegetable oils and vanaspati (partially hydrogenated oil).</p>
          <table className="macro-table">
            <thead><tr><th>Fat Type</th><th>Examples in Indian Cooking</th><th>Health Impact</th></tr></thead>
            <tbody>
              <tr><td>Saturated fat (in moderation)</td><td>Ghee, coconut oil, full-fat dairy</td><td>Neutral to slightly positive in moderation</td></tr>
              <tr><td>Monounsaturated (MUFA)</td><td>Groundnut oil, olive oil, avocado</td><td>Heart-protective; good for blood lipids</td></tr>
              <tr><td>Polyunsaturated (PUFA)</td><td>Mustard oil, fish, walnuts, flaxseed</td><td>Anti-inflammatory; essential omega-3s</td></tr>
              <tr><td>Trans fat (avoid)</td><td>Vanaspati, commercial fried snacks, margarine</td><td>Strongly linked to heart disease</td></tr>
            </tbody>
          </table>
          <div className="macro-highlight">
            <strong>Best cooking fats for Indians:</strong> Cold-pressed mustard oil or groundnut oil for everyday cooking (high smoke point, good fat profile). Small amounts of ghee for flavour — it&apos;s traditional and not the villain it&apos;s made out to be in moderation. Avoid refined oils (refined sunflower, refined palm) as primary cooking fat.
          </div>
        </div>

        <div className="macro-cta-bar">
          <h3>Know How Many Calories You&apos;re Burning?</h3>
          <p>Use our Calorie Burn Calculator to see how many calories your workouts actually burn.</p>
          <Link href="/calorie-burn-calculator">Try Calorie Burn Calculator &rarr;</Link>
        </div>

        <div className="macro-section">
          <h2>Frequently Asked Questions</h2>
          {macroFaqs.map((faq, i) => (
            <div key={i} className="macro-faq-item">
              <div className="macro-faq-q" onClick={() => toggleFAQ(i)}>
                {faq.q}
                <span className={`macro-faq-icon${faqOpen[i] ? ' open' : ''}`}>+</span>
              </div>
              <div className={`macro-faq-a${faqOpen[i] ? ' open' : ''}`}>
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
