import React, { useState } from 'react';
import { GoogleIcon, FacebookIcon } from './icons';
import { useAuth } from '../src/contexts/AuthContext';
import type { Page } from '../types';

interface AuthPageProps {
  setPage: (page: Page) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ setPage }) => {
  const { login, signup, signInWithGoogle, signInWithFacebook } = useAuth();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginView) {
        // Login
        const { error: loginError } = await login(email, password);
        if (loginError) {
          setError(loginError);
        }
      } else {
        // Sign up
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          return;
        }
        const { error: signupError } = await signup(email, password, fullName);
        if (signupError) {
          setError(signupError);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleView = () => {
    setIsLoginView(!isLoginView);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError);
      setLoading(false);
    }
    // Note: User will be redirected to Google, so we keep loading=true
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error: facebookError } = await signInWithFacebook();
    if (facebookError) {
      setError(facebookError);
      setLoading(false);
    }
    // Note: User will be redirected to Facebook, so we keep loading=true
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-slate-700";
  const buttonClass = "w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const socialButtonClass = "w-full inline-flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Back button */}
      <button
        type="button"
        onClick={() => setPage('landing')}
        className="absolute top-4 left-4 flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-white/50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 fade-in">
        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-slate-800">Career Hub AI</h1>
            <p className="text-slate-500 text-sm mt-2">
                {isLoginView ? 'Welcome back! Sign in to continue.' : 'Create an account to get started.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={socialButtonClass}
            >
              <GoogleIcon className="w-5 h-5 mr-3" />
              Continue with Google
            </button>
            <button
              onClick={handleFacebookSignIn}
              disabled={loading}
              className={socialButtonClass}
            >
              <FacebookIcon className="w-5 h-5 mr-3 text-[#1877F2]" />
              Continue with Facebook
            </button>
          </div>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase">OR</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isLoginView ? (
              // Login Form
              <>
                <div>
                  <label htmlFor="email-login" className={labelClass}>Email Address</label>
                  <input
                    id="email-login"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className={inputClass}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password-login" className={labelClass}>Password</label>
                  <input
                    id="password-login"
                    type="password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className={inputClass}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              // Sign Up Form
              <>
                <div>
                  <label htmlFor="fullname-signup" className={labelClass}>Full Name (Optional)</label>
                  <input
                    id="fullname-signup"
                    type="text"
                    disabled={loading}
                    className={inputClass}
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="email-signup" className={labelClass}>Email Address</label>
                  <input
                    id="email-signup"
                    type="email"
                    required
                    disabled={loading}
                    className={inputClass}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password-signup" className={labelClass}>Password</label>
                  <input
                    id="password-signup"
                    type="password"
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
                  <label htmlFor="confirm-password-signup" className={labelClass}>Confirm Password</label>
                  <input
                    id="confirm-password-signup"
                    type="password"
                    required
                    disabled={loading}
                    className={inputClass}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <button type="submit" disabled={loading} className={buttonClass}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLoginView ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLoginView ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={handleToggleView}
              disabled={loading}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoginView ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Legal Links Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex justify-center items-center space-x-4 text-xs text-slate-500">
              <button
                onClick={() => setPage('privacy')}
                className="hover:text-indigo-600 transition-colors hover:underline"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => setPage('terms')}
                className="hover:text-indigo-600 transition-colors hover:underline"
              >
                Terms of Service
              </button>
            </div>
            <div className="text-center mt-2 text-xs text-slate-400">
              © {new Date().getFullYear()} Career Hub AI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
