import React, { useState, useEffect } from 'react';
import { getStripeConfig, createCheckoutSession, SubscriptionTier } from '../../services/payments';

interface PricingPageProps {
  userToken: string | null;
  currentPlan?: string;
}

export function PricingPage({ userToken, currentPlan = 'free' }: PricingPageProps) {
  const [tiers, setTiers] = useState<Record<string, SubscriptionTier> | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPricingTiers();
  }, []);

  async function loadPricingTiers() {
    try {
      const config = await getStripeConfig();
      setTiers(config.tiers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(priceId: string, tierName: string) {
    if (!userToken) {
      setError('Please sign in to subscribe');
      return;
    }

    setProcessingTier(tierName);
    setError(null);

    try {
      const { sessionUrl } = await createCheckoutSession(priceId, userToken);
      // Redirect to Stripe Checkout
      window.location.href = sessionUrl;
    } catch (err: any) {
      setError(err.message);
      setProcessingTier(null);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading pricing...</p>
      </div>
    );
  }

  if (error && !tiers) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <p>Error loading pricing: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Choose Your Plan</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666' }}>
        Unlock premium features to supercharge your job search
      </p>

      {error && (
        <div
          style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginTop: '30px',
        }}
      >
        {tiers &&
          Object.entries(tiers).map(([key, tier]) => {
            const isCurrentPlan = currentPlan === key;
            const isProcessing = processingTier === key;
            const isFree = tier.price === 0;

            return (
              <div
                key={key}
                style={{
                  border: isCurrentPlan ? '3px solid #4CAF50' : '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '30px',
                  backgroundColor: isCurrentPlan ? '#f0f8f0' : '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {isCurrentPlan && (
                  <div
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '15px',
                      textAlign: 'center',
                    }}
                  >
                    CURRENT PLAN
                  </div>
                )}

                {!isCurrentPlan && tier.badge && (
                  <div
                    style={{
                      backgroundColor: '#FF9800',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '15px',
                      textAlign: 'center',
                    }}
                  >
                    {tier.badge}
                  </div>
                )}

                <h2 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>{tier.name}</h2>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold' }}>${tier.price}</span>
                  {!isFree && <span style={{ color: '#666' }}>/{tier.interval}</span>}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', flex: 1 }}>
                  {tier.features.map((feature, idx) => (
                    <li
                      key={idx}
                      style={{
                        padding: '8px 0',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ marginRight: '10px', color: '#4CAF50' }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {!isFree && !isCurrentPlan && (
                  <button
                    onClick={() => handleSubscribe(tier.priceId, key)}
                    disabled={isProcessing || !userToken}
                    style={{
                      padding: '15px',
                      backgroundColor: isProcessing ? '#ccc' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: isProcessing || !userToken ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.3s',
                    }}
                    onMouseOver={(e) => {
                      if (!isProcessing && userToken) {
                        e.currentTarget.style.backgroundColor = '#45a049';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isProcessing && userToken) {
                        e.currentTarget.style.backgroundColor = '#4CAF50';
                      }
                    }}
                  >
                    {isProcessing ? 'Processing...' : !userToken ? 'Sign In to Subscribe' : 'Subscribe Now'}
                  </button>
                )}

                {isFree && !isCurrentPlan && (
                  <button
                    disabled
                    style={{
                      padding: '15px',
                      backgroundColor: '#eee',
                      color: '#999',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'not-allowed',
                    }}
                  >
                    Current Plan
                  </button>
                )}

                {isCurrentPlan && !isFree && (
                  <button
                    disabled
                    style={{
                      padding: '15px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'default',
                    }}
                  >
                    Active
                  </button>
                )}
              </div>
            );
          })}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', color: '#666' }}>
        <p>All plans include secure payment processing via Stripe</p>
        <p>Cancel anytime from your subscription settings</p>
      </div>
    </div>
  );
}
