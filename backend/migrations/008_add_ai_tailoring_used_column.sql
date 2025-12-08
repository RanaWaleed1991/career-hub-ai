-- Migration: Add ai_tailoring_used column to subscriptions table
-- This tracks the number of times users have used the AI resume tailoring feature
-- Run this in Supabase SQL Editor

-- Add ai_tailoring_used column to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS ai_tailoring_used INTEGER DEFAULT 0;

-- Update the create_user_subscription trigger function to include the new column
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
    resumes_created,
    resumes_downloaded,
    ai_analyses_used,
    ai_tailoring_used
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

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.ai_tailoring_used IS 'Number of times user has used AI resume tailoring feature';
