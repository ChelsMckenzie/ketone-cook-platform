-- KetoMate Feature Updates: Meal Linking, Pantry, City Selection
-- Run this in Supabase SQL Editor

-- 1. Add city field to profile table
DO $$ BEGIN
    ALTER TABLE public.profile ADD COLUMN city TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 2. Add linked_meal_id to logs table for meal linking
DO $$ BEGIN
    ALTER TABLE public.logs ADD COLUMN linked_meal_id UUID REFERENCES public.logs(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- 3. Create pantry table for ambient ingredients
CREATE TABLE IF NOT EXISTS public.pantry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profile(id) ON DELETE CASCADE NOT NULL,
    ingredient_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, ingredient_name)
);

-- 4. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pantry_user_id ON public.pantry(user_id);

-- 5. Add updated_at trigger for pantry
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pantry_updated_at ON public.pantry;
CREATE TRIGGER update_pantry_updated_at
    BEFORE UPDATE ON public.pantry
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS for pantry table
ALTER TABLE public.pantry ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pantry select own" ON public.pantry;
CREATE POLICY "Pantry select own"
  ON public.pantry
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pantry insert own" ON public.pantry;
CREATE POLICY "Pantry insert own"
  ON public.pantry
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pantry update own" ON public.pantry;
CREATE POLICY "Pantry update own"
  ON public.pantry
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pantry delete own" ON public.pantry;
CREATE POLICY "Pantry delete own"
  ON public.pantry
  FOR DELETE
  USING (auth.uid() = user_id);
