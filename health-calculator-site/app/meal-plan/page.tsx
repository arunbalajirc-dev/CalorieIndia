import type { Metadata } from 'next';
import MealPlanClient from './MealPlanClient';

export const metadata: Metadata = {
  title: 'Get Your Personalised Meal Plan – Nutrition Tracker',
  description: 'Calorie-accurate, macro-balanced meal plans tailored to your weight, height, and lifestyle — no guesswork. Get your personalised Indian diet plan for ₹249.',
  openGraph: {
    title: 'Get Your Personalised Indian Meal Plan — NutritionTracker.in',
    description: 'Calorie-accurate, macro-balanced meal plans tailored to your weight, height, and lifestyle — no guesswork. Get your personalised Indian diet plan for ₹249.',
    url: 'https://nutritiontracker.in/meal-plan',
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
    description: 'Calorie-accurate, macro-balanced meal plans tailored to your weight, height, and lifestyle — no guesswork. Get your personalised Indian diet plan for ₹249.',
    images: ['https://nutritiontracker.in/images/Home%20page%20section%201.png'],
  },
};

export default function MealPlanPage() {
  return <MealPlanClient />;
}
