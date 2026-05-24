import type { Metadata } from 'next';
import BmiCalculatorClient from './BmiCalculatorClient';
import { bmiFaqs } from '@/lib/calculator-faqs';

export const metadata: Metadata = {
  title: 'BMI Calculator for Indians (Asian BMI Ranges) | Nutrition Tracker',
  description: 'Get your BMI using Asian-specific healthy weight ranges. Standard Western BMI charts don\'t apply to Indian bodies. Free, instant, no signup.',
  alternates: { canonical: 'https://nutritiontracker.in/bmi-calculator' },
  openGraph: {
    title: 'BMI Calculator for Indians (Asian BMI Ranges) | Nutrition Tracker',
    description: 'Get your BMI using Asian-specific healthy weight ranges. Standard Western BMI charts don\'t apply to Indian bodies. Free, instant, no signup.',
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
    title: 'BMI Calculator for Indians (Asian BMI Ranges) | Nutrition Tracker',
    description: 'Get your BMI using Asian-specific healthy weight ranges. Standard Western BMI charts don\'t apply to Indian bodies. Free, instant, no signup.',
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
