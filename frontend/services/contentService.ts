import type { Job, Course } from '../types';
import { getAccessToken } from './userService';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

// --- Jobs ---

/**
 * Get all jobs (admin view - includes all statuses)
 */
export const getJobs = async (): Promise<Job[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/jobs/admin/all`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return [];
  }
};

/**
 * Get public jobs (active only)
 */
export const getPublicJobs = async (): Promise<Job[]> => {
  try {
    const response = await fetch(`${API_URL}/api/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error('Failed to fetch public jobs:', error);
    return [];
  }
};

/**
 * Add a new job (admin only)
 */
export const addJob = async (job: Omit<Job, 'id'>): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/jobs/admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(job),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add job');
    }
  } catch (error) {
    console.error('Failed to add job:', error);
    throw error;
  }
};

/**
 * Delete a job (admin only)
 */
export const deleteJob = async (jobId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/jobs/admin/${jobId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete job');
    }
  } catch (error) {
    console.error('Failed to delete job:', error);
    throw error;
  }
};

/**
 * Sync jobs from Adzuna API (admin only)
 */
export const syncJobsFromAdzuna = async (options?: {
  limitPerCategory?: number;
  clearExisting?: boolean;
}): Promise<{
  message: string;
  stats: {
    tech: number;
    accounting: number;
    casual: number;
    total: number;
  };
  jobs: Job[];
}> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/jobs/admin/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sync jobs from Adzuna');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to sync jobs from Adzuna:', error);
    throw error;
  }
};

// --- Courses ---

/**
 * Get all courses (admin view - includes drafts)
 */
export const getCourses = async (): Promise<Course[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/courses/admin/all`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return [];
  }
};

/**
 * Get public courses (published only)
 */
export const getPublicCourses = async (): Promise<Course[]> => {
  try {
    const response = await fetch(`${API_URL}/api/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error('Failed to fetch public courses:', error);
    return [];
  }
};

/**
 * Add a new course (admin only)
 */
export const addCourse = async (course: Omit<Course, 'id'>): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/courses/admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(course),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add course');
    }
  } catch (error) {
    console.error('Failed to add course:', error);
    throw error;
  }
};

/**
 * Delete a course (admin only)
 */
export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/courses/admin/${courseId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete course');
    }
  } catch (error) {
    console.error('Failed to delete course:', error);
    throw error;
  }
};
