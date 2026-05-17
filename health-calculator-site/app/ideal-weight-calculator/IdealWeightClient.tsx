'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { idealWeightFaqs } from '@/lib/calculator-faqs';

export { idealWeightFaqs };

interface IWCResult {
  lower: number;
  upper: number;
  opt: number;
}

interface FAQState { [key: number]: boolean; }

export default function IdealWeightClient() {
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState<IWCResult | null>(null);
  const [faqOpen, setFaqOpen] = useState<FAQState>({});

  function calcIdealWeight() {
    const h = parseFloat(height);
    if (!h) { alert('Please enter your height.'); return; }
    const hm = h / 100;
    setResult({
      lower: Math.round(18.5 * hm * hm),
      upper: Math.round(22.9 * hm * hm),
      opt: Math.round(21 * hm * hm),
    });
  }

  function toggleFAQ(idx: number) {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <>
      <Navbar />

      <div className="iwc-hero">
        <div className="breadcrumb">
          <Link href="/calculator" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link> &rsaquo; Ideal Weight Calculator
        </div>
        <span className="hero-emoji">💛</span>
        <h1>Ideal Weight Calculator <span>for Indians</span></h1>
        <p>Find your healthy weight range based on your height and gender — using Asian BMI standards that are more accurate for Indian body types.</p>
      </div>

      <section className="iwc-calc-section">
        <div className="iwc-calc-card">
          <h2>Calculate Your Healthy Weight Range</h2>
          <div className="form-grid">
            <div className="iwc-form-group">
              <label>Height (cm)</label>
              <input type="number" placeholder="e.g. 165" min={100} max={230} value={height} onChange={e => setHeight(e.target.value)} />
            </div>
            <div className="iwc-form-group">
              <label>Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <button className="iwc-calc-btn" onClick={calcIdealWeight}>Calculate &rarr;</button>

          {result && (
            <div style={{ marginTop: '32px' }}>
              <div className="iwc-result-main">
                <div className="label">Healthy Weight Range (Asian BMI 18.5–22.9)</div>
                <div className="range">{result.lower} – {result.upper} kg</div>
                <div className="sub">Optimal target: {result.opt} kg (BMI 21)</div>
              </div>
              <div className="iwc-result-grid">
                <div className="iwc-r-box">
                  <div className="r-label">Lower bound</div>
                  <div className="r-val">{result.lower} kg</div>
                  <div className="r-sub">BMI 18.5</div>
                </div>
                <div className="iwc-r-box opt">
                  <div className="r-label">Optimal target</div>
                  <div className="r-val">{result.opt} kg</div>
                  <div className="r-sub">BMI 21 (midpoint)</div>
                </div>
                <div className="iwc-r-box">
                  <div className="r-label">Upper bound</div>
                  <div className="r-val">{result.upper} kg</div>
                  <div className="r-sub">BMI 22.9 (Asian)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="content-wrap">
        <div className="iwc-section">
          <h2>What is &ldquo;Ideal Body Weight&rdquo;?</h2>
          <p>The concept of &ldquo;ideal body weight&rdquo; has evolved significantly over the decades. Originally developed by Metropolitan Life Insurance tables in the 1940s–60s to estimate mortality risk by height and frame size, it has since been refined using BMI-based population research. Today, &ldquo;healthy weight range&rdquo; is considered more accurate and less judgmental than a single &ldquo;ideal&rdquo; number, since healthy weight depends on individual factors like muscle mass, bone density, and body composition.</p>
          <p>For Indians, this range is calculated using <strong>Asian BMI standards</strong>: BMI 18.5–22.9, rather than the Western standard of 18.5–24.9. This is because South Asians develop metabolic health problems at lower BMI values than Europeans (see our <Link href="/bmi-calculator">BMI Calculator</Link> page for the full explanation).</p>
          <div className="iwc-highlight">
            <strong>Important:</strong> A healthy weight range is just that — a range. You don&apos;t need to be at the bottom or a specific number within this range. Any weight within the healthy BMI range of 18.5–22.9 is a legitimate, healthy target.
          </div>
        </div>

        <div className="iwc-section">
          <h2>Healthy Weight Chart for Indian Men and Women</h2>
          <p>The table below shows the healthy weight ranges for common heights in India, calculated using Asian BMI cutoffs (18.5–22.9):</p>
          <h3>For Indian Men</h3>
          <table className="iwc-table">
            <thead><tr><th>Height</th><th>Lower Bound (BMI 18.5)</th><th>Optimal (BMI 21)</th><th>Upper Bound (BMI 22.9)</th></tr></thead>
            <tbody>
              <tr><td>155 cm (5&apos;1&quot;)</td><td>44 kg</td><td>50 kg</td><td>55 kg</td></tr>
              <tr><td>160 cm (5&apos;3&quot;)</td><td>47 kg</td><td>54 kg</td><td>59 kg</td></tr>
              <tr><td>165 cm (5&apos;5&quot;)</td><td>50 kg</td><td>57 kg</td><td>62 kg</td></tr>
              <tr><td>170 cm (5&apos;7&quot;)</td><td>53 kg</td><td>61 kg</td><td>66 kg</td></tr>
              <tr><td>175 cm (5&apos;9&quot;)</td><td>57 kg</td><td>64 kg</td><td>70 kg</td></tr>
              <tr><td>180 cm (5&apos;11&quot;)</td><td>60 kg</td><td>68 kg</td><td>74 kg</td></tr>
            </tbody>
          </table>
          <h3>For Indian Women</h3>
          <table className="iwc-table">
            <thead><tr><th>Height</th><th>Lower Bound (BMI 18.5)</th><th>Optimal (BMI 21)</th><th>Upper Bound (BMI 22.9)</th></tr></thead>
            <tbody>
              <tr><td>145 cm (4&apos;9&quot;)</td><td>39 kg</td><td>44 kg</td><td>48 kg</td></tr>
              <tr><td>150 cm (4&apos;11&quot;)</td><td>42 kg</td><td>47 kg</td><td>52 kg</td></tr>
              <tr><td>155 cm (5&apos;1&quot;)</td><td>44 kg</td><td>50 kg</td><td>55 kg</td></tr>
              <tr><td>160 cm (5&apos;3&quot;)</td><td>47 kg</td><td>54 kg</td><td>59 kg</td></tr>
              <tr><td>165 cm (5&apos;5&quot;)</td><td>50 kg</td><td>57 kg</td><td>62 kg</td></tr>
              <tr><td>170 cm (5&apos;7&quot;)</td><td>53 kg</td><td>61 kg</td><td>66 kg</td></tr>
            </tbody>
          </table>
        </div>

        <div className="iwc-section">
          <h2>Multiple Formulas for Ideal Body Weight</h2>
          <p>There are several historical formulas used to calculate ideal body weight. Each gives slightly different results, and none is definitively &ldquo;correct&rdquo; — they&apos;re all approximations:</p>
          <table className="iwc-table">
            <thead><tr><th>Formula</th><th>For Men (170 cm)</th><th>For Women (160 cm)</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td>BMI-based (Asian, this calculator)</td><td>53–66 kg</td><td>47–59 kg</td><td>Most relevant for Indians</td></tr>
              <tr><td>Devine Formula (1974)</td><td>~68 kg</td><td>~57 kg</td><td>Used in clinical medicine (drug dosing)</td></tr>
              <tr><td>Hamwi Formula (1964)</td><td>~66 kg</td><td>~57 kg</td><td>Similar to Devine</td></tr>
              <tr><td>Robinson Formula (1983)</td><td>~65 kg</td><td>~55 kg</td><td>A revision of Devine</td></tr>
            </tbody>
          </table>
          <p>For practical weight goals, the BMI-based Asian range is the most appropriate for Indians. The other formulas (Devine, Hamwi, Robinson) were developed in Western populations and tend to suggest slightly higher targets than are optimal for South Asians.</p>
        </div>

        <div className="iwc-section">
          <h2>Ideal Weight vs. Healthy Weight: Why the Difference Matters</h2>
          <h3>The Problem With Chasing a Single Number</h3>
          <p>Many Indians — especially women — fixate on a specific &ldquo;goal weight&rdquo; like 55 kg or 60 kg, often driven by cultural comparisons or past weight history. But body weight fluctuates daily by 1–3 kg due to water retention, food volume, digestion, and hormonal changes. Obsessing over a single number on the scale is both inaccurate and psychologically harmful.</p>
          <p>A healthier approach: aim for a weight range (e.g., 55–60 kg), prioritise how you feel and your health markers (energy, blood sugar, blood pressure, strength), and judge progress by monthly trends — not daily weigh-ins.</p>
          <h3>Body Composition Matters More Than Scale Weight</h3>
          <p>Two people at the same weight and height can look and feel very different depending on their body composition. A person with 20% body fat and 60 kg of lean mass will look leaner and be healthier than someone at the same scale weight with 35% body fat. Resistance training builds muscle and reduces fat even without changing your scale weight — a phenomenon called &ldquo;body recomposition&rdquo; that is common in Indian women who start lifting weights for the first time.</p>
          <div className="iwc-highlight">
            <strong>Better measures of progress than scale weight:</strong> Waist circumference. How clothes fit. Energy levels. Strength in the gym. Blood glucose and HbA1c. Blood pressure. Monthly photos. These tell a far more complete story than a number on the scale.
          </div>
        </div>

        <div className="iwc-section">
          <h2>How to Reach Your Ideal Weight Range</h2>
          <p>If your current weight is above the healthy range, a structured, moderate approach works best:</p>
          <h3>Step 1: Find Your TDEE</h3>
          <p>Use our <Link href="/tdee-calculator">TDEE Calculator</Link> to find how many calories your body burns daily. This is your starting baseline.</p>
          <h3>Step 2: Set a Moderate Deficit</h3>
          <p>Aim to eat 400–500 calories below your TDEE daily. Use our <Link href="/calorie-deficit-calculator">Calorie Deficit Calculator</Link> to get your target and timeline.</p>
          <h3>Step 3: Prioritise Protein</h3>
          <p>Eat at least 1.6g of protein per kg of goal body weight. This preserves muscle during weight loss and keeps you full. Use our <Link href="/macro-calculator">Macro Calculator</Link> for your personalised split.</p>
          <h3>Step 4: Add Resistance Training</h3>
          <p>Aim for at least 2 strength training sessions per week. This preserves muscle mass during a calorie deficit and permanently elevates your resting metabolism.</p>
          <h3>Step 5: Be Patient and Track Monthly</h3>
          <p>At 0.5 kg/week, it takes about 20 weeks (5 months) to lose 10 kg sustainably. This is not slow — this is the fastest rate that preserves muscle and metabolic health. Anyone promising faster results is selling you rapid water and muscle loss followed by rebound.</p>
        </div>

        <div className="iwc-cta-bar">
          <h3>Know Your Daily Calorie Budget</h3>
          <p>Calculate how many calories you need to reach your ideal weight — and when you&apos;ll get there.</p>
          <Link href="/calorie-deficit-calculator">Calorie Deficit Calculator &rarr;</Link>
        </div>

        <div className="iwc-section">
          <h2>Frequently Asked Questions</h2>
          {idealWeightFaqs.map((faq, i) => (
            <div key={i} className="iwc-faq-item">
              <div className="iwc-faq-q" onClick={() => toggleFAQ(i)}>
                {faq.q}
                <span className={`iwc-faq-icon${faqOpen[i] ? ' open' : ''}`}>+</span>
              </div>
              <div className={`iwc-faq-a${faqOpen[i] ? ' open' : ''}`}>
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
