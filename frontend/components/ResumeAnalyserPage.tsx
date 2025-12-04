import React, { useState, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import { canAnalyzeResume, useResumeAnalysisAttempt } from '../services/premiumService';
import { analyzeResume } from '../services/geminiService';
import { pdfService } from '../services/pdfService';
import type { ResumeAnalysisResult } from '../types';
import { UploadCloudIcon, CheckCircleIcon, XCircleIcon, DocumentChartBarIcon, LightBulbIcon, UserCircleIcon, PrintIcon } from './icons';
import { downloadOrSharePDF, isMobileDevice, getPDFSuccessMessage } from '../utils/pdfDownload';

interface ResumeAnalyserPageProps {
  triggerPremiumFlow: () => void;
  setActionToRetry: (action: (() => void) | null) => void;
}

type View = 'upload' | 'loading' | 'result';

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;
    const color = score > 80 ? 'text-emerald-500' : score > 60 ? 'text-amber-500' : 'text-rose-500';

    return (
        <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-slate-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="52" cx="60" cy="60" />
                <circle
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-slate-800">
                {score}<span className="text-lg text-slate-500">/100</span>
            </div>
        </div>
    );
};

const FeedbackCard: React.FC<{ item: ResumeAnalysisResult['sectionFeedback'][0] }> = ({ item }) => {
    const ratingColor = {
        'Excellent': 'text-emerald-500 bg-emerald-50',
        'Good': 'text-sky-500 bg-sky-50',
        'Fair': 'text-amber-500 bg-amber-50',
        'Poor': 'text-rose-500 bg-rose-50',
    }[item.rating] || 'text-slate-500 bg-slate-50';

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-slate-700">{item.sectionName}</h4>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ratingColor}`}>{item.rating}</span>
            </div>
            <ul className="space-y-2">
                {item.feedbackPoints.map((point, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-600">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const ResumeAnalyserPage: React.FC<ResumeAnalyserPageProps> = ({ triggerPremiumFlow, setActionToRetry }) => {
    const [view, setView] = useState<View>('upload');
    const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const handleFile = useCallback(async (file: File) => {
        if (!file || file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }

        if (!canAnalyzeResume()) {
            setActionToRetry(() => () => handleFile(file));
            triggerPremiumFlow();
            return;
        }
        
        setView('loading');
        setError(null);
        setFileName(file.name);

        try {
            // Use pdfService to extract text from PDF
            const textContent = await pdfService.extractTextFromPDF(file);

            if (!textContent.trim()) {
                throw new Error("Could not extract text from the PDF. It may be an image-based PDF.");
            }

            const result = await analyzeResume(textContent);

            // Backend already tracks usage in /api/gemini/analyze-resume
            // No need to track again here (was causing double-counting)

            setAnalysisResult(result);
            setView('result');

        } catch (err) {
            // Check if this is a limit reached error
            if (err instanceof Error && (err as any).limitReached) {
                setActionToRetry(() => () => handleFile(file));
                triggerPremiumFlow();
            } else {
                setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
            }
            setView('upload');
        }
    }, [setActionToRetry, triggerPremiumFlow]);
    
    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };
    
    const handleStartOver = () => {
        setView('upload');
        setAnalysisResult(null);
        setError(null);
        setFileName('');
    };

    const generatePDF = async () => {
        const element = document.getElementById('analysis-report');
        if (!element || !analysisResult) {
            alert('Report content not found. Please try again.');
            return;
        }

        try {
            // Show loading modal
            setIsGeneratingPDF(true);

            // Show loading cursor
            const originalCursor = document.body.style.cursor;
            document.body.style.cursor = 'wait';

            // Clone the element
            const clone = element.cloneNode(true) as HTMLElement;

            // Remove print:hidden elements (buttons)
            const printHiddenElements = clone.querySelectorAll('.print\\:hidden');
            printHiddenElements.forEach(el => el.remove());

            // Remove all container styling
            clone.style.border = 'none';
            clone.style.boxShadow = 'none';
            clone.style.borderRadius = '0';
            clone.style.background = 'white';
            clone.style.padding = '20px';

            // Let content flow naturally
            clone.style.height = 'auto';
            clone.style.minHeight = 'auto';
            clone.style.maxHeight = 'none';
            clone.style.overflow = 'visible';

            // Create temporary container
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

            // Wait for browser to render
            await new Promise(resolve => setTimeout(resolve, 300));

            // Calculate content height
            const contentHeight = clone.scrollHeight;

            const filename = `resume_analysis_report_${Date.now()}.pdf`;

            const opt = {
                margin: 15,
                filename, // Still needed for some html2pdf internal logic
                image: { type: 'png', quality: 1 },
                html2canvas: {
                    scale: 4, // High quality
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    windowHeight: contentHeight,
                    scrollY: 0,
                    scrollX: 0,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // Generate PDF as blob instead of auto-saving
            const pdfBlob = await html2pdf().set(opt).from(clone).outputPdf('blob');

            document.body.style.cursor = originalCursor;

            // Clean up
            document.body.removeChild(container);

            // Hide loading modal
            setIsGeneratingPDF(false);

            // Use mobile-friendly download/share
            const result = await downloadOrSharePDF(pdfBlob, filename);

            if (result.success) {
                const isMobile = isMobileDevice();
                alert(getPDFSuccessMessage(result.method, isMobile));
            } else {
                throw new Error(result.error || 'Failed to save PDF');
            }
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
            document.body.style.cursor = 'default';

            // Hide loading modal on error
            setIsGeneratingPDF(false);
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'loading':
                return (
                    <div className="text-center p-8">
                        <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="mt-4 text-xl font-semibold text-slate-800">Analysing Your Resume...</h3>
                        <p className="text-slate-500 mt-2">Our AI is reviewing <span className="font-medium text-slate-600">{fileName}</span>. This might take a moment.</p>
                    </div>
                );
            case 'result':
                if (!analysisResult) return null;
                return (
                    <div id="analysis-report" className="bg-slate-50 p-8">
                        <div className="flex justify-between items-center mb-6 print:hidden">
                            <h2 className="text-3xl font-bold text-slate-800">Resume Analysis Report</h2>
                            <div className="flex gap-2">
                                <button onClick={handleStartOver} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300">Analyse Another</button>
                                <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
                                    <PrintIcon className="w-5 h-5"/> Download Report
                                </button>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-4">ATS Compatibility Score</h3>
                                    <ScoreGauge score={analysisResult.atsScore} />
                                </div>
                                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm" style={{ pageBreakInside: 'avoid', breakInside: 'avoid', pageBreakAfter: 'always' }}>
                                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><LightBulbIcon className="w-5 h-5 text-indigo-500"/> Overall Feedback</h3>
                                    <p className="text-sm text-slate-600">{analysisResult.overallFeedback}</p>
                                </div>
                                 <div className="bg-indigo-700 text-white p-6 rounded-lg shadow-lg" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2"><UserCircleIcon className="w-5 h-5"/> Recruiter's Summary</h3>
                                    <p className="text-sm text-indigo-100 italic">"{analysisResult.recruiterSummary}"</p>
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                {analysisResult.sectionFeedback.map(item => <FeedbackCard key={item.sectionName} item={item} />)}
                            </div>
                        </div>
                    </div>
                );
            case 'upload':
            default:
                return (
                    <div className="p-8">
                        <div className="text-center">
                            <DocumentChartBarIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">AI Resume Analyser</h2>
                            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                                Upload your resume in PDF format to receive an instant scorecard, including an ATS rating and actionable feedback.
                            </p>
                        </div>
                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-start" role="alert">
                                <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0"/>
                                <div>
                                    <p className="font-bold">Oops!</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}
                        <div
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-colors ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400'}`}
                        >
                            <UploadCloudIcon className="w-12 h-12 text-slate-400 mb-3" />
                            <p className="font-semibold text-slate-700">Drag & drop your PDF here</p>
                            <p className="text-slate-500 text-sm">or</p>
                            <label htmlFor="file-upload" className="mt-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md cursor-pointer hover:bg-indigo-700">
                                Browse File
                            </label>
                            <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={onFileChange} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-full bg-slate-50 overflow-y-auto">
            {renderContent()}

            {/* PDF Generation Loading Modal */}
            {isGeneratingPDF && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4">
                        <div className="flex flex-col items-center">
                            {/* Spinner */}
                            <svg className="animate-spin h-16 w-16 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>

                            {/* Text */}
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Generating Report PDF...</h3>
                            <p className="text-sm text-slate-600 text-center mb-4">
                                Creating your professional analysis report with high-quality formatting.
                            </p>
                            <p className="text-xs text-slate-500 text-center">
                                This may take 5-10 seconds. Please don't close this window.
                            </p>

                            {/* Progress bar animation */}
                            <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
                                <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeAnalyserPage;