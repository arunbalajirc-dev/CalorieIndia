import { supabaseAdmin } from '../_shared/supabase-client.ts'

export interface MealFood {
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fibre_g: number
  serving_size: number
  serving_unit: string
  scaled_grams: number       // how many grams to eat to hit target calories
}

export interface DayMeal {
  breakfast: MealFood[]
  lunch:     MealFood[]
  dinner:    MealFood[]
  snacks:    MealFood[]
  total_calories: number
  total_protein:  number
  total_carbs:    number
  total_fat:      number
}

export interface MealPlan {
  days: DayMeal[]            // always 7 days
  user_name:        string
  goal:             string   // 'lose' | 'maintain' | 'gain'
  goal_label:       string   // 'Weight Loss' | 'Maintain Weight' | 'Gain Muscle'
  target_calories:  number
  protein_target:   number
  carbs_target:     number
  fat_target:       number
  tdee:             number
  bmi:              number
  bmi_category:     string
  cuisine_labels:   string[] // e.g. ['Indian', 'Japanese']
  diet_label:       string   // 'Non-Vegetarian' | 'Vegetarian' | 'Vegan'
  generated_date:   string   // formatted DD MMM YYYY
}

// Calorie distribution per meal
const MEAL_SPLIT = {
  breakfast: 0.25,
  lunch:     0.35,
  dinner:    0.30,
  snacks:    0.10
}

export async function buildMealPlan(intakeData: any, goal: string): Promise<MealPlan> {
  const {
    name, cuisine, is_vegetarian, is_vegan, allergens = [],
    target_calories, protein_target, carbs_target, fat_target,
    tdee, bmi, weight_kg
  } = intakeData

  // Fetch foods from RPC
  const { data: foods, error } = await supabaseAdmin.rpc('get_plan_foods', {
    p_goal:              goal,
    p_cuisine:           cuisine,
    p_is_vegetarian:     is_vegetarian,
    p_is_vegan:          is_vegan,
    p_exclude_allergens: allergens,
    p_categories:        [],
    p_limit:             300
  })

  if (error || !foods?.length) {
    throw new Error(`get_plan_foods failed: ${error?.message ?? 'no foods returned'}`)
  }

  // Group foods by category
  const byCategory: Record<string, any[]> = {}
  for (const food of foods) {
    if (!byCategory[food.category]) byCategory[food.category] = []
    byCategory[food.category].push(food)
  }

  // Helper: pick N random foods from a category, cycling if needed
  function pick(category: string, n: number, dayIndex: number): MealFood[] {
    const pool = byCategory[category] ?? byCategory['other'] ?? foods
    const result: MealFood[] = []
    for (let i = 0; i < n; i++) {
      const food = pool[(dayIndex * n + i) % pool.length]
      result.push({
        name:         food.name,
        calories:     food.calories,
        protein_g:    food.protein_g,
        carbs_g:      food.carbs_g,
        fat_g:        food.fat_g,
        fibre_g:      food.fibre_g,
        serving_size: food.serving_size,
        serving_unit: food.serving_unit,
        scaled_grams: food.serving_size  // default, scaled below
      })
    }
    return result
  }

  // Scale foods in a meal slot to hit target calories for that slot
  function scaleMeal(foods: MealFood[], targetCals: number): MealFood[] {
    if (!foods.length) return foods
    const totalRaw = foods.reduce((s, f) => s + f.calories, 0)
    if (totalRaw === 0) return foods
    const ratio = targetCals / totalRaw
    return foods.map(f => ({
      ...f,
      scaled_grams: Math.round(f.serving_size * ratio),
      calories:     Math.round(f.calories  * ratio),
      protein_g:    Math.round(f.protein_g * ratio * 10) / 10,
      carbs_g:      Math.round(f.carbs_g   * ratio * 10) / 10,
      fat_g:        Math.round(f.fat_g     * ratio * 10) / 10,
      fibre_g:      Math.round(f.fibre_g   * ratio * 10) / 10,
    }))
  }

  // Build 7 days
  const days: DayMeal[] = []
  for (let d = 0; d < 7; d++) {
    const bfCals     = Math.round(target_calories * MEAL_SPLIT.breakfast)
    const lunchCals  = Math.round(target_calories * MEAL_SPLIT.lunch)
    const dinnerCals = Math.round(target_calories * MEAL_SPLIT.dinner)
    const snackCals  = Math.round(target_calories * MEAL_SPLIT.snacks)

    const breakfast = scaleMeal([
      ...pick('grain',   1, d),
      ...pick('protein', 1, d + 7),
      ...pick('fruit',   1, d + 14)
    ], bfCals)

    const lunch = scaleMeal([
      ...pick('grain',     1, d + 21),
      ...pick('protein',   1, d + 28),
      ...pick('vegetable', 2, d + 35)
    ], lunchCals)

    const dinner = scaleMeal([
      ...pick('grain',     1, d + 42),
      ...pick('protein',   1, d + 49),
      ...pick('vegetable', 1, d + 56)
    ], dinnerCals)

    const snacks = scaleMeal([
      ...pick('fruit', 1, d + 63)
    ], snackCals)

    const allFoods = [...breakfast, ...lunch, ...dinner, ...snacks]

    days.push({
      breakfast, lunch, dinner, snacks,
      total_calories: allFoods.reduce((s, f) => s + f.calories, 0),
      total_protein:  Math.round(allFoods.reduce((s, f) => s + f.protein_g, 0) * 10) / 10,
      total_carbs:    Math.round(allFoods.reduce((s, f) => s + f.carbs_g,   0) * 10) / 10,
      total_fat:      Math.round(allFoods.reduce((s, f) => s + f.fat_g,     0) * 10) / 10,
    })
  }

  // BMI category
  const bmiCategory =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Normal weight' :
    bmi < 30   ? 'Overweight' : 'Obese'

  // Goal label
  const goalLabel =
    goal === 'lose'     ? 'Weight Loss' :
    goal === 'gain'     ? 'Gain Muscle' : 'Maintain Weight'

  // Diet label
  const { diet_type } = intakeData
  const dietLabel =
    diet_type === 'non-veg' ? 'Non-Vegetarian' :
    diet_type === 'both'    ? 'Veg & Non-Veg' :
    diet_type === 'veg'     ? 'Vegetarian' :
    is_vegan                ? 'Vegan' :
    is_vegetarian           ? 'Vegetarian' : 'Non-Vegetarian'

  // Cuisine labels
  const cuisineMap: Record<string, string> = {
    indian: 'Indian', continental: 'Continental', japanese: 'Japanese'
  }
  const rawCuisine = (cuisine as string[] | undefined) ?? ['indian']
  const cuisineLabels = rawCuisine.map(c => cuisineMap[c] ?? c)

  // Format date
  const now = new Date()
  const generatedDate = now.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return {
    days,
    user_name:       name,
    goal,
    goal_label:      goalLabel,
    target_calories: Math.round(target_calories),
    protein_target:  Math.round(intakeData.protein_target ?? weight_kg * (goal === 'gain' ? 2 : 1.6)),
    carbs_target:    Math.round(carbs_target ?? 0),
    fat_target:      Math.round(fat_target ?? 0),
    tdee:            Math.round(tdee),
    bmi:             Math.round(bmi * 10) / 10,
    bmi_category:    bmiCategory,
    cuisine_labels:  cuisineLabels,
    diet_label:      dietLabel,
    generated_date:  generatedDate
  }
}
