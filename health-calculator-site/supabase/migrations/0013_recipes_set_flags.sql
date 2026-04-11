-- Migration: 0013_recipes_set_flags.sql
-- Set is_vegetarian, is_vegan, and allergens flags on the recipes table.
-- Depends on: 0012 (is_vegetarian, is_vegan, allergens columns must exist).

-- ─── 1. Mark non-vegetarian rows ─────────────────────────────────────────────

UPDATE public.recipes
SET is_vegetarian = false,
    is_vegan      = false
WHERE name ILIKE ANY(ARRAY[
  '%chicken%','%mutton%','%beef%','%pork%','%fish%','%prawn%',
  '%shrimp%','%crab%','%lobster%','%squid%','%anchovy%','%sardine%',
  '%tuna%','%salmon%','%meat%','%lamb%','%goat%','%bacon%','%ham%',
  '%turkey%','%duck%','%venison%','%sausage%','%pepperoni%'
]);

-- Also mark rows whose normalised category is protein-meat/fish as non-vegetarian
-- (catches items where the name alone doesn't reveal it, e.g. "Ground round")
UPDATE public.recipes
SET is_vegetarian = false,
    is_vegan      = false
WHERE category = 'protein'
  AND (
    -- original source category was a meat/fish category before normalisation;
    -- we key off name keywords already above but also catch by source_dataset label
    name ILIKE ANY(ARRAY[
      '%steak%','%roast%','%rib%','%chop%','%fillet%','%loin%',
      '%mince%','%ground%','%drumstick%','%thigh%','%breast%','%wing%',
      '%seafood%','%shellfish%','%oyster%','%mussel%','%clam%','%scallop%'
    ])
  );

-- ─── 2. Mark vegan rows ───────────────────────────────────────────────────────
-- Vegan = vegetarian AND no animal by-products in name

UPDATE public.recipes
SET is_vegan = true
WHERE is_vegetarian = true
  AND NOT (name ILIKE ANY(ARRAY[
    '%milk%','%curd%','%yogurt%','%yoghurt%','%butter%','%ghee%','%cheese%',
    '%cream%','%paneer%','%egg%','%honey%','%whey%','%dairy%',
    '%lassi%','%custard%','%mayonnaise%','%mayo%'
  ]));

-- ─── 3. Set allergen arrays ───────────────────────────────────────────────────

UPDATE public.recipes
SET allergens = ARRAY(
  SELECT unnest FROM unnest(ARRAY[
    CASE WHEN name ILIKE ANY(ARRAY[
      '%wheat%','%gluten%','%bread%','%roti%','%pasta%','%noodle%',
      '%maida%','%atta%','%semolina%','%barley%','%rye%'
    ]) THEN 'gluten' END,
    CASE WHEN name ILIKE ANY(ARRAY[
      '%milk%','%cheese%','%butter%','%cream%','%curd%','%paneer%',
      '%ghee%','%yogurt%','%yoghurt%','%dairy%','%whey%','%lassi%'
    ]) THEN 'dairy' END,
    CASE WHEN name ILIKE ANY(ARRAY[
      '%egg%','%mayonnaise%','%mayo%','%custard%'
    ]) THEN 'eggs' END,
    CASE WHEN name ILIKE ANY(ARRAY[
      '%peanut%','%almond%','%cashew%','%walnut%','%pistachio%',
      '%hazelnut%','%pecan%','%macadamia%','%chestnut%'
    ]) THEN 'nuts' END,
    CASE WHEN name ILIKE ANY(ARRAY[
      '%soy%','%tofu%','%edamame%','%miso%','%tempeh%'
    ]) THEN 'soy' END,
    CASE WHEN name ILIKE ANY(ARRAY[
      '%prawn%','%shrimp%','%crab%','%lobster%','%shellfish%',
      '%oyster%','%mussel%','%clam%','%scallop%'
    ]) THEN 'shellfish' END,
    CASE WHEN name ILIKE ANY(ARRAY[
      '%fish%','%tuna%','%salmon%','%sardine%','%anchovy%',
      '%mackerel%','%herring%','%cod%','%tilapia%','%catfish%'
    ]) THEN 'fish' END
  ]) WHERE unnest IS NOT NULL
)
WHERE allergens = '{}' OR allergens IS NULL;
