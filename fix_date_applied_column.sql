-- ============================================================================
-- Fix Applications Table Date Column Mismatch
-- ============================================================================
-- This script fixes the column name mismatch between date_applied and applied_date
-- Run this in your Supabase SQL Editor

DO $$
BEGIN
  -- Check if date_applied column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'date_applied'
  ) THEN
    -- Check if applied_date also exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'applications' AND column_name = 'applied_date'
    ) THEN
      -- Both columns exist, update date_applied from applied_date and drop date_applied
      UPDATE public.applications
      SET date_applied = COALESCE(applied_date, NOW())
      WHERE date_applied IS NULL;

      RAISE NOTICE 'Updated date_applied from applied_date';

      -- Drop the date_applied column since we're using applied_date
      ALTER TABLE public.applications DROP COLUMN date_applied;
      RAISE NOTICE 'Dropped date_applied column - using applied_date instead';
    ELSE
      -- Only date_applied exists, rename it to applied_date
      ALTER TABLE public.applications RENAME COLUMN date_applied TO applied_date;
      RAISE NOTICE 'Renamed date_applied to applied_date';
    END IF;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'applied_date'
  ) THEN
    -- Neither column exists, add applied_date
    ALTER TABLE public.applications
    ADD COLUMN applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added applied_date column';
  ELSE
    RAISE NOTICE 'applied_date column already exists correctly';
  END IF;
END $$;

-- Verify the final table structure
SELECT 'Applications table columns after fix:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Date column fix applied successfully!' as status;
