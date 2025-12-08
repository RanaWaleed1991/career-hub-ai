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

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  relationship: string;
  phone?: string;
  email?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export type LayoutStyle = 'traditional' | 'skills-first' | 'australian';

export interface ResumeData {
  personalDetails: PersonalDetails;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  skillsLabel?: string; // Optional custom label for skills section
  layoutStyle?: LayoutStyle; // Preset section ordering style (default: traditional)
  certifications?: Certification[];
  references?: Reference[];
  customSections?: CustomSection[];
}

export interface ResumeVersion {
  id: string;
  name: string;
  createdAt: string;
  data: ResumeData;
}

export type TemplateType = 'classic' | 'modern' | 'australian' | 'picture' | 'ats' | 'minimal';

export type Page = 'landing' | 'auth' | 'forgot-password' | 'reset-password' | 'builder' | 'courses' | 'jobs' | 'coverLetter' | 'admin' | 'tracker' | 'versions' | 'analyser' | 'dashboard' | 'paymentSuccess' | 'paymentCancel' | 'pricing' | 'subscription' | 'privacy' | 'terms' | 'blogs' | 'blog';

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
  external_id?: string;
  external_url?: string;
  salary_min?: number;
  salary_max?: number;
  source?: 'manual' | 'adzuna';
  posted_date?: string;
}

export type CourseType = 'free' | 'paid';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  title: string;
  provider: string;
  description: string;
  video_url: string;
  type: CourseType;
  thumbnail_url?: string;
  duration?: string;
  level?: CourseLevel;
  category?: string;
  affiliate_link?: string;
  enrollment_count?: number;
  is_featured?: boolean;
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

export type BlogStatus = 'draft' | 'published';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  category?: string;
  tags?: string[];
  featured_image?: string;
  status: BlogStatus;
  published_date?: string;
  meta_title?: string;
  meta_description?: string;
  reading_time_minutes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}