-- Step 1: Migrate existing data to new types
-- This updates any existing journal entries to use the new type names

UPDATE public.logs 
SET type = 'meal_note' 
WHERE type = 'meal';

UPDATE public.logs 
SET type = 'personal_note' 
WHERE type = 'note';

UPDATE public.logs 
SET type = 'ketone_reading' 
WHERE type = 'measurement';

-- Delete any entries with 'fasting_start' type (or convert to personal_note if preferred)
-- Option A: Delete fasting_start entries
DELETE FROM public.logs WHERE type = 'fasting_start';

-- Option B: Convert fasting_start to personal_note (uncomment if you prefer this)
-- UPDATE public.logs SET type = 'personal_note' WHERE type = 'fasting_start';

-- Step 2: Now drop and recreate the constraint
-- Drop ALL possible constraint names
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_type_check;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_type_check1;
ALTER TABLE public.logs DROP CONSTRAINT IF EXISTS logs_type_check2;

-- Drop any constraint that references the type column
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

-- Step 3: Add the correct constraint
ALTER TABLE public.logs 
ADD CONSTRAINT logs_type_check 
CHECK (type IN ('meal_note', 'personal_note', 'ketone_reading'));

-- Step 4: Verify (optional - uncomment to check)
-- SELECT type, COUNT(*) FROM public.logs GROUP BY type;
