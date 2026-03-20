
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeData, Application, ResumeVersion } from '../types';
import { getLatestResume } from '../services/resumeService';
import { getApplications } from '../services/applicationService';
import { getVersions } from '../services/versionHistoryService';
import { hasPremium, getSubscription, getFreeTrialState } from '../services/premiumService';
import { createPortalSession } from '../src/services/payments';
import { getAccessToken } from '../services/userService';
import { useAuth } from '../src/contexts/AuthContext';
import ExpertReviewWidget from './ExpertReviewWidget';
import {
  DocumentChartBarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ClipboardDocumentCheckIcon,
  CogIcon,
  ChartBarIcon,
  StarIcon,
  DownloadIcon,
  CheckCircleIcon,
} from './icons';

interface DashboardProps {
  setPage: (page: string) => void;
  openTailorModal: () => void;
}

/* ── Resume completion calculation (reused from ProgressTracker logic) ── */
function getCompletionSections(data: ResumeData | null) {
  if (!data) return { sections: [], percentage: 0 };

  const sections = [
    {
      label: 'Personal Details',
      done: !!(data.personalDetails?.fullName && data.personalDetails?.jobTitle && data.personalDetails?.email),
    },
    { label: 'Summary', done: (data.summary?.length ?? 0) > 0 },
    { label: 'Experience', done: (data.experience?.length ?? 0) > 0 },
    { label: 'Education', done: (data.education?.length ?? 0) > 0 },
    {
      label: 'Skills',
      done: (data.skills?.length ?? 0) > 0 && data.skills.some(s => s.name?.trim()),
    },
  ];

  const completed = sections.filter(s => s.done).length;
  const percentage = Math.round((completed / sections.length) * 100);
  return { sections, percentage };
}

const Dashboard: React.FC<DashboardProps> = ({ setPage, openTailorModal }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState('');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [trialState, setTrialState] = useState<any>(null);
  const [hasActiveReview, setHasActiveReview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [resume, apps, vers, premium] = await Promise.all([
          getLatestResume().catch(() => null),
          getApplications().catch(() => []),
          getVersions().catch(() => []),
          hasPremium().catch(() => false),
        ]);

        setResumeData(resume);
        setApplications(apps);
        setVersions(vers);
        setIsPremium(premium);

        if (premium) {
          const sub = await getSubscription().catch(() => null);
          if (sub) setPremiumPlan(sub.plan === 'weekly' ? 'Weekly' : 'Monthly');
        } else {
          const state = await getFreeTrialState().catch(() => null);
          setTrialState(state);
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleManageSubscription = async () => {
    try {
      setIsLoadingPortal(true);
      const token = await getAccessToken();
      if (!token) return;
      const { portalUrl } = await createPortalSession(token);
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const applicationSummary = {
    applied: applications.filter(a => a.status === 'Applied').length,
    interviewing: applications.filter(a => a.status === 'Interviewing').length,
  };

  const { sections: completionSections, percentage: completionPct } = getCompletionSections(resumeData);
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  const toolkitActions = [
    { title: 'Resume Analyser', path: '/resume-analysis', icon: DocumentChartBarIcon },
    { title: 'Edit my Resume', path: '/resume-builder', icon: DocumentTextIcon },
    { title: 'Tailor for a Job', action: openTailorModal, icon: ClipboardDocumentCheckIcon },
    { title: 'Generate Cover Letter', path: '/cover-letter', icon: EnvelopeIcon },
  ];

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 bg-slate-50 min-h-full flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-12 bg-slate-200 rounded-xl w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-slate-200 rounded-xl" />
            <div className="h-40 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-32 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Premium Banner ── */}
        {isPremium && !bannerDismissed && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-5 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-white">
                <span className="font-bold">{premiumPlan} Premium Active:</span>{' '}
                Your account is currently prioritized for AI processing.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                className="text-xs font-bold text-indigo-600 bg-white rounded-full px-4 py-1.5 hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {isLoadingPortal ? 'Opening...' : 'Manage'}
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Free Credits Bar ── */}
        {!isPremium && trialState && (
          <div className="bg-white rounded-xl border border-slate-200 px-5 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Free Plan</span>
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { label: 'Downloads', count: trialState.resumeDownloads, limit: 3 },
                  { label: 'Analyses', count: trialState.resumeAnalyses, limit: 3 },
                  { label: 'Letters', count: trialState.coverLetters, limit: 3 },
                ].map(item => {
                  const isLow = item.count <= 1;
                  return (
                    <span
                      key={item.label}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 ${
                        isLow
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {item.count}/{item.limit} {item.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 flex-shrink-0"
            >
              Upgrade <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        )}

        {/* ── Row 1: Command Centre + Career Toolkit ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Command Centre */}
          <div className="md:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2">Command Centre</h2>
            <p className="text-slate-500 text-sm">
              Welcome back, {firstName}!{' '}
              {completionPct === 100
                ? 'Your resume is complete and ready to go.'
                : completionPct > 0
                  ? 'Continue building your resume to unlock all features.'
                  : 'Start building your resume to get personalised insights.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg px-3 py-1.5 hover:bg-slate-200 transition-colors"
              >
                <CogIcon className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}
          </div>

          {/* Career Toolkit */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 px-5 pt-5 pb-3">Career Toolkit</h3>
            <div className="divide-y divide-slate-100">
              {toolkitActions.map(action => (
                <button
                  key={action.title}
                  onClick={() => action.path ? navigate(action.path) : action.action?.()}
                  className="w-full flex items-center px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500 mr-3 flex-shrink-0">
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">{action.title}</span>
                  <svg className="w-4 h-4 ml-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Resume Completion Stepper ── */}
        {resumeData && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800">Resume Completion</h3>
              <span className="text-lg font-extrabold text-indigo-600">{completionPct}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>

            {/* Connected dot stepper */}
            <div className="flex items-start justify-between relative">
              {/* Connecting line */}
              <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-slate-200" />
              <div
                className="absolute top-4 left-[10%] h-0.5 bg-indigo-500 transition-all duration-700"
                style={{
                  width: `${Math.max(0, ((completionSections.filter(s => s.done).length - 1) / (completionSections.length - 1)) * 80)}%`,
                }}
              />

              {completionSections.map((section, i) => (
                <div key={section.label} className="flex flex-col items-center relative z-10" style={{ width: '20%' }}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      section.done
                        ? 'bg-indigo-600'
                        : 'bg-white border-2 border-slate-300'
                    }`}
                  >
                    {section.done ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-[11px] mt-2 text-center leading-tight ${
                    section.done ? 'font-semibold text-slate-700' : 'text-slate-400'
                  }`}>
                    {section.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Row 3: Intelligence Tools + Applications ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Intelligence Tools */}
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-3">Intelligence Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/skill-gap')}
                className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="p-2 bg-indigo-50 rounded-lg inline-flex mb-3">
                  <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Skill Gap Audit</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Match your resume against any job and find gaps in your skill set.
                </p>
              </button>

              <button
                onClick={() => navigate('/selection-criteria')}
                className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="p-2 bg-slate-100 rounded-lg inline-flex mb-3">
                  <StarIcon className="w-5 h-5 text-slate-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Selection Criteria</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generate STAR-method responses for government and corporate roles.
                </p>
              </button>
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800">Applications</h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Status
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="text-center py-2">
                <p className="text-3xl font-extrabold text-slate-800">{applicationSummary.applied}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Active Apps</p>
              </div>
              <div className="text-center py-2 border-l border-slate-100">
                <p className="text-3xl font-extrabold text-slate-800">{applicationSummary.interviewing}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Interview</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/applications')}
              className="w-full text-center px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              View Full Tracker
            </button>
          </div>
        </div>

        {/* ── Row 4: Expert Review + Resume Versions ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expert Resume Review */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {hasActiveReview ? (
              <ExpertReviewWidget />
            ) : (
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Expert Resume Review</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Get your resume professionally rewritten by a certified career specialist. Includes 30 days Premium access.
                </p>
                <div className="space-y-2.5">
                  <button
                    onClick={() => navigate('/expert-review')}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    Learn More
                  </button>
                  <button
                    onClick={() => navigate('/expert-review')}
                    className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Book a Review
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resume Versions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Resume Versions</h3>
            {versions.length > 0 ? (
              <div className="space-y-3 mb-5">
                {versions.slice(0, 3).map((version, i) => (
                  <div key={version.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{version.name}</p>
                      <p className="text-xs text-slate-400">V{versions.length - i}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/versions')}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => navigate('/versions')}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Download"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 mb-4">
                <p className="text-sm text-slate-400">No versions saved yet</p>
                <p className="text-xs text-slate-300 mt-1">Save resume versions to track changes</p>
              </div>
            )}
            <button
              onClick={() => navigate('/versions')}
              className="w-full text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {versions.length > 0 ? 'Manage Versions' : 'Create New'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
