import type { Metadata } from 'next';
import CalorieBurnClient from './CalorieBurnClient';
import { burnFaqs } from '@/lib/calculator-faqs';

export const metadata: Metadata = {
  title: 'Calorie Burn Calculator India – Calories Burned by Exercise & Activity',
  description: 'Calculate how many calories you burn during exercise. Walking, running, cricket, Zumba, HIIT and more. Free calorie burn calculator for Indians with MET-based formula.',
  openGraph: {
    title: 'Calorie Burn Calculator India — Calories Burned by Exercise & Activity',
    description: 'Calculate how many calories you burn during exercise. Walking, running, cricket, Zumba, HIIT and more. Free calorie burn calculator for Indians.',
    url: 'https://nutritiontracker.in/calorie-burn-calculator',
    siteName: 'NutritionTracker.in',
    images: [
      {
        url: 'https://nutritiontracker.in/images/Home%20page%20section%201.png',
        width: 1200,
        height: 630,
        alt: 'NutritionTracker.in — Science-backed nutrition tools for Indian bodies',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calorie Burn Calculator India — Calories Burned by Exercise & Activity',
    description: 'Calculate how many calories you burn during exercise. Walking, running, cricket, Zumba, HIIT and more. Free calorie burn calculator for Indians.',
    images: ['https://nutritiontracker.in/images/Home%20page%20section%201.png'],
  },
};

const burnJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Calorie Burn Calculator',
      url: 'https://nutritiontracker.in/calorie-burn-calculator',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: burnFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function CalorieBurnPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(burnJsonLd) }}
      />
      <CalorieBurnClient />
    </>
  );
}
