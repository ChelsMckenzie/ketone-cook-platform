-- Migration: Add is_public to recipes and create recipe_favorites table
-- Run this after the main schema

-- Add is_public column to recipes table
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create recipe_favorites table
CREATE TABLE IF NOT EXISTS public.recipe_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_favorites_user_id ON public.recipe_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_favorites_recipe_id ON public.recipe_favorites(recipe_id);

-- Enable RLS on recipe_favorites
ALTER TABLE public.recipe_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.recipe_favorites;
CREATE POLICY "Users can view their own favorites"
  ON public.recipe_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own favorites" ON public.recipe_favorites;
CREATE POLICY "Users can create their own favorites"
  ON public.recipe_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.recipe_favorites;
CREATE POLICY "Users can delete their own favorites"
  ON public.recipe_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update recipes RLS to allow public viewing
DROP POLICY IF EXISTS "Recipes select public" ON public.recipes;
CREATE POLICY "Recipes select public"
  ON public.recipes
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- Ensure logs table exists (for journal entries)
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('meal_note', 'personal_note', 'ketone_reading')),
  content text NOT NULL,
  image_url text,
  macros jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at);

-- Enable RLS on logs
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for logs
DROP POLICY IF EXISTS "Users can view their own logs" ON public.logs;
CREATE POLICY "Users can view their own logs"
  ON public.logs
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own logs" ON public.logs;
CREATE POLICY "Users can create their own logs"
  ON public.logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own logs" ON public.logs;
CREATE POLICY "Users can update their own logs"
  ON public.logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own logs" ON public.logs;
CREATE POLICY "Users can delete their own logs"
  ON public.logs
  FOR DELETE
  USING (auth.uid() = user_id);
