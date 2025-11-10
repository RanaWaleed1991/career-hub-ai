-- ============================================================================
-- Comprehensive Applications Table Fix
-- ============================================================================
-- This script will check your applications table and add all missing columns
-- Run this in your Supabase SQL Editor

-- First, check if the applications table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'applications'
  ) THEN
    -- Create the table from scratch if it doesn't exist
    CREATE TABLE public.applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      company TEXT NOT NULL,
      position TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'applied',
      applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      job_url TEXT,
      notes TEXT,
      salary_range TEXT,
      location TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable Row Level Security
    ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can read own applications"
      ON public.applications FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own applications"
      ON public.applications FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own applications"
      ON public.applications FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own applications"
      ON public.applications FOR DELETE
      USING (auth.uid() = user_id);

    -- Create indexes
    CREATE INDEX applications_user_id_idx ON public.applications(user_id);
    CREATE INDEX applications_status_idx ON public.applications(status);

    -- Create trigger for updated_at
    CREATE TRIGGER update_applications_updated_at
      BEFORE UPDATE ON public.applications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    RAISE NOTICE 'Applications table created successfully!';
  ELSE
    RAISE NOTICE 'Applications table already exists, checking for missing columns...';
  END IF;
END $$;

-- Now add any missing columns if the table existed but was incomplete
DO $$
BEGIN
  -- Add position column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'position'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN position TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Added position column';
  END IF;

  -- Add applied_date column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'applied_date'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added applied_date column';
  END IF;

  -- Add company column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'company'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN company TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Added company column';
  END IF;

  -- Add status column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN status TEXT NOT NULL DEFAULT 'applied';
    RAISE NOTICE 'Added status column';
  END IF;

  -- Add job_url column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'job_url'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN job_url TEXT;
    RAISE NOTICE 'Added job_url column';
  END IF;

  -- Add notes column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN notes TEXT;
    RAISE NOTICE 'Added notes column';
  END IF;

  -- Add salary_range column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'salary_range'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN salary_range TEXT;
    RAISE NOTICE 'Added salary_range column';
  END IF;

  -- Add location column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'location'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN location TEXT;
    RAISE NOTICE 'Added location column';
  END IF;

  RAISE NOTICE 'All required columns verified!';
END $$;

-- Verify the final table structure
SELECT 'Final applications table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- Reload the PostgREST schema cache to fix PGRST204 errors
NOTIFY pgrst, 'reload schema';

SELECT 'Schema cache has been reloaded!' as status;
SELECT 'Applications table is now ready to use!' as final_status;
