import React, { useState, useEffect } from 'react';
import {
  getSubscriptionStatus,
  createPortalSession,
  cancelSubscription,
  reactivateSubscription,
  SubscriptionStatus,
} from '../../services/payments';

interface SubscriptionManagementProps {
  userToken: string | null;
}

export function SubscriptionManagement({ userToken }: SubscriptionManagementProps) {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (userToken) {
      loadSubscriptionStatus();
    }
  }, [userToken]);

  async function loadSubscriptionStatus() {
    if (!userToken) return;

    try {
      setLoading(true);
      const status = await getSubscriptionStatus(userToken);
      setSubscription(status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    if (!userToken) return;

    setActionLoading(true);
    setError(null);

    try {
      const { portalUrl } = await createPortalSession(userToken);
      window.location.href = portalUrl;
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!userToken || !confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await cancelSubscription(userToken);
      await loadSubscriptionStatus(); // Reload status
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReactivateSubscription() {
    if (!userToken) return;

    setActionLoading(true);
    setError(null);

    try {
      await reactivateSubscription(userToken);
      await loadSubscriptionStatus(); // Reload status
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (!userToken) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Please sign in to manage your subscription</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading subscription...</p>
      </div>
    );
  }

  const isFree = subscription?.plan === 'free';
  const isActive = subscription?.status === 'active';
  const isCanceled = subscription?.cancelAtPeriodEnd;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>Subscription Management</h1>

      {error && (
        <div
          style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '8px',
          }}
        >
          {error}
        </div>
      )}

      {subscription && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '30px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>
              {subscription.plan} Plan
            </h2>
            <div
              style={{
                display: 'inline-block',
                padding: '5px 15px',
                borderRadius: '20px',
                backgroundColor: isActive ? '#e8f5e9' : '#fff3e0',
                color: isActive ? '#2e7d32' : '#f57c00',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {subscription.status.toUpperCase()}
            </div>
          </div>

          {!isFree && subscription.currentPeriodEnd && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Billing Period Ends:</strong>{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}

          {isCanceled && (
            <div
              style={{
                padding: '15px',
                marginBottom: '20px',
                backgroundColor: '#fff3e0',
                color: '#f57c00',
                borderRadius: '8px',
              }}
            >
              Your subscription will be canceled at the end of the billing period. You will retain
              access to premium features until then.
            </div>
          )}

          <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {!isFree && isActive && (
              <>
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseOver={(e) => {
                    if (!actionLoading) {
                      e.currentTarget.style.backgroundColor = '#45a049';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!actionLoading) {
                      e.currentTarget.style.backgroundColor = '#4CAF50';
                    }
                  }}
                >
                  Manage Billing
                </button>

                {!isCanceled ? (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.3s',
                    }}
                    onMouseOver={(e) => {
                      if (!actionLoading) {
                        e.currentTarget.style.backgroundColor = '#da190b';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!actionLoading) {
                        e.currentTarget.style.backgroundColor = '#f44336';
                      }
                    }}
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.3s',
                    }}
                    onMouseOver={(e) => {
                      if (!actionLoading) {
                        e.currentTarget.style.backgroundColor = '#0b7dda';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!actionLoading) {
                        e.currentTarget.style.backgroundColor = '#2196F3';
                      }
                    }}
                  >
                    Reactivate Subscription
                  </button>
                )}
              </>
            )}

            {isFree && (
              <a
                href="/pricing"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'inline-block',
                }}
              >
                Upgrade Plan
              </a>
            )}
          </div>

          {!isFree && (
            <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
              <h3 style={{ marginBottom: '15px' }}>Subscription Features</h3>
              <p style={{ color: '#666' }}>
                You have access to all premium features including unlimited downloads, AI
                improvements, cover letters, and resume analyses.
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center', color: '#666' }}>
        <p>Need help? Contact support at support@careerhub.ai</p>
      </div>
    </div>
  );
}
