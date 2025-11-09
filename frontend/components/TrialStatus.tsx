import React, { useState, useEffect } from 'react';
import { getFreeTrialState, type FreeTrial } from '../services/premiumService';
import { SparklesIcon, EnvelopeIcon, DocumentChartBarIcon, DownloadIcon, ClipboardDocumentCheckIcon } from './icons';

const TrialStatus: React.FC = () => {
  const [trialState, setTrialState] = useState<FreeTrial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrialState = async () => {
      try {
        const state = await getFreeTrialState();
        setTrialState(state);
      } catch (error) {
        console.error('Failed to load trial state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrialState();
  }, []);

  const isPremium = !!localStorage.getItem('career_hub_subscription_v3');

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: `300ms` }}>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Trial Status</h3>
        <div className="text-center py-4 text-slate-500">Loading...</div>
      </div>
    );
  }

  if (isPremium) {
     return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: `300ms` }}>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Subscription Status</h3>
          <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-semibold">
            Premium Plan Active
          </div>
        </div>
      );
  }

  if (!trialState) {
    return null; // Don't show if trial is over and user is not premium
  }

  const items = [
    { name: 'AI Enhancements', count: trialState.aiImprovements, icon: SparklesIcon },
    { name: 'Resume Tailoring', count: trialState.resumeTailoring, icon: ClipboardDocumentCheckIcon },
    { name: 'Cover Letters', count: trialState.coverLetters, icon: EnvelopeIcon },
    { name: 'Resume Analyses', count: trialState.resumeAnalyses, icon: DocumentChartBarIcon },
    { name: 'Resume Downloads', count: trialState.resumeDownloads, icon: DownloadIcon },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: `300ms` }}>
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Trial Status</h3>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.name} className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <item.icon className="w-5 h-5 text-indigo-500 mr-2" />
              <span className="text-slate-600">{item.name}</span>
            </div>
            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">{item.count} left</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrialStatus;
