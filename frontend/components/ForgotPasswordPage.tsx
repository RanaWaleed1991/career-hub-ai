import React, { useState } from 'react';
import type { Page } from '../types';

interface ForgotPasswordPageProps {
  setPage: (page: Page) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ setPage }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/auth/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-slate-700";
  const buttonClass = "w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";

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
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800">Reset Password</h1>
            <p className="text-slate-500 text-sm mt-2">
              {success
                ? 'Check your email for reset instructions'
                : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
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
                    <p className="text-sm font-medium text-green-800">Reset link sent!</p>
                    <p className="text-sm text-green-700 mt-1">
                      If an account exists with <strong>{email}</strong>, you'll receive a password reset link within a few minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-600 space-y-2">
                <p><strong>Didn't receive the email?</strong></p>
                <ul className="list-disc list-inside text-xs space-y-1 text-slate-500">
                  <li>Check your spam/junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes - emails can take time to arrive</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setError(null);
                }}
                className="w-full py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Another Link
              </button>

              <button
                onClick={() => setPage('auth')}
                className="w-full py-2 px-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email-reset" className={labelClass}>
                  Email Address
                </label>
                <input
                  id="email-reset"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className={inputClass}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Enter the email address associated with your account
                </p>
              </div>

              <div>
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending reset link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Remember your password?{' '}
              <button
                onClick={() => setPage('auth')}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
