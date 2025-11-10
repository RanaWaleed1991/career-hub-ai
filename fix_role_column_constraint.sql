-- ============================================================================
-- Fix Applications Table Role Column Constraint
-- ============================================================================
-- This script fixes the NOT NULL constraint issue on the role column
-- Run this in your Supabase SQL Editor

-- First, check if role column exists and update it to match position
DO $$
BEGIN
  -- If role column exists, update existing records to copy position to role
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'role'
  ) THEN
    -- Update any NULL role values to match position
    UPDATE public.applications
    SET role = position
    WHERE role IS NULL;

    RAISE NOTICE 'Updated role column to match position for existing records';

    -- Now we can safely drop the NOT NULL constraint or drop the column
    -- Option 1: Drop the role column entirely (recommended since we use position)
    ALTER TABLE public.applications DROP COLUMN IF EXISTS role;
    RAISE NOTICE 'Dropped role column - using position column instead';

  ELSE
    RAISE NOTICE 'Role column does not exist - no action needed';
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

SELECT 'Fix applied successfully!' as status;
