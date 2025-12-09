import React, { useState, useEffect } from 'react';
import type { Page } from '../types';
import { supabase } from '../src/config/supabase';

interface ResetPasswordPageProps {
  setPage: (page: Page) => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ setPage }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if we have a valid reset session
    // Supabase automatically handles the recovery token from the URL hash
    let mounted = true;

    const checkToken = async () => {
      try {
        // Listen for auth state changes - Supabase will emit when session is established
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;

          if (event === 'PASSWORD_RECOVERY') {
            // Password recovery session detected
            setValidToken(true);
            setChecking(false);
          } else if (event === 'SIGNED_IN' && session) {
            // Session established
            setValidToken(true);
            setChecking(false);
          }
        });

        // Also check current session after a brief delay
        setTimeout(async () => {
          if (!mounted) return;

          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Session check error:', error);
          }

          if (session) {
            setValidToken(true);
            setChecking(false);
          } else {
            // No session found after waiting
            setError('Invalid or expired reset link. Please request a new one.');
            setChecking(false);
          }
        }, 2000); // Increased timeout to 2 seconds

        // Cleanup subscription
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        if (mounted) {
          setError('Failed to verify reset link. Please try again.');
          setChecking(false);
        }
      }
    };

    checkToken();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || 'Failed to reset password. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        setPage('auth');
      }, 3000);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-slate-700";
  const buttonClass = "w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Back button */}
      <button
        type="button"
        onClick={() => setPage('auth')}
        className="absolute top-4 left-4 flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="font-medium">Back to Login</span>
      </button>

      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 fade-in">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800">Set New Password</h1>
            <p className="text-slate-500 text-sm mt-2">
              {success ? 'Password updated successfully!' : 'Choose a strong password for your account'}
            </p>
          </div>

          {error && !validToken && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Invalid Reset Link</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => setPage('forgot-password')}
                    className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                  >
                    Request a new reset link
                  </button>
                </div>
              </div>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">Password reset successful!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Your password has been updated. Redirecting to login...
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPage('auth')}
                className={buttonClass}
              >
                Go to Login
              </button>
            </div>
          ) : validToken && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && validToken && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="password-new" className={labelClass}>
                  New Password
                </label>
                <input
                  id="password-new"
                  type="password"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className={inputClass}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">At least 6 characters</p>
              </div>

              <div>
                <label htmlFor="password-confirm" className={labelClass}>
                  Confirm New Password
                </label>
                <input
                  id="password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className={inputClass}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div>
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
