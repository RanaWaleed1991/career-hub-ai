-- Migration: Enhance course schema with affiliate links, enrollment tracking
-- Run this in Supabase SQL Editor

-- Rename link column to video_url for clarity
ALTER TABLE courses
RENAME COLUMN link TO video_url;

-- Add new columns to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS affiliate_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Create course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_type ON courses(type);

-- Enable RLS on course_enrollments
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
  ON course_enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own enrollments
CREATE POLICY "Users can enroll in courses"
  ON course_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own enrollment progress
CREATE POLICY "Users can update own enrollment progress"
  ON course_enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON COLUMN courses.thumbnail_url IS 'URL to course thumbnail/preview image';
COMMENT ON COLUMN courses.duration IS 'Course duration (e.g., "10 hours", "6 weeks")';
COMMENT ON COLUMN courses.level IS 'Course difficulty level';
COMMENT ON COLUMN courses.category IS 'Course category (e.g., Programming, Design, Business)';
COMMENT ON COLUMN courses.affiliate_link IS 'Affiliate link for paid courses (where users purchase)';
COMMENT ON COLUMN courses.enrollment_count IS 'Total number of enrollments';
COMMENT ON COLUMN courses.is_featured IS 'Whether course is featured/highlighted';
COMMENT ON TABLE course_enrollments IS 'Tracks user enrollments in courses';
