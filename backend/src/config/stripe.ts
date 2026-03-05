import Stripe from 'stripe';
import { env } from './env.js';

/**
 * Stripe client instance
 * Initialized with the secret key from environment variables
 */
export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  : null;

/**
 * Stripe price IDs for subscription tiers
 * These should be created in your Stripe Dashboard and added to .env
 *
 * To create prices:
 * 1. Go to Stripe Dashboard -> Products
 * 2. Create products: "Career Hub Weekly Premium" and "Career Hub Monthly Premium"
 * 3. Add prices: $9.99/week (recurring) and $24.99/month (recurring)
 * 4. Copy the price IDs (they start with price_) to your .env file
 */
export const STRIPE_PRICE_IDS = {
  WEEKLY: process.env.STRIPE_PRICE_ID_PRO_WEEKLY || '',
  MONTHLY: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || '',
  EXPERT_REVIEW: process.env.STRIPE_PRICE_ID_EXPERT_REVIEW || '',
};

/**
 * Subscription tier configuration
 */
export interface SubscriptionTier {
  name: string;
  price: number;
  interval: 'week' | 'month';
  priceId: string;
  features: string[];
  badge?: string | null;
  limits: {
    downloads: number;
    coverLetters: number;
    resumeAnalyses: number;
    aiEnhancements: number;
    aiTailoring: number;
  };
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'month',
    priceId: '',
    badge: null,
    features: [
      '3 Resume Downloads',
      '3 Cover Letters',
      '3 Resume Analyses',
      '10 AI Enhancements',
      '3 Resume Tailoring',
    ],
    limits: {
      downloads: 3,
      coverLetters: 3,
      resumeAnalyses: 3,
      aiEnhancements: 10,
      aiTailoring: 3,
    },
  },
  weekly: {
    name: 'Weekly Premium',
    price: 9.99,
    interval: 'week',
    priceId: STRIPE_PRICE_IDS.WEEKLY,
    badge: null,
    features: [
      'Unlimited resume downloads',
      'Unlimited AI improvements',
      'Unlimited AI Resume Tailoring',
      'Unlimited cover letters',
      '10 AI Resume Analyses per week',
      'Clean downloads (no watermark)',
      'Resume version history',
      'Application tracker dashboard',
    ],
    limits: {
      downloads: Infinity,
      coverLetters: Infinity,
      resumeAnalyses: 10,
      aiEnhancements: Infinity,
      aiTailoring: Infinity,
    },
  },
  monthly: {
    name: 'Monthly Premium',
    price: 24.99,
    interval: 'month',
    priceId: STRIPE_PRICE_IDS.MONTHLY,
    badge: 'SAVE 37%',
    features: [
      'Everything in Weekly, PLUS:',
      'UNLIMITED AI Resume Analyses',
      'Save $15/month (37% discount)',
      'Unlimited resume downloads',
      'Unlimited AI improvements',
      'Unlimited AI Resume Tailoring',
      'Unlimited cover letters',
      'Clean downloads (no watermark)',
      'Resume version history',
      'Application tracker dashboard',
    ],
    limits: {
      downloads: Infinity,
      coverLetters: Infinity,
      resumeAnalyses: Infinity,
      aiEnhancements: Infinity,
      aiTailoring: Infinity,
    },
  },
};

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = (): boolean => {
  return !!stripe && !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET;
};

/**
 * Helper to ensure Stripe is configured
 */
export const ensureStripeConfigured = (): void => {
  if (!isStripeConfigured()) {
    throw new Error(
      'Stripe is not configured. Please add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env'
    );
  }
};
