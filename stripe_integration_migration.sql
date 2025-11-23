-- Stripe Integration Migration
-- This migration adds Stripe-specific fields to the subscriptions table
-- and updates the schema to support the new subscription tiers (free, weekly, monthly)

-- Add Stripe-specific columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- Create indexes for Stripe fields for faster lookups
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON public.subscriptions(stripe_subscription_id);

-- Add unique constraint on stripe_customer_id (one customer per user)
-- Note: We use WHERE clause to allow NULL values (users without Stripe customers)
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_unique
ON public.subscriptions(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Add comment to document valid plan values
COMMENT ON COLUMN public.subscriptions.plan IS 'Valid values: free, weekly ($9.99/week), monthly ($24.99/month)';

-- Add comment to document status values
COMMENT ON COLUMN public.subscriptions.status IS 'Valid values: active, canceled, incomplete, past_due, trialing';

-- Verify that all required usage tracking columns exist
-- These columns should already exist in your current schema
DO $$
BEGIN
    -- Check if columns exist, if not create them
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='subscriptions' AND column_name='ai_enhancements_used') THEN
        ALTER TABLE public.subscriptions ADD COLUMN ai_enhancements_used INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='subscriptions' AND column_name='downloads_used') THEN
        ALTER TABLE public.subscriptions ADD COLUMN downloads_used INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='subscriptions' AND column_name='cover_letters_generated') THEN
        ALTER TABLE public.subscriptions ADD COLUMN cover_letters_generated INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='subscriptions' AND column_name='resume_analyses_done') THEN
        ALTER TABLE public.subscriptions ADD COLUMN resume_analyses_done INTEGER DEFAULT 0;
    END IF;
END $$;

-- Summary of changes:
-- ✅ Added stripe_customer_id, stripe_subscription_id, stripe_price_id
-- ✅ Added current_period_start, current_period_end, cancel_at_period_end
-- ✅ Created indexes for performance
-- ✅ Added unique constraint for stripe_customer_id
-- ✅ Verified usage tracking columns exist
-- ✅ Valid plans: free, weekly, monthly
