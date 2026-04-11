
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ResumeData, Application, ResumeVersion } from '../types';
import { getLatestResume } from '../services/resumeService';
import { getApplications } from '../services/applicationService';
import { getVersions } from '../services/versionHistoryService';
import { hasPremium, getSubscription, getFreeTrialState, FREE_TIER_LIMITS } from '../services/premiumService';
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
} from './icons';

interface DashboardProps {
  setPage: (page: string) => void;
  openTailorModal: () => void;
}

/* ── Resume completion calculation ── */
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

/* ── Circular Progress Ring ── */
const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 54;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={radius * 2} height={radius * 2} className="-rotate-90">
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white">{percentage}%</span>
        <span className="text-[10px] text-white/70 font-medium">complete</span>
      </div>
    </div>
  );
};

/* ── Mini Line Chart (Applications) ── */
const MiniLineChart: React.FC = () => {
  const points = [
    { x: 0, y: 70 },
    { x: 20, y: 55 },
    { x: 40, y: 60 },
    { x: 60, y: 40 },
    { x: 80, y: 45 },
    { x: 100, y: 25 },
    { x: 120, y: 30 },
    { x: 140, y: 15 },
  ];

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const lastPoint = points[points.length - 1];

  return (
    <svg viewBox="0 0 150 80" className="w-full h-16 mt-2" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path
        d={`${pathD} L ${lastPoint.x} 80 L 0 80 Z`}
        fill="url(#chartGradient)"
      />
      <path
        d={pathD}
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="white" />
    </svg>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ setPage, openTailorModal }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    offers: applications.filter(a => a.status === 'Offered').length,
  };

  const { percentage: completionPct } = getCompletionSections(resumeData);

  /* ── Sidebar navigation items ── */
  const sidebarNav = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { label: 'My Resume', icon: 'resume', path: '/resume-builder' },
    { label: 'Resume Version', icon: 'version', path: '/versions' },
    { label: 'Job Search', icon: 'search', path: '/jobs' },
    { label: 'Applications', icon: 'applications', path: '/applications' },
    { label: 'Courses', icon: 'courses', path: '/courses' },
  ];

  const sidebarBottom = [
    { label: 'Settings', icon: 'settings', path: '/subscription' },
    { label: 'Profile', icon: 'profile', path: '/resume-builder' },
  ];

  const getSidebarIcon = (icon: string) => {
    switch (icon) {
      case 'dashboard':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        );
      case 'resume':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'version':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case 'search':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        );
      case 'applications':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        );
      case 'courses':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        );
      case 'settings':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'profile':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] bg-[#0f1628]">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex w-52 flex-col bg-[#141b2d] border-r border-white/5 p-4">
          <div className="animate-pulse space-y-3 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-9 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="animate-pulse space-y-5 max-w-6xl mx-auto">
            <div className="h-12 bg-white/5 rounded-xl w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="h-48 bg-white/5 rounded-2xl" />
              <div className="h-48 bg-white/5 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="h-52 bg-white/5 rounded-2xl" />
              <div className="h-52 bg-white/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0f1628]">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-52 flex-col bg-[#141b2d] border-r border-white/5">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              CH
            </div>
            <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
              Career Hub <span className="text-indigo-400">AI</span>
            </span>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarNav.map(item => {
            const isActive = item.path === '/dashboard';
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {getSidebarIcon(item.icon)}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          {sidebarBottom.map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {getSidebarIcon(item.icon)}
              {item.label}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
            >
              <CogIcon className="w-5 h-5" />
              Admin Panel
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">

          {/* ── Premium / Free Banner ── */}
          {isPremium && !bannerDismissed && (
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-xl px-5 py-3.5 flex items-center justify-between shadow-lg">
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                {premiumPlan} Premium Subscription
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManageSubscription}
                  disabled={isLoadingPortal}
                  className="text-xs font-bold text-indigo-900 bg-white rounded-full px-4 py-1.5 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  {isLoadingPortal ? 'Opening...' : 'Manage Subscription'}
                </button>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {!isPremium && trialState && (
            <div className="bg-[#1a2238] rounded-xl px-5 py-3 flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Free Plan</span>
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
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
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
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 flex-shrink-0"
              >
                Upgrade <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          )}

          {/* ── Command Centre Heading ── */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Command Centre</h1>

          {/* ── Row 1: Intelligence Tools + Career Toolkit ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Intelligence Tools */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[#2a1f5e] via-[#3b2d7a] to-[#4a3094] shadow-lg relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
              <h2 className="text-lg font-bold text-white mb-4 relative z-10">Intelligence Tools</h2>
              <div className="space-y-3 relative z-10">
                <button
                  onClick={() => navigate('/skill-gap')}
                  className="w-full flex items-start gap-4 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-xl p-4 text-left transition-all group"
                >
                  <div className="p-2 bg-white/15 rounded-lg flex-shrink-0 mt-0.5">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">Skill Gap Audit</h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Analyze your skills against job market demands to identify areas for improvement.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/selection-criteria')}
                  className="w-full flex items-start gap-4 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-xl p-4 text-left transition-all group"
                >
                  <div className="p-2 bg-white/15 rounded-lg flex-shrink-0 mt-0.5">
                    <StarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">Selection Criteria</h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Generate tailored responses for job selection criteria based on your experience and skills.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Career Toolkit */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[#6b2fa0] via-[#9b3d8a] to-[#d4556b] shadow-lg relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl" />
              <h2 className="text-lg font-bold text-white mb-4 relative z-10">Career Toolkit</h2>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <button
                  onClick={() => navigate('/resume-analysis')}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
                >
                  <span className="text-sm font-semibold text-white flex-1">Resume Analyser</span>
                  <DocumentChartBarIcon className="w-5 h-5 text-white/60 flex-shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/resume-builder')}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
                >
                  <span className="text-sm font-semibold text-white flex-1">Edit my Resume</span>
                  <DocumentTextIcon className="w-5 h-5 text-white/60 flex-shrink-0" />
                </button>

                <button
                  onClick={openTailorModal}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
                >
                  <span className="text-sm font-semibold text-white flex-1">Tailor for a job</span>
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-white/60 flex-shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/cover-letter')}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
                >
                  <span className="text-sm font-semibold text-white flex-1">Generate cover letter</span>
                  <EnvelopeIcon className="w-5 h-5 text-white/60 flex-shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Row 2: Resume Progress + Applications Summary ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Resume Progress */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[#1e3a6e] via-[#264a8a] to-[#3060a8] shadow-lg relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-400/15 rounded-full blur-3xl" />
              <h2 className="text-lg font-bold text-white mb-4 relative z-10">Resume Progress</h2>
              <div className="flex items-center gap-6 relative z-10">
                <CircularProgress percentage={completionPct} />
                <div className="flex-1">
                  <p className="text-sm text-white/80 leading-relaxed mb-4">
                    {completionPct === 100
                      ? 'Your resume is complete and ready to go.'
                      : completionPct >= 80
                        ? 'Your resume is nearly ready. Add a few more details to maximize your visibility.'
                        : completionPct > 0
                          ? 'Continue building your resume to unlock all features.'
                          : 'Start building your resume to get personalised insights.'}
                  </p>
                  <button
                    onClick={() => navigate('/resume-builder')}
                    className="inline-flex items-center px-4 py-2 bg-white text-slate-800 text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-sm"
                  >
                    View Resume
                  </button>
                </div>
              </div>
            </div>

            {/* Applications Summary */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[#1a5c5c] via-[#1f7070] to-[#258585] shadow-lg relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-400/15 rounded-full blur-3xl" />
              <h2 className="text-lg font-bold text-white mb-3 relative z-10">Applications Summary</h2>
              <div className="relative z-10">
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <p className="text-[11px] text-white/50 font-medium uppercase tracking-wider mb-1">Applied:</p>
                    <p className="text-3xl font-extrabold text-white">{applicationSummary.applied}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/50 font-medium uppercase tracking-wider mb-1">Interviews:</p>
                    <p className="text-3xl font-extrabold text-white">{applicationSummary.interviewing}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/50 font-medium uppercase tracking-wider mb-1">Offers:</p>
                    <p className="text-3xl font-extrabold text-white">{applicationSummary.offers}</p>
                  </div>
                </div>

                <MiniLineChart />

                <button
                  onClick={() => navigate('/applications')}
                  className="mt-3 inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg transition-colors border border-white/10"
                >
                  Track Applications
                </button>
              </div>
            </div>
          </div>

          {/* ── Row 3: Expert Resume Review Banner ── */}
          <div className="rounded-2xl bg-[#1a2238] border border-white/5 px-6 py-5 flex items-center justify-between shadow-lg">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Expert Resume Review</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Get personalized feedback from professional resume writers to boost your job search success.
              </p>
            </div>
            <button
              onClick={() => navigate('/expert-review')}
              className="flex-shrink-0 ml-4 px-5 py-2.5 bg-white text-slate-800 text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-sm"
            >
              Get Expert Feedback
            </button>
          </div>

          {/* ── Mobile Navigation (visible on smaller screens) ── */}
          <div className="lg:hidden rounded-2xl bg-[#1a2238] border border-white/5 p-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Quick Navigation</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[...sidebarNav.slice(1), ...sidebarBottom].map(item => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                  {getSidebarIcon(item.icon)}
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
