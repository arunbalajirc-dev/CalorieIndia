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
  scaled_grams: number
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
  snacks:    0.10,
}

async function fetchCombos(
  category: string,
  dietType: string,
  allergens: string[],
  targetKcal: number,
  limit = 20,
): Promise<any[]> {
  for (const margin of [80, 150, 300]) {
    let q = (supabaseAdmin as any)
      .from('indian_meal_combos')
      .select('*')
      .eq('meal_category', category)
      .gte('total_kcal', targetKcal - margin)
      .lte('total_kcal', targetKcal + margin)

    if (dietType === 'veg') {
      q = q.eq('diet_type', 'veg')
    } else if (dietType === 'non-veg') {
      q = q.in('diet_type', ['veg', 'non-veg'])
    }

    if (allergens.length > 0) {
      q = q.not('allergens', 'ov', `{${allergens.join(',')}}`)
    }

    const { data } = await q.limit(limit)
    if (data && data.length > 0) return data
  }

  // Fallback: any combos for this category/diet
  let q = (supabaseAdmin as any)
    .from('indian_meal_combos')
    .select('*')
    .eq('meal_category', category)

  if (dietType === 'veg') q = q.eq('diet_type', 'veg')
  else if (dietType === 'non-veg') q = q.in('diet_type', ['veg', 'non-veg'])

  const { data, error } = await q.limit(limit)
  if (error || !data?.length) {
    console.error(`No combos found for ${category}:`, error?.message)
    return []
  }
  return data
}

function comboToMealFood(combo: any): MealFood {
  return {
    name:         combo.meal_name,
    calories:     Math.round(combo.total_kcal),
    protein_g:    Math.round(combo.protein_g * 10) / 10,
    carbs_g:      Math.round(combo.carbs_g   * 10) / 10,
    fat_g:        Math.round(combo.fat_g     * 10) / 10,
    fibre_g:      Math.round((combo.fibre_g ?? 0) * 10) / 10,
    serving_size: 1,
    serving_unit: ' serving',
    scaled_grams: 1,
  }
}

function deterministicPick(pool: any[], seed: number): any | null {
  if (!pool.length) return null
  const sorted = [...pool].sort((a, b) => {
    const hA = (a.id * 2654435761 + seed * 1234567) >>> 0
    const hB = (b.id * 2654435761 + seed * 1234567) >>> 0
    return hA - hB
  })
  return sorted[0]
}

export async function buildMealPlan(intakeData: any, goal: string): Promise<MealPlan> {
  const {
    name,
    diet_type     = 'veg',
    allergens     = [],
    target_calories,
    protein_target,
    carbs_target,
    fat_target,
    tdee,
    bmi,
    weight_kg,
  } = intakeData

  const bfCals     = Math.round(target_calories * MEAL_SPLIT.breakfast)
  const lunchCals  = Math.round(target_calories * MEAL_SPLIT.lunch)
  const dinnerCals = Math.round(target_calories * MEAL_SPLIT.dinner)
  const snackCals  = Math.round(target_calories * MEAL_SPLIT.snacks)

  const [bfPool, lunchPool, dinnerPool, snacksPool] = await Promise.all([
    fetchCombos('Breakfast', diet_type, allergens, bfCals,     20),
    fetchCombos('Lunch',     diet_type, allergens, lunchCals,  20),
    fetchCombos('Dinner',    diet_type, allergens, dinnerCals, 20),
    fetchCombos('Snack',     diet_type, allergens, snackCals,  20),
  ])

  const days: DayMeal[] = []
  for (let d = 0; d < 7; d++) {
    const bfCombo     = deterministicPick(bfPool,     d)
    const lunchCombo  = deterministicPick(lunchPool,  d + 7)
    const dinnerCombo = deterministicPick(dinnerPool, d + 14)
    const snackCombo  = deterministicPick(snacksPool, d + 21)

    const breakfast = bfCombo     ? [comboToMealFood(bfCombo)]     : []
    const lunch     = lunchCombo  ? [comboToMealFood(lunchCombo)]  : []
    const dinner    = dinnerCombo ? [comboToMealFood(dinnerCombo)] : []
    const snacks    = snackCombo  ? [comboToMealFood(snackCombo)]  : []

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
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return {
    days,
    user_name:       name,
    goal,
    goal_label:      goalLabel,
    target_calories: Math.round(target_calories),
    protein_target:  Math.round(protein_target ?? weight_kg * (goal === 'gain' ? 2 : 1.6)),
    carbs_target:    Math.round(carbs_target ?? 0),
    fat_target:      Math.round(fat_target ?? 0),
    tdee:            Math.round(tdee),
    bmi:             Math.round(bmi * 10) / 10,
    bmi_category:    bmiCategory,
    cuisine_labels:  ['Indian'],
    diet_label:      dietLabel,
    generated_date:  generatedDate,
  }
}
