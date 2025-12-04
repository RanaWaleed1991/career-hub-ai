import type { ResumeAnalysisResult } from '../types';
import { getAccessToken } from './userService';

// Get API URL from environment variables
const API_URL = 'https://api.careerhubai.com.au';

/**
 * Get auth headers with JWT token
 */
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Enhance text using AI (for summary or experience sections)
 * @param text - The text to enhance
 * @param section - Either 'summary' or 'experience'
 * @returns Enhanced text
 */
export const enhanceTextWithAI = async (text: string, section: 'summary' | 'experience'): Promise<string> => {
  if (!text.trim()) {
    return "";
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/gemini/enhance-summary`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, section }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to use this feature.');
      }
      if (response.status === 403) {
        const errorData = await response.json();
        const error: any = new Error(errorData.message || 'You have reached your limit. Please upgrade to continue.');
        error.limitReached = true;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.enhancedText || "";
  } catch (error) {
    console.error("Error calling backend API for enhance-summary:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to get AI suggestion. Please check your connection and try again.");
  }
};

/**
 * Tailor resume for a specific job
 * @param resumeText - The current resume text
 * @param jobDescription - The job description to tailor for
 * @returns Tailored resume text
 */
export const tailorResumeForJob = async (resumeText: string, jobDescription: string): Promise<string> => {
  if (!resumeText.trim() || !jobDescription.trim()) {
    return "";
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/gemini/tailor-resume`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to use this feature.');
      }
      if (response.status === 403) {
        const errorData = await response.json();
        const error: any = new Error(errorData.message || 'You have reached your limit. Please upgrade to continue.');
        error.limitReached = true;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.tailoredResume || "";
  } catch (error) {
    console.error("Error calling backend API for tailor-resume:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to tailor resume. Please check your connection and try again.");
  }
};

/**
 * Generate a cover letter based on resume and job details
 * @param resumeText - The resume text
 * @param jobTitle - The job title
 * @param company - The company name
 * @param jobDescription - The job description
 * @returns Generated cover letter
 */
export const generateCoverLetter = async (
  resumeText: string,
  jobTitle: string,
  company: string,
  jobDescription: string
): Promise<string> => {
  if (!resumeText.trim() || !jobDescription.trim() || !jobTitle.trim() || !company.trim()) {
    return "";
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/gemini/generate-cover-letter`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ resumeText, jobTitle, company, jobDescription }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to use this feature.');
      }
      if (response.status === 403) {
        const errorData = await response.json();
        const error: any = new Error(errorData.message || 'You have reached your limit. Please upgrade to continue.');
        error.limitReached = true;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.coverLetter || "";
  } catch (error) {
    console.error("Error calling backend API for cover letter:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate cover letter. Please check your connection and try again.");
  }
};

/**
 * Analyze resume and get detailed feedback
 * @param resumeText - The resume text to analyze
 * @returns Resume analysis result with ATS score and feedback
 */
export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysisResult> => {
  if (!resumeText.trim()) {
    throw new Error("Resume text cannot be empty.");
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/gemini/analyze-resume`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ resumeText }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to use this feature.');
      }
      if (response.status === 403) {
        const errorData = await response.json();
        const error: any = new Error(errorData.message || 'You have reached your limit. Please upgrade to continue.');
        error.limitReached = true;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // If there's a warning message from backend, attach it to the result
    if (data.warningMessage) {
      (data.analysis as any).__warningMessage = data.warningMessage;
    }

    return data.analysis;
  } catch (error) {
    console.error("Error calling backend API for resume analysis:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to analyze resume. The AI model may be temporarily unavailable. Please try again later.");
  }
};
