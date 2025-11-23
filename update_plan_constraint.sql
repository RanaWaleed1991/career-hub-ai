-- Update the plan check constraint to allow new plan names
-- Run this in Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- Add new constraint with updated plan names
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_check
CHECK (plan IN ('free', 'weekly', 'monthly'));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.subscriptions'::regclass
AND conname = 'subscriptions_plan_check';
