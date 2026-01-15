-- Fix logs table constraint - Run this in Supabase SQL Editor
-- This script will check and fix the constraint properly

-- First, let's see what constraints exist
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'public.logs'::regclass AND contype = 'c';

-- Drop ALL possible constraint names (in case it has a different name)
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_type_check;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_type_check1;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_type_check2;

-- Also try to drop any constraint on the type column
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.logs'::regclass 
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%type%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Now add the correct constraint
ALTER TABLE public.logs 
ADD CONSTRAINT logs_type_check 
CHECK (type IN ('meal_note', 'personal_note', 'ketone_reading'));

-- Verify the constraint was created correctly
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'public.logs'::regclass AND contype = 'c';
