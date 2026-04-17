-- ============================================================
-- Nutrition Tracker · Indian Food Database Schema
-- Source: IFCT 2017, NIN, ICMR
-- ============================================================

CREATE TABLE IF NOT EXISTS foods (
  id     SERIAL PRIMARY KEY,
  code   TEXT UNIQUE NOT NULL,          -- IFCT food code, e.g. "A001"
  name   TEXT NOT NULL,                 -- Common English name
  scie   TEXT,                          -- Scientific / botanical name
  lang   TEXT,                          -- Regional names (Tamil, Hindi, Telugu, etc.)
  grup   TEXT,                          -- Food group
  ener   NUMERIC,                       -- Energy (kcal / 100g)
  prot   NUMERIC,                       -- Protein (g / 100g)
  fat    NUMERIC,                       -- Total fat (g / 100g)
  carb   NUMERIC,                       -- Total carbohydrates (g / 100g)
  fibr   NUMERIC,                       -- Dietary fibre (g / 100g)
  sugr   NUMERIC,                       -- Total sugars (g / 100g)
  sodium NUMERIC,                       -- Sodium (mg / 100g)
  source TEXT DEFAULT 'IFCT 2017'       -- Data source
);

-- ── Row-Level Security ───────────────────────────────────────
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (required for public food lookup)
CREATE POLICY "public read" ON foods
  FOR SELECT USING (true);

-- ── Indexes ──────────────────────────────────────────────────
-- Full-text index on name for fast ilike search
CREATE INDEX idx_foods_name ON foods USING gin(to_tsvector('english', name));

-- B-tree index on food group for category filter
CREATE INDEX idx_foods_grup ON foods (grup);

-- ── Example: Grant usage to anon role (Supabase default) ─────
-- GRANT SELECT ON foods TO anon;
