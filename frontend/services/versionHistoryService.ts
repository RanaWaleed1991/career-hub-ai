import type { ResumeData, ResumeVersion } from '../types';
import { getAccessToken } from './userService';
import { getActiveResume } from './resumeService';

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

/**
 * Retrieves all saved resume versions from database, sorted by most recent first.
 */
export const getVersions = async (): Promise<ResumeVersion[]> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/versions`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 503) {
        console.warn('Database not configured, returning empty versions');
        return [];
      }
      throw new Error(`Failed to fetch versions: ${response.status}`);
    }

    const data = await response.json();
    const versions = data.versions || [];

    // Map database format to frontend format
    return versions.map((v: any): ResumeVersion => ({
      id: v.id,
      name: v.version_name,
      createdAt: v.created_at,
      data: v.data,
    }));
  } catch (error) {
    console.error('Failed to get versions:', error);
    return [];
  }
};

/**
 * Creates and saves a new version of a resume.
 * @param name - A user-provided name for the version.
 * @param resumeData - The resume data object to save.
 */
export const saveVersion = async (name: string, resumeData: ResumeData): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    // Get the active resume to link the version to it
    const activeResume = await getActiveResume();

    if (!activeResume || !activeResume.id) {
      throw new Error('No active resume found. Please save your resume first.');
    }

    const response = await fetch(`${API_URL}/api/versions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        resumeId: activeResume.id,
        versionData: resumeData,
        versionName: name,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save version: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to save version:', error);
    throw error;
  }
};

/**
 * Deletes a resume version by its ID.
 * @param versionId - The ID of the version to delete.
 */
export const deleteVersion = async (versionId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/versions/${versionId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete version: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete version:', error);
    throw error;
  }
};

/**
 * Retrieves a single resume version by its ID.
 * @param versionId - The ID of the version to retrieve.
 * @returns The ResumeVersion object or null if not found.
 */
export const getVersion = async (versionId: string): Promise<ResumeVersion | null> => {
  try {
    const versions = await getVersions();
    return versions.find((v) => v.id === versionId) || null;
  } catch (error) {
    console.error('Failed to get version:', error);
    return null;
  }
};

/**
 * Restore a version (update active resume with version data)
 * @param versionId - The ID of the version to restore
 */
export const restoreVersion = async (versionId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/versions/${versionId}/restore`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to restore version: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to restore version:', error);
    throw error;
  }
};
