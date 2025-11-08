export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  website: string;
  photo: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id:string;
  degree: string;
  institution: string;
  location: string;
  gradDate: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
}

export interface ResumeVersion {
  id: string;
  name: string;
  createdAt: string;
  data: ResumeData;
}

export type TemplateType = 'classic' | 'modern' | 'australian' | 'creative' | 'elegant';

export type Page = 'landing' | 'builder' | 'courses' | 'jobs' | 'coverLetter' | 'admin' | 'tracker' | 'versions' | 'analyser' | 'dashboard';

export interface ResumeAnalysisResult {
  atsScore: number;
  overallFeedback: string;
  sectionFeedback: {
    sectionName: string;
    rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    feedbackPoints: string[];
  }[];
  recruiterSummary: string;
}

export type JobCategory = 'tech' | 'accounting' | 'casual';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  category: JobCategory;
}

export type CourseType = 'free' | 'paid';

export interface Course {
  id: string;
  title: string;
  provider: string;
  description: string;
  link: string;
  type: CourseType;
}

export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  dateApplied: string;
  notes: string;
}