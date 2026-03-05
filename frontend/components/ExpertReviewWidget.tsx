import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExpertReview, ExpertReviewStatus, QuestionnaireAnswer } from '../types';
import {
  getExpertReviews,
  submitResumeForReview,
  getQuestionnaire,
  submitQuestionnaire,
  downloadRewrittenResume,
} from '../services/expertReviewService';

const STATUS_LABELS: Record<ExpertReviewStatus, string> = {
  pending_submission: 'Upload Your Resume',
  submitted: 'Resume Received — Expert is Reviewing',
  in_review: 'Expert is Reviewing Your Resume',
  questionnaire_sent: 'Expert Has Questions for You',
  questionnaire_completed: 'Expert is Working on Your Rewrite',
  revision_in_progress: 'Your Resume is Being Rewritten',
  completed: 'Your Expert Resume is Ready!',
};

const STATUS_STEPS: ExpertReviewStatus[] = [
  'pending_submission',
  'submitted',
  'in_review',
  'questionnaire_sent',
  'questionnaire_completed',
  'revision_in_progress',
  'completed',
];

const ExpertReviewWidget: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ExpertReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getExpertReviews();
      setReviews(data);

      // If there's a review awaiting questionnaire, load it
      const pendingQ = data.find(r => r.status === 'questionnaire_sent');
      if (pendingQ) {
        const q = await getQuestionnaire(pendingQ.id);
        setQuestionnaire({ ...q, reviewId: pendingQ.id });
      }
    } catch (err) {
      console.error('Failed to load expert reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeReview = reviews.find(r => r.status !== 'completed');
  const completedReviews = reviews.filter(r => r.status === 'completed');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum 10MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await submitResumeForReview(file);
      await loadReviews();
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitQuestionnaire = async () => {
    if (!questionnaire) return;

    const formattedAnswers: QuestionnaireAnswer[] = questionnaire.questionnaire.map(
      (q: any, i: number) => ({
        question: q.question,
        answer: answers[i] || '',
      })
    );

    // Check that all questions are answered
    const unanswered = formattedAnswers.filter(a => !a.answer.trim());
    if (unanswered.length > 0) {
      setError('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitQuestionnaire(questionnaire.reviewId, formattedAnswers);
      setQuestionnaire(null);
      setAnswers({});
      await loadReviews();
    } catch (err: any) {
      setError(err.message || 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (reviewId: string) => {
    try {
      const { downloadUrl } = await downloadRewrittenResume(reviewId);
      window.open(downloadUrl, '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to download resume');
    }
  };

  if (loading) return null;

  // No reviews at all — show promo card
  if (reviews.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
        <h3 className="text-lg font-bold mb-2">Expert Resume Review</h3>
        <p className="text-purple-100 text-sm mb-4 leading-relaxed">
          Get your resume professionally rewritten by a career specialist. Includes 30 days Premium.
        </p>
        <button
          onClick={() => navigate('/expert-review')}
          className="w-full bg-white text-purple-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors"
        >
          Learn More — $89
        </button>
      </div>
    );
  }

  // Get current step index for progress bar
  const currentStepIndex = activeReview
    ? STATUS_STEPS.indexOf(activeReview.status)
    : STATUS_STEPS.length;
  const progressPercent = activeReview
    ? Math.round(((currentStepIndex + 1) / STATUS_STEPS.length) * 100)
    : 100;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-purple-100 rounded-lg">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800">Expert Review</h3>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

      {activeReview && (
        <>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-purple-600">
                {STATUS_LABELS[activeReview.status]}
              </span>
              <span className="text-xs text-slate-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Upload resume */}
          {activeReview.status === 'pending_submission' && (
            <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center bg-purple-50/50">
              <svg className="w-10 h-10 text-purple-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-600 mb-3">Upload your current resume (PDF, max 10MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Choose PDF File'}
              </button>
            </div>
          )}

          {/* Questionnaire */}
          {activeReview.status === 'questionnaire_sent' && questionnaire?.questionnaire && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-2">
                Our expert has reviewed your resume and has a few questions:
              </p>
              {questionnaire.questionnaire.map((q: any, i: number) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {q.question}
                  </label>
                  {q.type === 'textarea' ? (
                    <textarea
                      value={answers[i] || ''}
                      onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your answer..."
                    />
                  ) : (
                    <input
                      type="text"
                      value={answers[i] || ''}
                      onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your answer..."
                    />
                  )}
                </div>
              ))}
              <button
                onClick={handleSubmitQuestionnaire}
                disabled={submitting}
                className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          )}

          {/* Waiting states */}
          {['submitted', 'in_review', 'questionnaire_completed', 'revision_in_progress'].includes(activeReview.status) && (
            <div className="text-center py-4">
              <div className="animate-pulse mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                {STATUS_LABELS[activeReview.status]}
              </p>
              <p className="text-xs text-slate-400 mt-1">We'll email you when there's an update.</p>
            </div>
          )}

          {/* Completed */}
          {activeReview.status === 'completed' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-3">Your expert resume is ready!</p>
              <button
                onClick={() => handleDownload(activeReview.id)}
                className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                Download Resume
              </button>
            </div>
          )}
        </>
      )}

      {/* Completed reviews download section */}
      {!activeReview && completedReviews.length > 0 && (
        <div className="space-y-2">
          {completedReviews.slice(0, 3).map(review => (
            <div key={review.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700">Expert Resume</p>
                <p className="text-xs text-slate-400">
                  {review.completed_at ? new Date(review.completed_at).toLocaleDateString('en-AU') : ''}
                </p>
              </div>
              <button
                onClick={() => handleDownload(review.id)}
                className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
              >
                Download
              </button>
            </div>
          ))}
          <button
            onClick={() => navigate('/expert-review')}
            className="w-full mt-2 bg-purple-50 text-purple-700 py-2 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
          >
            Order Another Review
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpertReviewWidget;
