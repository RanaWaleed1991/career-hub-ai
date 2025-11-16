import Joi from 'joi';

/**
 * Environment variables schema
 * Validates all required environment variables at startup
 */
const envSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Server configuration
  PORT: Joi.number()
    .integer()
    .min(1)
    .max(65535)
    .default(3001),

  // Frontend URL
  FRONTEND_URL: Joi.string()
    .uri()
    .required()
    .description('Frontend application URL for CORS'),

  // Supabase configuration
  SUPABASE_URL: Joi.string()
    .uri()
    .required()
    .description('Supabase project URL'),

  SUPABASE_SERVICE_KEY: Joi.string()
    .required()
    .description('Supabase service role key (keep secret!)'),

  // Gemini AI configuration
  GEMINI_API_KEY: Joi.string()
    .required()
    .description('Google Gemini API key for AI features'),

  // Stripe payment configuration
  STRIPE_SECRET_KEY: Joi.string()
    .required()
    .description('Stripe secret key for payment processing'),

  STRIPE_WEBHOOK_SECRET: Joi.string()
    .required()
    .description('Stripe webhook secret for signature verification'),

  // Stripe price IDs (support both single and multiple pricing tiers)
  STRIPE_PRICE_ID: Joi.string()
    .optional()
    .description('Stripe price ID for subscription (single tier)'),

  STRIPE_WEEKLY_PRICE_ID: Joi.string()
    .optional()
    .description('Stripe weekly subscription price ID'),

  STRIPE_MONTHLY_PRICE_ID: Joi.string()
    .optional()
    .description('Stripe monthly subscription price ID'),

  // Adzuna job API configuration
  ADZUNA_APP_ID: Joi.string()
    .required()
    .description('Adzuna API application ID'),

  ADZUNA_APP_KEY: Joi.string()
    .optional()
    .description('Adzuna API application key'),

  ADZUNA_API_KEY: Joi.string()
    .optional()
    .description('Adzuna API key (alternative naming)'),
}).unknown(true); // Allow other env variables

/**
 * Validate environment variables
 * @throws {Error} If validation fails
 */
export function validateEnv(): void {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false, // Collect all errors, not just the first one
    stripUnknown: false, // Keep unknown variables
  });

  if (error) {
    const missingVars = error.details.map((detail) => detail.message).join('\n');
    console.error('❌ Environment validation failed:');
    console.error(missingVars);
    throw new Error(`Environment validation failed:\n${missingVars}`);
  }

  // Custom validation: Check for at least one Adzuna API key naming convention
  if (!process.env.ADZUNA_APP_KEY && !process.env.ADZUNA_API_KEY) {
    const errorMsg = 'Either ADZUNA_APP_KEY or ADZUNA_API_KEY is required';
    console.error('❌ Environment validation failed:');
    console.error(errorMsg);
    throw new Error(`Environment validation failed:\n${errorMsg}`);
  }

  console.log('✅ Environment variables validated successfully');

  // Log security-relevant configuration (without exposing secrets)
  console.log('Environment configuration:');
  console.log(`  NODE_ENV: ${value.NODE_ENV}`);
  console.log(`  PORT: ${value.PORT}`);
  console.log(`  FRONTEND_URL: ${value.FRONTEND_URL}`);
  console.log(`  SUPABASE_URL: ${value.SUPABASE_URL}`);
  console.log(`  GEMINI_API_KEY: ${value.GEMINI_API_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`  STRIPE_SECRET_KEY: ${value.STRIPE_SECRET_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`  STRIPE_WEBHOOK_SECRET: ${value.STRIPE_WEBHOOK_SECRET ? '✓ Set' : '✗ Missing'}`);
  console.log(`  ADZUNA_APP_ID: ${value.ADZUNA_APP_ID ? '✓ Set' : '✗ Missing'}`);
  const adzunaKey = value.ADZUNA_APP_KEY || value.ADZUNA_API_KEY;
  console.log(`  ADZUNA_API_KEY: ${adzunaKey ? '✓ Set' : '✗ Missing'}`);
}

/**
 * Check if required environment variables are set
 * @returns Array of missing variables
 */
export function getMissingEnvVars(): string[] {
  const missing: string[] = [];
  const requiredVars = [
    'FRONTEND_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'GEMINI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'ADZUNA_APP_ID',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check for Adzuna API key (supports both naming conventions)
  if (!process.env.ADZUNA_APP_KEY && !process.env.ADZUNA_API_KEY) {
    missing.push('ADZUNA_APP_KEY or ADZUNA_API_KEY');
  }

  return missing;
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}
