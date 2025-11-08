import type { ResumeData } from '../types';

const LATEST_RESUME_KEY = 'career_hub_latest_resume';

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


export const saveResume = (resumeData: ResumeData): void => {
  try {
    localStorage.setItem(LATEST_RESUME_KEY, JSON.stringify(resumeData));
  } catch (error) {
    console.error("Failed to save resume to localStorage", error);
  }
};

export const getLatestResume = (): ResumeData => {
  try {
    const resumeJson = localStorage.getItem(LATEST_RESUME_KEY);
    return resumeJson ? JSON.parse(resumeJson) : initialResumeData;
  } catch (error) {
    console.error("Failed to parse resume from localStorage", error);
    return initialResumeData;
  }
};