-- Migration: 0015_get_plan_foods_v2.sql
-- Replace get_plan_foods() RPC to query the recipes table instead of foods.
-- Column mappings:  energy_kcal → calories,  carbohydrate_g → carbs_g,
--                  fiber_g     → fibre_g,    cuisine        → cuisine_type

-- Drop existing function first — return type changes require DROP+CREATE
DROP FUNCTION IF EXISTS public.get_plan_foods(text,text[],boolean,boolean,text[],text[],integer);

CREATE OR REPLACE FUNCTION public.get_plan_foods(
  p_goal              text,
  p_cuisine           text[],
  p_is_vegetarian     boolean,
  p_is_vegan          boolean,
  p_exclude_allergens text[],
  p_categories        text[],
  p_limit             integer DEFAULT 200
)
RETURNS TABLE (
  id            text,
  name          text,
  name_local    text,
  cuisine_type  text,
  category      text,
  serving_size  numeric,
  serving_unit  text,
  calories      numeric,
  protein_g     numeric,
  carbs_g       numeric,
  fat_g         numeric,
  fibre_g       numeric,
  sodium_mg     numeric,
  is_vegetarian boolean,
  is_vegan      boolean,
  -- bonus micronutrients for PDF detail pages
  calcium_mg    numeric,
  iron_mg       numeric,
  vitamin_c_mg  numeric,
  fiber_g       numeric
)
LANGUAGE sql STABLE AS $$
  SELECT
    r.id::text,
    r.name,
    r.name_local,
    r.cuisine                     AS cuisine_type,
    r.category,
    100::numeric                  AS serving_size,
    COALESCE(r.serving_unit, 'g') AS serving_unit,
    r.energy_kcal                 AS calories,
    r.protein_g,
    r.carbohydrate_g              AS carbs_g,
    r.fat_g,
    r.fiber_g                     AS fibre_g,
    r.sodium_mg,
    r.is_vegetarian,
    r.is_vegan,
    r.calcium_mg,
    r.iron_mg,
    r.vitamin_c_mg,
    r.fiber_g
  FROM public.recipes r
  WHERE
    (p_cuisine IS NULL OR cardinality(p_cuisine) = 0 OR r.cuisine = ANY(p_cuisine))
    AND (p_is_vegan      = false OR r.is_vegan      = true)
    AND (p_is_vegetarian = false OR r.is_vegetarian = true)
    AND (
      p_exclude_allergens IS NULL
      OR cardinality(p_exclude_allergens) = 0
      OR NOT (r.allergens && p_exclude_allergens)
    )
    AND (
      p_categories IS NULL
      OR cardinality(p_categories) = 0
      OR r.category = ANY(p_categories)
    )
    AND r.energy_kcal IS NOT NULL
    AND r.energy_kcal > 0
  ORDER BY
    CASE WHEN p_goal = 'lose'     THEN r.energy_kcal END ASC  NULLS LAST,
    CASE WHEN p_goal = 'gain'     THEN r.protein_g   END DESC NULLS LAST,
    CASE WHEN p_goal = 'maintain' THEN r.energy_kcal END ASC  NULLS LAST
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_plan_foods TO service_role;
