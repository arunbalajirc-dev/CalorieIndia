import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'Nutrition Tracker — Personalized Indian Diet Plans',
  description: 'Get your personalized Indian meal plan based on your TDEE, BMI and health goals. Instant PDF download.',
  alternates: { canonical: 'https://nutritiontracker.in' },
  openGraph: {
    title: 'Nutrition Tracker — Personalized Indian Diet Plans',
    description: 'Get your personalized Indian meal plan based on your TDEE, BMI and health goals. Instant PDF download.',
    url: 'https://nutritiontracker.in',
    siteName: 'NutritionTracker.in',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nutrition Tracker — Personalized Indian Diet Plans',
    description: 'Get your personalized Indian meal plan based on your TDEE, BMI and health goals. Instant PDF download.',
  },
};

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://nutritiontracker.in/#organization',
      name: 'NutritionTracker.in',
      url: 'https://nutritiontracker.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nutritiontracker.in/images/nutrition-tracker-logo.png',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://nutritiontracker.in/#website',
      url: 'https://nutritiontracker.in',
      name: 'NutritionTracker.in',
      publisher: { '@id': 'https://nutritiontracker.in/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://nutritiontracker.in/food-database?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomeClient />
    </>
  )
}
