import React, { useState, useEffect } from 'react';
import { tailorResumeForJob } from '../services/geminiService';
import { canTailorResume, purchasePlan, useTailorAttempt } from '../services/premiumService';
import PremiumModal from './PremiumModal';
import type { Plan } from '../services/premiumService';
import { ArrowLeftIcon } from './icons';

interface TailorResumeModalProps {
  onClose: () => void;
  initialResumeText?: string;
}

type Step = 'resume' | 'job' | 'result';

const TailorResumeModal: React.FC<TailorResumeModalProps> = ({ onClose, initialResumeText }) => {
  const [step, setStep] = useState<Step>(initialResumeText ? 'job' : 'resume');
  const [resumeText, setResumeText] = useState(initialResumeText || '');
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredContent, setTailoredContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleTailor = async () => {
    const canUse = await canTailorResume();
    if (!canUse) {
      setShowPremiumModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await tailorResumeForJob(resumeText, jobDescription);
      setTailoredContent(result);

      // Backend already tracks usage in /api/gemini/tailor-resume
      // No need to track again here (was causing double-counting)

      setStep('result');
    } catch (err) {
      // Check if this is a limit reached error
      if (err instanceof Error && (err as any).limitReached) {
        setShowPremiumModal(true);
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchasePlan = async (plan: Plan) => {
    await purchasePlan(plan);
    setShowPremiumModal(false);
    // After purchase, retry the action
    setTimeout(() => {
      handleTailor();
    }, 100);
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(tailoredContent);
    alert('Copied to clipboard!');
  };
  
  const handleStartOver = () => {
    setResumeText(initialResumeText || '');
    setJobDescription('');
    setTailoredContent('');
    setError(null);
    setStep(initialResumeText ? 'job' : 'resume');
  };

  const renderStep = () => {
    switch (step) {
      case 'resume':
        return (
          <>
            <h3 className="text-xl font-semibold text-slate-800">Step 1: Paste Your Resume</h3>
            <p className="text-sm text-slate-500 mb-4">Provide the full text of your current resume below.</p>
            <textarea
              className="w-full h-64 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep('job')}
                disabled={!resumeText.trim()}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        );
      case 'job':
        return (
          <>
            <h3 className="text-xl font-semibold text-slate-800">Step {initialResumeText ? '1' : '2'}: Paste the Job Description</h3>
            <p className="text-sm text-slate-500 mb-4">Copy the full job description from the listing and paste it below.</p>
            <textarea
              className="w-full h-64 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="mt-6 flex justify-between items-center">
              {!initialResumeText && (
                <button onClick={() => setStep('resume')} className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600">
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back</span>
                </button>
              )}
              <div className="flex-grow" /> 
              <button
                onClick={handleTailor}
                disabled={!jobDescription.trim() || isLoading}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Tailoring...
                    </>
                ) : 'Tailor My Resume'}
              </button>
            </div>
          </>
        );
      case 'result':
        return (
          <>
            <h3 className="text-xl font-semibold text-slate-800">Your AI-Tailored Resume</h3>

            {/* Clear instruction message */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-amber-800">
                    How to Use This Tailored Content
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Copy the tailored content below and <strong>manually paste it into your resume builder</strong>.
                    Edit each section (Summary, Experience, Skills, etc.) to match the improved text.
                    This gives you full control over the final formatting.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full h-80 p-3 border bg-slate-50 border-slate-300 rounded-md overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                {tailoredContent}
            </div>
             <div className="mt-6 flex justify-between">
                <button
                    onClick={handleStartOver}
                    className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                    Start Over
                </button>
                <button
                    onClick={handleCopyToClipboard}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Copy to Clipboard
                </button>
            </div>
          </>
        );
    }
  };

  return (
    <>
        {showPremiumModal && (
            <PremiumModal 
                onClose={() => setShowPremiumModal(false)}
                onPurchasePlan={handlePurchasePlan}
            />
        )}
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all p-8"
                onClick={(e) => e.stopPropagation()}
            >
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                {renderStep()}
            </div>
        </div>
    </>
  );
};

export default TailorResumeModal;
