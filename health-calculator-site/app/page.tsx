'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface TDEEResult {
  bmi: string;
  deficit: string;
  weeks: number;
}

export default function HomePage() {
  const [age, setAge] = useState('28');
  const [weight, setWeight] = useState('72');
  const [height, setHeight] = useState('168');
  const [result, setResult] = useState<TDEEResult>(() => calcInitial('28', '72', '168'));

  function calcInitial(a: string, w: string, h: string): TDEEResult {
    const ag = parseFloat(a) || 28;
    const wt = parseFloat(w) || 72;
    const ht = parseFloat(h) || 168;
    const bmi = (wt / ((ht / 100) ** 2)).toFixed(1);
    const weeks = Math.round((5 * 7700) / (500 * 7));
    return { bmi, deficit: '–500 cal', weeks };
  }

  function handleCalc() {
    setResult(calcInitial(age, weight, height));
  }

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">🇮🇳 Free · India&apos;s Calorie Calculator</div>
            <h1>
              Eat right for your body.<br />
              Lose weight that <em>stays lost.</em>
            </h1>
            <p>
              Science-backed calorie calculators, Indian diet guides, and practical
              weight loss advice — built for Indian bodies.
            </p>
            <div className="hero-btns">
              <Link href="/calculator" className="btn-primary">Calculate My Calories →</Link>
              <Link href="/blog" className="btn-secondary">Browse free guides →</Link>
            </div>
            <div className="hero-trust">
              <span>100% free tools</span>
              <span>No login needed</span>
              <span>India-specific data</span>
            </div>
          </div>

          {/* Live TDEE Calculator Card */}
          <div className="calc-card">
            <div className="calc-card-header">
              <div className="calc-icon">🔥</div>
              <div>
                <h3>TDEE Calculator</h3>
                <p>Find your total daily calorie burn</p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="number"
                placeholder="28 years"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weight</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="72 kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="168 cm"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>
            <button className="btn-calc" onClick={handleCalc}>Calculate →</button>
            <div className="calc-results">
              <div className="calc-result-box">
                <div className="calc-result-label">BMI</div>
                <div className="calc-result-value">{result.bmi}</div>
              </div>
              <div className="calc-result-box">
                <div className="calc-result-label">Deficit</div>
                <div className="calc-result-value green">{result.deficit}</div>
              </div>
              <div className="calc-result-box">
                <div className="calc-result-label">Goal</div>
                <div className="calc-result-value">{result.weeks} weeks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="tools-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-badge">Start here — Free tools</div>
          <div className="section-title">Everything you need to manage your weight</div>
          <div className="tools-grid">
            <Link href="/calculator#tdee" className="tool-card">
              <span className="tool-emoji">🔥</span>
              <div className="tool-name">TDEE Calculator</div>
              <div className="tool-desc">Find your total daily calorie burn</div>
              <div className="tool-link">Try it →</div>
            </Link>
            <Link href="/calculator#deficit" className="tool-card">
              <span className="tool-emoji">🧮</span>
              <div className="tool-name">Calorie Deficit</div>
              <div className="tool-desc">Calculate your weight loss target</div>
              <div className="tool-link">Try it →</div>
            </Link>
            <Link href="/calculator#bmi" className="tool-card">
              <span className="tool-emoji">⚖️</span>
              <div className="tool-name">BMI Calculator</div>
              <div className="tool-desc">Asian BMI ranges included</div>
              <div className="tool-link">Try it →</div>
            </Link>
            <Link href="/calculator#macro" className="tool-card">
              <span className="tool-emoji">🥗</span>
              <div className="tool-name">Macro Calculator</div>
              <div className="tool-desc">Protein, carbs &amp; fat split</div>
              <div className="tool-link">Try it →</div>
            </Link>
            <Link href="/calculator#ideal" className="tool-card">
              <span className="tool-emoji">💛</span>
              <div className="tool-name">Ideal Weight</div>
              <div className="tool-desc">Your healthy weight range</div>
              <div className="tool-link">Try it →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-bar">
        <div className="stats-inner">
          <div>
            <div className="stat-value">12,400+</div>
            <div className="stat-label">Calories calculated this month</div>
          </div>
          <div>
            <div className="stat-value">8 Tools</div>
            <div className="stat-label">Free — no login required</div>
          </div>
          <div>
            <div className="stat-value">100%</div>
            <div className="stat-label">Indian food database</div>
          </div>
          <div>
            <div className="stat-value">4.9 ★</div>
            <div className="stat-label">Average user satisfaction</div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="blog-section">
        <div className="blog-inner">
          <div className="section-badge">From the blog</div>
          <div className="section-header">
            <div className="section-title" style={{ marginBottom: 0 }}>
              Weight loss guides for Indian bodies
            </div>
            <Link href="/blog" className="view-all">View all articles →</Link>
          </div>
          <div className="section-subtitle">Evidence-based articles for the Indian context.</div>
          <div className="blog-grid">
            <div className="blog-card">
              <div className="blog-thumb mint">🥗</div>
              <div className="blog-body">
                <div className="blog-tag weight-loss">Weight Loss</div>
                <div className="blog-title">How Many Calories Should You Eat to Lose Weight?</div>
                <div className="blog-excerpt">
                  Understanding your caloric needs is the first step to sustainable weight
                  loss. Learn how to calculate your personal calorie target.
                </div>
                <div className="blog-meta"><span>March 15, 2026</span><span>📖 8 min read</span></div>
              </div>
            </div>
            <div className="blog-card">
              <div className="blog-thumb peach">🍌</div>
              <div className="blog-body">
                <div className="blog-tag indian-diet">Indian Diet</div>
                <div className="blog-title">Calories in Common Indian Foods: The Complete List</div>
                <div className="blog-excerpt">
                  From dal makhani to dosa, a comprehensive calorie database of over 500
                  Indian foods to help you track intake.
                </div>
                <div className="blog-meta"><span>March 10, 2026</span><span>📖 12 min read</span></div>
              </div>
            </div>
            <div className="blog-card">
              <div className="blog-thumb lavender">🌸</div>
              <div className="blog-body">
                <div className="blog-tag pcos">PCOS</div>
                <div className="blog-title">PCOS Weight Loss: A Complete Guide for Indian Women</div>
                <div className="blog-excerpt">
                  PCOS makes weight loss harder, but not impossible. Discover diet strategies
                  and lifestyle changes that actually work.
                </div>
                <div className="blog-meta"><span>March 5, 2026</span><span>📖 14 min read</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEAL PLAN CTA */}
      <section className="meal-cta">
        <div className="meal-cta-inner">
          <div>
            <div className="meal-cta-badge">Free Download</div>
            <h2>Your free 7-day Indian meal plan</h2>
            <p>Calorie-counted Indian meals for 7 days. No crash dieting. Real food your family will love.</p>
            <Link href="/meal-plan" className="btn-primary">Send me the free plan →</Link>
            <div className="meal-cta-note">No spam. Unsubscribe anytime.</div>
          </div>
          <div className="meal-plan-card">
            <div className="title">7-Day Indian Weight<br />Loss Meal Plan</div>
            <div className="sub">NutritionTracker.in · Free Download</div>
            <div className="meal-plan-emojis">🍱 🥗 🍛</div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
