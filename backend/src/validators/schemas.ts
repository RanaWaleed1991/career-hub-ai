import { body, param, query } from 'express-validator';

// =======================
// AUTH VALIDATION SCHEMAS
// =======================

export const signupSchema = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email is too long'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),

  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
];

export const loginSchema = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// =======================
// JOB VALIDATION SCHEMAS
// =======================

export const createJobSchema = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Description must be between 10 and 10,000 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['tech', 'accounting', 'casual'])
    .withMessage('Category must be tech, accounting, or casual'),

  body('external_url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Must be a valid URL'),

  body('salary_min')
    .optional()
    .isNumeric()
    .withMessage('Salary min must be a number')
    .custom((value, { req }) => {
      if (req.body.salary_max && value > req.body.salary_max) {
        throw new Error('Minimum salary cannot be greater than maximum salary');
      }
      return true;
    }),

  body('salary_max')
    .optional()
    .isNumeric()
    .withMessage('Salary max must be a number'),
];

export const updateJobSchema = [
  param('id')
    .isUUID()
    .withMessage('Job ID must be a valid UUID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),

  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Description must be between 10 and 10,000 characters'),

  body('category')
    .optional()
    .trim()
    .isIn(['tech', 'accounting', 'casual'])
    .withMessage('Category must be tech, accounting, or casual'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
];

export const deleteJobSchema = [
  param('id')
    .isUUID()
    .withMessage('Job ID must be a valid UUID'),
];

export const jobCategorySchema = [
  param('category')
    .isIn(['tech', 'accounting', 'casual', 'healthcare'])
    .withMessage('Category must be tech, accounting, casual, or healthcare'),
];

// =======================
// COURSE VALIDATION SCHEMAS
// =======================

export const createCourseSchema = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),

  body('provider')
    .trim()
    .notEmpty()
    .withMessage('Provider is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Provider must be between 2 and 255 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5,000 characters'),

  body('video_url')
    .trim()
    .notEmpty()
    .withMessage('Video URL is required')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Must be a valid URL'),

  body('type')
    .trim()
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['free', 'paid'])
    .withMessage('Type must be free or paid'),

  body('thumbnail_url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Must be a valid URL'),

  body('duration')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Duration is too long'),

  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate, or advanced'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category is too long'),

  body('affiliate_link')
    .if(body('type').equals('paid'))
    .trim()
    .notEmpty()
    .withMessage('Affiliate link is required for paid courses')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Must be a valid URL'),
];

export const updateCourseSchema = [
  param('id')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),

  body('provider')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Provider must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5,000 characters'),

  body('video_url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Must be a valid URL'),

  body('type')
    .optional()
    .trim()
    .isIn(['free', 'paid'])
    .withMessage('Type must be free or paid'),

  body('thumbnail_url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Must be a valid URL'),

  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate, or advanced'),

  body('status')
    .optional()
    .isIn(['published', 'draft'])
    .withMessage('Status must be published or draft'),
];

export const deleteCourseSchema = [
  param('id')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),
];

export const courseTypeSchema = [
  param('type')
    .isIn(['free', 'paid'])
    .withMessage('Type must be free or paid'),
];

export const enrollCourseSchema = [
  body('courseId')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),
];

// =======================
// RESUME VALIDATION SCHEMAS
// =======================

export const createResumeSchema = [
  body('data')
    .notEmpty()
    .withMessage('Resume data is required')
    .isObject()
    .withMessage('Resume data must be an object'),

  body('data.personalInfo')
    .notEmpty()
    .withMessage('Personal info is required')
    .isObject()
    .withMessage('Personal info must be an object'),

  body('data.personalInfo.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('data.personalInfo.email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),

  body('data.personalInfo.phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),

  body('data.personalInfo.location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location is too long'),

  body('data.personalInfo.linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('Must be a valid URL'),

  body('data.personalInfo.portfolio')
    .optional()
    .trim()
    .isURL()
    .withMessage('Must be a valid URL'),

  body('data.summary')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Summary is too long (max 1000 characters)'),

  body('data.experience')
    .optional()
    .isArray()
    .withMessage('Experience must be an array'),

  body('data.education')
    .optional()
    .isArray()
    .withMessage('Education must be an array'),

  body('data.skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
];

export const updateResumeSchema = [
  param('id')
    .isUUID()
    .withMessage('Resume ID must be a valid UUID'),

  ...createResumeSchema,
];

export const deleteResumeSchema = [
  param('id')
    .isUUID()
    .withMessage('Resume ID must be a valid UUID'),
];

export const getResumeSchema = [
  param('id')
    .isUUID()
    .withMessage('Resume ID must be a valid UUID'),
];

// =======================
// APPLICATION VALIDATION SCHEMAS
// =======================

export const createApplicationSchema = [
  body('job_id')
    .isUUID()
    .withMessage('Job ID must be a valid UUID'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 255 })
    .withMessage('Company name is too long'),

  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ max: 255 })
    .withMessage('Position is too long'),

  body('status')
    .optional()
    .isIn(['applied', 'interviewing', 'offered', 'rejected', 'accepted'])
    .withMessage('Invalid status'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes are too long (max 5000 characters)'),
];

export const updateApplicationSchema = [
  param('id')
    .isUUID()
    .withMessage('Application ID must be a valid UUID'),

  body('status')
    .optional()
    .isIn(['applied', 'interviewing', 'offered', 'rejected', 'accepted'])
    .withMessage('Invalid status'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes are too long (max 5000 characters)'),
];

export const deleteApplicationSchema = [
  param('id')
    .isUUID()
    .withMessage('Application ID must be a valid UUID'),
];

// =======================
// AI REQUEST VALIDATION
// =======================

export const enhanceSummarySchema = [
  body('section')
    .trim()
    .notEmpty()
    .withMessage('Section is required')
    .isIn(['summary', 'experience'])
    .withMessage('Section must be either summary or experience'),

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Text is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Text must be between 10 and 5000 characters'),
];

export const analyzeResumeSchema = [
  body('resumeText')
    .trim()
    .notEmpty()
    .withMessage('Resume text is required')
    .isLength({ min: 50, max: 20000 })
    .withMessage('Resume text must be between 50 and 20,000 characters'),
];

export const generateCoverLetterSchema = [
  body('jobTitle')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 200 })
    .withMessage('Job title is too long'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 200 })
    .withMessage('Company name is too long'),

  body('jobDescription')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20, max: 10000 })
    .withMessage('Job description must be between 20 and 10,000 characters'),

  body('resumeText')
    .trim()
    .notEmpty()
    .withMessage('Resume text is required')
    .isLength({ min: 50, max: 20000 })
    .withMessage('Resume text must be between 50 and 20,000 characters'),
];

export const tailorResumeSchema = [
  body('resumeText')
    .trim()
    .notEmpty()
    .withMessage('Resume text is required')
    .isLength({ min: 50, max: 20000 })
    .withMessage('Resume text must be between 50 and 20,000 characters'),

  body('jobDescription')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20, max: 10000 })
    .withMessage('Job description must be between 20 and 10,000 characters'),
];

export const skillGapSchema = [
  body('resumeText')
    .trim()
    .notEmpty()
    .withMessage('Resume text is required')
    .isLength({ min: 50, max: 20000 })
    .withMessage('Resume text must be between 50 and 20,000 characters'),

  body('jobDescription')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20, max: 10000 })
    .withMessage('Job description must be between 20 and 10,000 characters'),
];

export const selectionCriteriaSchema = [
  body('resumeText')
    .trim()
    .notEmpty()
    .withMessage('Resume text is required')
    .isLength({ min: 50, max: 20000 })
    .withMessage('Resume text must be between 50 and 20,000 characters'),

  body('jobDescription')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20, max: 15000 })
    .withMessage('Job description must be between 20 and 15,000 characters'),
];

// =======================
// PAYMENT VALIDATION SCHEMAS
// =======================

export const createCheckoutSchema = [
  body('priceId')
    .trim()
    .notEmpty()
    .withMessage('Price ID is required')
    .matches(/^price_[a-zA-Z0-9]+$/)
    .withMessage('Invalid Stripe price ID format'),
];

// =======================
// PAGINATION & SEARCH
// =======================

export const paginationSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('sort')
    .optional()
    .isIn(['asc', 'desc', 'newest', 'oldest'])
    .withMessage('Invalid sort order'),
];

export const searchSchema = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query is too long'),

  query('category')
    .optional()
    .isIn(['tech', 'accounting', 'casual', 'all'])
    .withMessage('Invalid category'),
];
