import React, { useEffect } from 'react';
import type { Page } from '../types';

interface PaymentSuccessProps {
  setPage: (page: Page) => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ setPage }) => {
  useEffect(() => {
    // Optional: You could fetch updated subscription status here
    console.log('Payment successful!');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-2">
          Welcome to Career Hub AI Premium!
        </p>

        <p className="text-gray-500 text-sm mb-8">
          Your subscription is now active. You have access to all premium features.
        </p>

        {/* Features List */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">What's unlocked:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Unlimited resume downloads</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Unlimited AI improvements</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Unlimited cover letters</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Enhanced resume analyses</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Clean downloads (no watermark)</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setPage('dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => setPage('builder')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Building Resume
          </button>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-xs text-gray-500">
          Need help? Contact us at{' '}
          <a href="mailto:support@careerhub.ai" className="text-blue-600 hover:underline">
            support@careerhub.ai
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
