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
};

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ triggerPremiumFlow, setActionToRetry, setPage, openTailorModal }) => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [template, setTemplate] = useState<TemplateType>('australian');
  const [isAiLoading, setIsAiLoading] = useState<{ field: string; index?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Load resume data on mount
  useEffect(() => {
    const loadResume = async () => {
      try {
        setIsLoading(true);
        const data = await getLatestResume();
        setResumeData(data);
      } catch (err) {
        console.error('Failed to load resume:', err);
        setError('Failed to load resume data');
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, []);

  // Auto-save resume data on change
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const debounceSave = setTimeout(async () => {
      try {
        await saveResume(resumeData);
      } catch (err) {
        console.error('Failed to save resume:', err);
      }
    }, 500); // Debounce to avoid excessive writes

    return () => clearTimeout(debounceSave);
  }, [resumeData, isLoading]);

  const handleEnhance = async (field: 'summary' | 'experience', text: string, index?: number) => {
    try {
      const canUse = await canUseAIImprovement();
      if (!canUse) {
        setActionToRetry(() => () => handleEnhance(field, text, index));
        triggerPremiumFlow();
        return;
      }

      setIsAiLoading({ field, index });
      setError(null);

      await useAIImprovementAttempt();
      const enhancedText = await enhanceTextWithAI(text, field);

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
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
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
      {showLoadModal && <LoadVersionModal onClose={() => setShowLoadModal(false)} onLoad={handleLoadVersion} />}
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
          />
        </div>
      </div>
    </>
  );
};

export default ResumeBuilder;
