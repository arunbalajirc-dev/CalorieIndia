/**
 * Single source of truth for per-post SEO fields (title, description, primary
 * keyword). Values are pre-budgeted: title <= 60 chars, description <= 155
 * chars, verified by scripts/check-meta-lengths.ts. Titles here are final —
 * do not append a site-name suffix to article pages.
 */

export interface BlogPostSeoMeta {
  title: string;
  description: string;
  primaryKeyword: string;
}

/** Real pixel dimensions of /images/blog/{slug}.jpg, measured from the files on disk. */
export interface BlogImageDimensions {
  width: number;
  height: number;
}

export const BLOG_SEO_META: Record<string, BlogPostSeoMeta> = {
  'healthy-indian-street-food-swaps': {
    title: 'Healthy Indian Street Food Swaps: Cut 30–50% Calories',
    description:
      'Baked samosas, chia pani puri and millet bhel — ingredient swaps that cut street food calories by 30–50% without losing flavour.',
    primaryKeyword: 'healthy indian street food',
  },
  'vegetarian-protein-india': {
    title: '100g Protein a Day: Indian Vegetarian Guide',
    description:
      'Hit 100g of protein daily on an Indian vegetarian diet using dal, paneer, soy chunks, sattu and moong — no supplements needed.',
    primaryKeyword: 'indian vegetarian protein',
  },
  'tdee-calculator-indians': {
    title: 'TDEE for Indians: Calculate Your Real Daily Calories',
    description:
      'Calculate your true TDEE with India-specific activity multipliers. Why generic calculators overestimate calorie needs for Indians.',
    primaryKeyword: 'tdee for indians',
  },
  'intermittent-fasting-indians': {
    title: 'Intermittent Fasting for Indians: A Practical Guide',
    description:
      'Adapt 12:12, 14:10 and 16:8 fasting to Indian meal timings, chai breaks and late dinners — without quitting in week two.',
    primaryKeyword: 'intermittent fasting india',
  },
  'south-vs-north-indian-diet': {
    title: 'South vs North Indian Diet: Which Is Healthier?',
    description:
      'Rice vs roti, fermented vs fried — a real macronutrient breakdown of both Indian diets and an honest verdict on which works better.',
    primaryKeyword: 'south indian vs north indian diet',
  },
  'surya-namaskar-calories': {
    title: 'Surya Namaskar Calories: Enough for Weight Loss?',
    description:
      'The actual calorie math behind Surya Namaskar, how it compares to jogging, and the round count you need to see fat loss.',
    primaryKeyword: 'surya namaskar calories',
  },
  'high-protein-indian-breakfasts': {
    title: '10 High-Protein Indian Breakfasts Under 400 Calories',
    description:
      'Besan chilla, paneer bhurji, moong dal chilla and 7 more high-protein Indian breakfasts that keep you full until lunch.',
    primaryKeyword: 'high protein indian breakfast',
  },
  'bmi-indian-bodies': {
    title: 'Why BMI Fails Indians: 5 Better Health Metrics',
    description:
      'BMI was built for European bodies. Why ICMR uses lower thresholds, what TOFI means for South Asians, and 5 metrics that matter more.',
    primaryKeyword: 'bmi for indians',
  },
  'home-workout-plan-india': {
    title: 'Home Workout Plan for Indians: No Gym, No Equipment',
    description:
      'A structured no-equipment home workout plan for Indian lifestyles — weekly schedule, exercise breakdowns and calorie targets.',
    primaryKeyword: 'home workout plan india',
  },
  'indian-diet-guide-lose-weight': {
    title: 'Indian Diet Plan for Fat Loss Without Starving',
    description:
      'Fix your plate structure instead of starving. Calorie deficit, portion control and protein balance using everyday Indian foods.',
    primaryKeyword: 'indian diet plan for weight loss',
  },
  'calories-in-indian-meals': {
    title: 'Calories in Indian Food: 40+ Dishes Counted',
    description:
      'Calorie counts for 40+ popular Indian dishes at standard serving sizes — breakfast, dals, curries, rice, snacks and drinks.',
    primaryKeyword: 'calories in indian food',
  },
};

/**
 * Measured directly from the files in /public/images/blog/ — 10 of 11 are
 * PNG bytes saved with a .jpg extension, all at 1280x720; only the street
 * food post is a real JPEG at 2048x1318. Do not assume 1200x630.
 */
export const BLOG_IMAGE_DIMENSIONS: Record<string, BlogImageDimensions> = {
  'healthy-indian-street-food-swaps': { width: 2048, height: 1318 },
  'vegetarian-protein-india': { width: 1280, height: 720 },
  'tdee-calculator-indians': { width: 1280, height: 720 },
  'intermittent-fasting-indians': { width: 1280, height: 720 },
  'south-vs-north-indian-diet': { width: 1280, height: 720 },
  'surya-namaskar-calories': { width: 1280, height: 720 },
  'high-protein-indian-breakfasts': { width: 1280, height: 720 },
  'bmi-indian-bodies': { width: 1280, height: 720 },
  'home-workout-plan-india': { width: 1280, height: 720 },
  'indian-diet-guide-lose-weight': { width: 1280, height: 720 },
  'calories-in-indian-meals': { width: 1280, height: 720 },
};
