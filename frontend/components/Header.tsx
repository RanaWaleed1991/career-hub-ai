
import React from 'react';
import { LogoutIcon, ArrowLeftIcon } from './icons';
// Fix: The 'Page' type is exported from `types.ts`, not `App.tsx`.
import type { Page } from '../types';

interface HeaderProps {
    onGoToHome: () => void;
    onLogout: () => void;
    page: Page;
    showLogout?: boolean; // Optional - hide logout for guests
}

const Header: React.FC<HeaderProps> = ({ onGoToHome, onLogout, page, showLogout = true }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center print:hidden sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        {page !== 'dashboard' && (
            <button
                type="button"
                onClick={onGoToHome}
                className="text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-slate-100 -ml-2"
                title="Back to Dashboard"
                aria-label="Back to dashboard"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
        )}
        <h1
            className="text-2xl font-bold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={onGoToHome}
            title="Back to Dashboard"
        >
            Career Hub AI <span className="text-sm font-normal text-indigo-600">with Gemini</span>
        </h1>
      </div>
      {showLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm hover:shadow-md"
        >
          <LogoutIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      )}
    </header>
  );
};

export default Header;
