// Ported from supabase/functions/generate-pdf/planner.ts (Deno → Node.js)
// Uses createServerClient() instead of supabaseAdmin

import { createServerClient } from '@/lib/supabase'

export interface MealFood {
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fibre_g: number
  serving_grams: number
  serving_unit: string
  scaled_grams: number
  serving_display: string
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
  deficit_kcal:    number
  deficit_mode:    string
  safety_flag:     string | null
  weekly_loss_kg:  number
  months_to_goal:  number
}

export interface DeficitResult {
  targetCalories: number
  deficitKcal:    number
  deficitPercent: number
  deficitMode:    string
  weeklyLossKg:   number
  monthsToGoal:   number
  safetyFlag:     string | null
}

export function calculateSafeTarget(
  tdee:            number,
  bmr:             number,
  gender:          string,
  currentWeightKg: number,
  targetWeightKg:  number | null,
  goal:            string,
): DeficitResult {
  if (goal === 'maintain') {
    return {
      targetCalories: tdee, deficitKcal: 0, deficitPercent: 0,
      deficitMode: 'Maintenance', weeklyLossKg: 0, monthsToGoal: 0, safetyFlag: null,
    }
  }
  if (goal === 'gain') {
    return {
      targetCalories: tdee + 300, deficitKcal: -300,
      deficitPercent: -Math.round(300 / tdee * 100),
      deficitMode: 'Lean Surplus +300', weeklyLossKg: -0.3, monthsToGoal: 0, safetyFlag: null,
    }
  }

  const kgToLose = Math.max(0, currentWeightKg - (targetWeightKg ?? currentWeightKg))

  let pct: number
  let deficitMode: string
  if (tdee < 1600) {
    pct = 15; deficitMode = 'Conservative 15%'
  } else if (kgToLose <= 5) {
    pct = 10; deficitMode = 'Conservative 10%'
  } else if (kgToLose <= 15) {
    pct = 20; deficitMode = 'Standard 20%'
  } else {
    pct = 25; deficitMode = 'Aggressive 25%'
  }

  let deficitKcal = Math.round(tdee * pct / 100)
  if (pct === 25 && deficitKcal > 750) deficitKcal = 750

  let targetCalories = tdee - deficitKcal

  const absoluteFloor = gender === 'male' ? 1500 : 1200
  const bmrFloor      = Math.round(bmr) + 100
  const floor         = Math.max(absoluteFloor, bmrFloor)

  let safetyFlag: string | null = null
  if (targetCalories < floor) {
    safetyFlag     = `Target adjusted to ${floor} kcal (BMR+100 safety floor). Eating below this level risks muscle loss.`
    targetCalories = floor
    deficitKcal    = tdee - targetCalories
  }

  const deficitPercent = Math.round(deficitKcal / tdee * 100)
  const weeklyLossKg   = Math.round(deficitKcal * 7 / 7700 * 10) / 10
  const monthsToGoal   = kgToLose > 0 && deficitKcal > 0
    ? Math.round((kgToLose * 7700) / (deficitKcal * 7) / 4.33)
    : 0

  return { targetCalories, deficitKcal, deficitPercent, deficitMode, weeklyLossKg, monthsToGoal, safetyFlag }
}

const MEAL_SPLIT = {
  breakfast: 0.25,
  lunch:     0.35,
  dinner:    0.30,
  snacks:    0.10,
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
  mealType: string,
  limit = 50
): Promise<MealFood[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase.rpc('get_plan_foods', {
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
    result.push({ ...pool[(offset + i) % pool.length] })
  }
  return result
}

export async function buildMealPlan(intakeData: any, goal: string): Promise<MealPlan> {
  const {
    name,
    diet_type      = 'veg',
    allergens      = [],
    protein_target,
    carbs_target,
    fat_target,
    bmi,
    weight_kg,
    height_cm,
    age,
    gender         = 'female',
    activity_level = 'lightly_active',
  } = intakeData

  const actMultiplier: Record<string, number> = {
    sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55,
    very_active: 1.725, extra_active: 1.9,
  }
  const bmr  = gender === 'male'
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  const tdee = intakeData.tdee ?? Math.round(bmr * (actMultiplier[activity_level] ?? 1.375))

  const targetWeightKg: number | null = intakeData.target_weight ?? intakeData.target_weight_kg ?? null
  const safeTarget = calculateSafeTarget(tdee, bmr, gender, weight_kg, targetWeightKg, goal)
  const target_calories = safeTarget.targetCalories

  console.log(`Safe deficit: ${safeTarget.deficitMode} → target=${target_calories} kcal`)
  if (safeTarget.safetyFlag) console.warn(`Safety flag: ${safeTarget.safetyFlag}`)

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
    const breakfast = scaleMeal(pick(bfPool,     1, d), bfCals)
    const lunch     = scaleMeal(pick(lunchPool,  1, d), lunchCals)
    const dinner    = scaleMeal(pick(dinnerPool, 1, d), dinnerCals)
    const snacks    = scaleMeal(pick(snacksPool, 1, d), snackCals)
    const allFoods  = [...breakfast, ...lunch, ...dinner, ...snacks]

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

  const generatedDate = new Date().toLocaleDateString('en-IN', {
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
    fat_target:      Math.round(fat_target   ?? 0),
    tdee:            Math.round(tdee),
    bmi:             Math.round(bmi * 10) / 10,
    bmi_category:    bmiCategory,
    cuisine_labels:  ['Indian'],
    diet_label:      dietLabel,
    generated_date:  generatedDate,
    deficit_kcal:    safeTarget.deficitKcal,
    deficit_mode:    safeTarget.deficitMode,
    safety_flag:     safeTarget.safetyFlag,
    weekly_loss_kg:  safeTarget.weeklyLossKg,
    months_to_goal:  safeTarget.monthsToGoal,
  }
}
