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
        // The credit is consumed on generation, not download.
        window.print();
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
                         <div id="cover-letter-content" className="bg-white p-6 border border-slate-300 rounded-md shadow-lg">
                            <textarea 
                                value={generatedLetter} 
                                onChange={e => setGeneratedLetter(e.target.value)}
                                className="w-full h-full min-h-[500px] p-2 border border-slate-200 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-none print:shadow-none print:p-0 print:font-serif print:leading-relaxed"
                                placeholder="Your generated cover letter will appear here..."
                            />
                         </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #cover-letter-content, #cover-letter-content * {
                        visibility: visible;
                    }
                    #cover-letter-content textarea {
                       resize: none;
                       border: none !important;
                       box-shadow: none !important;
                       padding: 0 !important;
                       overflow: visible;
                       height: auto;
                    }
                    #cover-letter-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        margin: 0;
                        padding: 0;
                        border: none;
                        box--shadow: none;
                    }
                }
                @page {
                    size: A4;
                    margin: 20mm;
                }
            `}</style>
        </div>
    );
};

export default CoverLetterBuilder;
