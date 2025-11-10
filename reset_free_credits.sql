-- ============================================================================
-- Reset Free Credits for Testing
-- ============================================================================
-- This script resets all usage counters for your user account
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- OPTION 1: Reset credits for YOUR specific user (recommended for testing)
-- Replace 'YOUR_USER_EMAIL_HERE' with your actual email address

UPDATE public.subscriptions
SET
  downloads_used = 0,
  resume_analyses_done = 0,
  cover_letters_generated = 0,
  ai_enhancements_used = 0,
  resumes_created = 0,
  resumes_downloaded = 0,
  ai_analyses_used = 0,
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_USER_EMAIL_HERE'
);

-- Verify the reset worked
SELECT
  u.email,
  s.downloads_used,
  s.resume_analyses_done,
  s.cover_letters_generated,
  s.plan,
  s.status
FROM public.subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'YOUR_USER_EMAIL_HERE';

-- ============================================================================
-- OPTION 2: Reset credits for ALL users (use with caution!)
-- Uncomment the lines below only if you want to reset ALL users
-- ============================================================================

/*
UPDATE public.subscriptions
SET
  downloads_used = 0,
  resume_analyses_done = 0,
  cover_letters_generated = 0,
  ai_enhancements_used = 0,
  resumes_created = 0,
  resumes_downloaded = 0,
  ai_analyses_used = 0,
  updated_at = NOW();

-- Verify the reset worked for all users
SELECT
  COUNT(*) as total_users_reset,
  SUM(downloads_used) as total_downloads,
  SUM(resume_analyses_done) as total_analyses,
  SUM(cover_letters_generated) as total_cover_letters
FROM public.subscriptions;
*/

-- ============================================================================
-- OPTION 3: Delete and recreate subscription (clean slate)
-- Replace 'YOUR_USER_EMAIL_HERE' with your actual email address
-- ============================================================================

/*
-- Delete existing subscription
DELETE FROM public.subscriptions
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_USER_EMAIL_HERE'
);

-- Create fresh subscription with 0 usage
INSERT INTO public.subscriptions (
  user_id,
  plan,
  status,
  downloads_used,
  resume_analyses_done,
  cover_letters_generated,
  ai_enhancements_used,
  created_at,
  updated_at
)
SELECT
  id,
  'free',
  'active',
  0,
  0,
  0,
  0,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'YOUR_USER_EMAIL_HERE';
*/

SELECT '✅ Credits reset script ready! Replace YOUR_USER_EMAIL_HERE with your actual email.' as status;
