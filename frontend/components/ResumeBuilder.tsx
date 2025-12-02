import React, { useState, useEffect } from 'react';
import type { Page, ResumeData, TemplateType } from '../types';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import { enhanceTextWithAI } from '../services/geminiService';
import {
  canUseAIImprovement,
  useAIImprovementAttempt,
} from '../services/premiumService';
import { getLatestResume, saveResume } from '../services/resumeService';
import LoadVersionModal from './LoadVersionModal';

interface ResumeBuilderProps {
  triggerPremiumFlow: () => void;
  setActionToRetry: (action: (() => void) | null) => void;
  setPage: (page: Page) => void;
  openTailorModal: (initialText: string) => void;
  isGuestMode?: boolean; // If true, user is not authenticated - use localStorage
}

const initialResumeData: ResumeData = {
  personalDetails: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    website: '',
    photo: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  skillsLabel: 'Skills',
  certifications: [],
  references: [],
  customSections: [],
};

// Guest mode localStorage keys
const GUEST_RESUME_KEY = 'career_hub_guest_resume';
const GUEST_TEMPLATE_KEY = 'career_hub_guest_template';

// Guest mode localStorage helpers
const loadGuestResume = (): ResumeData => {
  const saved = localStorage.getItem(GUEST_RESUME_KEY);
  return saved ? JSON.parse(saved) : initialResumeData;
};

const saveGuestResume = (data: ResumeData) => {
  localStorage.setItem(GUEST_RESUME_KEY, JSON.stringify(data));
};

const loadGuestTemplate = (): TemplateType => {
  const saved = localStorage.getItem(GUEST_TEMPLATE_KEY);
  return (saved as TemplateType) || 'australian';
};

const saveGuestTemplate = (template: TemplateType) => {
  localStorage.setItem(GUEST_TEMPLATE_KEY, template);
};

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ triggerPremiumFlow, setActionToRetry, setPage, openTailorModal, isGuestMode = false }) => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [template, setTemplate] = useState<TemplateType>('australian');
  const [isAiLoading, setIsAiLoading] = useState<{ field: string; index?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  // Load resume data on mount
  useEffect(() => {
    const loadResume = async () => {
      try {
        setIsLoading(true);
        if (isGuestMode) {
          // Guest mode - load from localStorage
          const guestData = loadGuestResume();
          const guestTemplate = loadGuestTemplate();
          setResumeData(guestData);
          setTemplate(guestTemplate);
        } else {
          // Authenticated - load from database
          const data = await getLatestResume();
          setResumeData(data);
        }
      } catch (err) {
        console.error('Failed to load resume:', err);
        setError('Failed to load resume data');
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [isGuestMode]);

  // Auto-save resume data on change
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const debounceSave = setTimeout(async () => {
      try {
        if (isGuestMode) {
          // Guest mode - save to localStorage
          saveGuestResume(resumeData);
        } else {
          // Authenticated - save to database
          await saveResume(resumeData);
        }
      } catch (err) {
        console.error('Failed to save resume:', err);
      }
    }, 500); // Debounce to avoid excessive writes

    return () => clearTimeout(debounceSave);
  }, [resumeData, isLoading, isGuestMode]);

  // Auto-save template selection
  useEffect(() => {
    if (isGuestMode) {
      saveGuestTemplate(template);
    }
  }, [template, isGuestMode]);

  const handleEnhance = async (field: 'summary' | 'experience', text: string, index?: number) => {
    try {
      // Guest mode - prompt signup before AI usage
      if (isGuestMode) {
        setShowSignupPrompt(true);
        return;
      }

      const canUse = await canUseAIImprovement();
      if (!canUse) {
        setActionToRetry(() => () => handleEnhance(field, text, index));
        triggerPremiumFlow();
        return;
      }

      setIsAiLoading({ field, index });
      setError(null);

      const enhancedText = await enhanceTextWithAI(text, field);

      // Only track usage after successful enhancement
      await useAIImprovementAttempt();

      setResumeData(prev => {
        if (field === 'summary') {
          return { ...prev, summary: enhancedText };
        }
        if (field === 'experience' && index !== undefined) {
          const newExperience = [...prev.experience];
          newExperience[index].description = enhancedText;
          return { ...prev, experience: newExperience };
        }
        return prev;
      });
    } catch (err) {
      // Check if this is a limit reached error
      if (err instanceof Error && (err as any).limitReached) {
        setActionToRetry(() => () => handleEnhance(field, text, index));
        triggerPremiumFlow();
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
    } finally {
      setIsAiLoading(null);
    }
  };

  const handleLoadVersion = (data: ResumeData) => {
    setResumeData(data);
    setShowLoadModal(false);
  };

  // Show loading spinner while fetching resume
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 md:w-auto max-w-lg bg-red-100 border-l-4 border-red-500 text-red-700 p-4 z-50 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Signup Prompt Modal for Guest Mode */}
      {showSignupPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Sign Up to Continue
            </h2>
            <p className="text-slate-600 mb-6">
              Create a free account to use AI features, download your resume, and access all Career Hub AI tools.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Save current work to localStorage before redirecting
                  saveGuestResume(resumeData);
                  saveGuestTemplate(template);
                  // Navigate to dashboard which will trigger auth page for non-authenticated users
                  setPage('dashboard');
                }}
                className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start Free Trial - Sign Up
              </button>
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="w-full py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Your work is automatically saved in your browser
            </p>
          </div>
        </div>
      )}

      {showLoadModal && <LoadVersionModal onClose={() => setShowLoadModal(false)} onLoad={handleLoadVersion} />}

      {/* Guest Mode Header */}
      {isGuestMode && (
        <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Career Hub AI</h1>
            <span className="text-xs bg-indigo-700 px-2 py-1 rounded">Guest Mode</span>
          </div>
          <button
            onClick={() => setShowSignupPrompt(true)}
            className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-sm"
          >
            Sign Up / Login
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 h-full overflow-hidden">
        <div className="overflow-y-auto">
          <ResumeForm
            resumeData={resumeData}
            setResumeData={setResumeData}
            onEnhance={handleEnhance}
            isAiLoading={isAiLoading}
          />
        </div>
        <div className="overflow-y-auto">
          <ResumePreview
            resumeData={resumeData}
            template={template}
            setTemplate={setTemplate}
            triggerPremiumFlow={triggerPremiumFlow}
            setActionToRetry={setActionToRetry}
            setPage={setPage}
            openTailorModal={openTailorModal}
            openLoadModal={() => setShowLoadModal(true)}
            isGuestMode={isGuestMode}
            onSignupPrompt={() => setShowSignupPrompt(true)}
          />
        </div>
      </div>
    </>
  );
};

export default ResumeBuilder;
