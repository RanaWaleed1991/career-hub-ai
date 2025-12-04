
import React from 'react';
import { CheckCircleIcon } from './icons';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="p-8 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-slate-800">Welcome to Career Hub AI!</h2>
          <p className="mt-2 text-slate-600">Your 1-week free trial has started. Here's what's included:</p>

          <ul className="mt-4 text-left space-y-2 text-slate-600 bg-slate-50 p-4 rounded-lg">
            <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>2 Free Resume Downloads</strong> (with watermark).</span></li>
            <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>10 AI Improvements</strong> for your summary & experience.</span></li>
            <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>3 AI Resume Tailoring</strong> attempts.</span></li>
            <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>3 Cover Letter</strong> generations.</span></li>
            <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span><strong>3 Free Resume Analyses</strong> to score your resume.</span></li>
            <li className="flex items-start"><span className="text-green-500 font-bold mr-2">✔</span> <span>Full access to all <strong>Courses & Job Listings</strong>.</span></li>
          </ul>

          <p className="mt-4 text-sm text-slate-500">
            Once you use your credits or your trial ends, you'll be presented with our premium options to continue.
          </p>

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
