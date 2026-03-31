/* shared.js — injects fixed header + footer into every page */

const HEADER_HTML = `
<header>
  <div class="header-inner">
    <a href="index.html" class="logo">
      <div class="logo-dot"></div>
      <span>CalorieIndia</span>
    </a>
    <nav>
      <a href="calculators.html">Calculators</a>
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
          <span>CalorieIndia</span>
        </a>
        <p style="margin-top:10px">India's most practical weight loss resource.</p>
        <div class="footer-flags">🇮🇳 ❤️ 🥗</div>
      </div>
      <div class="footer-col">
        <h4>Calculators</h4>
        <ul>
          <li><a href="calculators.html#tdee">TDEE Calculator</a></li>
          <li><a href="calculators.html#deficit">Calorie Deficit Calculator</a></li>
          <li><a href="calculators.html#bmi">BMI Calculator</a></li>
          <li><a href="calculators.html#macro">Macro Calculator</a></li>
          <li><a href="calculators.html#ideal">Ideal Weight Calculator</a></li>
          <li><a href="calculators.html#burn">Calorie Burn Calculator</a></li>
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
      <span>© 2026 CalorieIndia. All rights reserved.</span>
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
