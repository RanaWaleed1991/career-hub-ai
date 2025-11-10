-- Stripe Integration Migration
-- This migration adds Stripe-specific fields to the subscriptions table
-- and updates the schema to support the new subscription tiers (free, basic, professional)

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
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_stripe_customer_id_unique UNIQUE (stripe_customer_id);

-- Update existing 'monthly' and 'yearly' plans to new plan names
-- old: free, monthly, yearly -> new: free, basic, professional
UPDATE public.subscriptions SET plan = 'basic' WHERE plan = 'monthly';
UPDATE public.subscriptions SET plan = 'professional' WHERE plan = 'yearly';

-- Add comment to document valid plan values
COMMENT ON COLUMN public.subscriptions.plan IS 'Valid values: free, basic ($9.99/week), professional ($24.99/month)';

-- Add comment to document status values
COMMENT ON COLUMN public.subscriptions.status IS 'Valid values: active, canceled, incomplete, past_due, trialing';

-- Update the column names for better clarity (optional, keeping compatibility)
-- Rename columns to match new terminology if needed
ALTER TABLE public.subscriptions RENAME COLUMN ai_analyses_used TO resume_analyses_done;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS ai_enhancements_used INTEGER DEFAULT 0;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS downloads_used INTEGER DEFAULT 0;

-- Rename subscription_end_date to current_period_end if you want consistency
-- (Skip if you want to keep both for backward compatibility)
-- ALTER TABLE public.subscriptions RENAME COLUMN subscription_end_date TO subscription_expires;
