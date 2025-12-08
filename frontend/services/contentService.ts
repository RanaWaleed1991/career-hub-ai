import type { Job, Course, Blog } from '../types';
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
  location?: string;
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

/**
 * Track course enrollment
 */
export const enrollInCourse = async (courseId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/courses/enroll`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ courseId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to track enrollment');
    }
  } catch (error) {
    console.error('Failed to track enrollment:', error);
    throw error;
  }
};

// --- Blogs ---

/**
 * Get all blogs (admin view - includes drafts)
 */
export const getBlogs = async (): Promise<Blog[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/blogs/admin/all`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.blogs || [];
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return [];
  }
};

/**
 * Get public blogs (published only with pagination)
 */
export const getPublicBlogs = async (options?: {
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ blogs: Blog[]; total: number }> => {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.tag) params.append('tag', options.tag);
    if (options?.search) params.append('search', options.search);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await fetch(`${API_URL}/api/blogs?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { blogs: data.blogs || [], total: data.total || 0 };
  } catch (error) {
    console.error('Failed to fetch public blogs:', error);
    return { blogs: [], total: 0 };
  }
};

/**
 * Get a single blog by slug (public)
 */
export const getBlogBySlug = async (slug: string): Promise<Blog | null> => {
  try {
    const response = await fetch(`${API_URL}/api/blogs/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.blog;
  } catch (error) {
    console.error('Failed to fetch blog:', error);
    return null;
  }
};

/**
 * Add a new blog (admin only)
 */
export const addBlog = async (blog: Partial<Blog>): Promise<Blog> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/blogs/admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(blog),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add blog');
    }

    const data = await response.json();
    return data.blog;
  } catch (error) {
    console.error('Failed to add blog:', error);
    throw error;
  }
};

/**
 * Update a blog (admin only)
 */
export const updateBlog = async (blogId: string, blog: Partial<Blog>): Promise<Blog> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/blogs/admin/${blogId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(blog),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update blog');
    }

    const data = await response.json();
    return data.blog;
  } catch (error) {
    console.error('Failed to update blog:', error);
    throw error;
  }
};

/**
 * Delete a blog (admin only)
 */
export const deleteBlog = async (blogId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/blogs/admin/${blogId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete blog');
    }
  } catch (error) {
    console.error('Failed to delete blog:', error);
    throw error;
  }
};
