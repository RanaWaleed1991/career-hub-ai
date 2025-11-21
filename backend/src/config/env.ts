import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from appropriate .env file
// In test mode, override any existing env vars to ensure .env file values are used
// BUT preserve NODE_ENV to keep test mode active
const isTestMode = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

// Determine which .env file to load
const envFileName = isProduction ? '.env.production' : '.env';
const envPath = join(__dirname, '../../', envFileName);

dotenv.config({
  path: envPath,
  override: isTestMode // Force override in test mode
});

// Restore NODE_ENV if it was overwritten during test mode
if (isTestMode) {
  process.env.NODE_ENV = 'test';
}

interface EnvConfig {
  GEMINI_API_KEY: string; // Now validated by validateEnv() in server.ts
  PORT: number;
  FRONTEND_URL: string;
  NODE_ENV: string;
  SUPABASE_URL: string | undefined;
  SUPABASE_SERVICE_KEY: string | undefined;
  STRIPE_SECRET_KEY: string | undefined;
  STRIPE_WEBHOOK_SECRET: string | undefined;
  STRIPE_PUBLISHABLE_KEY: string | undefined;
  ADZUNA_APP_ID: string | undefined;
  ADZUNA_API_KEY: string | undefined;
  SENDGRID_API_KEY: string | undefined;
  EMAIL_FROM: string | undefined;
  EMAIL_FROM_NAME: string | undefined;
}

const getEnvVar = (key: string, defaultValue?: string, required: boolean = true): string => {
  const value = process.env[key] || defaultValue;
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
};

// NOTE: Environment validation is now handled by validateEnv() in server.ts
// This allows env.ts to load without throwing errors, and validateEnv() performs comprehensive validation
export const env: EnvConfig = {
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY', '', false) || '',
  PORT: parseInt(getEnvVar('PORT', '3001', false), 10),
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:5173', false),
  NODE_ENV: getEnvVar('NODE_ENV', 'development', false),
  SUPABASE_URL: getEnvVar('SUPABASE_URL', '', false) || undefined,
  SUPABASE_SERVICE_KEY: getEnvVar('SUPABASE_SERVICE_KEY', '', false) || undefined,
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY', '', false) || undefined,
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET', '', false) || undefined,
  STRIPE_PUBLISHABLE_KEY: getEnvVar('STRIPE_PUBLISHABLE_KEY', '', false) || undefined,
  ADZUNA_APP_ID: getEnvVar('ADZUNA_APP_ID', '', false) || undefined,
  ADZUNA_API_KEY: getEnvVar('ADZUNA_API_KEY', '', false) || undefined,
  SENDGRID_API_KEY: getEnvVar('SENDGRID_API_KEY', '', false) || undefined,
  EMAIL_FROM: getEnvVar('EMAIL_FROM', 'careerhubaiaus@gmail.com', false),
  EMAIL_FROM_NAME: getEnvVar('EMAIL_FROM_NAME', 'Career Hub AI', false),
};
