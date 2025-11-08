import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Backend uses service_role key for admin operations
export const supabase: SupabaseClient | null =
  env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// Helper to ensure Supabase is configured
export const ensureSupabaseConfigured = (): void => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_SERVICE_KEY to your .env file.'
    );
  }
};
