import type { Metadata } from 'next';
import CalculatorClient from './CalculatorClient';

export const metadata: Metadata = {
  title: 'Free Calorie & Health Calculators for Indians — TDEE, BMI, Macros',
  description: 'Free TDEE, BMI, macro, ideal weight, calorie deficit, and calorie burn calculators built for Indian body types and food culture.',
  openGraph: {
    title: 'Free Calorie & Health Calculators for Indians — TDEE, BMI, Macros',
    description: 'Free TDEE, BMI, macro, ideal weight, calorie deficit, and calorie burn calculators built for Indian body types and food culture.',
    url: 'https://nutritiontracker.in/calculator',
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
    title: 'Free Calorie & Health Calculators for Indians — TDEE, BMI, Macros',
    description: 'Free TDEE, BMI, macro, ideal weight, calorie deficit, and calorie burn calculators built for Indian body types and food culture.',
    images: ['https://nutritiontracker.in/images/Home%20page%20section%201.png'],
  },
};

const calcJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Indian Health Calculators — TDEE, BMI, Macros & More',
  url: 'https://nutritiontracker.in/calculator',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
};

export default function CalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calcJsonLd) }}
      />
      <CalculatorClient />
    </>
  );
}
