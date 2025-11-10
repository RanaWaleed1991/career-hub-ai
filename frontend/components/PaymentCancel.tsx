import React from 'react';
import type { Page } from '../types';

interface PaymentCancelProps {
  setPage: (page: Page) => void;
}

const PaymentCancel: React.FC<PaymentCancelProps> = ({ setPage }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Cancel Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Canceled
        </h1>

        <p className="text-gray-600 mb-2">
          Your payment was not completed.
        </p>

        <p className="text-gray-500 text-sm mb-8">
          No charges were made to your account. You can try again anytime.
        </p>

        {/* What You're Missing */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">
            What you're missing with Premium:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>Unlimited resume downloads</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>Unlimited AI improvements</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>Unlimited cover letters</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>Clean downloads (no watermark)</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>Priority job alerts</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setPage('pricing')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again - View Plans
          </button>

          <button
            onClick={() => setPage('dashboard')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Return to Dashboard
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Have questions about our plans?</strong>
          </p>
          <p className="text-xs text-gray-600">
            Contact us at{' '}
            <a href="mailto:support@careerhub.ai" className="text-blue-600 hover:underline">
              support@careerhub.ai
            </a>
          </p>
        </div>

        {/* Free Tier Reminder */}
        <p className="mt-4 text-xs text-gray-500">
          Don't worry - you can still use Career Hub AI with the free tier!
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
