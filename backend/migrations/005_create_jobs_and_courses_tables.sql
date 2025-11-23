-- Migration: Create jobs and courses tables for admin content management
-- Date: 2025-11-14

-- =====================================================
-- Jobs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('tech', 'accounting', 'casual')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- =====================================================
-- Courses Table
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  link VARCHAR(500) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('free', 'paid')),
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_type ON courses(type);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Jobs: Allow public read access (anyone can view jobs)
CREATE POLICY "Jobs are viewable by everyone" ON jobs
  FOR SELECT
  USING (status = 'active');

-- Jobs: Only admins can insert/update/delete (handled by backend service_role key)
-- No policy needed as backend uses service_role key which bypasses RLS

-- Courses: Allow public read access (anyone can view published courses)
CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT
  USING (status = 'published');

-- Courses: Only admins can insert/update/delete (handled by backend service_role key)
-- No policy needed as backend uses service_role key which bypasses RLS

-- =====================================================
-- Updated_at Trigger Function
-- =====================================================

-- Create or replace the trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to jobs table
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to courses table
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify tables were created successfully
DO $$
BEGIN
  RAISE NOTICE '✓ Migration complete: jobs and courses tables created';
  RAISE NOTICE '  - Jobs table: % columns', (SELECT count(*) FROM information_schema.columns WHERE table_name = 'jobs');
  RAISE NOTICE '  - Courses table: % columns', (SELECT count(*) FROM information_schema.columns WHERE table_name = 'courses');
END $$;
