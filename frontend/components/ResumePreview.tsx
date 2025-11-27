import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import type { Page, ResumeData, TemplateType } from '../types';
import ClassicTemplate from '../templates/ClassicTemplate';
import ModernTemplate from '../templates/ModernTemplate';
import AustralianTemplate from '../templates/AustralianTemplate';
import PictureTemplate from '../templates/PictureTemplate';
import ATSTemplate from '../templates/ATSTemplate';
import MinimalTemplate from '../templates/MinimalTemplate';
import { PrintIcon, ClipboardDocumentCheckIcon, EnvelopeIcon, DocumentTextIcon, DownloadIcon } from './icons';
import { shouldShowWatermark, canDownloadResume, useResumeDownload, canAccessVersionHistory, canSaveVersion, useVersionSave, hasPremium } from '../services/premiumService';
import { saveVersion } from '../services/versionHistoryService';
import { resumeDataToText } from '../utils/resumeUtils';

interface ResumePreviewProps {
  resumeData: ResumeData;
  template: TemplateType;
  setTemplate: (template: TemplateType) => void;
  triggerPremiumFlow: () => void;
  setActionToRetry: (action: (() => void) | null) => void;
  setPage: (page: Page) => void;
  openTailorModal: (initialText: string) => void;
  openLoadModal: () => void;
  isGuestMode?: boolean; // If true, show signup prompt on download
  onSignupPrompt?: () => void; // Callback to show signup modal
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData, template, setTemplate, triggerPremiumFlow,
  setActionToRetry, setPage, openTailorModal, openLoadModal,
  isGuestMode = false, onSignupPrompt
}) => {
  const [showWatermark, setShowWatermark] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      const isPremium = await hasPremium();
      setShowWatermark(!isPremium); // Show watermark only for non-premium users
    };
    checkPremiumStatus();
  }, []);

  const getTemplateComponent = () => {
    const props = { data: resumeData, showWatermark };
    switch (template) {
      case 'classic':
        return <ClassicTemplate {...props} />;
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'australian':
        return <AustralianTemplate {...props} />;
      case 'picture':
        return <PictureTemplate {...props} />;
      case 'ats':
        return <ATSTemplate {...props} />;
      case 'minimal':
        return <MinimalTemplate {...props} />;
      default:
        return <AustralianTemplate {...props} />;
    }
  };

  const generatePDF = async () => {
    const element = document.getElementById('resume-preview-content');
    if (!element) {
      alert('Resume content not found. Please try again.');
      return;
    }

    try {
      // Show loading state
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';

      // Clone the element
      const clone = element.cloneNode(true) as HTMLElement;

      // Remove all container styling (borders, shadows, backgrounds, rounded corners)
      clone.style.border = 'none';
      clone.style.boxShadow = 'none';
      clone.style.borderRadius = '0';
      clone.style.background = 'white';
      clone.style.padding = '0';

      // Let content flow naturally without forcing height
      clone.style.height = 'auto';
      clone.style.minHeight = 'auto';
      clone.style.maxHeight = 'none';
      clone.style.overflow = 'visible';

      // Create a temporary container that's visible but below viewport
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '0';
      container.style.top = '100vh'; // Below viewport
      container.style.width = '210mm'; // A4 width
      container.style.zIndex = '-9999';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.appendChild(clone);
      document.body.appendChild(container);

      // Wait for browser to render and calculate layout
      await new Promise(resolve => setTimeout(resolve, 300));

      // Calculate actual content height after render
      const contentHeight = clone.scrollHeight;

      const opt = {
        margin: 15,
        filename: `${resumeData.personalDetails.fullName || 'resume'}_resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          logging: false,
          letterRendering: true,
          windowHeight: contentHeight, // Use actual content height
          scrollY: 0,
          scrollX: 0,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(clone).save();

      // Restore cursor
      document.body.style.cursor = originalCursor;

      // Clean up
      document.body.removeChild(container);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
      document.body.style.cursor = 'default';
    }
  };

  const handlePrintClick = async () => {
    // Guest mode - prompt signup before download
    if (isGuestMode) {
      if (onSignupPrompt) {
        onSignupPrompt();
      }
      return;
    }

    const canUse = await canDownloadResume();
    if (!canUse) {
      setActionToRetry(() => handlePrintClick);
      triggerPremiumFlow();
      return;
    }

    // Check if user has premium - skip confirmation for premium users
    const isPremium = await hasPremium();

    if (isPremium) {
      // Premium users: direct download without confirmation
      await generatePDF();
    } else {
      // Free users: confirm before using credit
      const confirmed = window.confirm('This will download your resume as a PDF and use 1 download credit. Continue?');
      if (confirmed) {
        await useResumeDownload();
        await generatePDF();
      }
    }
  };


  const handleSaveVersion = async () => {
    const canSave = await canSaveVersion();
    if (!canSave) {
        alert('You have reached the limit of 3 free resume versions. Upgrade to save unlimited versions.');
        setActionToRetry(() => handleSaveVersion);
        triggerPremiumFlow();
        return;
    }
    const name = prompt("Enter a name for this resume version:", `Version ${new Date().toLocaleString()}`);
    if (name) {
        try {
            await saveVersion(name, resumeData);
            await useVersionSave(); // Track usage
            alert(`Version "${name}" saved!`);
        } catch (err) {
            console.error('Failed to save version:', err);
            alert('Failed to save version. Please try again.');
        }
    }
  };

  const handleLoadVersion = async () => {
    const canAccess = await canAccessVersionHistory();
    if (!canAccess) {
        setActionToRetry(() => handleLoadVersion);
        triggerPremiumFlow();
        return;
    }
    openLoadModal();
  };

  const handleTailor = () => {
    const text = resumeDataToText(resumeData);
    openTailorModal(text);
  };
  
  const handleGenerateCoverLetter = () => {
    const text = resumeDataToText(resumeData);
    sessionStorage.setItem('cover_letter_resume_text', text);
    setPage('coverLetter');
  };

  const templateButtonClass = "px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors";
  const activeClass = "bg-indigo-600 text-white";
  const inactiveClass = "bg-white text-slate-700 hover:bg-slate-100";

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-100 to-slate-200 h-full flex flex-col">
      <div className="mb-4 p-2 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm flex flex-col gap-3 print:hidden">
        {/* Top row for templates */}
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-700">Template:</span>
                <div className="flex rounded-md shadow-sm border border-slate-200">
                    <button onClick={() => setTemplate('classic')} className={`${templateButtonClass} rounded-l-md ${template === 'classic' ? activeClass : inactiveClass}`}>Classic</button>
                    <button onClick={() => setTemplate('modern')} className={`${templateButtonClass} ${template === 'modern' ? activeClass : inactiveClass}`}>Modern</button>
                    <button onClick={() => setTemplate('australian')} className={`${templateButtonClass} ${template === 'australian' ? activeClass : inactiveClass}`}>Australian</button>
                    <button onClick={() => setTemplate('picture')} className={`${templateButtonClass} ${template === 'picture' ? activeClass : inactiveClass}`}>Picture</button>
                    <button onClick={() => setTemplate('ats')} className={`${templateButtonClass} ${template === 'ats' ? activeClass : inactiveClass}`}>ATS</button>
                    <button onClick={() => setTemplate('minimal')} className={`${templateButtonClass} rounded-r-md ${template === 'minimal' ? activeClass : inactiveClass}`}>Minimal</button>
                </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => window.print()} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                  <PrintIcon className="w-4 h-4"/>
                  <span>Preview</span>
              </button>
              <button onClick={handlePrintClick} className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm">
                  <DownloadIcon className="w-4 h-4"/>
                  <span>Download PDF</span>
              </button>
            </div>
        </div>
        {/* Bottom row for actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-2">
           <button onClick={handleSaveVersion} className="flex-1 text-sm flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-slate-700 rounded-md hover:bg-slate-100 border border-slate-300">
              <DownloadIcon className="w-4 h-4"/> Save Version
           </button>
           <button onClick={handleLoadVersion} className="flex-1 text-sm flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-slate-700 rounded-md hover:bg-slate-100 border border-slate-300">
             <DocumentTextIcon className="w-4 h-4"/> Load Version
           </button>
            <button onClick={handleTailor} className="flex-1 text-sm flex items-center justify-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600">
               <ClipboardDocumentCheckIcon className="w-4 h-4"/> Tailor
           </button>
            <button onClick={handleGenerateCoverLetter} className="flex-1 text-sm flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600">
                <EnvelopeIcon className="w-4 h-4"/> Cover Letter
           </button>
        </div>
      </div>

      <div id="resume-preview-content" className="flex-grow overflow-y-auto print:overflow-visible bg-white shadow-2xl rounded-lg">
        {getTemplateComponent()}
      </div>

      <style>
        {`
          @media print {
            /* Hide everything except resume content - visibility approach works best with complex layouts */
            body * {
              visibility: hidden;
            }
            #resume-preview-content, #resume-preview-content * {
              visibility: visible;
            }

            /* Position resume and enable multi-page flow */
            #resume-preview-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: auto !important;
              max-height: none !important;
              min-height: auto !important;
              overflow: visible !important;
              margin: 0;
              padding: 0;
              border: none;
              box-shadow: none;
              border-radius: 0;
            }

            /* Preserve background colors in print */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            /* Smart page break handling */
            h1, h2, h3, h4 {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }

            /* Keep sections together when possible, but allow breaks if needed */
            section, .mb-6, .mb-4 {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            /* Orphan/widow control for better pagination */
            p, ul, ol {
              orphans: 2;
              widows: 2;
            }
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        `}
      </style>
    </div>
  );
};

export default ResumePreview;