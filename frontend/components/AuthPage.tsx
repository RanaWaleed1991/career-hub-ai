import React, { useState } from 'react';
import { GoogleIcon, FacebookIcon } from './icons';

interface AuthPageProps {
  onLogin: (email: string, password?: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginView && password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (email) {
      onLogin(email, password);
    }
  };

  const handleToggleView = () => {
    setIsLoginView(!isLoginView);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }
  
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
  const labelClass = "block text-sm font-medium text-slate-700";
  const buttonClass = "w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
  const socialButtonClass = "w-full inline-flex items-center justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 fade-in">
        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-slate-800">Career Hub AI</h1>
            <p className="text-slate-500 text-sm mt-2">
                {isLoginView ? 'Welcome back! Sign in to continue.' : 'Create an account to get started.'}
            </p>
          </div>

          <div className="space-y-4">
            <button onClick={() => onLogin('google.user@test.com')} className={socialButtonClass}>
              <GoogleIcon className="w-5 h-5 mr-3" />
              Continue with Google
            </button>
            <button onClick={() => onLogin('facebook.user@test.com')} className={socialButtonClass}>
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
                  <input id="email-login" type="email" autoComplete="email" required className={inputClass} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="password-login" className={labelClass}>Password</label>
                  <input id="password-login" type="password" autoComplete="current-password" required className={inputClass} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </>
            ) : (
              // Sign Up Form
              <>
                <div>
                  <label htmlFor="email-signup" className={labelClass}>Email Address</label>
                  <input id="email-signup" type="email" required className={inputClass} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="password-signup" className={labelClass}>Password</label>
                  <input id="password-signup" type="password" required className={inputClass} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="confirm-password-signup" className={labelClass}>Confirm Password</label>
                  <input id="confirm-password-signup" type="password" required className={inputClass} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <button type="submit" className={buttonClass}>
                {isLoginView ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={handleToggleView}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isLoginView ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;