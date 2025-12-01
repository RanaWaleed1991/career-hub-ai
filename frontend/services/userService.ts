import { supabase } from '../src/config/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const ADMIN_EMAIL = 'admin@careerhub.ai';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: 'user' | 'admin';
}

/**
 * Sign up a new user with email and password
 * Calls backend API to ensure welcome email is sent
 */
export const signup = async (
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const API_URL = 'https://api.careerhubai.com.au';

    // Call backend API instead of Supabase directly to trigger welcome email
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fullName: fullName || '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { user: null, error: data.error || 'Signup failed' };
    }

    // Backend returns { user, session }
    if (!data.user) {
      return { user: null, error: 'Failed to create user' };
    }

    // Set the session in Supabase client for immediate authentication
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || email,
        fullName: data.user.user_metadata?.full_name,
        role: (data.user.user_metadata?.role as 'user' | 'admin') || 'user',
      },
      error: null,
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { user: null, error: 'Signup failed. Please try again.' };
  }
};

/**
 * Login with email and password
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Login failed' };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || email,
        fullName: data.user.user_metadata?.full_name,
        role: (data.user.user_metadata?.role as 'user' | 'admin') || 'user',
      },
      error: null,
    };
  } catch (error) {
    return { user: null, error: 'Login failed. Please try again.' };
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: 'Logout failed. Please try again.' };
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name,
      role: (user.user_metadata?.role as 'user' | 'admin') || 'user',
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get the current user's email (for backward compatibility)
 */
export const getCurrentUserEmail = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.email || null;
};

/**
 * Get the current session
 */
export const getSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Get the access token for API requests
 */
export const getAccessToken = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.access_token || null;
};

/**
 * Check if the current user is an administrator
 */
export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === 'admin';
};

/**
 * Sign in with OAuth provider (Google or Facebook)
 */
export const signInWithOAuth = async (
  provider: 'google' | 'facebook'
): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: `${provider} sign-in failed. Please try again.` };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
        fullName: session.user.user_metadata?.full_name,
        role: (session.user.user_metadata?.role as 'user' | 'admin') || 'user',
      });
    } else {
      callback(null);
    }
  });
};
