import type { Metadata } from 'next';
import MacroCalculatorClient from './MacroCalculatorClient';
import { macroFaqs } from '@/lib/calculator-faqs';

export const metadata: Metadata = {
  title: 'Macro Calculator for Indian Diets — Protein, Carbs, Fat | Nutrition Tracker',
  description: 'Calculate your daily protein, carbs, and fat targets. Optimized for Indian vegetarian and non-vegetarian diets. Free, no signup.',
  alternates: { canonical: 'https://nutritiontracker.in/macro-calculator' },
  openGraph: {
    title: 'Macro Calculator for Indian Diets — Protein, Carbs, Fat | Nutrition Tracker',
    description: 'Calculate your daily protein, carbs, and fat targets. Optimized for Indian vegetarian and non-vegetarian diets. Free, no signup.',
    url: 'https://nutritiontracker.in/macro-calculator',
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
    title: 'Macro Calculator for Indian Diets — Protein, Carbs, Fat | Nutrition Tracker',
    description: 'Calculate your daily protein, carbs, and fat targets. Optimized for Indian vegetarian and non-vegetarian diets. Free, no signup.',
    images: ['https://nutritiontracker.in/images/Home%20page%20section%201.png'],
  },
};

const macroJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Macro Calculator',
      url: 'https://nutritiontracker.in/macro-calculator',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: macroFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function MacroCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(macroJsonLd) }}
      />
      <MacroCalculatorClient />
    </>
  );
}
