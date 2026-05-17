import type { Metadata } from 'next';
import BmiCalculatorClient from './BmiCalculatorClient';
import { bmiFaqs } from '@/lib/calculator-faqs';

export const metadata: Metadata = {
  title: 'BMI Calculator for Indians — Asian BMI Standards',
  description: 'Check your BMI using Asian-specific cutoffs. Indian BMI standards are different from Western charts — find your healthy weight range.',
  openGraph: {
    title: 'BMI Calculator for Indians — Asian BMI Standards',
    description: 'Check your BMI using Asian-specific cutoffs. Indian BMI standards are different from Western charts — find your healthy weight range.',
    url: 'https://nutritiontracker.in/bmi-calculator',
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
    title: 'BMI Calculator for Indians — Asian BMI Standards',
    description: 'Check your BMI using Asian-specific cutoffs. Indian BMI standards are different from Western charts — find your healthy weight range.',
    images: ['https://nutritiontracker.in/images/Home%20page%20section%201.png'],
  },
};

const bmiJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'BMI Calculator for Indians',
      url: 'https://nutritiontracker.in/bmi-calculator',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: bmiFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function BMICalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bmiJsonLd) }}
      />
      <BmiCalculatorClient />
    </>
  );
}
