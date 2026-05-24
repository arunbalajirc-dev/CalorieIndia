import type { Metadata } from 'next';
import CalorieDeficitClient from './CalorieDeficitClient';
import { deficitFaqs } from '@/lib/calculator-faqs';

export const metadata: Metadata = {
  title: 'Calorie Deficit Calculator for Weight Loss | Nutrition Tracker',
  description: 'Find your exact daily calorie target for sustainable weight loss. Built for Indian lifestyles. Free calculator with safe deficit ranges.',
  alternates: { canonical: 'https://nutritiontracker.in/calorie-deficit-calculator' },
  openGraph: {
    title: 'Calorie Deficit Calculator for Weight Loss | Nutrition Tracker',
    description: 'Find your exact daily calorie target for sustainable weight loss. Built for Indian lifestyles. Free calculator with safe deficit ranges.',
    url: 'https://nutritiontracker.in/calorie-deficit-calculator',
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
    title: 'Calorie Deficit Calculator for Weight Loss | Nutrition Tracker',
    description: 'Find your exact daily calorie target for sustainable weight loss. Built for Indian lifestyles. Free calculator with safe deficit ranges.',
    images: ['https://nutritiontracker.in/images/Home%20page%20section%201.png'],
  },
};

const deficitJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Calorie Deficit Calculator',
      url: 'https://nutritiontracker.in/calorie-deficit-calculator',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: deficitFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function CalorieDeficitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(deficitJsonLd) }}
      />
      <CalorieDeficitClient />
    </>
  );
}
