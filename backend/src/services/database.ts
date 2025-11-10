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

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        ...subscriptionData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
