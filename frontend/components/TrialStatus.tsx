import React, { useState, useEffect } from 'react';
import { getFreeTrialState, hasPremium, getSubscription, FREE_TIER_LIMITS } from '../services/premiumService';
import { SparklesIcon, EnvelopeIcon, DocumentChartBarIcon, DownloadIcon, ClipboardDocumentCheckIcon, ChartBarIcon } from './icons';

const TrialStatus: React.FC = () => {
  const [trialState, setTrialState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState<string>('');

  useEffect(() => {
    const loadTrialState = async () => {
      try {
        const premium = await hasPremium();
        setIsPremium(premium);

        if (premium) {
          const sub = await getSubscription();
          if (sub) {
            setPremiumPlan(sub.plan === 'weekly' ? 'Weekly Premium' : 'Monthly Premium');
          }
        } else {
          const state = await getFreeTrialState();
          setTrialState(state);
        }
      } catch (error) {
        console.error('Failed to load free tier usage:', error);
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg border border-indigo-300 opacity-0 slide-in-up" style={{ animationDelay: `300ms` }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2" />
            {premiumPlan} Active
          </h3>
          <span className="bg-white bg-opacity-20 text-white text-xs font-bold px-3 py-1 rounded-full">
            PREMIUM
          </span>
        </div>
        <div className="space-y-2 text-white text-opacity-90">
          <p className="text-sm flex items-center gap-2">
            <DownloadIcon className="w-4 h-4 flex-shrink-0" />
            Unlimited resume downloads
          </p>
          <p className="text-sm flex items-center gap-2">
            <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
            Unlimited cover letters &amp; selection criteria
          </p>
          <p className="text-sm flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4 flex-shrink-0" />
            {premiumPlan === 'Monthly Premium' ? 'Unlimited' : '10'} analyses &amp; skill gap audits
          </p>
          <p className="text-sm flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 flex-shrink-0" />
            Unlimited AI enhancements &amp; tailoring
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-white border-opacity-20">
          <p className="text-xs text-white text-opacity-75">
            No watermarks on downloads &middot; Priority support &middot; Cancel anytime
          </p>
        </div>
      </div>
    );
  }

  if (!trialState) {
    return null;
  }

  const items = [
    { name: 'Resume Downloads', count: trialState.resumeDownloads, icon: DownloadIcon, limit: FREE_TIER_LIMITS.downloads },
    {
      name: 'Cover Letters & Selection Criteria',
      count: trialState.coverLetters,
      icon: EnvelopeIcon,
      limit: FREE_TIER_LIMITS.coverLetters,
    },
    {
      name: 'Analyses & Skill Gap Audits',
      count: trialState.resumeAnalyses,
      icon: ChartBarIcon,
      limit: FREE_TIER_LIMITS.resumeAnalyses,
    },
    { name: 'AI Enhancements', count: trialState.aiImprovements, icon: SparklesIcon, limit: FREE_TIER_LIMITS.aiEnhancements },
    { name: 'Resume Tailoring', count: trialState.resumeTailoring, icon: ClipboardDocumentCheckIcon, limit: FREE_TIER_LIMITS.resumeTailoring },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: `300ms` }}>
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Free Tier Credits</h3>
      <div className="space-y-4">
        {items.map(item => {
          const pct = Math.max(0, Math.round((item.count / item.limit) * 100));
          const isLow = item.count <= 1;
          return (
            <div key={item.name}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
                <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                  isLow ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.count} left
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isLow ? 'bg-red-400' : 'bg-indigo-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Full access to jobs, courses &amp; application tracker<br />
            Save up to {FREE_TIER_LIMITS.versionSaves} resume versions
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialStatus;
