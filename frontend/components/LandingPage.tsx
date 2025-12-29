
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Page } from '../types';
import { DocumentTextIcon, BriefcaseIcon, BookOpenIcon, ClipboardDocumentCheckIcon, EnvelopeIcon, Cog6ToothIcon, FacebookIcon, ChartBarIcon, DocumentChartBarIcon } from './icons';
import TailorResumeModal from './TailorResumeModal';

interface LandingPageProps {
  setPage: (page: Page) => void;
  triggerPremiumFlow: () => void;
  setActionToRetry: (action: (() => void) | null) => void;
  openTailorModal: () => void;
  isAuthenticated?: boolean; // Optional - indicates if user is logged in
  isAdmin?: boolean; // Optional - indicates if user is admin
}

const baseFeatures = [
  {
    page: 'builder',
    title: 'AI Resume Builder',
    description: 'Create a standout resume with our AI-powered content enhancer and professional templates.',
    icon: DocumentTextIcon,
    color: 'bg-indigo-500',
    isPremium: false,
  },
  {
    page: 'tailor',
    title: 'Tailor Resume to Job',
    description: 'Optimize your resume for any job description to beat applicant tracking systems (ATS).',
    icon: ClipboardDocumentCheckIcon,
    color: 'bg-rose-500',
    isPremium: false,
  },
  {
    page: 'coverLetter',
    title: 'AI Cover Letter Builder',
    description: 'Generate a personalized cover letter in seconds based on your resume and the job description.',
    icon: EnvelopeIcon,
    color: 'bg-purple-500',
    isPremium: false,
  },
  {
    page: 'analyser',
    title: 'AI Resume Analyser',
    description: 'Get an instant analysis of your resume, with an ATS score and improvement tips from AI.',
    icon: DocumentChartBarIcon,
    color: 'bg-cyan-500',
    isPremium: true,
  },
  {
    page: 'tracker',
    title: 'Application Tracker',
    description: 'Track where you applied, manage interview dates, and monitor your job search progress.',
    icon: ChartBarIcon,
    color: 'bg-emerald-500',
    isPremium: true,
  },
   {
    page: 'versions',
    title: 'Resume Version History',
    description: 'Save and compare different versions of your resume to tailor it for specific applications.',
    icon: DocumentTextIcon,
    color: 'bg-amber-500',
    isPremium: true,
  },
  {
    page: 'jobs',
    title: 'Find Jobs',
    description: 'Browse curated job listings in your field and location to find your next opportunity.',
    icon: BriefcaseIcon,
    color: 'bg-sky-500',
    isPremium: false,
  },
  {
    page: 'courses',
    title: 'Explore Courses',
    description: 'Discover recommended free and paid courses to upskill and enhance your qualifications.',
    icon: BookOpenIcon,
    color: 'bg-teal-500',
    isPremium: false,
  },
  {
    page: 'blogs',
    title: 'Read Our Blog',
    description: 'Get expert career tips, resume advice, and job search strategies to boost your success.',
    icon: BookOpenIcon,
    color: 'bg-violet-500',
    isPremium: false,
  },
];

const adminFeature = {
    page: 'admin',
    title: 'Admin Panel',
    description: 'Manage job listings and course recommendations for the entire application.',
    icon: Cog6ToothIcon,
    color: 'bg-slate-500',
    isPremium: false,
};


const FeatureCard: React.FC<{ feature: typeof baseFeatures[0]; onClick: () => void; isLocked: boolean; index: number }> = ({ feature, onClick, isLocked, index }) => (
  <button
    type="button"
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left w-full flex flex-col relative opacity-0 slide-in-up"
    style={{ animationDelay: `${index * 100}ms` }}
    aria-label={`Navigate to ${feature.title}`}
  >
    {isLocked && (
        <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-amber-900">
            PREMIUM
        </span>
    )}
    <div className={`p-3 rounded-lg ${feature.color} inline-flex self-start mb-4 shadow-md`}>
      <feature.icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
    <p className="text-sm text-slate-600 flex-grow">{feature.description}</p>
    <span className={`mt-4 text-sm font-semibold ${isLocked ? 'text-amber-600' : 'text-indigo-600'}`}>
      {isLocked ? 'Unlock Feature' : `Go to ${feature.title.split(' ')[0]}`} &rarr;
    </span>
  </button>
);

const LandingPage: React.FC<LandingPageProps> = ({ setPage, triggerPremiumFlow, setActionToRetry, openTailorModal, isAuthenticated = false, isAdmin = false }) => {
  const navigate = useNavigate();
  const features = isAdmin ? [...baseFeatures, adminFeature].filter(f => f.page !== 'versions') : baseFeatures; // temp hide versions from admin

  // Map old page names to new routes
  const pageToRoute = (page: string): string => {
    const routeMap: Record<string, string> = {
      'builder': '/resume-builder',
      'coverLetter': '/cover-letter',
      'analyser': '/resume-analysis',
      'tracker': '/applications',
      'versions': '/versions',
      'jobs': '/jobs',
      'courses': '/courses',
      'admin': '/admin',
      'dashboard': '/dashboard',
      'privacy': '/privacy',
      'terms': '/terms',
      'blogs': '/blogs',
      'landing': '/',
    };
    return routeMap[page] || `/${page}`;
  };

  const handleGetStartedClick = () => {
    // Go to builder - if not authenticated, App.tsx will show auth page
    navigate('/resume-builder');
  };

  const handleFeatureClick = (page: Page | 'tailor') => {
    // Navigate to feature page - App.tsx will handle auth for protected routes
    if (page === 'tailor') {
      openTailorModal();
    } else {
      // Navigate to the page - App.tsx handles authentication and access control
      navigate(pageToRoute(page as string));
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="text-center px-4 py-16 md:py-24">
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-4 tracking-tight opacity-0 fade-in" style={{ animationDelay: '100ms' }}>
                Build Your Professional Resume in 10 Minutes
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-3xl mx-auto opacity-0 fade-in" style={{ animationDelay: '300ms' }}>
                AI-powered resume builder with <span className="font-semibold text-indigo-600">8 ATS-optimized templates</span>. Start free with 3 downloads and 10 AI improvements. <span className="font-semibold">No credit card required.</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 fade-in" style={{ animationDelay: '500ms' }}>
                <button
                  type="button"
                  onClick={handleGetStartedClick}
                  className="px-10 py-4 font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 text-lg"
                >
                  {isAuthenticated ? 'Start Building My Resume' : 'Get Started - Sign Up Free'}
                </button>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-10 py-4 font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105 bg-white text-indigo-600 hover:bg-slate-50 focus:ring-indigo-500 text-lg border-2 border-indigo-600"
                  >
                    Already have an account? Sign In
                  </button>
                )}
              </div>
            </div>
        </div>

        {/* Features Grid */}
        <div className="flex-grow p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-800 text-center mb-10 fade-in opacity-0" style={{ animationDelay: '600ms' }}>Your Complete Career Toolkit</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {features.map((feature, index) => {
                      const isLocked = feature.isPremium && !isAdmin;
                      return (
                         <FeatureCard key={feature.page} feature={feature} onClick={() => handleFeatureClick(feature.page as Page | 'tailor')} isLocked={isLocked} index={index}/>
                      )
                  })}
              </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="w-full bg-slate-100 border-t border-slate-200 mt-auto py-6 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Social Media */}
            <div className="text-center mb-4">
              <a
                href="https://www.facebook.com/profile.php?id=61584777962745"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors group"
                aria-label="Follow us on Facebook"
              >
                <FacebookIcon className="w-6 h-6 text-[#1877F2] group-hover:scale-110 transition-transform" />
                <span className="font-medium">Follow us on Facebook</span>
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex justify-center items-center space-x-6 text-sm text-slate-600">
              <a
                href="/privacy"
                onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}
                className="hover:text-indigo-600 transition-colors hover:underline"
              >
                Privacy Policy
              </a>
              <span className="text-slate-400">•</span>
              <a
                href="/terms"
                onClick={(e) => { e.preventDefault(); navigate('/terms'); }}
                className="hover:text-indigo-600 transition-colors hover:underline"
              >
                Terms of Service
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center mt-4 text-xs text-slate-500">
              © {new Date().getFullYear()} Career Hub AI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
