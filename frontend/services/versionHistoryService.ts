import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ResumeVersion {
  id: string;
  name: string;
  content: any;
  createdAt: string;
  updatedAt: string;
}

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
