-- Migration: 0012_recipes_add_helper_columns.sql
-- Add helper columns needed by get_plan_foods() RPC and frontend filters.
-- Normalise cuisine and category values to CalorieIndia's canonical sets.
-- Data-informed: cuisine values are 'Indian', 'Continental', 'Japanese' (Title Case).
-- Category values are exact strings from the USDA/IFCT dataset (see mappings below).

-- ─── 1. Add helper columns ────────────────────────────────────────────────────

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS is_vegetarian boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_vegan      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS allergens     text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS name_local    text;

-- ─── 2. Normalise cuisine ─────────────────────────────────────────────────────
-- Actual values found: 'Indian' (1,014), 'Continental' (13,225), 'Japanese' (2,191)
-- Target values: 'indian' | 'continental' | 'japanese' | 'other'

UPDATE public.recipes
SET cuisine = CASE
  WHEN cuisine = 'Indian'      THEN 'indian'
  WHEN cuisine = 'Japanese'    THEN 'japanese'
  WHEN cuisine = 'Continental' THEN 'continental'
  ELSE 'other'
END;

-- ─── 3. Normalise category ────────────────────────────────────────────────────
-- Target values: 'grain'|'protein'|'vegetable'|'fruit'|'dairy'|'fat'|'beverage'|'snack'|'sweet'|'other'
-- Exact source category strings found in data used for matching.

UPDATE public.recipes
SET category = CASE

  -- grain
  WHEN category IN (
    'Baked Products',
    'Breakfast Cereals',
    'Cereal Grains and Pasta',
    'Cereals and Grains',
    'Potatoes and Starches',
    'Rice Dishes',
    'Breads'
  ) THEN 'grain'

  -- protein (meat, fish, eggs, legumes, nuts/seeds)
  WHEN category IN (
    'Beef Products',
    'Lamb, Veal, and Game Products',
    'Fish and Shellfish',
    'Poultry Products',
    'Pork Products',
    'Meat',
    'Non-Vegetarian',
    'Legumes and Legume Products',
    'Finfish and Shellfish Products',
    'Sausages and Luncheon Meats',
    'Pulses and Legumes',
    'Lentils and Curries',
    'Eggs',
    'Nut and Seed Products',
    'Nuts and Seeds'
  ) THEN 'protein'

  -- vegetable
  WHEN category IN (
    'Vegetables and Vegetable Products',
    'Vegetables',
    'Seaweeds',
    'Mushrooms'
  ) THEN 'vegetable'

  -- fruit
  WHEN category IN (
    'Fruits and Fruit Juices',
    'Fruits'
  ) THEN 'fruit'

  -- dairy
  WHEN category IN (
    'Dairy and Egg Products',
    'Dairy Products',
    'Dairy-Based'
  ) THEN 'dairy'

  -- fat
  WHEN category IN (
    'Fats and Oils'
  ) THEN 'fat'

  -- beverage
  WHEN category IN (
    'Beverages'
  ) THEN 'beverage'

  -- snack
  WHEN category IN (
    'Snacks',
    'Snacks and Chaat',
    'Fast Foods'
  ) THEN 'snack'

  -- sweet
  WHEN category IN (
    'Sweets',
    'Confectionery',
    'Sweets and Desserts',
    'Sugars and Sweeteners'
  ) THEN 'sweet'

  -- other (General, Main Course, Baby Foods, Soups/Sauces/Gravies, etc.)
  ELSE 'other'

END;
