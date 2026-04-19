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
  diet_type: 'veg' | 'non-veg' | 'both'
  allergens: string[]
  tags: string[]
}

function applyDietFilter(query: any, dietType: 'veg' | 'non-veg' | 'both'): any {
  if (dietType === 'veg') return query.eq('diet_type', 'veg')
  if (dietType === 'non-veg') return query.in('diet_type', ['veg', 'non-veg'])
  return query // 'both' — no filter
}

function applyAllergenFilter(query: any, allergens: string[]): any {
  if (!allergens.length) return query
  return query.not('allergens', 'ov', `{${allergens.join(',')}}`)
}

export async function pickMealCombos(
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
  targetKcal: number,
  dietType: 'veg' | 'non-veg' | 'both',
  allergens: string[],
  count: number,
  dayIndex: number
): Promise<IndianMealCombo[]> {
  function buildQuery(lower: number, upper: number, limit?: number) {
    let q = supabaseAdmin
      .from('indian_meal_combos')
      .select('*')
      .eq('meal_category', category)
    q = applyDietFilter(q, dietType)
    q = applyAllergenFilter(q, allergens)
    if (limit) return q.limit(limit)
    return q.gte('total_kcal', lower).lte('total_kcal', upper)
  }

  let { data, error } = await buildQuery(targetKcal - 80, targetKcal + 80)

  if (!data || data.length === 0) {
    const fallback = await buildQuery(targetKcal - 150, targetKcal + 150)
    data = fallback.data
    error = fallback.error
  }

  if (!data || data.length === 0) {
    const any = await buildQuery(0, 0, 20)
    data = any.data
    error = any.error
  }

  if (error || !data || data.length === 0) {
    throw new Error(`No meal combos found for ${category} ~${targetKcal}kcal`)
  }

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
  dietType: 'veg' | 'non-veg' | 'both',
  allergens: string[] = []
): Promise<IndianMealCombo[]> {
  return pickMealCombos(category, targetKcal, dietType, allergens, 10, 0)
}
