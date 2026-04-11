-- Migration: 0014_recipes_indexes.sql
-- Add btree indexes for filter columns and a GIN full-text search index.
-- Depends on: 0012 (is_vegetarian, cuisine, category columns must be normalised).

CREATE INDEX IF NOT EXISTS idx_recipes_cuisine   ON public.recipes(cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_category  ON public.recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_is_veg    ON public.recipes(is_vegetarian);
CREATE INDEX IF NOT EXISTS idx_recipes_energy    ON public.recipes(energy_kcal);

-- Full-text search column + GIN index on recipe name
ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(name, ''))
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_recipes_fts ON public.recipes USING GIN(fts);
