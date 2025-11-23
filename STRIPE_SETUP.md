# Stripe Payment Integration Setup Guide

This guide will walk you through setting up Stripe payment processing for Career Hub AI.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Creating Subscription Products](#creating-subscription-products)
4. [Configuring Environment Variables](#configuring-environment-variables)
5. [Database Migration](#database-migration)
6. [Testing Payments](#testing-payments)
7. [Setting Up Webhooks](#setting-up-webhooks)
8. [Going to Production](#going-to-production)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Active Stripe account (sign up at https://stripe.com)
- Completed Sprint 1-3 (Backend API, Supabase, Frontend)
- Node.js and npm installed

## Stripe Account Setup

### 1. Create a Stripe Account

1. Go to https://stripe.com and sign up
2. Complete your account verification
3. Start in **Test Mode** (toggle in the top right corner)

### 2. Get Your API Keys

1. Go to **Developers** → **API keys**
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

**IMPORTANT:** Never commit your secret key to version control!

## Creating Subscription Products

### 1. Create Basic Plan Product

1. Go to **Products** → **Add product**
2. Fill in the details:
   - **Name:** Career Hub Basic
   - **Description:** Weekly subscription with unlimited downloads and 10 AI analyses
   - **Pricing model:** Standard pricing
   - **Price:** $9.99
   - **Billing period:** Weekly
   - **Recurring:** Yes
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`)

### 2. Create Professional Plan Product

1. Go to **Products** → **Add product**
2. Fill in the details:
   - **Name:** Career Hub Professional
   - **Description:** Monthly subscription with unlimited features
   - **Pricing model:** Standard pricing
   - **Price:** $24.99
   - **Billing period:** Monthly
   - **Recurring:** Yes
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`)

## Configuring Environment Variables

### Backend Configuration

1. Copy `backend/.env.example` to `backend/.env`
2. Add your Stripe keys:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here  # Leave empty for now

# Stripe Price IDs
STRIPE_BASIC_PRICE_ID=price_your_basic_price_id_here
STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id_here
```

### Frontend Configuration

1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Add your Stripe publishable key:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

## Database Migration

### Run the Stripe Integration Migration

1. Open your Supabase project: https://app.supabase.com
2. Go to **SQL Editor**
3. Open the file `stripe_integration_migration.sql` from the project root
4. Copy and paste the entire SQL script into the editor
5. Click **Run** to execute the migration

This migration adds the following to your `subscriptions` table:
- `stripe_customer_id` - Stripe customer ID
- `stripe_subscription_id` - Stripe subscription ID
- `stripe_price_id` - The price ID for the subscription
- `current_period_start` - Subscription period start date
- `current_period_end` - Subscription period end date
- `cancel_at_period_end` - Whether subscription is set to cancel

### Verify the Migration

Run this query in Supabase SQL Editor to verify:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions';
```

You should see all the new Stripe-related columns.

## Testing Payments

### 1. Start Your Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Test Stripe Configuration

Check your backend console for:
```
💳 Stripe Payments configured: ✓
```

If you see ✗, double-check your `.env` file.

### 3. Test the Checkout Flow

1. Navigate to your pricing page in the frontend
2. Click "Subscribe Now" on either plan
3. Use Stripe test card numbers:
   - **Success:** `4242 4242 4242 4242`
   - **Decline:** `4000 0000 0000 0002`
   - **Requires authentication:** `4000 0025 0000 3155`
4. Use any future expiry date (e.g., 12/25)
5. Use any 3-digit CVC (e.g., 123)
6. Complete the checkout

### 4. Verify Subscription Creation

1. Check Stripe Dashboard → **Payments** → **Subscriptions**
2. You should see your test subscription
3. Check your Supabase `subscriptions` table:
   ```sql
   SELECT * FROM subscriptions WHERE stripe_subscription_id IS NOT NULL;
   ```

## Setting Up Webhooks

Webhooks are essential for keeping your database in sync with Stripe events.

### Local Development with Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add it to `backend/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```
6. Restart your backend server

### Test Webhook Events

Trigger test events with Stripe CLI:

```bash
# Test subscription creation
stripe trigger checkout.session.completed

# Test subscription update
stripe trigger customer.subscription.updated

# Test subscription cancellation
stripe trigger customer.subscription.deleted

# Test successful payment
stripe trigger invoice.payment_succeeded

# Test failed payment
stripe trigger invoice.payment_failed
```

Check your backend logs to see webhook events being processed.

### Production Webhooks

When deploying to production:

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret
5. Add it to your production environment variables

## Going to Production

### 1. Switch to Live Mode

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Go to **Developers** → **API keys**
3. Copy your **live** API keys (start with `pk_live_` and `sk_live_`)

### 2. Update Environment Variables

Update your production environment variables with live keys:

```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_BASIC_PRICE_ID=price_your_live_basic_price_id
STRIPE_PROFESSIONAL_PRICE_ID=price_your_live_professional_price_id
```

### 3. Create Live Products

Repeat the product creation steps in **Live mode** to get live price IDs.

### 4. Activate Your Stripe Account

1. Complete business verification in Stripe Dashboard
2. Add bank account for payouts
3. Configure business settings
4. Set up tax collection (if applicable)

### 5. Test Live Payments

**IMPORTANT:** Live mode uses real money!

1. Test with small amounts first
2. Use real credit cards
3. Verify webhooks are working
4. Test the full subscription lifecycle

## Troubleshooting

### Backend Not Starting

**Error:** "Missing required environment variable: STRIPE_SECRET_KEY"

**Solution:** Ensure all Stripe environment variables are set in `backend/.env`

### Webhooks Not Working

**Error:** "Webhook signature verification failed"

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. Ensure webhook endpoint is registered before JSON middleware (already done in `server.ts`)
3. Check Stripe Dashboard → Webhooks for failed deliveries

### Checkout Session Creation Fails

**Error:** "Invalid price ID"

**Solution:**
1. Verify price IDs in `.env` match your Stripe Dashboard
2. Ensure you're using the correct mode (test vs live)
3. Check that products are active in Stripe

### Subscription Not Syncing

**Issue:** Subscription created in Stripe but not in database

**Solution:**
1. Check webhook logs in Stripe Dashboard
2. Verify `userId` is in checkout session metadata
3. Check backend console for webhook processing errors
4. Ensure database migration was run successfully

### Customer Portal Not Loading

**Error:** "No Stripe customer found for user"

**Solution:**
1. User must have an active subscription first
2. Verify `stripe_customer_id` exists in subscriptions table
3. Check that checkout session completed successfully

## API Endpoints Reference

### Payment Endpoints

- `GET /api/payments/config` - Get Stripe config and pricing tiers
- `POST /api/payments/create-checkout-session` - Create checkout session
- `POST /api/payments/create-portal-session` - Create customer portal session
- `GET /api/payments/subscription-status` - Get subscription status
- `POST /api/payments/cancel-subscription` - Cancel subscription
- `POST /api/payments/reactivate-subscription` - Reactivate canceled subscription

### Webhook Endpoint

- `POST /api/webhooks/stripe` - Handle Stripe webhook events

## Subscription Tiers

### Free Tier
- 3 Resume Downloads
- 3 Cover Letters
- 3 Resume Analyses
- Price: $0

### Basic Tier ($9.99/week)
- Unlimited resume downloads
- Unlimited AI improvements
- Unlimited AI Resume Tailoring
- Unlimited cover letters
- 10 AI Resume Analyses
- Clean downloads (no watermark)
- Resume version history
- Application tracker dashboard
- Auto Renewal

### Professional Tier ($24.99/month)
- Everything in Basic
- Unlimited AI Resume Analyses
- Priority job alerts
- Auto Renewal

## Security Best Practices

1. Never commit API keys to version control
2. Use environment variables for all secrets
3. Always verify webhook signatures
4. Use HTTPS in production
5. Keep Stripe SDK up to date
6. Implement rate limiting on payment endpoints
7. Log all payment-related events for audit trail
8. Use Stripe's test mode during development

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Career Hub AI Issues: [Your GitHub Issues URL]

## Next Steps

After completing this setup:

1. Test the complete payment flow
2. Customize the pricing page design
3. Add email notifications for subscription events
4. Implement usage tracking and limits
5. Add analytics for conversion tracking
6. Consider adding promotional codes/discounts
7. Set up subscription management in customer portal

## Additional Resources

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Security Guide](https://stripe.com/docs/security)
