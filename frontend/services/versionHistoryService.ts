import type { ResumeData, ResumeVersion } from '../types';

const VERSIONS_KEY = 'career_hub_resume_versions';

/**
 * Retrieves all saved resume versions from localStorage, sorted by most recent first.
 */
export const getVersions = (): ResumeVersion[] => {
  try {
    const versionsJson = localStorage.getItem(VERSIONS_KEY);
    const versions = versionsJson ? (JSON.parse(versionsJson) as ResumeVersion[]) : [];
    // Sort by date, newest first
    return versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to parse resume versions from localStorage", error);
    return [];
  }
};

/**
 * Saves the current list of versions to localStorage.
 */
const saveAllVersions = (versions: ResumeVersion[]): void => {
  try {
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  } catch (error) {
    console.error("Failed to save resume versions to localStorage", error);
  }
};

/**
 * Creates and saves a new version of a resume.
 * @param name - A user-provided name for the version.
 * @param resumeData - The resume data object to save.
 */
export const saveVersion = (name: string, resumeData: ResumeData): void => {
  const versions = getVersions();
  const newVersion: ResumeVersion = {
    id: Date.now().toString(),
    name,
    createdAt: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(resumeData)), // Deep copy to prevent mutation
  };
  versions.push(newVersion);
  saveAllVersions(versions);
};

/**
 * Deletes a resume version by its ID.
 * @param versionId - The ID of the version to delete.
 */
export const deleteVersion = (versionId: string): void => {
  let versions = getVersions();
  versions = versions.filter(v => v.id !== versionId);
  saveAllVersions(versions);
};

/**
 * Retrieves a single resume version by its ID.
 * @param versionId - The ID of the version to retrieve.
 * @returns The ResumeVersion object or null if not found.
 */
export const getVersion = (versionId: string): ResumeVersion | null => {
    const versions = getVersions();
    return versions.find(v => v.id === versionId) || null;
}
