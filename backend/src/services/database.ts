import { supabase } from '../config/supabase.js';
import { Response } from 'express';

/**
 * Helper to check if Supabase/database is configured
 */
export const ensureDatabaseConfigured = (res: Response): boolean => {
  if (!supabase) {
    res.status(503).json({
      error: 'Database is not configured. Please add Supabase credentials to .env file.',
    });
    return false;
  }
  return true;
};

/**
 * Generic error handler for database operations
 */
export const handleDatabaseError = (error: any, operation: string): string => {
  console.error(`Database error during ${operation}:`, error);

  if (error.code === '23505') {
    return 'A record with this data already exists.';
  }

  if (error.code === '23503') {
    return 'Referenced record does not exist.';
  }

  if (error.code === 'PGRST116') {
    return 'No rows found.';
  }

  return error.message || `Failed to ${operation}.`;
};

/**
 * Database service for resumes
 */
export const resumeDb = {
  /**
   * Create a new resume
   */
  async create(userId: string, resumeData: any) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        data: resumeData,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all resumes for a user
   */
  async getAll(userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a specific resume by ID
   */
  async getById(resumeId: string, userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get active resume for user
   */
  async getActive(userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  /**
   * Update a resume
   */
  async update(resumeId: string, userId: string, resumeData: any) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('resumes')
      .update({
        data: resumeData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resumeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a resume
   */
  async delete(resumeId: string, userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Set a resume as active (and deactivate others)
   */
  async setActive(resumeId: string, userId: string) {
    if (!supabase) throw new Error('Database not configured');

    // Deactivate all resumes for user
    await supabase
      .from('resumes')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Activate the specified resume
    const { data, error } = await supabase
      .from('resumes')
      .update({ is_active: true })
      .eq('id', resumeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

/**
 * Database service for resume versions
 */
export const versionDb = {
  /**
   * Save a new version
   */
  async create(userId: string, resumeId: string, versionData: any, versionName: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('resume_versions')
      .insert({
        user_id: userId,
        resume_id: resumeId,
        data: versionData,
        name: versionName,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all versions for a user
   */
  async getAll(userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get versions for a specific resume
   */
  async getByResumeId(resumeId: string, userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('resume_id', resumeId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Delete a version
   */
  async delete(versionId: string, userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { error } = await supabase
      .from('resume_versions')
      .delete()
      .eq('id', versionId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Get a specific version
   */
  async getById(versionId: string, userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('id', versionId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },
};

/**
 * Database service for applications
 */
export const applicationDb = {
  /**
   * Create a new application
   */
  async create(userId: string, applicationData: any) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        ...applicationData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all applications for a user
   */
  async getAll(userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a specific application
   */
  async getById(applicationId: string, userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an application
   */
  async update(applicationId: string, userId: string, applicationData: any) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('applications')
      .update(applicationData)
      .eq('id', applicationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an application
   */
  async delete(applicationId: string, userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },
};

/**
 * Database service for subscriptions
 */
export const subscriptionDb = {
  /**
   * Get user's current subscription
   */
  async getCurrent(userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  /**
   * Create or update subscription
   */
  async upsert(userId: string, subscriptionData: any) {
    if (!supabase) throw new Error('Database not configured');

    // Check if subscription exists
    const existing = await this.getCurrent(userId);

    if (existing) {
      // Update existing record, ensuring plan is never null
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan: existing.plan || 'free', // Ensure plan is set if it was null
          ...subscriptionData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new record with all required fields
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: 'free', // Default plan for new subscriptions
          status: 'active',
          ...subscriptionData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  /**
   * Update feature usage
   */
  async updateFeatureUsage(userId: string, featureUpdates: any) {
    if (!supabase) throw new Error('Database not configured');

    // First, check if subscription exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If no subscription exists, create one with the feature updates
    if (!existingSub) {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: 'free',
          status: 'active',
          ...featureUpdates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Otherwise, update the existing subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        ...featureUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

/**
 * Database service for jobs (admin-managed content)
 */
export const jobDb = {
  /**
   * Get all jobs
   */
  async getAll() {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get active jobs only (for public display)
   */
  async getActive() {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get jobs by category
   */
  async getByCategory(category: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new job (admin only)
   */
  async create(jobData: {
    title: string;
    company: string;
    location: string;
    description: string;
    category: string;
    external_id?: string;
    external_url?: string;
    salary_min?: number;
    salary_max?: number;
    source?: 'manual' | 'adzuna';
    posted_date?: string;
  }) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        ...jobData,
        status: 'active',
        source: jobData.source || 'manual',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Bulk create jobs (for syncing from external sources)
   */
  async bulkCreate(jobs: Array<{
    title: string;
    company: string;
    location: string;
    description: string;
    category: string;
    external_id?: string;
    external_url?: string;
    salary_min?: number;
    salary_max?: number;
    source?: 'manual' | 'adzuna';
    posted_date?: string;
  }>) {
    if (!supabase) throw new Error('Database not configured');

    const jobsWithDefaults = jobs.map(job => ({
      ...job,
      status: 'active',
      source: job.source || 'manual',
    }));

    const { data, error } = await supabase
      .from('jobs')
      .insert(jobsWithDefaults)
      .select();

    if (error) throw error;
    return data || [];
  },

  /**
   * Delete jobs by source (for cleanup before re-sync)
   */
  async deleteBySource(source: 'manual' | 'adzuna') {
    if (!supabase) throw new Error('Database not configured');

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('source', source);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Update a job (admin only)
   */
  async update(jobId: string, jobData: {
    title?: string;
    company?: string;
    location?: string;
    description?: string;
    category?: string;
    status?: string;
  }) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('jobs')
      .update(jobData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a job (admin only)
   */
  async delete(jobId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
    return { success: true };
  },
};

/**
 * Database service for courses (admin-managed content)
 */
export const courseDb = {
  /**
   * Get all courses
   */
  async getAll() {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get published courses only (for public display)
   */
  async getPublished() {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get courses by type
   */
  async getByType(type: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('type', type)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new course (admin only)
   */
  async create(courseData: {
    title: string;
    provider: string;
    description: string;
    video_url: string;
    type: string;
    thumbnail_url?: string;
    duration?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
    affiliate_link?: string;
  }) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...courseData,
        status: 'published',
        enrollment_count: 0,
        is_featured: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a course (admin only)
   */
  async update(courseId: string, courseData: {
    title?: string;
    provider?: string;
    description?: string;
    video_url?: string;
    type?: string;
    status?: string;
    thumbnail_url?: string;
    duration?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
    affiliate_link?: string;
    is_featured?: boolean;
  }) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a course (admin only)
   */
  async delete(courseId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Enroll user in a course (track enrollment)
   */
  async enroll(userId: string, courseId: string) {
    if (!supabase) throw new Error('Database not configured');

    // Insert enrollment (ignore if already enrolled due to unique constraint)
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
      })
      .select()
      .single();

    // Increment enrollment count
    await supabase
      .from('courses')
      .update({ enrollment_count: supabase.rpc('increment', { column: 'enrollment_count' }) })
      .eq('id', courseId);

    if (error && error.code !== '23505') throw error; // Ignore duplicate enrollment errors
    return data;
  },

  /**
   * Get user's enrollments
   */
  async getUserEnrollments(userId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Increment enrollment count for a course
   */
  async incrementEnrollmentCount(courseId: string) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase.rpc('increment_enrollment_count', {
      course_id: courseId,
    });

    if (error) {
      // Fallback: manual increment
      const { data: course } = await supabase
        .from('courses')
        .select('enrollment_count')
        .eq('id', courseId)
        .single();

      if (course) {
        await supabase
          .from('courses')
          .update({ enrollment_count: (course.enrollment_count || 0) + 1 })
          .eq('id', courseId);
      }
    }

    return { success: true };
  },
};
