-- Migration: Add fields for external jobs (Adzuna)
-- Run this in Supabase SQL Editor

-- Add new columns to jobs table for external job sources
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS salary_min NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS salary_max NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS posted_date TIMESTAMP WITH TIME ZONE;

-- Add check constraint for source
ALTER TABLE jobs
  ADD CONSTRAINT jobs_source_check
  CHECK (source IN ('manual', 'adzuna'));

-- Create index on external_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);

-- Create index on source for filtering
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);

-- Add unique constraint for external jobs (prevent duplicates from same source)
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_unique_external
  ON jobs(external_id, source)
  WHERE external_id IS NOT NULL;

-- Update existing jobs to have source = 'manual'
UPDATE jobs
SET source = 'manual'
WHERE source IS NULL;

-- Comments for documentation
COMMENT ON COLUMN jobs.external_id IS 'External job ID from third-party API (e.g., Adzuna)';
COMMENT ON COLUMN jobs.external_url IS 'External URL to apply for the job';
COMMENT ON COLUMN jobs.salary_min IS 'Minimum salary for the position';
COMMENT ON COLUMN jobs.salary_max IS 'Maximum salary for the position';
COMMENT ON COLUMN jobs.source IS 'Source of the job (manual or adzuna)';
COMMENT ON COLUMN jobs.posted_date IS 'Original posting date from external source';
