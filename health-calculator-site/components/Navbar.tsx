'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const activeStyle = (href: string): React.CSSProperties =>
    pathname === href ? { color: '#2d6a4f', fontWeight: 700 } : {};

  return (
    <nav
      id="ci-nav"
      style={scrolled ? { boxShadow: '0 4px 20px rgba(0,0,0,.10)' } : undefined}
    >
      {/* Logo */}
      <Link href="/" className="ci-logo">
        <img
          src="/images/nutrition-tracker-logo.png"
          alt="Nutrition Tracker"
          style={{ height: '44px', objectFit: 'contain' }}
        />
      </Link>

      {/* Desktop links */}
      <ul className="ci-nav-links">
        <li className="ci-dropdown">
          <Link href="/calculator" style={activeStyle('/calculator')}>
            Calculators
            <i className="ci-chevron">▾</i>
          </Link>
          <div className="ci-dropdown-panel">
            <Link href="/tdee-calculator">
              <span className="ci-drop-icon">🔥</span>
              <span className="ci-drop-text">
                <span className="ci-drop-name">TDEE Calculator</span>
                <span className="ci-drop-desc">Total Daily Energy Expenditure</span>
              </span>
            </Link>
            <Link href="/bmi-calculator">
              <span className="ci-drop-icon">⚖️</span>
              <span className="ci-drop-text">
                <span className="ci-drop-name">BMI Calculator</span>
                <span className="ci-drop-desc">Asian BMI ranges for Indians</span>
              </span>
            </Link>
            <Link href="/calorie-deficit-calculator">
              <span className="ci-drop-icon">🧮</span>
              <span className="ci-drop-text">
                <span className="ci-drop-name">Calorie Deficit Calculator</span>
                <span className="ci-drop-desc">Find your weight loss target</span>
              </span>
            </Link>
            <Link href="/macro-calculator">
              <span className="ci-drop-icon">🥗</span>
              <span className="ci-drop-text">
                <span className="ci-drop-name">Macro Calculator</span>
                <span className="ci-drop-desc">Protein, carbs &amp; fat split</span>
              </span>
            </Link>
            <Link href="/ideal-weight-calculator">
              <span className="ci-drop-icon">💛</span>
              <span className="ci-drop-text">
                <span className="ci-drop-name">Ideal Weight Calculator</span>
                <span className="ci-drop-desc">Healthy weight for your height</span>
              </span>
            </Link>
            <hr className="ci-drop-divider" />
            <Link href="/calorie-burn-calculator">
              <span className="ci-drop-icon">🏃</span>
              <span className="ci-drop-text">
                <span className="ci-drop-name">Calorie Burn Calculator</span>
                <span className="ci-drop-desc">Calories burned by exercise</span>
              </span>
            </Link>
          </div>
        </li>

        <li>
          <Link href="/food-lookup" className="ci-food-db-link" style={activeStyle('/food-lookup')}>
            🍽️ Food Database
          </Link>
        </li>

        <li>
          <Link
            href="/recipe-database"
            className="ci-food-db-link"
            style={{ color: '#2d6a4f !important' as React.CSSProperties['color'], ...activeStyle('/recipe-database') }}
          >
            📖 Recipe Database
          </Link>
        </li>

        <li>
          <Link href="/blog" style={activeStyle('/blog')}>Blog</Link>
        </li>
        <li>
          <Link href="/meal-plan" style={{ color: '#2d6a4f', fontWeight: 600, ...activeStyle('/meal-plan') }}>
            🍱 Meal Plan
          </Link>
        </li>
      </ul>

      {/* Desktop CTA */}
      <Link href="/meal-plan" className="ci-cta ci-cta-desktop">
        Get My Meal Plan →
      </Link>

      {/* Mobile hamburger */}
      <button
        ref={btnRef}
        className={`ci-hamburger${mobileOpen ? ' open' : ''}`}
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        className={`ci-mobile-menu${mobileOpen ? ' open' : ''}`}
      >
        <div className="ci-mobile-section-label">Calculators</div>
        <Link href="/tdee-calculator" onClick={closeMobile}><span>🔥</span> TDEE Calculator</Link>
        <Link href="/bmi-calculator" onClick={closeMobile}><span>⚖️</span> BMI Calculator</Link>
        <Link href="/calorie-deficit-calculator" onClick={closeMobile}><span>🧮</span> Calorie Deficit Calculator</Link>
        <Link href="/macro-calculator" onClick={closeMobile}><span>🥗</span> Macro Calculator</Link>
        <Link href="/ideal-weight-calculator" onClick={closeMobile}><span>💛</span> Ideal Weight Calculator</Link>
        <Link href="/calorie-burn-calculator" onClick={closeMobile}><span>🏃</span> Calorie Burn Calculator</Link>
        <div className="ci-mobile-section-label">More</div>
        <Link href="/food-lookup" style={{ color: '#E07B39', fontWeight: 600 }} onClick={closeMobile}><span>🍽️</span> Food Database</Link>
        <Link href="/recipe-database" style={{ color: '#2d6a4f', fontWeight: 600 }} onClick={closeMobile}><span>📖</span> Recipe Database</Link>
        <Link href="/blog" onClick={closeMobile}><span>📝</span> Blog</Link>
        <Link href="/meal-plan" style={{ color: '#2d6a4f', fontWeight: 600 }} onClick={closeMobile}><span>🍱</span> Meal Plan</Link>
        <Link
          href="/meal-plan"
          style={{ marginTop: '12px', background: '#2d6a4f', color: '#fff', borderRadius: '8px', justifyContent: 'center', fontWeight: 600 }}
          onClick={closeMobile}
        >
          Get My Meal Plan →
        </Link>
      </div>
    </nav>
  );
}
