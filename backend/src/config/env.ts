import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '../../.env') });

interface EnvConfig {
  GEMINI_API_KEY: string;
  PORT: number;
  FRONTEND_URL: string;
  NODE_ENV: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env: EnvConfig = {
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY'),
  PORT: parseInt(getEnvVar('PORT', '3001'), 10),
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_SERVICE_KEY: getEnvVar('SUPABASE_SERVICE_KEY'),
};
