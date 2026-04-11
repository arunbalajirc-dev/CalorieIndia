-- Migration: 0016_recipes_rls.sql
-- Enable Row Level Security on recipes and allow public SELECT access.

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recipes_public_read" ON public.recipes;
CREATE POLICY "recipes_public_read" ON public.recipes
  FOR SELECT USING (true);
