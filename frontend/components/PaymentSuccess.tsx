import React, { useEffect, useState } from 'react';
import type { Page } from '../types';
import { getSubscription } from '../services/premiumService';

interface PaymentSuccessProps {
  setPage: (page: Page) => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ setPage }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationFailed, setVerificationFailed] = useState(false);

  useEffect(() => {
    // Poll subscription status until webhook has processed
    const verifySubscription = async () => {
      const maxAttempts = 20; // 20 seconds max
      let attempts = 0;

      const checkSubscription = async (): Promise<boolean> => {
        try {
          const sub = await getSubscription();
          console.log('[PaymentSuccess] Checking subscription:', sub);

          // Check if subscription is now premium (weekly or monthly)
          if (sub && (sub.plan === 'weekly' || sub.plan === 'monthly')) {
            console.log('[PaymentSuccess] ✅ Premium subscription verified!');
            return true;
          }

          return false;
        } catch (error) {
          console.error('[PaymentSuccess] Error checking subscription:', error);
          return false;
        }
      };

      // Poll every second until subscription is updated or max attempts reached
      const pollInterval = setInterval(async () => {
        attempts++;
        console.log(`[PaymentSuccess] Polling attempt ${attempts}/${maxAttempts}`);

        const isUpdated = await checkSubscription();

        if (isUpdated) {
          clearInterval(pollInterval);
          setIsVerifying(false);
          console.log('[PaymentSuccess] Subscription verified, showing success message');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setIsVerifying(false);
          setVerificationFailed(true);
          console.warn('[PaymentSuccess] Subscription verification timed out');
        }
      }, 1000); // Check every second

      // Cleanup on unmount
      return () => clearInterval(pollInterval);
    };

    verifySubscription();
  }, []);

  const handleGoToDashboard = () => {
    // Force a full page reload to ensure fresh subscription data
    window.location.href = '/';
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Processing Your Subscription...
          </h1>
          <p className="text-gray-600">
            Please wait while we activate your premium account.
          </p>
        </div>
      </div>
    );
  }

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

        <p className="text-gray-500 text-sm mb-2">
          Your subscription is now active. You have access to all premium features.
        </p>

        {verificationFailed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ Subscription is being processed. If you don't see premium features immediately, please refresh the page in a few moments.
            </p>
          </div>
        )}

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
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to Dashboard
          </button>

          <button
            onClick={handleGoToDashboard}
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
