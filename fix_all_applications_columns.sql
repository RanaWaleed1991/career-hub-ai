-- ============================================================================
-- Comprehensive Applications Table Column Fix
-- ============================================================================
-- This script fixes all column mismatches in the applications table
-- Run this ONCE in your Supabase SQL Editor to fix all issues
-- ============================================================================

-- Fix 1: Handle role vs position column mismatch
DO $$
BEGIN
  -- If role column exists, drop it (we use position instead)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'role'
  ) THEN
    -- Update any NULL role values to match position first
    UPDATE public.applications
    SET role = position
    WHERE role IS NULL AND position IS NOT NULL;

    -- Drop the role column
    ALTER TABLE public.applications DROP COLUMN role;
    RAISE NOTICE '[1/2] Dropped redundant role column - using position instead';
  ELSE
    RAISE NOTICE '[1/2] Role column does not exist - OK';
  END IF;
END $$;

-- Fix 2: Handle date_applied vs applied_date column mismatch
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
      -- Both exist: update date_applied from applied_date and drop date_applied
      UPDATE public.applications
      SET date_applied = COALESCE(applied_date, NOW())
      WHERE date_applied IS NULL;

      ALTER TABLE public.applications DROP COLUMN date_applied;
      RAISE NOTICE '[2/2] Dropped date_applied column - using applied_date instead';
    ELSE
      -- Only date_applied exists: rename it to applied_date
      ALTER TABLE public.applications RENAME COLUMN date_applied TO applied_date;
      RAISE NOTICE '[2/2] Renamed date_applied to applied_date';
    END IF;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'applied_date'
  ) THEN
    -- Neither exists: add applied_date
    ALTER TABLE public.applications
    ADD COLUMN applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '[2/2] Added applied_date column';
  ELSE
    RAISE NOTICE '[2/2] applied_date column exists correctly - OK';
  END IF;
END $$;

-- Verify the final table structure
SELECT '=== Final Applications Table Structure ===' as info;
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

SELECT '=== All fixes applied successfully! ===' as status;
SELECT 'You can now create applications without errors.' as next_step;
