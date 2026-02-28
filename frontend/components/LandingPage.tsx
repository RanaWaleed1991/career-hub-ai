
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Page } from '../types';
import {
  DocumentTextIcon,
  BriefcaseIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  StarIcon,
  FacebookIcon,
} from './icons';
import TailorResumeModal from './TailorResumeModal';

interface LandingPageProps {
  setPage: (page: Page) => void;
  triggerPremiumFlow: () => void;
  setActionToRetry: (action: (() => void) | null) => void;
  openTailorModal: () => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

// ── Feature definitions ────────────────────────────────────────────────────

const intelligenceFeatures = [
  {
    path: '/skill-gap',
    title: 'Skill Gap Audit',
    description: 'Match your resume to any job, identify missing skills, and get a prioritised roadmap to close the gap.',
    icon: ChartBarIcon,
    badge: 'Intelligence',
  },
  {
    path: '/selection-criteria',
    title: 'Selection Criteria Generator',
    description: 'Auto-generate STAR-format responses for every criterion in a government or corporate job description.',
    icon: StarIcon,
    badge: 'Intelligence',
  },
  {
    path: '/resume-analysis',
    title: 'Resume Analyser',
    description: 'Get an instant ATS compatibility score, section-by-section feedback, and recruiter-ready improvements.',
    icon: DocumentChartBarIcon,
    badge: 'Intelligence',
  },
];

const writingFeatures = [
  {
    path: '/resume-builder',
    title: 'AI Resume Builder',
    description: 'Build a standout resume with AI-powered content enhancement and six professional templates.',
    icon: DocumentTextIcon,
  },
  {
    path: 'tailor',
    title: 'Tailor for a Job',
    description: 'Rewrite your resume in seconds to match a specific job description and beat ATS filters.',
    icon: ClipboardDocumentCheckIcon,
  },
  {
    path: '/cover-letter',
    title: 'Cover Letter Builder',
    description: 'Generate a personalised, job-specific cover letter based on your resume and role requirements.',
    icon: EnvelopeIcon,
  },
];

const resourceFeatures = [
  {
    path: '/jobs',
    title: 'Find Jobs',
    description: 'Browse curated listings across technology, healthcare, accounting, and government sectors.',
    icon: BriefcaseIcon,
  },
  {
    path: '/courses',
    title: 'Explore Courses',
    description: 'Discover recommended free and paid courses to upskill and boost your qualifications.',
    icon: BookOpenIcon,
  },
  {
    path: '/blogs',
    title: 'Career Blog',
    description: 'Expert tips on resumes, interviews, job search strategy, and navigating today\'s market.',
    icon: BookOpenIcon,
  },
];

// ── Popular Roles ──────────────────────────────────────────────────────────

const popularRoles = [
  {
    sector: 'Technology',
    highlight: 'Skill Gap Audit',
    description: 'See exactly which cloud, DevOps, or AI skills are missing from your profile.',
    path: '/skill-gap',
    tags: ['Software Engineer', 'Data Analyst', 'DevOps', 'Cybersecurity'],
  },
  {
    sector: 'Government',
    highlight: 'Selection Criteria',
    description: 'APS and local government roles require formal selection criteria. We generate STAR responses automatically.',
    path: '/selection-criteria',
    tags: ['APS 4–6', 'Policy Officer', 'Project Manager', 'Administration'],
  },
  {
    sector: 'Healthcare',
    highlight: 'Resume Analyser',
    description: 'Healthcare ATS systems are strict. Score your resume and fix compliance gaps before you apply.',
    path: '/resume-analysis',
    tags: ['Registered Nurse', 'Allied Health', 'Medical Admin', 'Aged Care'],
  },
  {
    sector: 'Finance',
    highlight: 'Tailor for a Job',
    description: 'Tailor your resume for each role and ensure your credentials and metrics stand out.',
    path: '/tailor',
    tags: ['Accountant', 'Financial Analyst', 'CPA', 'Audit & Compliance'],
  },
];

// ── Components ─────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left w-full flex flex-col"
    >
      {badge && (
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3">
          {badge}
        </span>
      )}
      <div className="p-2.5 bg-slate-100 rounded-lg inline-flex mb-4">
        <Icon className="w-5 h-5 text-slate-700" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 flex-grow leading-relaxed">{description}</p>
      <span className="mt-4 text-sm font-semibold text-indigo-600">Get started &rarr;</span>
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const LandingPage: React.FC<LandingPageProps> = ({
  setPage,
  triggerPremiumFlow,
  setActionToRetry,
  openTailorModal,
  isAuthenticated = false,
  isAdmin = false,
}) => {
  const navigate = useNavigate();

  const handleFeatureClick = (path: string) => {
    if (path === 'tailor') {
      openTailorModal();
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-white overflow-y-auto">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6 border border-indigo-800 rounded-full px-4 py-1.5 bg-indigo-900/50">
            Powered by Google Gemini
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 opacity-0 fade-in" style={{ animationDelay: '100ms' }}>
            The Intelligent Edge<br />
            <span className="text-indigo-400">for Your Next Career Move.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto opacity-0 fade-in" style={{ animationDelay: '300ms' }}>
            AI-powered tools that go beyond templates — from skill gap analysis and selection criteria to resume tailoring and ATS scoring.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 fade-in" style={{ animationDelay: '500ms' }}>
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/resume-builder')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg transition-all hover:scale-105 text-base"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started — Free'}
            </button>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all hover:scale-105 text-base"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 opacity-0 fade-in" style={{ animationDelay: '700ms' }}>
            {['ATS-Friendly', 'Professional', 'Government-Ready', 'AI-Powered'].map(badge => (
              <span key={badge} className="flex items-center gap-2 text-sm text-slate-400">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Intelligence Tools ── */}
      <div className="bg-slate-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">New in 2026</p>
            <h2 className="text-3xl font-bold text-slate-800">Career Intelligence Suite</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Tools that analyse, advise, and respond — not just format.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {intelligenceFeatures.map(f => (
              <FeatureCard
                key={f.path}
                icon={f.icon}
                title={f.title}
                description={f.description}
                badge={f.badge}
                onClick={() => handleFeatureClick(f.path)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Most Popular Roles ── */}
      <div className="bg-white py-16 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800">Built for Your Industry</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Specific tools for specific sectors — not generic advice.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {popularRoles.map(role => (
              <button
                key={role.sector}
                type="button"
                onClick={() => handleFeatureClick(role.path)}
                className="text-left p-6 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-800">{role.sector}</h3>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1">
                    {role.highlight}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{role.description}</p>
                <div className="flex flex-wrap gap-2">
                  {role.tags.map(tag => (
                    <span key={tag} className="text-xs text-slate-600 bg-slate-100 rounded-full px-2.5 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Writing Tools ── */}
      <div className="bg-slate-50 py-16 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800">Writing Tools</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Build, tailor, and send — your full application toolkit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {writingFeatures.map(f => (
              <FeatureCard
                key={f.path}
                icon={f.icon}
                title={f.title}
                description={f.description}
                onClick={() => handleFeatureClick(f.path)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Resources ── */}
      <div className="bg-white py-16 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800">Resources</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Jobs, courses, and expert guidance — all in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resourceFeatures.map(f => (
              <FeatureCard
                key={f.path}
                icon={f.icon}
                title={f.title}
                description={f.description}
                onClick={() => handleFeatureClick(f.path)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="bg-indigo-600 py-14 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to get the edge?</h2>
        <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
          Start free. No credit card required. Three analyses, three cover letters, three downloads — on us.
        </p>
        <button
          type="button"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/resume-builder')}
          className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-lg shadow-lg hover:bg-slate-50 transition-all hover:scale-105 text-base"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'}
        </button>
      </div>

      {/* ── Footer ── */}
      <footer className="w-full bg-slate-900 text-slate-400 py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Career Hub AI</span>
              <span className="text-xs text-indigo-400 border border-indigo-700 rounded px-1.5 py-0.5 bg-indigo-900/50">
                Gemini
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="https://www.facebook.com/profile.php?id=61584777962745"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
                aria-label="Follow us on Facebook"
              >
                <FacebookIcon className="w-5 h-5 text-[#1877F2]" />
                Facebook
              </a>
              <a
                href="/privacy"
                onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}
                className="hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="/terms"
                onClick={(e) => { e.preventDefault(); navigate('/terms'); }}
                className="hover:text-white transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
          <div className="text-center mt-6 text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Career Hub AI. All rights reserved. &middot; Made in Australia
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
