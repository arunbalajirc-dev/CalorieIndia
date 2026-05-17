import type { Metadata } from 'next';
import IdealWeightClient from './IdealWeightClient';
import { idealWeightFaqs } from '@/lib/calculator-faqs';

export const metadata: Metadata = {
  title: 'Ideal Weight Calculator India – Healthy Weight Range for Indians',
  description: 'Find your ideal body weight using Asian and Indian-specific height-weight standards. Free ideal weight calculator with healthy weight range for men and women in India.',
  openGraph: {
    title: 'Ideal Weight Calculator India — Healthy Weight Range for Indians',
    description: 'Find your ideal body weight using Asian and Indian-specific height-weight standards. Free ideal weight calculator with healthy weight range for men and women.',
    url: 'https://nutritiontracker.in/ideal-weight-calculator',
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
    title: 'Ideal Weight Calculator India — Healthy Weight Range for Indians',
    description: 'Find your ideal body weight using Asian and Indian-specific height-weight standards. Free ideal weight calculator with healthy weight range for men and women.',
    images: ['https://nutritiontracker.in/images/Home%20page%20section%201.png'],
  },
};

const idealWeightJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Ideal Weight Calculator',
      url: 'https://nutritiontracker.in/ideal-weight-calculator',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: idealWeightFaqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function IdealWeightPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(idealWeightJsonLd) }}
      />
      <IdealWeightClient />
    </>
  );
}
