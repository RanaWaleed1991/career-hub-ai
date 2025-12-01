import type { Application, ApplicationStatus } from '../types';
import { getAccessToken } from './userService';

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

/**
 * Get all applications for the authenticated user
 */
export const getApplications = async (): Promise<Application[]> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/applications`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 503) {
        console.warn('Database not configured, returning empty applications');
        return [];
      }
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }

    const data = await response.json();
    const applications = data.applications || [];

    // Map database format to frontend format
    return applications.map((app: any): Application => ({
      id: app.id,
      company: app.company,
      role: app.position,
      status: app.status as ApplicationStatus,
      dateApplied: app.applied_date,
      notes: app.notes || '',
    }));
  } catch (error) {
    console.error('Failed to get applications:', error);
    return [];
  }
};

/**
 * Create a new application
 */
export const createApplication = async (
  company: string,
  role: string,
  dateApplied: string
): Promise<Application | null> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/applications`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        company,
        position: role,
        status: 'Applied',
        applied_date: dateApplied,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create application: ${response.status}`);
    }

    const data = await response.json();
    const app = data.application;

    return {
      id: app.id,
      company: app.company,
      role: app.position,
      status: app.status as ApplicationStatus,
      dateApplied: app.applied_date,
      notes: app.notes || '',
    };
  } catch (error) {
    console.error('Failed to create application:', error);
    throw error;
  }
};

/**
 * Update an application's status
 */
export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus
): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/applications/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update application: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to update application:', error);
    throw error;
  }
};

/**
 * Delete an application
 */
export const deleteApplication = async (id: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/applications/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete application: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete application:', error);
    throw error;
  }
};
