-- ============================================================================
-- Database Schema Verification and Fix Script
-- ============================================================================
-- Run this script in Supabase SQL Editor to verify and fix schema issues

-- First, let's check what tables exist
SELECT 'Existing tables:' as info;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check resume_versions table structure
SELECT 'resume_versions table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'resume_versions'
ORDER BY ordinal_position;

-- Check applications table structure
SELECT 'applications table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- Check subscriptions table structure
SELECT 'subscriptions table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Reload the schema cache to fix PGRST204 errors
NOTIFY pgrst, 'reload schema';

SELECT 'Schema cache has been reloaded!' as status;

-- ============================================================================
-- If you still get errors, the tables might not exist.
-- In that case, run the database_schema.sql file to create them.
-- ============================================================================
