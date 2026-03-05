/**
 * Expert Review API service
 */
import { getAccessToken } from './userService';
import type { ExpertReview, QuestionnaireAnswer } from '../types';

const API_URL = 'https://api.careerhubai.com.au';

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Create a Stripe checkout session for the expert review ($89)
 */
export const createExpertReviewCheckout = async (): Promise<{ sessionId: string; sessionUrl: string }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/expert-review/create-checkout`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create checkout');
  }
  return response.json();
};

/**
 * Get all expert reviews for the current user
 */
export const getExpertReviews = async (): Promise<ExpertReview[]> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/expert-review/status`, { headers });
  if (!response.ok) throw new Error('Failed to fetch review status');
  const data = await response.json();
  return data.reviews;
};

/**
 * Upload a resume PDF for expert review
 */
export const submitResumeForReview = async (file: File): Promise<void> => {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/api/expert-review/submit-resume`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/pdf',
      'X-Filename': file.name,
    },
    body: file,
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to submit resume');
  }
};

/**
 * Get questionnaire for a specific review
 */
export const getQuestionnaire = async (reviewId: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/expert-review/questionnaire/${reviewId}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch questionnaire');
  return response.json();
};

/**
 * Submit questionnaire answers
 */
export const submitQuestionnaire = async (reviewId: string, answers: QuestionnaireAnswer[]): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/expert-review/questionnaire/${reviewId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to submit questionnaire');
  }
};

/**
 * Get download URL for rewritten resume
 */
export const downloadRewrittenResume = async (reviewId: string): Promise<{ downloadUrl: string; filename: string }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/expert-review/download/${reviewId}`, { headers });
  if (!response.ok) throw new Error('Failed to get download link');
  return response.json();
};

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * Get all expert review orders (admin)
 */
export const getAdminOrders = async (status?: string): Promise<ExpertReview[]> => {
  const headers = await getAuthHeaders();
  const url = status
    ? `${API_URL}/api/expert-review/admin/orders?status=${status}`
    : `${API_URL}/api/expert-review/admin/orders`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Failed to fetch orders');
  const data = await response.json();
  return data.orders;
};

/**
 * Update review status (admin)
 */
export const updateReviewStatus = async (
  reviewId: string,
  status: string,
  adminNotes?: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/expert-review/admin/${reviewId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status, admin_notes: adminNotes }),
  });
  if (!response.ok) throw new Error('Failed to update status');
};

/**
 * Set questionnaire questions (admin)
 */
export const setQuestionnaireQuestions = async (
  reviewId: string,
  questions: { question: string; type: string }[]
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/expert-review/admin/${reviewId}/questionnaire`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ questions }),
  });
  if (!response.ok) throw new Error('Failed to set questionnaire');
};

/**
 * Upload rewritten resume (admin)
 */
export const uploadRewrittenResume = async (reviewId: string, file: File): Promise<void> => {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/api/expert-review/admin/${reviewId}/upload-rewrite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/pdf',
      'X-Filename': file.name,
    },
    body: file,
  });
  if (!response.ok) throw new Error('Failed to upload rewritten resume');
};

/**
 * Download original resume (admin)
 */
export const downloadOriginalResume = async (reviewId: string): Promise<{ downloadUrl: string; filename: string }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/expert-review/admin/${reviewId}/download-original`, { headers });
  if (!response.ok) throw new Error('Failed to get download link');
  return response.json();
};

/**
 * Get questionnaire answers (admin)
 */
export const getQuestionnaireAnswers = async (reviewId: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/api/expert-review/admin/${reviewId}/answers`, { headers });
  if (!response.ok) throw new Error('Failed to fetch answers');
  return response.json();
};
