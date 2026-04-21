import Link from 'next/link';

export default function Footer() {
  return (
    <div id="site-footer">
      <footer>
        <div className="sf-inner">
          <div className="sf-top">
            {/* Brand */}
            <div className="sf-brand">
              <Link href="/" className="sf-brand-logo">
                <img src="/images/nutrition-tracker-logo.png" alt="Nutrition Tracker" />
              </Link>
              <p>India&apos;s most practical weight loss resource. Science-backed nutrition for Indian bodies.</p>
              <div className="sf-brand-email">
                📧 <a href="mailto:support@nutritiontracker.in">support@nutritiontracker.in</a>
              </div>
              <div className="sf-brand-email">
                🌐 <a href="https://nutritiontracker.in">nutritiontracker.in</a>
              </div>
              <div className="sf-flags">🇮🇳 ❤️ 🥗</div>
            </div>

            {/* Calculators */}
            <div className="sf-col">
              <h4>Calculators</h4>
              <ul>
                <li><Link href="/tdee-calculator">TDEE Calculator</Link></li>
                <li><Link href="/calorie-deficit-calculator">Calorie Deficit</Link></li>
                <li><Link href="/bmi-calculator">BMI Calculator</Link></li>
                <li><Link href="/macro-calculator">Macro Calculator</Link></li>
                <li><Link href="/ideal-weight-calculator">Ideal Weight</Link></li>
                <li><Link href="/calorie-burn-calculator">Calorie Burn</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="sf-col">
              <h4>Resources</h4>
              <ul>
                <li><Link href="/food-lookup">Food Database</Link></li>
                <li><Link href="/recipe-database">Recipe Database</Link></li>
                <li><Link href="/blog">Blog &amp; Guides</Link></li>
                <li><Link href="/meal-plan">Free Meal Plan</Link></li>
              </ul>
            </div>

            {/* Info */}
            <div className="sf-col">
              <h4>Info</h4>
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                <li><Link href="/terms-of-use">Terms of Use</Link></li>
                <li><Link href="/disclaimer">Disclaimer</Link></li>
                <li><Link href="/meal-plan">Get My Plan</Link></li>
              </ul>
            </div>
          </div>

          <div className="sf-bottom">
            <span>© 2026 Nutrition Tracker. All rights reserved.</span>
            <span>For informational purposes only. Not medical advice.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
