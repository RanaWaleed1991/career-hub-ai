import React, { useEffect, useState } from 'react';
import { premiumService } from '../services/premiumService';

interface TrialState {
  isActive: boolean;
  daysRemaining: number;
  generationsRemaining: number;
  totalGenerations: number;
}

export default function TrialStatus() {
  const [trialState, setTrialState] = useState<TrialState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TrialStatus: Component mounted');
    loadTrialState();
  }, []);

  const loadTrialState = async () => {
    try {
      console.log('TrialStatus: Loading trial state...');
      setLoading(true);
      setError(null);

      const state = await premiumService.getFreeTrialState();
      console.log('TrialStatus: Trial state loaded:', state);

      setTrialState(state);
    } catch (err) {
      console.error('TrialStatus: Error loading trial state:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trial status');
    } finally {
      setLoading(false);
    }
  };

  // IMPORTANT: Always render something
  if (loading) {
    return (
      <div className="trial-status loading">
        <p>Loading trial status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trial-status error">
        <p>⚠️ {error}</p>
        <button onClick={loadTrialState}>Retry</button>
      </div>
    );
  }

  if (!trialState || !trialState.isActive) {
    return (
      <div className="trial-status inactive">
        <h3>Free Trial Expired</h3>
        <p>Upgrade to continue using AI features</p>
      </div>
    );
  }

  const percentageRemaining = (trialState.generationsRemaining / trialState.totalGenerations) * 100;

  return (
    <div className="trial-status active">
      <div className="trial-header">
        <h3>🎁 Free Trial Active</h3>
        <span>{trialState.daysRemaining} days left</span>
      </div>
      <div className="generations">
        <p>{trialState.generationsRemaining} of {trialState.totalGenerations} AI generations remaining</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentageRemaining}%` }} />
        </div>
      </div>
    </div>
  );
}
