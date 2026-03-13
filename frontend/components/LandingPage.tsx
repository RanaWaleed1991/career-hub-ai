
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Page } from '../types';
import {
  DocumentTextIcon,
  BriefcaseIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  EnvelopeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  StarIcon,
  FacebookIcon,
} from './icons';

interface LandingPageProps {
  setPage: (page: Page) => void;
  triggerPremiumFlow: () => void;
  setActionToRetry: (action: (() => void) | null) => void;
  openTailorModal: () => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}

// ── Animated ATS Score Ring ─────────────────────────────────────────────────

function ATSScoreRing({ score = 85 }: { score?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let current = 0;
    const step = score / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= score) { setAnimatedScore(score); clearInterval(timer); }
      else setAnimatedScore(Math.round(current));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, score]);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = animatedScore >= 80 ? '#10b981' : animatedScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-800">{animatedScore}</span>
          <span className="text-xs text-slate-500 font-medium">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-700 mt-3">ATS Score</p>
    </div>
  );
}

// ── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(current);
    }, 30);
    return () => clearInterval(timer);
  }, [isVisible, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Feature Card (Upgraded) ─────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
  gradient,
  iconColor,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
  gradient: string;
  iconColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1.5 hover:border-indigo-200 transition-all duration-300 text-left w-full flex flex-col relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none">
        <Icon className="w-full h-full" />
      </div>
      {badge && (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-3 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          {badge}
        </span>
      )}
      <div className={`p-3 rounded-xl inline-flex mb-4 ${gradient}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 flex-grow leading-relaxed">{description}</p>
      <span className="mt-4 text-sm font-semibold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
        Try it free <span aria-hidden="true">&rarr;</span>
      </span>
    </button>
  );
}

// ── How It Works Step ───────────────────────────────────────────────────────

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-200 mb-4 group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{description}</p>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

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
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 mb-6 border border-indigo-700/50 rounded-full px-4 py-1.5 bg-indigo-900/40 opacity-0 fade-in" style={{ animationDelay: '100ms' }}>
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Powered by Google Gemini AI
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 opacity-0 fade-in leading-[1.1]" style={{ animationDelay: '200ms' }}>
                Land Your Dream Job<br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">with AI on Your Side.</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-lg opacity-0 fade-in leading-relaxed" style={{ animationDelay: '400ms' }}>
                Build ATS-ready resumes, generate cover letters, audit your skills, and tailor every application — all powered by AI that understands recruiters.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 opacity-0 fade-in" style={{ animationDelay: '600ms' }}>
                <button
                  type="button"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/resume-builder')}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-600/30 text-base"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Building — Free'}
                </button>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all hover:scale-105 text-base backdrop-blur-sm"
                  >
                    Sign In
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-4 opacity-0 fade-in" style={{ animationDelay: '700ms' }}>
                No credit card required. 3 free analyses, cover letters &amp; downloads.
              </p>
            </div>

            {/* Right: Visual — Resume mockup with ATS score */}
            <div className="hidden md:flex justify-center opacity-0 fade-in" style={{ animationDelay: '500ms' }}>
              <div className="relative">
                {/* Resume mockup */}
                <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-6 w-72 text-slate-800 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full" />
                      <div>
                        <div className="h-3 w-24 bg-slate-800 rounded" />
                        <div className="h-2 w-20 bg-slate-300 rounded mt-1.5" />
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded" />
                    <div className="h-2 w-5/6 bg-slate-100 rounded" />
                    <div className="h-2 w-4/6 bg-slate-100 rounded" />
                    <div className="border-t border-slate-100 my-3" />
                    <div className="h-2.5 w-20 bg-indigo-100 rounded" />
                    <div className="h-2 w-full bg-slate-100 rounded" />
                    <div className="h-2 w-5/6 bg-slate-100 rounded" />
                    <div className="h-2 w-3/6 bg-slate-100 rounded" />
                    <div className="border-t border-slate-100 my-3" />
                    <div className="h-2.5 w-16 bg-indigo-100 rounded" />
                    <div className="h-2 w-full bg-slate-100 rounded" />
                    <div className="h-2 w-4/6 bg-slate-100 rounded" />
                  </div>
                </div>

                {/* Floating ATS badge */}
                <div className="absolute -top-4 -right-8 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2 border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600">ATS Score</p>
                    <p className="text-lg font-extrabold text-slate-800">92<span className="text-xs font-normal text-slate-400">/100</span></p>
                  </div>
                </div>

                {/* Floating AI enhance badge */}
                <div className="absolute -bottom-2 -left-12 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2 border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-600">AI Enhanced</p>
                    <p className="text-[11px] text-slate-500">Content optimised</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Stats Bar ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 6, suffix: '', label: 'Professional Templates', icon: '🎨' },
              { value: 9, suffix: '', label: 'AI-Powered Tools', icon: '🤖' },
              { value: 3, suffix: '', label: 'Free Analyses', icon: '📊' },
              { value: 0, suffix: '', label: 'Credit Card Required', icon: '💳' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-2xl" role="img" aria-hidden="true">{stat.icon}</span>
                <div>
                  <p className="text-xl font-extrabold text-slate-800">
                    {stat.value === 0 ? 'No' : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Core Writing Tools (Most Understandable — Show First) ── */}
      <div className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Your Application Toolkit</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              Build, Tailor &amp; Send —<br className="hidden sm:block" /> All in One Place
            </h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
              From your first draft to your final application, our AI writing tools handle the heavy lifting so you can focus on what matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={DocumentTextIcon}
              title="AI Resume Builder"
              description="Pick from 6 professional templates and let AI enhance your content section by section. ATS-optimised from the start."
              onClick={() => handleFeatureClick('/resume-builder')}
              gradient="bg-gradient-to-br from-blue-50 to-blue-100"
              iconColor="text-blue-600"
            />
            <FeatureCard
              icon={ClipboardDocumentCheckIcon}
              title="Tailor for Any Job"
              description="Paste a job description and watch AI rewrite your resume to match — beating ATS filters in seconds, not hours."
              onClick={() => handleFeatureClick('tailor')}
              gradient="bg-gradient-to-br from-emerald-50 to-emerald-100"
              iconColor="text-emerald-600"
            />
            <FeatureCard
              icon={EnvelopeIcon}
              title="Cover Letter Generator"
              description="Generate a personalised, job-specific cover letter from your resume and role requirements. No more blank-page anxiety."
              onClick={() => handleFeatureClick('/cover-letter')}
              gradient="bg-gradient-to-br from-purple-50 to-purple-100"
              iconColor="text-purple-600"
            />
          </div>
        </div>
      </div>

      {/* ── Interactive ATS Score Demo ── */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 py-20 px-6 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">See Your Score Instantly</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4">
                Is Your Resume<br />ATS-Ready?
              </h2>
              <p className="text-slate-500 mb-6 leading-relaxed text-lg">
                Most resumes are rejected before a human ever sees them. Our AI analyses your resume against real ATS algorithms and gives you an instant score with actionable feedback.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Section-by-section scoring and feedback',
                  'Keyword optimisation recommendations',
                  'Formatting and compliance checks',
                  'Recruiter readability assessment',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate('/resume-analysis')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-105 text-sm"
              >
                Analyse My Resume — Free
              </button>
            </div>
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-sm">
                <ATSScoreRing score={85} />
                <div className="mt-6 space-y-3">
                  {[
                    { label: 'Content Quality', score: 90, color: 'bg-emerald-500' },
                    { label: 'ATS Compatibility', score: 85, color: 'bg-blue-500' },
                    { label: 'Keyword Match', score: 78, color: 'bg-amber-500' },
                    { label: 'Formatting', score: 92, color: 'bg-indigo-500' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">{item.label}</span>
                        <span className="font-bold text-slate-700">{item.score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Career Intelligence Suite ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4 border border-indigo-700/50 rounded-full px-4 py-1.5 bg-indigo-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              New in 2026
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Career Intelligence Suite
            </h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
              Go beyond templates. These AI tools analyse, advise, and respond — giving you a strategic advantage most candidates don't have.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                path: '/skill-gap',
                title: 'Skill Gap Audit',
                description: 'Match your resume to any job description. Get a match score, discover missing skills, and receive a prioritised action plan to close the gap.',
                icon: ChartBarIcon,
                gradient: 'from-emerald-500/20 to-emerald-600/10',
                iconColor: 'text-emerald-400',
                borderColor: 'hover:border-emerald-500/30',
              },
              {
                path: '/selection-criteria',
                title: 'Selection Criteria Generator',
                description: 'Auto-generate STAR-format responses for every essential and desirable criterion in government and corporate job descriptions.',
                icon: StarIcon,
                gradient: 'from-amber-500/20 to-amber-600/10',
                iconColor: 'text-amber-400',
                borderColor: 'hover:border-amber-500/30',
              },
              {
                path: '/resume-analysis',
                title: 'ATS Resume Analyser',
                description: 'Get an instant ATS compatibility score with section-by-section feedback and recruiter-ready improvement suggestions.',
                icon: DocumentChartBarIcon,
                gradient: 'from-blue-500/20 to-blue-600/10',
                iconColor: 'text-blue-400',
                borderColor: 'hover:border-blue-500/30',
              },
            ].map((f) => (
              <button
                key={f.path}
                type="button"
                onClick={() => handleFeatureClick(f.path)}
                className={`group bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 ${f.borderColor} hover:bg-white/10 transition-all duration-300 text-left w-full flex flex-col hover:-translate-y-1`}
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Intelligence
                </span>
                <div className={`p-3 rounded-xl inline-flex mb-4 bg-gradient-to-br ${f.gradient}`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-400 flex-grow leading-relaxed">{f.description}</p>
                <span className="mt-4 text-sm font-semibold text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Try it free <span aria-hidden="true">&rarr;</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">How It Works</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg">
              Three steps. Five minutes. A job-ready application.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <StepCard
              number={1}
              title="Upload or Build"
              description="Upload your existing resume or start from scratch with our AI-powered builder and 6 professional templates."
            />
            <StepCard
              number={2}
              title="AI Enhances & Analyses"
              description="Our AI scores your resume, enhances your content, and identifies gaps — all tailored to your target role."
            />
            <StepCard
              number={3}
              title="Apply with Confidence"
              description="Download your ATS-optimised resume, generate a matching cover letter, and track your applications."
            />
          </div>
        </div>
      </div>

      {/* ── Built for Your Industry ── */}
      <div className="bg-slate-50 py-20 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">Built for Your Industry</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg">
              Specific tools for specific sectors — not generic advice.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                sector: 'Technology',
                highlight: 'Skill Gap Audit',
                description: 'See exactly which cloud, DevOps, or AI skills are missing from your profile and get a learning roadmap.',
                path: '/skill-gap',
                tags: ['Software Engineer', 'Data Analyst', 'DevOps', 'Cybersecurity'],
                emoji: '💻',
                accentColor: 'from-blue-500 to-blue-600',
              },
              {
                sector: 'Government',
                highlight: 'Selection Criteria',
                description: 'APS and local government roles require formal selection criteria. We generate STAR responses automatically.',
                path: '/selection-criteria',
                tags: ['APS 4–6', 'Policy Officer', 'Project Manager', 'Administration'],
                emoji: '🏛️',
                accentColor: 'from-emerald-500 to-emerald-600',
              },
              {
                sector: 'Healthcare',
                highlight: 'Resume Analyser',
                description: 'Healthcare ATS systems are strict. Score your resume and fix compliance gaps before you apply.',
                path: '/resume-analysis',
                tags: ['Registered Nurse', 'Allied Health', 'Medical Admin', 'Aged Care'],
                emoji: '🏥',
                accentColor: 'from-rose-500 to-rose-600',
              },
              {
                sector: 'Finance',
                highlight: 'Tailor for a Job',
                description: 'Tailor your resume for each role and ensure your credentials, metrics, and certifications stand out.',
                path: 'tailor',
                tags: ['Accountant', 'Financial Analyst', 'CPA', 'Audit & Compliance'],
                emoji: '📊',
                accentColor: 'from-amber-500 to-amber-600',
              },
            ].map((role) => (
              <button
                key={role.sector}
                type="button"
                onClick={() => handleFeatureClick(role.path)}
                className="text-left p-6 bg-white border border-slate-200/80 rounded-2xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-hidden="true">{role.emoji}</span>
                    <h3 className="font-bold text-slate-800 text-lg">{role.sector}</h3>
                  </div>
                  <span className={`text-xs font-bold text-white bg-gradient-to-r ${role.accentColor} rounded-full px-3 py-1 shadow-sm`}>
                    {role.highlight}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{role.description}</p>
                <div className="flex flex-wrap gap-2">
                  {role.tags.map((tag) => (
                    <span key={tag} className="text-xs text-slate-600 bg-slate-100 rounded-full px-3 py-1 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Resources ── */}
      <div className="bg-white py-20 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">Resources</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg">
              Jobs, courses, and expert guidance — all in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={BriefcaseIcon}
              title="Find Jobs"
              description="Browse curated listings across technology, healthcare, accounting, and government sectors."
              onClick={() => handleFeatureClick('/jobs')}
              gradient="bg-gradient-to-br from-orange-50 to-orange-100"
              iconColor="text-orange-600"
            />
            <FeatureCard
              icon={BookOpenIcon}
              title="Explore Courses"
              description="Discover recommended free and paid courses to upskill and boost your qualifications."
              onClick={() => handleFeatureClick('/courses')}
              gradient="bg-gradient-to-br from-cyan-50 to-cyan-100"
              iconColor="text-cyan-600"
            />
            <FeatureCard
              icon={BookOpenIcon}
              title="Career Blog"
              description="Expert tips on resumes, interviews, job search strategy, and navigating today's market."
              onClick={() => handleFeatureClick('/blogs')}
              gradient="bg-gradient-to-br from-pink-50 to-pink-100"
              iconColor="text-pink-600"
            />
          </div>
        </div>
      </div>

      {/* ── Pricing Preview ── */}
      <div className="bg-slate-50 py-20 px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">Simple, Transparent Pricing</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg">
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800">Free</h3>
              <p className="text-4xl font-extrabold text-slate-800 mt-2">$0</p>
              <p className="text-sm text-slate-500 mt-1 mb-6">Forever</p>
              <ul className="space-y-3 flex-grow">
                {['3 resume downloads', '3 AI analyses', '3 cover letters', 'Unlimited AI enhancement', 'Unlimited resume tailoring', '6 professional templates'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/resume-builder')}
                className="mt-6 w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
            </div>

            {/* Weekly */}
            <div className="bg-white rounded-2xl border-2 border-indigo-500 p-6 flex flex-col relative shadow-lg shadow-indigo-100">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Popular
              </span>
              <h3 className="text-lg font-bold text-slate-800">Weekly</h3>
              <p className="text-4xl font-extrabold text-slate-800 mt-2">$9.99<span className="text-base font-normal text-slate-400">/wk</span></p>
              <p className="text-sm text-slate-500 mt-1 mb-6">Billed weekly</p>
              <ul className="space-y-3 flex-grow">
                {['20 resume downloads', '20 AI analyses', '20 cover letters', 'No watermarks', 'Unlimited versions', 'Everything in Free'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="mt-6 w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200 text-sm"
              >
                Start Weekly Plan
              </button>
            </div>

            {/* Monthly */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800">Monthly</h3>
              <p className="text-4xl font-extrabold text-slate-800 mt-2">$24.99<span className="text-base font-normal text-slate-400">/mo</span></p>
              <p className="text-sm text-slate-500 mt-1 mb-6">Best value</p>
              <ul className="space-y-3 flex-grow">
                {['Unlimited downloads', 'Unlimited AI analyses', 'Unlimited cover letters', 'No watermarks', 'Unlimited versions', 'Everything in Free'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="mt-6 w-full py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors text-sm"
              >
                Start Monthly Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Social Proof ── */}
      <div className="bg-white py-20 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-12">
            Trusted by Job Seekers Across Australia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'The Skill Gap Audit showed me exactly what I was missing for cloud engineering roles. Landed interviews within two weeks.',
                name: 'Tech Professional',
                role: 'Sydney, NSW',
              },
              {
                quote: 'Selection Criteria Generator saved me hours on my APS application. The STAR responses were spot-on and needed minimal editing.',
                name: 'Government Applicant',
                role: 'Canberra, ACT',
              },
              {
                quote: 'My resume went from a 45 to 89 ATS score after using the analyser and tailoring tools. Got three callbacks in a week.',
                name: 'Career Changer',
                role: 'Melbourne, VIC',
              },
            ].map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Get the Edge?</h2>
          <p className="text-indigo-200 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
            Start free. No credit card required. Three analyses, three cover letters, three downloads — on us.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/resume-builder')}
              className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-all hover:scale-105 text-base"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'}
            </button>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 text-base backdrop-blur-sm"
              >
                View Plans
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="w-full bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-white text-lg">Career Hub AI</span>
                <span className="text-xs text-indigo-400 border border-indigo-700 rounded px-1.5 py-0.5 bg-indigo-900/50">
                  Gemini
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                AI-powered career tools built for the Australian job market. From resumes to selection criteria.
              </p>
            </div>

            {/* Tools */}
            <div>
              <p className="text-sm font-bold text-white mb-3">AI Tools</p>
              <ul className="space-y-2 text-sm">
                <li><a href="/resume-builder" onClick={(e) => { e.preventDefault(); navigate('/resume-builder'); }} className="hover:text-white transition-colors">Resume Builder</a></li>
                <li><a href="/resume-analysis" onClick={(e) => { e.preventDefault(); navigate('/resume-analysis'); }} className="hover:text-white transition-colors">Resume Analyser</a></li>
                <li><a href="/cover-letter" onClick={(e) => { e.preventDefault(); navigate('/cover-letter'); }} className="hover:text-white transition-colors">Cover Letter</a></li>
                <li><a href="/skill-gap" onClick={(e) => { e.preventDefault(); navigate('/skill-gap'); }} className="hover:text-white transition-colors">Skill Gap Audit</a></li>
                <li><a href="/selection-criteria" onClick={(e) => { e.preventDefault(); navigate('/selection-criteria'); }} className="hover:text-white transition-colors">Selection Criteria</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-sm font-bold text-white mb-3">Resources</p>
              <ul className="space-y-2 text-sm">
                <li><a href="/jobs" onClick={(e) => { e.preventDefault(); navigate('/jobs'); }} className="hover:text-white transition-colors">Find Jobs</a></li>
                <li><a href="/courses" onClick={(e) => { e.preventDefault(); navigate('/courses'); }} className="hover:text-white transition-colors">Courses</a></li>
                <li><a href="/blogs" onClick={(e) => { e.preventDefault(); navigate('/blogs'); }} className="hover:text-white transition-colors">Career Blog</a></li>
                <li><a href="/pricing" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }} className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Legal + Social */}
            <div>
              <p className="text-sm font-bold text-white mb-3">Company</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.facebook.com/profile.php?id=61584777962745"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                    Facebook
                  </a>
                </li>
                <li><a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Career Hub AI. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">Made in Australia 🇦🇺</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
