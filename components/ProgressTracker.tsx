import React from 'react';
import type { ResumeData } from '../types';
import { CheckCircleIcon } from './icons';

interface ProgressTrackerProps {
  data: ResumeData;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ data }) => {
  const progressConfig = [
    {
      name: 'Personal Details',
      isComplete: !!(data.personalDetails.fullName && data.personalDetails.jobTitle && data.personalDetails.email),
    },
    {
      name: 'Summary',
      isComplete: data.summary.trim().length > 0,
    },
    {
      name: 'Experience',
      isComplete: data.experience.length > 0,
    },
    {
      name: 'Education',
      isComplete: data.education.length > 0,
    },
    {
      name: 'Skills',
      isComplete: data.skills.some(skill => skill.name.trim().length > 0),
    },
  ];

  const completedCount = progressConfig.filter(item => item.isComplete).length;
  const totalCount = progressConfig.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-8">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Resume Progress</h3>
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {progressConfig.map(item => (
          <div key={item.name} className="flex items-center text-sm">
            {item.isComplete ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <div className="w-5 h-5 mr-2 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-slate-400 rounded-full"></div>
              </div>
            )}
            <span className={item.isComplete ? 'text-slate-600' : 'text-slate-500'}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;