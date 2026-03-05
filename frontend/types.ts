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

export type Page = 'landing' | 'auth' | 'forgot-password' | 'reset-password' | 'builder' | 'courses' | 'jobs' | 'coverLetter' | 'admin' | 'tracker' | 'versions' | 'analyser' | 'dashboard' | 'paymentSuccess' | 'paymentCancel' | 'pricing' | 'subscription' | 'privacy' | 'terms' | 'blogs' | 'blog' | 'skill-gap' | 'selection-criteria' | 'expert-review';

// ─── Skill Gap Analysis ───────────────────────────────────────────────────────

export type SkillCategory = 'technical' | 'soft' | 'certification' | 'domain';
export type SkillStrength = 'strong' | 'moderate' | 'mentioned';
export type SkillPriority = 'critical' | 'important' | 'nice-to-have';
export type RecommendationType = 'highlight' | 'learn' | 'reframe';

export interface PresentSkill {
  name: string;
  category: SkillCategory;
  strength: SkillStrength;
}

export interface MissingSkill {
  name: string;
  category: SkillCategory;
  priority: SkillPriority;
  reason: string;
}

export interface SkillRecommendation {
  skill: string;
  action: string;
  type: RecommendationType;
}

export interface SkillGapResult {
  matchScore: number;
  matchSummary: string;
  presentSkills: PresentSkill[];
  missingSkills: MissingSkill[];
  keywordGaps: string[];
  recommendations: SkillRecommendation[];
  strengthAreas: string[];
  improvementAreas: string[];
}

// ─── Selection Criteria ───────────────────────────────────────────────────────

export type CriterionType = 'essential' | 'desirable';
export type CriterionConfidence = 'high' | 'medium' | 'low';

export interface StarResponse {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface SelectionCriterion {
  type: CriterionType;
  criterion: string;
  starResponse: StarResponse;
  fullResponse: string;
  confidence: CriterionConfidence;
}

export interface SelectionCriteriaResult {
  jobTitle: string;
  organization: string;
  criteria: SelectionCriterion[];
  generalNotes: string;
}

// ─── Expert Review ──────────────────────────────────────────────────────────

export type ExpertReviewStatus =
  | 'pending_submission'
  | 'submitted'
  | 'in_review'
  | 'questionnaire_sent'
  | 'questionnaire_completed'
  | 'revision_in_progress'
  | 'completed';

export interface QuestionnaireQuestion {
  question: string;
  type: 'text' | 'textarea';
}

export interface QuestionnaireAnswer {
  question: string;
  answer: string;
}

export interface ExpertReview {
  id: string;
  user_id: string;
  status: ExpertReviewStatus;
  stripe_payment_intent_id?: string;
  amount_paid?: number;
  paid_at?: string;
  original_resume_url?: string;
  original_resume_filename?: string;
  submitted_at?: string;
  questionnaire?: QuestionnaireQuestion[];
  questionnaire_answers?: QuestionnaireAnswer[];
  questionnaire_sent_at?: string;
  questionnaire_completed_at?: string;
  rewritten_resume_url?: string;
  rewritten_resume_filename?: string;
  completed_at?: string;
  admin_notes?: string;
  user_email?: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

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