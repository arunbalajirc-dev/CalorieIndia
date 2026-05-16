import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://nutritiontracker.in/tdee-calculator',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
