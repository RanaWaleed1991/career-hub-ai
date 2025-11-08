import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Backend uses service_role key for admin operations
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
