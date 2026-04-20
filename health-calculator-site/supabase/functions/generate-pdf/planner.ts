import { supabaseAdmin } from '../_shared/supabase-client.ts'

export interface MealFood {
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fibre_g: number
  serving_grams: number       // original grams before scaling
  serving_unit: string
  scaled_grams: number        // actual grams user should eat after scaling
  serving_display: string     // human-readable e.g. "189g" or "3 pieces (180g) → 189g"
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
  days: DayMeal[]
  user_name:       string
  goal:            string
  goal_label:      string
  target_calories: number
  protein_target:  number
  carbs_target:    number
  fat_target:      number
  tdee:            number
  bmi:             number
  bmi_category:    string
  cuisine_labels:  string[]
  diet_label:      string
  generated_date:  string
}

const MEAL_SPLIT = {
  breakfast: 0.25,
  lunch:     0.35,
  dinner:    0.30,
  snacks:    0.10
}

function toMealFood(row: any): MealFood {
  return {
    name:            row.meal_name,
    calories:        row.total_kcal,
    protein_g:       Number(row.protein_g) || 0,
    carbs_g:         Number(row.carbs_g)   || 0,
    fat_g:           Number(row.fat_g)     || 0,
    fibre_g:         Number(row.fibre_g)   || 0,
    serving_grams:   row.serving_grams     || 100,
    serving_unit:    'g',
    scaled_grams:    row.serving_grams     || 100,
    serving_display: row.serving_display   || `${row.serving_grams || 100}g`,
  }
}

function scaleMeal(foods: MealFood[], targetCals: number): MealFood[] {
  if (!foods.length) return foods
  const totalRaw = foods.reduce((s, f) => s + f.calories, 0)
  if (totalRaw === 0) return foods
  const ratio = targetCals / totalRaw
  return foods.map(f => {
    const scaledG = Math.round(f.serving_grams * ratio)
    return {
      ...f,
      scaled_grams:    scaledG,
      serving_display: `${scaledG}g`,
      calories:        Math.round(f.calories  * ratio),
      protein_g:       Math.round(f.protein_g * ratio * 10) / 10,
      carbs_g:         Math.round(f.carbs_g   * ratio * 10) / 10,
      fat_g:           Math.round(f.fat_g     * ratio * 10) / 10,
      fibre_g:         Math.round(f.fibre_g   * ratio * 10) / 10,
    }
  })
}

async function fetchSlot(
  goal: string,
  dietType: string,
  allergens: string[],
  mealType: string,   // 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
  limit = 50
): Promise<MealFood[]> {
  const { data, error } = await supabaseAdmin.rpc('get_plan_foods', {
    p_goal:      goal,
    p_diet_type: dietType,
    p_allergens: allergens,
    p_meal_type: mealType,
    p_limit:     limit,
  })
  if (error || !data?.length) {
    console.error(`get_plan_foods error for ${mealType}:`, error?.message)
    return []
  }
  return data.map(toMealFood)
}

function pick(pool: MealFood[], n: number, offset: number): MealFood[] {
  if (!pool.length) return []
  const result: MealFood[] = []
  for (let i = 0; i < n; i++) {
    // Use offset to ensure different foods on different days
    result.push({ ...pool[(offset + i) % pool.length] })
  }
  return result
}

export async function buildMealPlan(intakeData: any, goal: string): Promise<MealPlan> {
  const {
    name,
    diet_type    = 'veg',
    allergens    = [],
    target_calories,
    protein_target,
    carbs_target,
    fat_target,
    tdee,
    bmi,
    weight_kg,
  } = intakeData

  // Fetch a large pool for each slot — note capital-first category names
  const [bfPool, lunchPool, dinnerPool, snacksPool] = await Promise.all([
    fetchSlot(goal, diet_type, allergens, 'Breakfast', 50),
    fetchSlot(goal, diet_type, allergens, 'Lunch',     50),
    fetchSlot(goal, diet_type, allergens, 'Dinner',    50),
    fetchSlot(goal, diet_type, allergens, 'Snack',     50),
  ])

  console.log(`Pool sizes — BF:${bfPool.length} L:${lunchPool.length} D:${dinnerPool.length} S:${snacksPool.length}`)

  const bfCals     = Math.round(target_calories * MEAL_SPLIT.breakfast)
  const lunchCals  = Math.round(target_calories * MEAL_SPLIT.lunch)
  const dinnerCals = Math.round(target_calories * MEAL_SPLIT.dinner)
  const snackCals  = Math.round(target_calories * MEAL_SPLIT.snacks)

  const days: DayMeal[] = []
  for (let d = 0; d < 7; d++) {
    // Each day picks a different single food per slot using day index as offset
    // This ensures variety across 7 days
    const breakfast = scaleMeal(pick(bfPool,     1, d),     bfCals)
    const lunch     = scaleMeal(pick(lunchPool,  1, d),     lunchCals)
    const dinner    = scaleMeal(pick(dinnerPool, 1, d),     dinnerCals)
    const snacks    = scaleMeal(pick(snacksPool, 1, d),     snackCals)

    const allFoods = [...breakfast, ...lunch, ...dinner, ...snacks]

    days.push({
      breakfast, lunch, dinner, snacks,
      total_calories: allFoods.reduce((s, f) => s + f.calories, 0),
      total_protein:  Math.round(allFoods.reduce((s, f) => s + f.protein_g, 0) * 10) / 10,
      total_carbs:    Math.round(allFoods.reduce((s, f) => s + f.carbs_g,   0) * 10) / 10,
      total_fat:      Math.round(allFoods.reduce((s, f) => s + f.fat_g,     0) * 10) / 10,
    })
  }

  const bmiCategory =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Normal weight' :
    bmi < 30   ? 'Overweight' : 'Obese'

  const goalLabel =
    goal === 'lose' ? 'Weight Loss' :
    goal === 'gain' ? 'Gain Muscle' : 'Maintain Weight'

  const dietLabel =
    diet_type === 'non-veg' ? 'Non-Vegetarian' :
    diet_type === 'both'    ? 'Veg & Non-Veg'  : 'Vegetarian'

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
    protein_target:  Math.round(protein_target ?? weight_kg * (goal === 'gain' ? 2 : 1.6)),
    carbs_target:    Math.round(carbs_target ?? 0),
    fat_target:      Math.round(fat_target   ?? 0),
    tdee:            Math.round(tdee),
    bmi:             Math.round(bmi * 10) / 10,
    bmi_category:    bmiCategory,
    cuisine_labels:  ['Indian'],
    diet_label:      dietLabel,
    generated_date:  generatedDate,
  }
}
