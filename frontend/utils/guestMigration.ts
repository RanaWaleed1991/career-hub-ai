/**
 * Guest Mode Data Migration
 *
 * Handles migrating localStorage data from guest mode to authenticated user account
 */

import { saveResume } from '../services/resumeService';
import type { ResumeData, TemplateType } from '../types';

const GUEST_RESUME_KEY = 'career_hub_guest_resume';
const GUEST_TEMPLATE_KEY = 'career_hub_guest_template';

/**
 * Check if guest has resume data in localStorage
 */
export const hasGuestData = (): boolean => {
  const guestResume = localStorage.getItem(GUEST_RESUME_KEY);
  return !!guestResume;
};

/**
 * Get guest resume data from localStorage
 */
export const getGuestResumeData = (): ResumeData | null => {
  const saved = localStorage.getItem(GUEST_RESUME_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to parse guest resume data:', error);
    return null;
  }
};

/**
 * Get guest template selection from localStorage
 */
export const getGuestTemplate = (): TemplateType | null => {
  const saved = localStorage.getItem(GUEST_TEMPLATE_KEY);
  return saved as TemplateType | null;
};

/**
 * Migrate guest data to authenticated user account
 * Called after successful signup/login
 */
export const migrateGuestDataToAccount = async (): Promise<boolean> => {
  try {
    const guestResume = getGuestResumeData();

    if (!guestResume) {
      console.log('No guest data to migrate');
      return false;
    }

    // Check if guest resume has any actual content (not just empty initial data)
    const hasContent =
      guestResume.personalDetails.fullName ||
      guestResume.personalDetails.email ||
      guestResume.summary ||
      guestResume.experience.length > 0 ||
      guestResume.education.length > 0 ||
      guestResume.skills.length > 0;

    if (!hasContent) {
      console.log('Guest resume is empty, skipping migration');
      clearGuestData();
      return false;
    }

    console.log('Migrating guest resume data to authenticated account...');

    // Save to authenticated user's account
    await saveResume(guestResume);

    console.log('✅ Guest data migrated successfully');

    // Clear guest data after successful migration
    clearGuestData();

    return true;
  } catch (error) {
    console.error('❌ Failed to migrate guest data:', error);
    // Don't clear guest data if migration failed - user can retry
    return false;
  }
};

/**
 * Clear guest data from localStorage
 */
export const clearGuestData = (): void => {
  localStorage.removeItem(GUEST_RESUME_KEY);
  localStorage.removeItem(GUEST_TEMPLATE_KEY);
  console.log('Guest data cleared from localStorage');
};
