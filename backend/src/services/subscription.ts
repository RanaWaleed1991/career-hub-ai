import Stripe from 'stripe';
import { stripe, ensureStripeConfigured, SUBSCRIPTION_TIERS } from '../config/stripe.js';
import { subscriptionDb } from './database.js';
import { sendPaymentConfirmationEmail, sendSubscriptionCancelledEmail } from './emailService.js';
import { supabase } from '../config/supabase.js';

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  ensureStripeConfigured();
  if (!stripe) throw new Error('Stripe not configured');

  const customer = await stripe.customers.create({
    email,
    name: name || email,
    metadata: {
      userId,
    },
  });

  return customer;
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  ensureStripeConfigured();
  if (!stripe) throw new Error('Stripe not configured');

  // Get or create customer
  const subscription = await subscriptionDb.getCurrent(userId);
  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const customer = await createStripeCustomer(userId, email);
    customerId = customer.id;

    // Save customer ID to database
    await subscriptionDb.upsert(userId, {
      stripe_customer_id: customerId,
      plan: subscription?.plan || 'free', // Preserve existing plan or default to free
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(
  userId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  console.log(`[Portal] Creating portal session for user ${userId}`);

  ensureStripeConfigured();
  if (!stripe) throw new Error('Stripe not configured');

  const subscription = await subscriptionDb.getCurrent(userId);
  console.log(`[Portal] Current subscription:`, subscription);

  let customerId = subscription?.stripe_customer_id;

  // If user doesn't have a Stripe customer ID yet, create one
  if (!customerId) {
    console.log(`[Portal] No customer ID found, creating new Stripe customer`);

    // Get user email from Supabase
    if (!supabase) throw new Error('Cannot create Stripe customer: Supabase not configured');

    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    console.log(`[Portal] Fetched user from Supabase:`, { email: authUser?.user?.email });

    if (!authUser?.user?.email) {
      throw new Error('Cannot create Stripe customer: User email not found');
    }

    const customer = await createStripeCustomer(
      userId,
      authUser.user.email,
      authUser.user.user_metadata?.full_name
    );
    customerId = customer.id;
    console.log(`[Portal] Created Stripe customer: ${customerId}`);

    // Save customer ID to database
    await subscriptionDb.upsert(userId, {
      stripe_customer_id: customerId,
      plan: subscription?.plan || 'free',
    });
    console.log(`[Portal] Saved customer ID to database`);
  }

  console.log(`[Portal] Creating billing portal session for customer ${customerId}`);

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log(`[Portal] ✅ Successfully created portal session`);
    return session;
  } catch (stripeError: any) {
    console.error(`[Portal] ❌ Stripe API error:`, {
      message: stripeError.message,
      type: stripeError.type,
      code: stripeError.code,
      statusCode: stripeError.statusCode,
    });

    // If customer doesn't exist in Stripe (deleted or wrong mode), create a new one
    if (stripeError.type === 'StripeInvalidRequestError' && stripeError.code === 'resource_missing') {
      console.log(`[Portal] Customer ${customerId} not found in Stripe, creating new customer`);

      // Get user email from Supabase
      if (!supabase) throw new Error('Cannot create Stripe customer: Supabase not configured');

      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (!authUser?.user?.email) {
        throw new Error('Cannot create Stripe customer: User email not found');
      }

      // Create new customer
      const newCustomer = await createStripeCustomer(
        userId,
        authUser.user.email,
        authUser.user.user_metadata?.full_name
      );
      console.log(`[Portal] Created new Stripe customer: ${newCustomer.id}`);

      // Update database with new customer ID
      await subscriptionDb.upsert(userId, {
        stripe_customer_id: newCustomer.id,
        plan: subscription?.plan || 'free',
      });

      // Retry creating portal session with new customer
      const retrySession = await stripe.billingPortal.sessions.create({
        customer: newCustomer.id,
        return_url: returnUrl,
      });

      console.log(`[Portal] ✅ Successfully created portal session with new customer`);
      return retrySession;
    }

    throw stripeError;
  }
}

/**
 * Get subscription status from Stripe
 */
export async function getSubscriptionStatus(userId: string) {
  const subscription = await subscriptionDb.getCurrent(userId);

  if (!subscription) {
    return {
      plan: 'free',
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  // If user has a Stripe subscription, fetch latest data
  if (subscription.stripe_subscription_id && stripe) {
    try {
      const stripeSubscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );

      return {
        plan: subscription.plan,
        status: stripeSubscription.status,
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
        stripeSubscriptionId: stripeSubscription.id,
      };
    } catch (error) {
      console.error('Error fetching Stripe subscription:', error);
    }
  }

  // Return database data
  return {
    plan: subscription.plan || 'free',
    status: subscription.status || 'active',
    currentPeriodEnd: (subscription as any).current_period_end,
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
  };
}

/**
 * Cancel a subscription (at period end)
 */
export async function cancelSubscription(userId: string): Promise<void> {
  ensureStripeConfigured();
  if (!stripe) throw new Error('Stripe not configured');

  const subscription = await subscriptionDb.getCurrent(userId);
  if (!subscription?.stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  // Cancel at period end (don't immediately cancel)
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  // Update database
  await subscriptionDb.upsert(userId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(userId: string): Promise<void> {
  ensureStripeConfigured();
  if (!stripe) throw new Error('Stripe not configured');

  const subscription = await subscriptionDb.getCurrent(userId);
  if (!subscription?.stripe_subscription_id) {
    throw new Error('No subscription found');
  }

  // Remove cancel_at_period_end flag
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  // Update database
  await subscriptionDb.upsert(userId, {
    cancel_at_period_end: false,
  });
}

/**
 * Handle successful subscription checkout
 * Called by webhook when checkout.session.completed
 */
export async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) {
    throw new Error('No userId in session metadata');
  }

  if (!stripe) throw new Error('Stripe not configured');

  // Get subscription details
  const subscriptionId = session.subscription as string;
  const stripeSubscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Determine plan based on price ID
  let plan = 'free';
  const priceId = stripeSubscription.items.data[0]?.price.id;

  for (const [tierName, tierConfig] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tierConfig.priceId === priceId) {
      plan = tierName;
      break;
    }
  }

  // Update database with subscription details
  const currentPeriodStart = (stripeSubscription as any).current_period_start;
  const currentPeriodEnd = (stripeSubscription as any).current_period_end;

  await subscriptionDb.upsert(userId, {
    plan,
    status: stripeSubscription.status,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
    current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    cancel_at_period_end: (stripeSubscription as any).cancel_at_period_end || false,
    // Reset usage counters on new subscription
    ai_enhancements_used: 0,
    downloads_used: 0,
    cover_letters_generated: 0,
    resume_analyses_done: 0,
  });

  // Send payment confirmation email
  try {
    if (supabase) {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (authUser?.user?.email) {
        const userName = authUser.user.user_metadata?.full_name || authUser.user.email;
        const amount = stripeSubscription.items.data[0]?.price.unit_amount || 0;
        const nextBillingDate = new Date((stripeSubscription as any).current_period_end * 1000);

        const emailResult = await sendPaymentConfirmationEmail(
          authUser.user.email,
          userName,
          plan,
          amount,
          nextBillingDate
        );

        if (emailResult.success) {
          console.log(`✅ Payment confirmation email sent to: ${authUser.user.email}`);
        } else {
          console.error(`❌ Failed to send payment confirmation email: ${emailResult.error}`);
        }
      }
    }
  } catch (emailError) {
    console.error('Error sending payment confirmation email:', emailError);
    // Don't throw - email failure shouldn't block the payment processing
  }
}

/**
 * Handle subscription updates
 * Called by webhook when customer.subscription.updated
 */
export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Determine plan based on price ID
  let plan = 'free';
  const priceId = subscription.items.data[0]?.price.id;

  for (const [tierName, tierConfig] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tierConfig.priceId === priceId) {
      plan = tierName;
      break;
    }
  }

  // Update database
  await subscriptionDb.upsert(userId, {
    plan,
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    current_period_start: (subscription as any).current_period_start
      ? new Date((subscription as any).current_period_start * 1000).toISOString()
      : null,
    current_period_end: (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: (subscription as any).cancel_at_period_end,
  });
}

/**
 * Handle subscription deletion
 * Called by webhook when customer.subscription.deleted
 */
export async function handleSubscriptionDelete(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Downgrade to free plan
  await subscriptionDb.upsert(userId, {
    plan: 'free',
    status: 'canceled',
    stripe_subscription_id: null,
    stripe_price_id: null,
    current_period_end: null,
    cancel_at_period_end: false,
  });

  // Send subscription cancellation confirmation email
  try {
    if (supabase) {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (authUser?.user?.email) {
        const userName = authUser.user.user_metadata?.full_name || authUser.user.email;
        // Use the current period end as the expiry date (user retains access until then)
        const expiryDate = (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000)
          : new Date();

        const emailResult = await sendSubscriptionCancelledEmail(
          authUser.user.email,
          userName,
          expiryDate
        );

        if (emailResult.success) {
          console.log(`✅ Cancellation confirmation email sent to: ${authUser.user.email}`);
        } else {
          console.error(`❌ Failed to send cancellation email: ${emailResult.error}`);
        }
      }
    }
  } catch (emailError) {
    console.error('Error sending cancellation email:', emailError);
    // Don't throw - email failure shouldn't block the cancellation processing
  }
}

/**
 * Handle successful payment
 * Called by webhook when invoice.payment_succeeded
 */
export async function handlePaymentSuccess(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id) as string;
  if (!subscriptionId || !stripe) return;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Update subscription status
  await subscriptionDb.upsert(userId, {
    status: 'active',
    current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
  });
}

/**
 * Handle failed payment
 * Called by webhook when invoice.payment_failed
 */
export async function handlePaymentFailure(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id) as string;
  if (!subscriptionId || !stripe) return;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Update subscription status to past_due
  await subscriptionDb.upsert(userId, {
    status: 'past_due',
  });
}
