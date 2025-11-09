import { supabase } from '../src/config/supabase';
import type { ResumeData, ResumeVersion as ResumeVersionType } from '../types';
import { getAccessToken } from './userService';
import { getActiveResume } from './resumeService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// NEW: Interface for the class-based service
export interface ResumeVersion {
  id: string;
  name: string;
  content: any;
  createdAt: string;
  updatedAt: string;
}

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

// NEW: Class-based service for VersionHistoryPage component
class VersionHistoryService {
  async getVersions(): Promise<ResumeVersion[]> {
    try {
      console.log('VersionHistoryService: Fetching versions from', API_URL);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('VersionHistoryService: No active session');
        throw new Error('Please log in to view your resume versions');
      }

      const response = await fetch(`${API_URL}/api/versions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('VersionHistoryService: Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch versions: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('VersionHistoryService: Received data:', data);

      const versions: ResumeVersion[] = (data.versions || []).map((v: any) => ({
        id: v.id,
        name: v.name || v.version_name || 'Untitled Version',
        content: v.content,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      }));

      console.log('VersionHistoryService: Returning', versions.length, 'versions');
      return versions;
    } catch (error) {
      console.error('VersionHistoryService: Error:', error);
      throw error;
    }
  }

  async saveVersion(name: string, content: any): Promise<ResumeVersion> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please log in');

      const response = await fetch(`${API_URL}/api/versions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, content }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save version: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        name: data.name || name,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('VersionHistoryService: Save error:', error);
      throw error;
    }
  }
}

export const versionHistoryService = new VersionHistoryService();

// OLD: Backward compatible exports for existing components
/**
 * Retrieves all saved resume versions from database, sorted by most recent first.
 */
export const getVersions = async (): Promise<ResumeVersionType[]> => {
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
    return versions.map((v: any): ResumeVersionType => ({
      id: v.id,
      name: v.name,
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
export const getVersion = async (versionId: string): Promise<ResumeVersionType | null> => {
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
