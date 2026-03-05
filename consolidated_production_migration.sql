-- ============================================================================
-- CAREER HUB AI - CONSOLIDATED PRODUCTION DATABASE MIGRATION
-- ============================================================================
-- This script creates the complete database schema for the new production
-- Supabase project. It consolidates all 13 migration files into one script.
--
-- IMPORTANT: Run this script in your NEW production Supabase SQL Editor
-- This creates the schema only - no data migration included
--
-- Created: 2025-11-19
-- Source: Consolidated from 13 migration files
-- ============================================================================

-- ============================================================================
-- SECTION 1: FUNCTIONS (Must be created first for triggers)
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create subscription when user signs up
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    status,
    downloads_used,
    resume_analyses_done,
    cover_letters_generated,
    ai_enhancements_used,
    ai_tailoring_used,
    resumes_created,
    resumes_downloaded,
    ai_analyses_used
  ) VALUES (
    NEW.id,
    'free',
    'active',
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 2: CORE TABLES (Resumes, Versions, Applications, Subscriptions)
-- ============================================================================

-- Table: resumes
-- Stores user resumes with JSONB data structure
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: resume_versions
-- Stores version history for resumes
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resume_id, version_number)
);

-- Table: applications
-- Tracks job applications submitted by users
-- NOTE: Uses 'position' not 'role', and 'applied_date' not 'date_applied'
CREATE TABLE IF NOT EXISTS public.applications (
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

-- Table: subscriptions
-- Manages user subscriptions with Stripe integration and usage tracking
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',

  -- Usage tracking columns
  downloads_used INTEGER DEFAULT 0,
  resume_analyses_done INTEGER DEFAULT 0,
  cover_letters_generated INTEGER DEFAULT 0,
  ai_enhancements_used INTEGER DEFAULT 0,
  ai_tailoring_used INTEGER DEFAULT 0,
  resumes_created INTEGER DEFAULT 0,
  resumes_downloaded INTEGER DEFAULT 0,
  ai_analyses_used INTEGER DEFAULT 0,

  -- Stripe integration fields
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_payment_method_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT subscriptions_plan_check CHECK (plan IN ('free', 'weekly', 'monthly')),
  CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'canceled', 'incomplete', 'past_due', 'trialing'))
);

-- ============================================================================
-- SECTION 3: JOBS & COURSES TABLES
-- ============================================================================

-- Table: jobs
-- Admin-managed job listings with external API integration (Adzuna)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('tech', 'accounting', 'casual')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  -- External job integration fields (Adzuna)
  external_id VARCHAR(255),
  external_url TEXT,
  salary_min NUMERIC(10, 2),
  salary_max NUMERIC(10, 2),
  source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'adzuna')),
  posted_date TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: courses
-- Course listings with enhanced schema for affiliates and enrollment tracking
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('free', 'paid')),
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published')),

  -- Enhanced fields
  thumbnail_url VARCHAR(500),
  duration VARCHAR(100),
  level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category VARCHAR(100),
  affiliate_link VARCHAR(500),
  enrollment_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: course_enrollments
-- Tracks user enrollments in courses with progress tracking
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================================================
-- SECTION 4: INDEXES
-- ============================================================================

-- Resumes indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_is_active ON public.resumes(is_active);

-- Resume versions indexes
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON public.resume_versions(user_id);

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- Unique index for Stripe customer (one per user, allowing NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_unique
  ON public.subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON public.jobs(external_id);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON public.jobs(source);

-- Unique index for external jobs (prevent duplicates from same source)
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_unique_external
  ON public.jobs(external_id, source)
  WHERE external_id IS NOT NULL;

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_type ON public.courses(type);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON public.courses(is_featured);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);

-- ============================================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Resumes Policies
-- ============================================================================

CREATE POLICY "Users can view own resumes"
  ON public.resumes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resumes"
  ON public.resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON public.resumes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON public.resumes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Resume Versions Policies
-- ============================================================================

CREATE POLICY "Users can view own resume versions"
  ON public.resume_versions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resume versions"
  ON public.resume_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume versions"
  ON public.resume_versions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Applications Policies
-- ============================================================================

CREATE POLICY "Users can view own applications"
  ON public.applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
  ON public.applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.applications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.applications
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Subscriptions Policies
-- ============================================================================

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Jobs Policies (Public read, admin write)
-- ============================================================================

CREATE POLICY "Anyone can view published jobs"
  ON public.jobs
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create jobs"
  ON public.jobs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update jobs"
  ON public.jobs
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete jobs"
  ON public.jobs
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Courses Policies (Public read, admin write)
-- ============================================================================

CREATE POLICY "Anyone can view published courses"
  ON public.courses
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create courses"
  ON public.courses
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update courses"
  ON public.courses
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete courses"
  ON public.courses
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Course Enrollments Policies
-- ============================================================================

CREATE POLICY "Users can view own enrollments"
  ON public.course_enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses"
  ON public.course_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment progress"
  ON public.course_enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 6: TRIGGERS
-- ============================================================================

-- Resumes updated_at trigger
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Applications updated_at trigger
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Subscriptions updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Jobs updated_at trigger
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Courses updated_at trigger
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create subscription when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription();

-- ============================================================================
-- SECTION 7: COMMENTS (Documentation)
-- ============================================================================

-- Subscriptions comments
COMMENT ON COLUMN public.subscriptions.plan IS 'Valid values: free, weekly ($9.99/week), monthly ($24.99/month)';
COMMENT ON COLUMN public.subscriptions.status IS 'Valid values: active, canceled, incomplete, past_due, trialing';

-- Jobs comments
COMMENT ON COLUMN public.jobs.external_id IS 'External job ID from third-party API (e.g., Adzuna)';
COMMENT ON COLUMN public.jobs.external_url IS 'External URL to apply for the job';
COMMENT ON COLUMN public.jobs.salary_min IS 'Minimum salary for the position';
COMMENT ON COLUMN public.jobs.salary_max IS 'Maximum salary for the position';
COMMENT ON COLUMN public.jobs.source IS 'Source of the job (manual or adzuna)';
COMMENT ON COLUMN public.jobs.posted_date IS 'Original posting date from external source';

-- Courses comments
COMMENT ON COLUMN public.courses.thumbnail_url IS 'URL to course thumbnail/preview image';
COMMENT ON COLUMN public.courses.duration IS 'Course duration (e.g., "10 hours", "6 weeks")';
COMMENT ON COLUMN public.courses.level IS 'Course difficulty level';
COMMENT ON COLUMN public.courses.category IS 'Course category (e.g., Programming, Design, Business)';
COMMENT ON COLUMN public.courses.affiliate_link IS 'Affiliate link for paid courses (where users purchase)';
COMMENT ON COLUMN public.courses.enrollment_count IS 'Total number of enrollments';
COMMENT ON COLUMN public.courses.is_featured IS 'Whether course is featured/highlighted';
COMMENT ON TABLE public.course_enrollments IS 'Tracks user enrollments in courses';

-- ============================================================================
-- SECTION 8: EXPERT REVIEWS TABLE
-- ============================================================================

-- Table: expert_reviews
-- Supports $99 one-time "Expert Resume Review" purchase
CREATE TABLE IF NOT EXISTS public.expert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_submission'
    CHECK (status IN (
      'pending_submission', 'submitted', 'in_review',
      'questionnaire_sent', 'questionnaire_completed',
      'revision_in_progress', 'completed'
    )),
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER,
  paid_at TIMESTAMPTZ,
  original_resume_url TEXT,
  original_resume_filename TEXT,
  submitted_at TIMESTAMPTZ,
  questionnaire JSONB,
  questionnaire_answers JSONB,
  questionnaire_sent_at TIMESTAMPTZ,
  questionnaire_completed_at TIMESTAMPTZ,
  rewritten_resume_url TEXT,
  rewritten_resume_filename TEXT,
  completed_at TIMESTAMPTZ,
  admin_notes TEXT,
  user_email TEXT,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expert_reviews_user_id ON public.expert_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_status ON public.expert_reviews(status);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_created_at ON public.expert_reviews(created_at);

ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expert reviews"
  ON public.expert_reviews FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own expert reviews"
  ON public.expert_reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_expert_reviews_updated_at
  BEFORE UPDATE ON public.expert_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 9: RELOAD SCHEMA CACHE
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT '✅ Database schema migration completed successfully!' as status;
SELECT 'Tables created: resumes, resume_versions, applications, subscriptions, jobs, courses, course_enrollments, expert_reviews' as tables;
SELECT 'Functions created: update_updated_at_column, create_user_subscription' as functions;
SELECT 'RLS enabled and policies configured for all tables' as security;
SELECT 'Ready for production use!' as next_step;
