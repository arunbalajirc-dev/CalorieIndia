'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BMIResult {
  bmi: string;
  cat: string;
  sub: string;
  color: string;
  pointerPct: number;
}

interface FAQState {
  [key: number]: boolean;
}

export default function BMICalculatorPage() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<BMIResult | null>(null);
  const [faqOpen, setFaqOpen] = useState<FAQState>({});

  function calcBMI() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) { alert('Please fill all fields.'); return; }
    const hm = h / 100;
    const bmi = (w / (hm * hm)).toFixed(1);
    let cat: string, color: string, sub: string;
    if (+bmi < 18.5) {
      cat = 'Underweight'; color = '#bbdefb'; sub = 'Below 18.5 — consider gaining weight healthily';
    } else if (+bmi < 23) {
      cat = 'Normal Weight ✓'; color = '#c8e6c9'; sub = 'Healthy range for Indians (18.5–22.9)';
    } else if (+bmi < 25) {
      cat = 'Overweight'; color = '#ffe0b2'; sub = 'Above healthy range for Asians (23.0–24.9)';
    } else if (+bmi < 30) {
      cat = 'Obese (Class I)'; color = '#ffcdd2'; sub = 'Significantly above healthy range';
    } else {
      cat = 'Obese (Class II+)'; color = '#ef9a9a'; sub = 'High health risk — medical consultation advised';
    }
    const pointerPct = Math.min(Math.max(((+bmi - 16) / 20) * 100, 2), 98);
    setResult({ bmi, cat, sub, color, pointerPct });
  }

  function toggleFAQ(idx: number) {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  const faqs = [
    {
      q: 'What is a good BMI for an Indian woman?',
      a: 'For Indian women, a BMI between 18.5 and 22.9 is considered healthy by Asian standards. A BMI of 23 or above indicates overweight, and 25 or above indicates obesity. These thresholds are lower than Western standards because South Asian women tend to develop metabolic diseases at lower BMI levels.',
    },
    {
      q: 'Is BMI 23 overweight for Indians?',
      a: 'Yes, by Asian/Indian standards, a BMI of 23 is classified as overweight. While a BMI of 23 is considered perfectly healthy in Western charts, multiple studies in India and South Asia have found increased metabolic risk (especially for diabetes and heart disease) starting from BMI 23.',
    },
    {
      q: 'My BMI says I\'m overweight but I feel healthy. What should I do?',
      a: "Don't panic — BMI is a screening tool, not a diagnosis. If you're physically active, eat well, and have normal blood sugar, cholesterol, and blood pressure, a slightly elevated BMI may not be medically significant. Measure your waist circumference and see a doctor for metabolic blood tests to get a complete picture.",
    },
    {
      q: 'Can I be healthy at BMI 25 or above?',
      a: "For Indians, BMI 25+ is in the obese range and does carry increased health risk on a population level. However, individual health outcomes depend on many factors — fitness level, metabolic health markers, lifestyle habits, and family history. See a doctor for personalised advice.",
    },
    {
      q: 'Is BMI accurate during pregnancy?',
      a: 'No. BMI is not accurate or relevant during pregnancy. Weight gain during pregnancy is normal and necessary. Pre-pregnancy BMI is used to guide appropriate weight gain during pregnancy, but this should be managed by your OB-GYN, not a calculator.',
    },
  ];

  return (
    <>
      <Navbar />

      <div className="bmi-hero">
        <div className="breadcrumb">
          <Link href="/calculator">Home</Link> › BMI Calculator
        </div>
        <span className="hero-emoji">⚖️</span>
        <h1>BMI Calculator <span>for Indians</span></h1>
        <p>
          Get your BMI using Asian-specific healthy weight ranges — because standard
          Western BMI charts don&apos;t apply to Indian body types.
        </p>
      </div>

      <section className="bmi-calc-section">
        <div className="bmi-calc-card">
          <h2>Calculate Your BMI (Asian Standards)</h2>
          <div className="form-grid">
            <div className="bmi-form-group">
              <label>Weight (kg)</label>
              <input type="number" placeholder="e.g. 68" min={20} max={200} value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="bmi-form-group">
              <label>Height (cm)</label>
              <input type="number" placeholder="e.g. 168" min={100} max={230} value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>
          <button className="calc-btn" onClick={calcBMI}>Calculate BMI →</button>

          {result && (
            <div style={{ marginTop: '32px' }}>
              <div className="bmi-result-main" style={{ background: result.color }}>
                <div className="label">Your BMI</div>
                <div className="value">{result.bmi}</div>
                <div className="category">{result.cat}</div>
                <div className="sub">{result.sub}</div>
              </div>
              <div className="bmi-scale">
                <div className="bmi-bar">
                  <div className="bmi-pointer" style={{ left: result.pointerPct + '%' }} />
                </div>
                <div className="bmi-labels">
                  <span>16</span><span>18.5</span><span>23</span><span>25</span><span>30</span><span>35+</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="content-wrap">
        <div className="bmi-section">
          <h2>What is BMI?</h2>
          <p>
            <strong>BMI (Body Mass Index)</strong> is a simple numerical measure calculated from your height and weight.
            It was developed in the 1830s by Belgian statistician Adolphe Quetelet as a population-level screening tool
            — not an individual diagnostic measure.
          </p>
          <div style={{ background: '#1a1a1a', color: '#e0f2f1', borderRadius: '12px', padding: '24px', margin: '20px 0', fontFamily: 'monospace', fontSize: '1.1rem', textAlign: 'center' }}>
            BMI = Weight (kg) ÷ Height² (m²)
          </div>
          <p>
            For example, a person who is 170 cm (1.70 m) tall and weighs 70 kg has a BMI of 70 ÷ (1.70 × 1.70) = <strong>24.2</strong>.
          </p>
        </div>

        <div className="bmi-section">
          <h2>BMI Chart for Indians: Asian vs. Western Standards</h2>
          <p>
            This is the most important thing to understand about BMI if you&apos;re Indian:{' '}
            <strong>standard Western BMI cutoffs are wrong for you.</strong>
          </p>
          <p>
            Multiple studies, including landmark research from the Indian Council of Medical Research (ICMR) and WHO&apos;s
            expert panel on Asian BMI, have shown that South Asians develop obesity-related health conditions like Type 2
            diabetes, hypertension, and cardiovascular disease at <em>lower BMI values</em> than Western populations.
          </p>
          <table className="bmi-table">
            <thead>
              <tr><th>BMI Range</th><th>Western Classification</th><th>Asian / Indian Classification</th></tr>
            </thead>
            <tbody>
              <tr><td>Below 18.5</td><td className="uw">Underweight</td><td className="uw">Underweight</td></tr>
              <tr><td>18.5 – 22.9</td><td className="norm">Normal weight</td><td className="norm">Normal weight</td></tr>
              <tr><td>23.0 – 24.9</td><td className="norm">Normal weight</td><td className="ow">Overweight</td></tr>
              <tr><td>25.0 – 29.9</td><td className="ow">Overweight</td><td className="ob">Obese (Class I)</td></tr>
              <tr><td>30.0 and above</td><td className="ob">Obese</td><td className="ob">Obese (Class II+)</td></tr>
            </tbody>
          </table>
          <div className="highlight-box">
            <strong>Key takeaway:</strong> If you&apos;re Indian and your BMI is 23–24.9, Western charts say you&apos;re
            &ldquo;normal&rdquo; but Asian guidelines flag this as overweight. A BMI of 25 for an Indian person corresponds
            to the health risk of a BMI of 30 in a Caucasian person.
          </div>
        </div>

        <div className="bmi-section">
          <h2>Why Do Indians Need Different BMI Ranges?</h2>
          <h3>The &ldquo;Thin-Fat Indian&rdquo; Phenomenon</h3>
          <p>
            Indian doctors coined the term &ldquo;thin-fat Indian&rdquo; to describe a common pattern: South Asians who
            appear lean or have a &ldquo;normal&rdquo; Western BMI but carry a high percentage of body fat — particularly
            visceral fat around the organs.
          </p>
          <h3>Research Evidence</h3>
          <p>
            A study published in <em>The Lancet</em> analysed data from over 800,000 individuals across South, East and
            Southeast Asia. It found that the optimal BMI cutoff for identifying risk of Type 2 diabetes in South Asians
            is around 22–23, compared to 25 in European populations.
          </p>
          <h3>Muscle Mass Differences</h3>
          <p>
            Indians on average have lower skeletal muscle mass compared to Europeans at the same body weight. Since BMI
            doesn&apos;t distinguish between fat and muscle, a lower BMI threshold is needed to capture the same level of
            metabolic risk in Indians.
          </p>
        </div>

        <div className="bmi-section">
          <h2>Limitations of BMI — What BMI Doesn&apos;t Tell You</h2>
          <h3>1. Fat vs. Muscle</h3>
          <p>
            A muscular athlete can have a BMI of 27 (classified as overweight) while being extremely healthy. Always pair
            BMI with waist circumference and lifestyle assessment.
          </p>
          <h3>2. Fat Distribution</h3>
          <p>
            Where you carry fat matters enormously. Abdominal fat (apple shape) is far more dangerous than hip-and-thigh
            fat (pear shape). Waist-to-height ratio is actually a better predictor of cardiovascular risk than BMI.
          </p>
          <h3>3. Age and Sex</h3>
          <p>Women naturally have more body fat than men at the same BMI.</p>
          <h3>4. Ethnicity</h3>
          <p>BMI was developed using European populations. The cutoffs recommended for Indians do not apply directly to other populations.</p>
          <div className="highlight-box">
            <strong>Use BMI as a starting point.</strong> For a more complete picture, combine BMI with: waist
            circumference, fasting blood glucose, blood pressure, and HbA1c.
          </div>
        </div>

        <div className="bmi-section">
          <h2>Healthy Waist Circumference for Indians</h2>
          <table className="bmi-table">
            <thead><tr><th>Measure</th><th>Men (Indian)</th><th>Women (Indian)</th></tr></thead>
            <tbody>
              <tr><td>Waist Circumference (low risk)</td><td>Below 85 cm</td><td>Below 80 cm</td></tr>
              <tr><td>Waist Circumference (elevated risk)</td><td>85–90 cm</td><td>80–85 cm</td></tr>
              <tr><td>Waist Circumference (high risk)</td><td>Above 90 cm</td><td>Above 85 cm</td></tr>
            </tbody>
          </table>
        </div>

        <div className="teal-cta-bar">
          <h3>Know Your Ideal Weight</h3>
          <p>Find the exact healthy weight range for your height using our Ideal Weight Calculator.</p>
          <Link href="/ideal-weight-calculator">Try Ideal Weight Calculator →</Link>
        </div>

        <div className="bmi-section">
          <h2>Frequently Asked Questions</h2>
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => toggleFAQ(i)}>
                {faq.q}
                <span className={`faq-icon${faqOpen[i] ? ' open' : ''}`}>+</span>
              </div>
              <div className={`faq-a${faqOpen[i] ? ' open' : ''}`}>
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
