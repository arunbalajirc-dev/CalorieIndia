import type { Metadata } from 'next';
import TdeeCalculatorClient from './TdeeCalculatorClient';
import { tdeeFaqs } from '@/lib/calculator-faqs';

export const metadata: Metadata = {
  title: 'TDEE Calculator for Indians — Free, No Signup | Nutrition Tracker',
  description: 'Calculate your Total Daily Energy Expenditure using India-specific activity levels. Free TDEE calculator with the Mifflin-St Jeor formula. Built for Indian bodies.',
  alternates: { canonical: 'https://nutritiontracker.in/tdee-calculator' },
  openGraph: {
    title: 'TDEE Calculator for Indians — Free, No Signup | Nutrition Tracker',
    description: 'Calculate your Total Daily Energy Expenditure using India-specific activity levels. Free TDEE calculator with the Mifflin-St Jeor formula. Built for Indian bodies.',
    url: 'https://nutritiontracker.in/tdee-calculator',
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
    title: 'TDEE Calculator for Indians — Free, No Signup | Nutrition Tracker',
    description: 'Calculate your Total Daily Energy Expenditure using India-specific activity levels. Free TDEE calculator with the Mifflin-St Jeor formula. Built for Indian bodies.',
    images: ['https://nutritiontracker.in/images/Home%20page%20section%201.png'],
  },
};

const tdeeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'TDEE Calculator for Indians',
      url: 'https://nutritiontracker.in/tdee-calculator',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: tdeeFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function TDEECalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tdeeJsonLd) }}
      />
      <TdeeCalculatorClient />
    </>
  );
}
