-- Migration: Standardize Course Categories
-- Date: 2025-01-21
-- Description: Updates all course categories to use standard category names
-- Categories: Technology, Accounting, Resume & Interview, Personal Development

-- First, check current categories to see what needs to be updated
-- Uncomment the line below to see what categories exist
-- SELECT DISTINCT category FROM courses WHERE category IS NOT NULL ORDER BY category;

-- Update Technology courses
UPDATE courses
SET category = 'Technology'
WHERE category IN ('IT & Technology', 'tech', 'IT', 'Programming', 'Web Development', 'Software', 'Technology');

-- Update Accounting courses
UPDATE courses
SET category = 'Accounting'
WHERE category IN ('Business & Finance', 'accounting', 'finance', 'Finance', 'Business');

-- Update Resume & Interview courses
UPDATE courses
SET category = 'Resume & Interview'
WHERE category IN ('Resume', 'Interview', 'Career', 'LinkedIn & Networking', 'Job Search', 'Career Development');

-- Update Personal Development courses
UPDATE courses
SET category = 'Personal Development'
WHERE category IN ('Personal Dev', 'Productivity', 'personal', 'Self-Improvement', 'Leadership', 'Communication');

-- Verify the changes
-- SELECT category, COUNT(*) as count
-- FROM courses
-- WHERE category IS NOT NULL
-- GROUP BY category
-- ORDER BY category;
