import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Calorie & Nutrition Calculators for Indians',
  description: 'Six free calculators built for Indian bodies: TDEE, BMI, calorie deficit, macros, ideal weight, calorie burn. No login. Asian BMI standards.',
  alternates: {
    canonical: 'https://nutritiontracker.in/calculator',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
