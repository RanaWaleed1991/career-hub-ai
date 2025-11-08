
import React from 'react';
import { SparklesIcon } from './icons';

interface AIAssistButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

const AIAssistButton: React.FC<AIAssistButtonProps> = ({ onClick, isLoading, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading || disabled}
      className="absolute top-0 right-0 mt-2 mr-2 p-1.5 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      aria-label="Enhance with AI"
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <SparklesIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default AIAssistButton;