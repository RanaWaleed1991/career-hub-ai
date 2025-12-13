import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '../../services/userService';
import {
  login as loginService,
  logout as logoutService,
  signup as signupService,
  getCurrentUser,
  onAuthStateChange,
  signInWithOAuth,
  getAccessToken,
} from '../../services/userService';
import { migrateGuestDataToAccount } from '../../utils/guestMigration';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: authListener } = onAuthStateChange((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      const { user: loggedInUser, error } = await loginService(email, password);
      if (error) {
        return { error };
      }
      setUser(loggedInUser);

      // Migrate guest data to account (if any exists)
      try {
        await migrateGuestDataToAccount();
        console.log('Guest data migration completed');
      } catch (migrationError) {
        console.error('Guest data migration failed (non-fatal):', migrationError);
        // Don't fail login if migration fails
      }

      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      const { user: newUser, error } = await signupService(email, password, fullName);
      if (error) {
        return { error };
      }
      setUser(newUser);

      // Migrate guest data to new account (if any exists)
      try {
        await migrateGuestDataToAccount();
        console.log('Guest data migration completed');
      } catch (migrationError) {
        console.error('Guest data migration failed (non-fatal):', migrationError);
        // Don't fail signup if migration fails - user can rebuild resume
      }

      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutService();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    return signInWithOAuth('google');
  };

  const getToken = async (): Promise<string | null> => {
    return getAccessToken();
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    signup,
    logout,
    signInWithGoogle,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
