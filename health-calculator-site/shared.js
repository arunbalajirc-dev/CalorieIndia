/* shared.js — header, footer + Supabase tracking */

const SUPABASE_URL = 'https://clutyaynlukgsumnopkf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdXR5YXlubHVrZ3N1bW5vcGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTAwMzcsImV4cCI6MjA5MDUyNjAzN30.rhWn8jZI0KegFiOrCG8aVDpNVnDhLxrSz-0R62jxja0';

async function supabaseInsert(table, data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) console.warn('Supabase insert failed', await res.text());
  } catch(e) { console.warn('Supabase error', e); }
}

function getUTM() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get('utm_source') || null,
    utm_medium: p.get('utm_medium') || null,
    utm_campaign: p.get('utm_campaign') || null
  };
}

window.trackCalc = async function(type, inputs, resultValue, resultDetails) {
  await supabaseInsert('calculator_leads', {
    calculator_type: type,
    age: inputs.age || null,
    gender: inputs.gender || null,
    weight_kg: inputs.weight || null,
    height_cm: inputs.height || null,
    activity_level: inputs.activity || null,
    result_value: String(resultValue),
    result_details: resultDetails || {},
    user_agent: navigator.userAgent
  });
};

window.trackMealPlan = async function(email, name) {
  const utm = getUTM();
  await supabaseInsert('meal_plan_leads', {
    email, name: name || null, source: 'meal-plan-cta', ...utm,
    user_agent: navigator.userAgent
  });
};

const MODAL_HTML = `
<div id="meal-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2000;align-items:center;justify-content:center;">
  <div style="background:#fff;border-radius:16px;padding:36px;max-width:420px;width:90%;position:relative;">
    <button onclick="document.getElementById('meal-modal').style.display='none'"
      style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:20px;cursor:pointer;color:#999;">✕</button>
    <div style="font-size:32px;margin-bottom:12px;">🍱</div>
    <h2 style="font-size:22px;font-weight:700;margin-bottom:8px;">Get your free 7-day meal plan</h2>
    <p style="font-size:14px;color:#6b7280;margin-bottom:20px;">Calorie-counted Indian meals. No spam. Unsubscribe anytime.</p>
    <input id="modal-name" type="text" placeholder="Your name"
      style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;font-family:inherit;margin-bottom:10px;outline:none;display:block;"/>
    <input id="modal-email" type="email" placeholder="Your email address"
      style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;font-family:inherit;outline:none;display:block;margin-bottom:12px;"/>
    <button onclick="submitMealPlan()"
      style="width:100%;background:#2d7a4f;color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">
      Send me the free plan →
    </button>
    <div id="modal-success" style="display:none;margin-top:12px;text-align:center;color:#2d7a4f;font-size:14px;font-weight:500;">
      ✅ Check your inbox! Sending your plan now.
    </div>
  </div>
</div>`;

window.openMealModal = function() {
  document.getElementById('meal-modal').style.display = 'flex';
};

window.submitMealPlan = async function() {
  const email = document.getElementById('modal-email').value.trim();
  const name  = document.getElementById('modal-name').value.trim();
  if (!email || !email.includes('@')) { alert('Please enter a valid email.'); return; }
  await trackMealPlan(email, name);
  document.getElementById('modal-success').style.display = 'block';
  setTimeout(() => { document.getElementById('meal-modal').style.display = 'none'; }, 2500);
};

// ── end Supabase section ──

const HEADER_HTML = `
<header>
  <div class="header-inner">
    <a href="index.html" class="logo">
      <div class="logo-dot"></div>
      <span>Nutrition Tracker</span>
    </a>
    <nav>
      <a href="calculator.html">Calculators</a>
      <a href="weight-loss.html">Weight Loss</a>
      <a href="indian-diet.html">Indian Diet</a>
      <a href="pcos.html">PCOS</a>
      <a href="blog.html">Blog</a>
    </nav>
    <a href="meal-plan.html" class="btn-cta">Get Free Meal Plan →</a>
  </div>
</header>`;

const FOOTER_HTML = `
<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="index.html" class="logo">
          <div class="logo-dot"></div>
          <span>Nutrition Tracker</span>
        </a>
        <p style="margin-top:10px">India's most practical weight loss resource.</p>
        <div class="footer-flags">🇮🇳 ❤️ 🥗</div>
      </div>
      <div class="footer-col">
        <h4>Calculators</h4>
        <ul>
          <li><a href="calculator.html#tdee">TDEE Calculator</a></li>
          <li><a href="calculator.html#deficit">Calorie Deficit Calculator</a></li>
          <li><a href="calculator.html#bmi">BMI Calculator</a></li>
          <li><a href="calculator.html#macro">Macro Calculator</a></li>
          <li><a href="calculator.html#ideal">Ideal Weight Calculator</a></li>
          <li><a href="calculator.html#burn">Calorie Burn Calculator</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Articles</h4>
        <ul>
          <li><a href="weight-loss.html">Weight Loss Basics</a></li>
          <li><a href="indian-diet.html">Indian Diet Guide</a></li>
          <li><a href="pcos.html">PCOS &amp; Weight Loss</a></li>
          <li><a href="blog.html">Calorie Counting Tips</a></li>
          <li><a href="blog.html">Healthy Indian Recipes</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Info</h4>
        <ul>
          <li><a href="about.html">About Us</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="privacy.html">Privacy Policy</a></li>
          <li><a href="terms.html">Terms of Use</a></li>
          <li><a href="disclaimer.html">Disclaimer</a></li>
          <li><a href="sitemap.html">Sitemap</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Nutrition Tracker. All rights reserved.</span>
      <span>This website is for informational purposes only and does not constitute medical advice.</span>
    </div>
  </div>
</footer>`;

document.addEventListener('DOMContentLoaded', () => {
  // Inject header
  const headerEl = document.createElement('div');
  headerEl.innerHTML = HEADER_HTML;
  document.body.insertBefore(headerEl.firstElementChild, document.body.firstChild);

  // Inject footer
  const footerEl = document.createElement('div');
  footerEl.innerHTML = FOOTER_HTML;
  document.body.appendChild(footerEl.firstElementChild);

  // Highlight active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('header nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.style.color = 'var(--green)';
  });
});
