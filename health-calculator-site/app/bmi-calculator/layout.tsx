import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMI Calculator India — Asian BMI Ranges for Indians',
  description: 'Calculate your BMI using Asian BMI ranges (18.5-22.9). Indians develop health risks at lower BMI than Western charts suggest. Free calculator.',
  alternates: {
    canonical: 'https://nutritiontracker.in/bmi-calculator',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
