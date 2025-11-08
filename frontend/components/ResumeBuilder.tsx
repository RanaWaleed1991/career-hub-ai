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

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ triggerPremiumFlow, setActionToRetry, setPage, openTailorModal }) => {
  const [resumeData, setResumeData] = useState<ResumeData>(() => getLatestResume());
  const [template, setTemplate] = useState<TemplateType>('australian');
  const [isAiLoading, setIsAiLoading] = useState<{ field: string; index?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Auto-save resume data on change
  useEffect(() => {
    const debounceSave = setTimeout(() => {
        saveResume(resumeData);
    }, 500); // Debounce to avoid excessive writes
    return () => clearTimeout(debounceSave);
  }, [resumeData]);


  const handleEnhance = async (field: 'summary' | 'experience', text: string, index?: number) => {
    if (!canUseAIImprovement()) {
      setActionToRetry(() => () => handleEnhance(field, text, index));
      triggerPremiumFlow();
      return;
    }

    setIsAiLoading({ field, index });
    setError(null);
    try {
      useAIImprovementAttempt();
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
