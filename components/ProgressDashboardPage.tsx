import React from 'react';
import { CheckCircleIcon, TrophyIcon } from './icons';

const mockData = {
  careerReadiness: 75,
  stats: {
    coursesCompleted: 2,
    jobsApplied: 5,
    resumeScore: 88,
  },
  achievements: [
    { name: 'First Steps', unlocked: true },
    { name: 'Resume Rockstar', unlocked: true },
    { name: 'Course Concluder', unlocked: true },
    { name: 'Application Ace', unlocked: false },
    { name: 'Interview Pro', unlocked: false },
  ],
  recentActivity: [
    'Applied to React Developer at Innovate Digital.',
    "Completed course: 'Introduction to Web Development'.",
    'Updated Professional Summary with AI Assist.',
  ]
};

const StatCard: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 text-center hover:shadow-lg transition-shadow">
    <p className="text-3xl font-bold text-indigo-600">{value}{label.includes('Score') ? '%' : ''}</p>
    <p className="text-sm font-medium text-slate-500">{label}</p>
  </div>
);

const Achievement: React.FC<{ name: string; unlocked: boolean }> = ({ name, unlocked }) => (
  <div className={`p-3 rounded-lg flex items-center space-x-3 ${unlocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
    <TrophyIcon className={`w-6 h-6 ${unlocked ? 'text-amber-500' : 'text-slate-400'}`} />
    <span className="font-medium">{name}</span>
  </div>
);

const ProgressDashboardPage: React.FC = () => {
  const { careerReadiness, stats, achievements, recentActivity } = mockData;

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Your Career Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 text-center">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Career Readiness</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-slate-200" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500"
                  strokeWidth="3"
                  strokeDasharray={`${careerReadiness}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-slate-800">
                {careerReadiness}%
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <StatCard value={stats.coursesCompleted} label="Courses Completed" />
            <StatCard value={stats.jobsApplied} label="Jobs Applied" />
            <StatCard value={stats.resumeScore} label="Resume Score" />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map(ach => <Achievement key={ach.name} {...ach} />)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Recent Activity</h3>
            <ul className="space-y-3">
              {recentActivity.map((activity, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboardPage;