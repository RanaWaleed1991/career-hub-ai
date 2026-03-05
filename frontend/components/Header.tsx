
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoutIcon } from './icons';
import type { Page } from '../types';

interface HeaderProps {
  onGoToHome: () => void;
  onLogout: () => void;
  page: Page;
  showLogout?: boolean;
  openTailorModal?: () => void;
}

interface NavGroup {
  label: string;
  items: { label: string; description: string; path?: string; action?: () => void }[];
}

const Header: React.FC<HeaderProps> = ({ onGoToHome, onLogout, page, showLogout = true, openTailorModal }) => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navGroups: NavGroup[] = [
    {
      label: 'Intelligence',
      items: [
        {
          label: 'Skill Gap Audit',
          description: 'Match your resume to any job — find what\'s missing.',
          path: '/skill-gap',
        },
        {
          label: 'Selection Criteria',
          description: 'Auto-generate STAR responses for government & corporate roles.',
          path: '/selection-criteria',
        },
        {
          label: 'Resume Analyser',
          description: 'ATS score + AI feedback on your resume\'s effectiveness.',
          path: '/resume-analysis',
        },
      ],
    },
    {
      label: 'Writing Tools',
      items: [
        {
          label: 'Resume Builder',
          description: 'Build and edit your resume with AI-powered suggestions.',
          path: '/resume-builder',
        },
        {
          label: 'Tailor for a Job',
          description: 'Rewrite your resume to fit a specific job description.',
          action: openTailorModal,
        },
        {
          label: 'Cover Letter',
          description: 'Generate a personalised, job-ready cover letter in seconds.',
          path: '/cover-letter',
        },
        {
          label: 'Expert Review',
          description: 'Get your resume professionally rewritten by a career specialist.',
          path: '/expert-review',
        },
      ],
    },
    {
      label: 'Resources',
      items: [
        {
          label: 'ATS-Optimised Templates',
          description: 'Six professionally designed, ATS-friendly resume templates.',
          path: '/resume-builder',
        },
        {
          label: 'Find Jobs',
          description: 'Browse curated listings across tech, healthcare, and government.',
          path: '/jobs',
        },
        {
          label: 'Career Blog',
          description: 'Expert tips on resumes, interviews, and job searching.',
          path: '/blogs',
        },
      ],
    },
  ];

  const handleItemClick = (item: NavGroup['items'][0]) => {
    setOpenMenu(null);
    setMobileOpen(false);
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 print:hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between" ref={menuRef}>
        {/* Logo */}
        <button
          type="button"
          onClick={onGoToHome}
          className="flex items-center gap-2 group"
          title="Back to Dashboard"
        >
          <span className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors tracking-tight">
            Career Hub AI
          </span>
          <span className="text-xs font-medium text-indigo-500 border border-indigo-200 rounded px-1.5 py-0.5 bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
            Gemini
          </span>
        </button>

        {/* Desktop Megamenu */}
        <nav className="hidden md:flex items-center gap-1">
          {navGroups.map(group => (
            <div key={group.label} className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  openMenu === group.label
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {group.label}
                <svg
                  className={`w-4 h-4 transition-transform ${openMenu === group.label ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openMenu === group.label && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  {group.items.map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors group"
                    >
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {showLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 text-sm font-medium"
            >
              <LogoutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 pb-4 px-4">
          {navGroups.map(group => (
            <div key={group.label} className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
