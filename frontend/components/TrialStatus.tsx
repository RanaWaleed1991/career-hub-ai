import React, { useState, useEffect } from 'react';
import { getFreeTrialState, hasPremium, getSubscription } from '../services/premiumService';
import { SparklesIcon, EnvelopeIcon, DocumentChartBarIcon, DownloadIcon, ClipboardDocumentCheckIcon, FolderIcon } from './icons';

const TrialStatus: React.FC = () => {
  const [trialState, setTrialState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState<string>('');

  useEffect(() => {
    const loadTrialState = async () => {
      try {
        // Check if user has premium
        const premium = await hasPremium();
        setIsPremium(premium);

        if (premium) {
          // Get subscription details to show plan name
          const sub = await getSubscription();
          if (sub) {
            setPremiumPlan(sub.plan === 'weekly' ? 'Weekly Premium' : 'Monthly Premium');
          }
        } else {
          // Only load trial state for free users
          const state = await getFreeTrialState();
          setTrialState(state);
        }
      } catch (error) {
        console.error('Failed to load trial state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrialState();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-3 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show premium badge for premium users
  if (isPremium) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg border border-indigo-300 opacity-0 slide-in-up" style={{ animationDelay: `300ms` }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2" />
            {premiumPlan} Active
          </h3>
          <span className="bg-white bg-opacity-20 text-white text-xs font-bold px-3 py-1 rounded-full">
            ✓ PREMIUM
          </span>
        </div>
        <div className="space-y-2 text-white text-opacity-90">
          <p className="text-sm flex items-center">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Unlimited resume downloads
          </p>
          <p className="text-sm flex items-center">
            <EnvelopeIcon className="w-4 h-4 mr-2" />
            Unlimited cover letters
          </p>
          <p className="text-sm flex items-center">
            <DocumentChartBarIcon className="w-4 h-4 mr-2" />
            {premiumPlan === 'Monthly Premium' ? 'Unlimited' : '10'} resume analyses per week
          </p>
          <p className="text-sm flex items-center">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Unlimited AI enhancements
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-white border-opacity-20">
          <p className="text-xs text-white text-opacity-75">
            ✓ No watermarks on downloads<br />
            ✓ Priority support<br />
            ✓ Cancel anytime
          </p>
        </div>
      </div>
    );
  }

  if (!trialState) {
    return null;
  }

  const items = [
    { name: 'Resume Downloads', count: trialState.resumeDownloads, icon: DownloadIcon, unlimited: false },
    { name: 'Cover Letters', count: trialState.coverLetters, icon: EnvelopeIcon, unlimited: false },
    { name: 'Resume Analyses', count: trialState.resumeAnalyses, icon: DocumentChartBarIcon, unlimited: false },
    { name: 'AI Enhancements', count: trialState.aiImprovements, icon: SparklesIcon, unlimited: false },
    { name: 'Resume Tailoring', count: trialState.resumeTailoring, icon: ClipboardDocumentCheckIcon, unlimited: false },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: `300ms` }}>
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Free Tier Status</h3>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.name} className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <item.icon className="w-5 h-5 text-indigo-500 mr-2" />
              <span className="text-slate-600">{item.name}</span>
            </div>
            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">
              {item.unlimited ? 'Unlimited' : `${item.count} left`}
            </span>
          </div>
        ))}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            ✓ Full access to courses and jobs section<br />
            ✓ Save up to 3 resume versions
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialStatus;
