-- Migration: Update journal entry types
-- Run this in Supabase SQL Editor to update the logs table constraint

-- Drop the old constraint
ALTER TABLE public.logs 
DROP CONSTRAINT IF EXISTS logs_type_check;

-- Add the new constraint with updated types
ALTER TABLE public.logs 
ADD CONSTRAINT logs_type_check 
CHECK (type IN ('meal_note', 'personal_note', 'ketone_reading'));

-- Optional: Update existing entries if needed
-- Note: You may want to migrate existing data first
-- UPDATE public.logs SET type = 'meal_note' WHERE type = 'meal';
-- UPDATE public.logs SET type = 'personal_note' WHERE type = 'note';
-- UPDATE public.logs SET type = 'ketone_reading' WHERE type = 'measurement';
-- DELETE FROM public.logs WHERE type = 'fasting_start'; -- Or migrate to personal_note if preferred
