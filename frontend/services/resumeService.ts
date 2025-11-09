import type { ResumeData } from '../types';
import { getAccessToken } from './userService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
 * Save resume to database (creates or updates active resume)
 */
export const saveResume = async (resumeData: ResumeData): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    // First, try to get the active resume to see if we need to create or update
    const activeResume = await getActiveResume();

    if (activeResume && activeResume.id) {
      // Update existing resume
      const response = await fetch(`${API_URL}/api/resumes/${activeResume.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ resumeData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update resume: ${response.status}`);
      }
    } else {
      // Create new resume
      const response = await fetch(`${API_URL}/api/resumes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ resumeData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create resume: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Failed to save resume:', error);
    throw error;
  }
};

/**
 * Get the latest/active resume from database
 */
export const getLatestResume = async (): Promise<ResumeData> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/resumes/active`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to access your resume');
      }
      if (response.status === 503) {
        console.warn('Database not configured, returning empty resume');
        return initialResumeData;
      }
      throw new Error(`Failed to fetch resume: ${response.status}`);
    }

    const data = await response.json();

    // If no resume found, return initial data
    if (!data.resume) {
      return initialResumeData;
    }

    return data.resume.data || initialResumeData;
  } catch (error) {
    console.error('Failed to get latest resume:', error);
    // Return initial data if there's an error
    return initialResumeData;
  }
};

/**
 * Get active resume with metadata (id, created_at, etc.)
 */
export const getActiveResume = async (): Promise<any> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/resumes/active`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 503) {
        return null;
      }
      throw new Error(`Failed to fetch active resume: ${response.status}`);
    }

    const data = await response.json();
    return data.resume;
  } catch (error) {
    console.error('Failed to get active resume:', error);
    return null;
  }
};

/**
 * Get all resumes for the current user
 */
export const getAllResumes = async (): Promise<any[]> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/resumes`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 503) {
        return [];
      }
      throw new Error(`Failed to fetch resumes: ${response.status}`);
    }

    const data = await response.json();
    return data.resumes || [];
  } catch (error) {
    console.error('Failed to get all resumes:', error);
    return [];
  }
};

/**
 * Delete a resume by ID
 */
export const deleteResume = async (resumeId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete resume: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete resume:', error);
    throw error;
  }
};

/**
 * Create a new resume
 */
export const createResume = async (resumeData: ResumeData): Promise<any> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/resumes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ resumeData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create resume: ${response.status}`);
    }

    const data = await response.json();
    return data.resume;
  } catch (error) {
    console.error('Failed to create resume:', error);
    throw error;
  }
};

/**
 * Set a specific resume as active
 */
export const setActiveResume = async (resumeId: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/resumes/${resumeId}/activate`, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to activate resume: ${response.status}`);
    }

    const data = await response.json();
    return data.resume;
  } catch (error) {
    console.error('Failed to set active resume:', error);
    throw error;
  }
};
