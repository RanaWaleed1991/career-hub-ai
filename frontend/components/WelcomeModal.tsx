
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, SparklesIcon } from './icons';
import { hasPremium } from '../services/premiumService';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    hasPremium().then(setIsPremium).catch(() => setIsPremium(false));
  }, []);

  // Don't render until we know the subscription status
  if (isPremium === null) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="p-8 text-center">
          {isPremium ? (
            <>
              <SparklesIcon className="h-12 w-12 text-indigo-500 mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-slate-800">Welcome to Career Hub AI!</h2>
              <p className="mt-2 text-slate-600">
                Your Premium subscription is active. You have full access to all tools and features.
              </p>

              <ul className="mt-4 text-left space-y-2 text-slate-600 bg-indigo-50 p-4 rounded-lg">
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">✔</span> <span><strong>Unlimited</strong> resume downloads (no watermark)</span></li>
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">✔</span> <span><strong>Unlimited</strong> AI content enhancements &amp; resume tailoring</span></li>
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">✔</span> <span><strong>Unlimited</strong> cover letters &amp; selection criteria</span></li>
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">✔</span> <span><strong>Unlimited</strong> resume analyses &amp; skill gap audits</span></li>
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">✔</span> <span><strong>Unlimited</strong> resume version saves</span></li>
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">✔</span> <span>Full access to all <strong>courses, jobs &amp; career tools</strong></span></li>
              </ul>

              <p className="mt-4 text-sm text-slate-500">
                Thank you for subscribing. Head to your Command Centre to get started.
              </p>
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-slate-800">Welcome to Career Hub AI!</h2>
              <p className="mt-2 text-slate-600">Here's what you get for free:</p>

              <ul className="mt-4 text-left space-y-2 text-slate-600 bg-slate-50 p-4 rounded-lg">
                <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>3 Resume Downloads</strong> (with watermark)</span></li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>10 AI Enhancements</strong> for your summary &amp; experience</span></li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>3 Resume Tailoring</strong> sessions to match job descriptions</span></li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>3 Cover Letters</strong> &amp; selection criteria generations</span></li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>3 Resume Analyses</strong> &amp; skill gap audits</span></li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>3 Resume Version</strong> saves</span></li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span>Full access to all <strong>courses, jobs &amp; career tools</strong></span></li>
              </ul>

              <p className="mt-4 text-sm text-slate-500">
                Need more? Upgrade anytime for unlimited access.
              </p>
            </>
          )}

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-8 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
