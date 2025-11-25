import React, { useState, useEffect } from 'react';
import { generateCoverLetter } from '../services/geminiService';
import { 
    canGenerateCoverLetter, 
    useCoverLetterAttempt,
} from '../services/premiumService';
import { DownloadIcon, SparklesIcon } from './icons';

interface CoverLetterBuilderProps {
  triggerPremiumFlow: () => void;
  setActionToRetry: (action: (() => void) | null) => void;
}

const CoverLetterBuilder: React.FC<CoverLetterBuilderProps> = ({ triggerPremiumFlow, setActionToRetry }) => {
    const [resumeText, setResumeText] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check sessionStorage for pre-filled resume text
        const prefilledText = sessionStorage.getItem('cover_letter_resume_text');
        if (prefilledText) {
            setResumeText(prefilledText);
            sessionStorage.removeItem('cover_letter_resume_text'); // Clean up
        }
    }, []);

    const handleGenerate = async () => {
        if (!canGenerateCoverLetter()) {
            setActionToRetry(() => handleGenerate);
            triggerPremiumFlow();
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await generateCoverLetter(resumeText, jobTitle, company, jobDescription);
            setGeneratedLetter(result);

            // Only track usage after successful generation
            await useCoverLetterAttempt();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        // Show confirmation dialog before download
        // Note: Credit was already consumed on generation, this just confirms download action
        const confirmed = window.confirm('You will see a print preview next where you can download as PDF.\n\nReady to proceed?');
        if (confirmed) {
            window.print();
        }
    };

    const inputClass = "block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition";
    const labelClass = "block text-sm font-medium text-slate-700 mb-1";
    const textareaClass = `${inputClass} min-h-[150px]`;

    return (
        <div className="h-full bg-slate-50 flex flex-col print:bg-white">
            <div className="p-8 flex-grow overflow-y-auto">
                <div className="text-center print:hidden">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">AI Cover Letter Builder</h2>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                        Provide your details and let Gemini craft the perfect cover letter for you.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <div className="space-y-6 print:hidden opacity-0 slide-in-up" style={{ animationDelay: '100ms' }}>
                        <div>
                            <label htmlFor="resumeText" className={labelClass}>Your Resume Text</label>
                            <textarea id="resumeText" value={resumeText} onChange={e => setResumeText(e.target.value)} className={textareaClass} placeholder="Paste your full resume text here..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="jobTitle" className={labelClass}>Job Title</label>
                                <input id="jobTitle" type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className={inputClass} placeholder="e.g., Senior Product Manager" />
                            </div>
                            <div>
                                <label htmlFor="company" className={labelClass}>Company Name</label>
                                <input id="company" type="text" value={company} onChange={e => setCompany(e.target.value)} className={inputClass} placeholder="e.g., Acme Corporation" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="jobDescription" className={labelClass}>Job Description</label>
                            <textarea id="jobDescription" value={jobDescription} onChange={e => setJobDescription(e.target.value)} className={textareaClass} placeholder="Paste the job description here..." />
                        </div>
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading || !resumeText || !jobTitle || !company || !jobDescription}
                            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <SparklesIcon className="w-5 h-5 mr-2"/>
                            )}
                            <span>{isLoading ? 'Generating...' : 'Generate Cover Letter'}</span>
                        </button>
                    </div>

                    {/* Output */}
                    <div className="space-y-4 opacity-0 slide-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex justify-between items-center print:hidden">
                            <h3 className="text-xl font-semibold text-slate-800">Generated Letter</h3>
                            <button
                                onClick={handleDownload}
                                disabled={!generatedLetter}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                <span>Download PDF</span>
                            </button>
                        </div>
                        {generatedLetter && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 print:hidden">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            <strong>Tip:</strong> Add your contact details (name, email, phone, address) at the top of the letter before downloading.
                                            You can edit the text directly in the box below.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                         <div id="cover-letter-content" className="bg-white p-8 border border-slate-300 rounded-md shadow-lg print:border-none print:shadow-none print:p-0">
                            {generatedLetter ? (
                                <>
                                    {/* Editable textarea for screen */}
                                    <textarea
                                        value={generatedLetter}
                                        onChange={e => setGeneratedLetter(e.target.value)}
                                        className="w-full min-h-[500px] p-4 border border-slate-200 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 print:hidden font-serif leading-relaxed"
                                    />

                                    {/* Formatted text for print - preserves line breaks and formatting */}
                                    <div className="hidden print:block text-sm leading-relaxed whitespace-pre-wrap font-serif">
                                        {generatedLetter}
                                    </div>
                                </>
                            ) : (
                                <div className="min-h-[500px] flex items-center justify-center text-slate-400">
                                    Your generated cover letter will appear here...
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    /* Remove ALL layout constraints to let browser paginate naturally */
                    html, body {
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    /* Remove height/overflow constraints from ALL parent containers */
                    body *, body > *, body > * > *, body > * > * > * {
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    /* Hide everything except cover letter content */
                    body * {
                        visibility: hidden;
                    }
                    #cover-letter-content, #cover-letter-content * {
                        visibility: visible;
                    }

                    /* Cover letter content has natural height - let it flow across pages */
                    #cover-letter-content {
                        position: static !important;
                        width: 100%;
                        height: auto !important; /* Override parent height: 0 */
                        padding: 20mm !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: white;
                    }

                    /* Proper text rendering for print */
                    #cover-letter-content .whitespace-pre-wrap {
                        font-size: 11pt;
                        line-height: 1.6;
                        color: black;
                    }

                    /* Page break control - allow natural breaks */
                    p {
                        page-break-inside: auto;
                        break-inside: auto;
                        orphans: 2;
                        widows: 2;
                    }
                }
                @page {
                    size: A4;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default CoverLetterBuilder;
