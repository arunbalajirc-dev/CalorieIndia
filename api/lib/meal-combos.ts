import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface IndianMealCombo {
  id: number
  meal_name: string
  primary_dish: string
  primary_dish_quantity: string
  accompaniment: string
  accompaniment_quantity: string
  meal_category: string
  cuisine_region: string
  total_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fibre_g: number
  is_vegetarian: boolean
  is_vegan: boolean
  tags: string[]
}

export async function pickMealCombos(
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
  targetKcal: number,
  isVegetarian: boolean,
  count: number,
  dayIndex: number
): Promise<IndianMealCombo[]> {
  // Try tight window first (±80 kcal)
  let query = supabaseAdmin
    .from('indian_meal_combos')
    .select('*')
    .eq('meal_category', category)
    .gte('total_kcal', targetKcal - 80)
    .lte('total_kcal', targetKcal + 80)

  if (isVegetarian) {
    query = query.eq('is_vegetarian', true)
  }

  let { data, error } = await query

  // Fallback to wider window (±150 kcal) if no results
  if (!data || data.length === 0) {
    let fallbackQuery = supabaseAdmin
      .from('indian_meal_combos')
      .select('*')
      .eq('meal_category', category)
      .gte('total_kcal', targetKcal - 150)
      .lte('total_kcal', targetKcal + 150)

    if (isVegetarian) {
      fallbackQuery = fallbackQuery.eq('is_vegetarian', true)
    }

    const fallback = await fallbackQuery
    data = fallback.data
    error = fallback.error
  }

  // Final fallback — just get any meal in category
  if (!data || data.length === 0) {
    let anyQuery = supabaseAdmin
      .from('indian_meal_combos')
      .select('*')
      .eq('meal_category', category)
      .limit(20)

    if (isVegetarian) {
      anyQuery = anyQuery.eq('is_vegetarian', true)
    }

    const any = await anyQuery
    data = any.data
    error = any.error
  }

  if (error || !data || data.length === 0) {
    throw new Error(`No meal combos found for ${category} ~${targetKcal}kcal`)
  }

  // Use dayIndex to rotate through options deterministically
  const shuffled = [...data].sort((a, b) => {
    const hashA = (a.id * 2654435761 + dayIndex * 1234567) >>> 0
    const hashB = (b.id * 2654435761 + dayIndex * 1234567) >>> 0
    return hashA - hashB
  })

  return shuffled.slice(0, count)
}

export async function getMealSuggestions(
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
  targetKcal: number,
  isVegetarian: boolean
): Promise<IndianMealCombo[]> {
  return pickMealCombos(category, targetKcal, isVegetarian, 10, 0)
}
