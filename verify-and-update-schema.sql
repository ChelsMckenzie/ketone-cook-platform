-- Comprehensive Schema Verification and Update Script
-- Run this in Supabase SQL Editor to ensure your database matches the frontend requirements
-- This script is idempotent (safe to run multiple times)

-- ============================================
-- 1. ENUM TYPES
-- ============================================
DO $$
BEGIN
  -- Create location_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'location_type') THEN
    CREATE TYPE public.location_type AS ENUM ('rural', 'semi_urban', 'city');
  END IF;

  -- Create activity_level enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_level') THEN
    CREATE TYPE public.activity_level AS ENUM (
      'sedentary',
      'lightly_active',
      'moderately_active',
      'very_active'
    );
  END IF;
END $$;

-- ============================================
-- 2. PROFILE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text,
  full_name text,
  email text NOT NULL,
  dob date,
  gender text,
  last_period_end date,
  location_type public.location_type,
  address text,
  activity_level public.activity_level,
  fasting_goal int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add address column if missing (we use this instead of location_type now)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profile' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE public.profile ADD COLUMN address text;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_email ON public.profile(email);

-- ============================================
-- 3. RECIPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES public.profile(id) ON DELETE SET NULL,
  title text NOT NULL,
  ingredients jsonb NOT NULL,
  instructions text,
  cooking_time int,
  difficulty text,
  category text,
  macros jsonb,
  is_public boolean DEFAULT false
);

-- Add is_public column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'recipes' 
    AND column_name = 'is_public'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at);

-- ============================================
-- 4. RECIPE_FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipe_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_favorites_user_id ON public.recipe_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_favorites_recipe_id ON public.recipe_favorites(recipe_id);

-- ============================================
-- 5. LOGS TABLE (Journal Entries)
-- ============================================
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('meal_note', 'personal_note', 'ketone_reading')),
  content text NOT NULL,
  image_url text,
  macros jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Update type constraint if it exists with old values
DO $$
BEGIN
  -- Drop old constraint if it exists with wrong values
  ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_type_check;
  
  -- Add correct constraint
  ALTER TABLE public.logs 
  ADD CONSTRAINT logs_type_check 
  CHECK (type IN ('meal_note', 'personal_note', 'ketone_reading'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at);

-- ============================================
-- 6. UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profile_updated_at ON public.profile;
CREATE TRIGGER trg_profile_updated_at
BEFORE UPDATE ON public.profile
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Profile RLS Policies
DROP POLICY IF EXISTS "Profile select own" ON public.profile;
CREATE POLICY "Profile select own"
  ON public.profile
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profile insert own" ON public.profile;
CREATE POLICY "Profile insert own"
  ON public.profile
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profile update own" ON public.profile;
CREATE POLICY "Profile update own"
  ON public.profile
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Recipes RLS Policies (allow public viewing of public recipes)
DROP POLICY IF EXISTS "Recipes select public and own" ON public.recipes;
CREATE POLICY "Recipes select public and own"
  ON public.recipes
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Recipes insert own" ON public.recipes;
CREATE POLICY "Recipes insert own"
  ON public.recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recipes update own" ON public.recipes;
CREATE POLICY "Recipes update own"
  ON public.recipes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recipes delete own" ON public.recipes;
CREATE POLICY "Recipes delete own"
  ON public.recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Recipe Favorites RLS Policies
DROP POLICY IF EXISTS "Favorites select own" ON public.recipe_favorites;
CREATE POLICY "Favorites select own"
  ON public.recipe_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Favorites insert own" ON public.recipe_favorites;
CREATE POLICY "Favorites insert own"
  ON public.recipe_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Favorites delete own" ON public.recipe_favorites;
CREATE POLICY "Favorites delete own"
  ON public.recipe_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Logs RLS Policies
DROP POLICY IF EXISTS "Logs select own" ON public.logs;
CREATE POLICY "Logs select own"
  ON public.logs
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Logs insert own" ON public.logs;
CREATE POLICY "Logs insert own"
  ON public.logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Logs update own" ON public.logs;
CREATE POLICY "Logs update own"
  ON public.logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Logs delete own" ON public.logs;
CREATE POLICY "Logs delete own"
  ON public.logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION QUERIES (Optional - uncomment to check)
-- ============================================
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profile', 'recipes', 'recipe_favorites', 'logs')
-- ORDER BY table_name, ordinal_position;
