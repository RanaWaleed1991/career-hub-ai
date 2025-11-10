import React, { useState, useEffect } from 'react';
import type { Page, ResumeData, TemplateType } from '../types';
import ClassicTemplate from '../templates/ClassicTemplate';
import ModernTemplate from '../templates/ModernTemplate';
import AustralianTemplate from '../templates/AustralianTemplate';
import CreativeTemplate from '../templates/CreativeTemplate';
import ElegantTemplate from '../templates/ATSTemplate'; // ATSTemplate file is repurposed as ElegantTemplate
import { PrintIcon, ClipboardDocumentCheckIcon, EnvelopeIcon, DocumentTextIcon, DownloadIcon } from './icons';
import { shouldShowWatermark, canDownloadResume, useResumeDownload, canAccessVersionHistory, canSaveVersion, useVersionSave } from '../services/premiumService';
import { saveVersion } from '../services/versionHistoryService';
import { resumeDataToText } from '../utils/resumeUtils';

// Declare the HTMLToDocx global variable provided by the script in index.html
declare const HTMLToDocx: any;


interface ResumePreviewProps {
  resumeData: ResumeData;
  template: TemplateType;
  setTemplate: (template: TemplateType) => void;
  triggerPremiumFlow: () => void;
  setActionToRetry: (action: (() => void) | null) => void;
  setPage: (page: Page) => void;
  openTailorModal: (initialText: string) => void;
  openLoadModal: () => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData, template, setTemplate, triggerPremiumFlow,
  setActionToRetry, setPage, openTailorModal, openLoadModal
}) => {
  const [showWatermark, setShowWatermark] = useState(false);

  useEffect(() => {
    const checkWatermark = async () => {
      const shouldShow = await shouldShowWatermark();
      setShowWatermark(shouldShow);
    };
    checkWatermark();
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
      case 'creative':
        return <CreativeTemplate {...props} />;
      case 'elegant':
        return <ElegantTemplate {...props} />;
      default:
        return <AustralianTemplate {...props} />;
    }
  };

  const handlePrintClick = async () => {
    const canUse = await canDownloadResume();
    if (canUse) {
      await useResumeDownload();
      window.print();
    } else {
      setActionToRetry(() => async () => {
        const canRetry = await canDownloadResume();
        if (canRetry) {
          await useResumeDownload();
          window.print();
        }
      });
      triggerPremiumFlow();
    }
  };

  const handleWordDownload = async () => {
    const canUse = await canDownloadResume();
    if (!canUse) {
      setActionToRetry(() => handleWordDownload);
      triggerPremiumFlow();
      return;
    }

    await useResumeDownload();
    
    const element = document.getElementById('resume-preview-content');
    if (element) {
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Resume</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 10pt; }
            h1, h2, h3 { color: #333; }
            ul { list-style-type: disc; margin-left: 20px; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
        </html>
      `;
      
      try {
        // Check if HTMLToDocx is available
        if (typeof HTMLToDocx === 'undefined') {
          throw new Error('HTML to DOCX library not loaded');
        }

        const fileBuffer = await HTMLToDocx(content, null, {
          table: { row: { cantSplit: true } },
          footer: true,
          pageNumber: true,
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(fileBuffer);
        link.download = `${resumeData.personalDetails.fullName || 'Resume'}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

      } catch (error) {
        console.error("Error generating DOCX file:", error);
        alert("Sorry, there was an error creating the Word document. Please try the PDF download instead.");
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
                    <button onClick={() => setTemplate('creative')} className={`${templateButtonClass} ${template === 'creative' ? activeClass : inactiveClass}`}>Creative</button>
                    <button onClick={() => setTemplate('elegant')} className={`${templateButtonClass} rounded-r-md ${template === 'elegant' ? activeClass : inactiveClass}`}>Elegant</button>
                </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={handleWordDownload} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                  <DocumentTextIcon className="w-4 h-4"/>
                  <span>Word</span>
              </button>
              <button onClick={handlePrintClick} className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm">
                  <PrintIcon className="w-4 h-4"/>
                  <span>PDF</span>
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

      <div id="resume-preview-content" className="flex-grow overflow-y-auto bg-white shadow-2xl rounded-lg">
        {getTemplateComponent()}
      </div>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #resume-preview-content, #resume-preview-content * {
              visibility: visible;
            }
            #resume-preview-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: auto;
              margin: 0;
              padding: 0;
              border: none;
              box-shadow: none;
              transform: scale(1);
            }
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        `}
      </style>
    </div>
  );
};

export default ResumePreview;