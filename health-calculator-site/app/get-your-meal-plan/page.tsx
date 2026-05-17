import type { Metadata } from 'next';
import GetYourMealPlanClient from './GetYourMealPlanClient';

export const metadata: Metadata = {
  title: 'Get Your Personalized Indian Diet Plan in 5 Minutes – Nutrition Tracker',
  description: 'Calorie-accurate, macro-balanced meal plans tailored to your weight, height, and lifestyle — no guesswork. Get your personalized Indian diet plan for ₹249.',
  openGraph: {
    title: 'Get Your Personalised Indian Meal Plan — NutritionTracker.in',
    description: 'Calorie-accurate, macro-balanced meal plans tailored to your weight, height, and lifestyle — no guesswork. Personalised Indian diet plan for ₹249.',
    url: 'https://nutritiontracker.in/get-your-meal-plan',
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
    title: 'Get Your Personalised Indian Meal Plan — NutritionTracker.in',
    description: 'Calorie-accurate, macro-balanced meal plans tailored to your weight, height, and lifestyle — no guesswork. Personalised Indian diet plan for ₹249.',
    images: ['https://nutritiontracker.in/images/Home%20page%20section%201.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Personalised Indian Meal Plan',
  url: 'https://nutritiontracker.in/get-your-meal-plan',
  description: 'A personalised 7-day Indian meal plan built around your TDEE, calorie goal, food preferences, and lifestyle. Instant PDF download.',
  brand: { '@type': 'Brand', name: 'NutritionTracker.in' },
  offers: {
    '@type': 'Offer',
    price: '249',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: 'https://nutritiontracker.in/get-your-meal-plan',
    seller: { '@type': 'Organization', name: 'NutritionTracker.in', '@id': 'https://nutritiontracker.in/#organization' },
  },
};

export default function GetYourMealPlanPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GetYourMealPlanClient />
    </>
  );
}
