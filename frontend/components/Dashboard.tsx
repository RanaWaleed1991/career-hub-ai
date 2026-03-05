
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeData, Application } from '../types';
import ProgressTracker from './ProgressTracker';
import TrialStatus from './TrialStatus';
import { getLatestResume } from '../services/resumeService';
import { getApplications } from '../services/applicationService';
import { getVersions } from '../services/versionHistoryService';
import { hasPremium } from '../services/premiumService';
import { createPortalSession } from '../src/services/payments';
import { getAccessToken } from '../services/userService';
import { useAuth } from '../src/contexts/AuthContext';
import ExpertReviewWidget from './ExpertReviewWidget';
import {
  BookOpenIcon,
  BriefcaseIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ClipboardDocumentCheckIcon,
  CogIcon,
  ChartBarIcon,
  StarIcon,
} from './icons';

interface DashboardProps {
  setPage: (page: string) => void;
  openTailorModal: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setPage, openTailorModal }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [versionCount, setVersionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const resume = await getLatestResume();
        setResumeData(resume);

        const apps = await getApplications();
        setApplications(apps);

        const versions = await getVersions();
        setVersionCount(versions.length);

        const premium = await hasPremium();
        setIsPremium(premium);
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
      if (!token) {
        alert('Please log in to manage your subscription');
        return;
      }
      const { portalUrl } = await createPortalSession(token);
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      alert('Failed to open subscription management. Please try again.');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const applicationSummary = {
    applied: applications.filter(a => a.status === 'Applied').length,
    interviewing: applications.filter(a => a.status === 'Interviewing').length,
  };

  // Secondary toolkit actions
  const toolkitActions = [
    { title: 'Edit My Resume', path: '/resume-builder', icon: DocumentTextIcon },
    { title: 'Tailor for a Job', action: openTailorModal, icon: ClipboardDocumentCheckIcon },
    { title: 'Generate Cover Letter', path: '/cover-letter', icon: EnvelopeIcon },
    { title: 'Resume Analyser', path: '/resume-analysis', icon: DocumentChartBarIcon },
    { title: 'Find Jobs', path: '/jobs', icon: BriefcaseIcon },
    { title: 'Explore Courses', path: '/courses', icon: BookOpenIcon },
    ...(isAdmin ? [{ title: 'Admin Panel', path: '/admin', icon: CogIcon }] : []),
  ];

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full overflow-y-auto">
      {/* Page title */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Command Centre</h2>
        <p className="text-slate-500 text-sm mt-1">Your AI-powered career intelligence hub.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Resume progress */}
          {resumeData && (
            <div className="opacity-0 slide-in-up" style={{ animationDelay: '100ms' }}>
              <ProgressTracker data={resumeData} />
            </div>
          )}

          {/* ── Intelligence Tools (primary) ── */}
          <div className="opacity-0 slide-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Intelligence Tools</h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1">
                Powered by Gemini
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Skill Gap Audit — featured card */}
              <button
                onClick={() => navigate('/skill-gap')}
                className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full flex flex-col group"
              >
                <div className="p-2.5 bg-white/20 rounded-xl inline-flex mb-4">
                  <ChartBarIcon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Skill Gap Audit</h4>
                <p className="text-sm text-indigo-200 leading-snug">
                  Match your resume to any job. Get a score, see gaps, and get a roadmap to close them.
                </p>
                <span className="mt-4 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                  Run an audit &rarr;
                </span>
              </button>

              {/* Selection Criteria — featured card */}
              <button
                onClick={() => navigate('/selection-criteria')}
                className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full flex flex-col group"
              >
                <div className="p-2.5 bg-white/20 rounded-xl inline-flex mb-4">
                  <StarIcon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Selection Criteria</h4>
                <p className="text-sm text-slate-300 leading-snug">
                  Auto-generate evidence-based STAR responses for government &amp; corporate applications.
                </p>
                <span className="mt-4 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                  Generate now &rarr;
                </span>
              </button>
            </div>
          </div>

          {/* ── Career Toolkit (secondary) ── */}
          <div className="opacity-0 slide-in-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Your Career Toolkit</h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
              {toolkitActions.map(action => (
                <button
                  key={action.title}
                  onClick={() => action.path ? navigate(action.path) : action.action?.()}
                  className="w-full flex items-center px-4 py-3 hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-500 mr-4 flex-shrink-0">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-700 text-sm">{action.title}</span>
                  <span className="ml-auto text-slate-400 text-sm">&rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Credit / plan status */}
          <TrialStatus />

          {/* Expert Review Widget */}
          <div className="opacity-0 slide-in-up" style={{ animationDelay: '300ms' }}>
            <ExpertReviewWidget />
          </div>

          {/* Manage subscription */}
          {isPremium && (
            <div className="opacity-0 slide-in-up" style={{ animationDelay: '350ms' }}>
              <button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                className="w-full bg-white p-4 rounded-xl shadow-sm border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3 text-indigo-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <CogIcon className="w-5 h-5" />
                {isLoadingPortal ? 'Opening...' : 'Manage Subscription'}
              </button>
            </div>
          )}

          {/* Application summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-base font-semibold text-slate-800 mb-4">Application Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Active Applications</span>
                <span className="font-bold text-slate-800 text-lg">{applicationSummary.applied}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Interviews</span>
                <span className="font-bold text-slate-800 text-lg">{applicationSummary.interviewing}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/applications')}
              className="mt-4 w-full text-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              View Full Tracker
            </button>
          </div>

          {/* Resume versions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: '500ms' }}>
            <h3 className="text-base font-semibold text-slate-800 mb-4">Resume Versions</h3>
            <div className="text-center py-2">
              <div className="text-4xl font-bold text-indigo-600 mb-1">{versionCount}</div>
              <p className="text-slate-500 text-sm">
                {versionCount === 0 ? 'No versions saved yet' : versionCount === 1 ? 'Version saved' : 'Versions saved'}
              </p>
              <p className="text-slate-400 text-xs mt-1">Free tier: up to 3 versions</p>
            </div>
            <button
              onClick={() => navigate('/versions')}
              className="mt-4 w-full text-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Manage Versions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
