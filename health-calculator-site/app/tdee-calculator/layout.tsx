import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TDEE Calculator for Indians — Find Your Daily Calorie Burn',
  description: 'Free TDEE calculator built for Indians. Get your daily calorie burn using Mifflin-St Jeor formula + India-specific activity levels.',
  alternates: {
    canonical: 'https://nutritiontracker.in/tdee-calculator',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
