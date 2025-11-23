-- ============================================================================
-- Fix Applications Table - Add Missing applied_date Column
-- ============================================================================
-- Run this script in your Supabase SQL Editor to fix the applications table

-- Add applied_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'applications'
    AND column_name = 'applied_date'
  ) THEN
    ALTER TABLE public.applications
    ADD COLUMN applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    RAISE NOTICE 'Column applied_date added to applications table';
  ELSE
    RAISE NOTICE 'Column applied_date already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT 'Verifying applications table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- Reload the PostgREST schema cache to fix PGRST204 errors
NOTIFY pgrst, 'reload schema';

SELECT 'Schema cache has been reloaded!' as status;
SELECT 'Applications table is now ready to use!' as status;
