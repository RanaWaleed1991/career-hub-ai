import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import {
  handleCheckoutComplete,
  handleSubscriptionUpdate,
  handleSubscriptionDelete,
  handlePaymentSuccess,
  handlePaymentFailure,
} from '../services/subscription.js';

const router = express.Router();

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * IMPORTANT: This endpoint must use raw body parsing (not JSON)
 * The raw body is needed to verify the webhook signature
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook handler called but Stripe is not configured');
      res.status(503).json({ error: 'Stripe not configured' });
      return;
    }

    const sig = req.headers['stripe-signature'];

    if (!sig) {
      console.error('No stripe-signature header found');
      res.status(400).json({ error: 'No signature' });
      return;
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
      return;
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    try {
      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode === 'subscription') {
            await handleCheckoutComplete(session);
            console.log('Successfully handled checkout.session.completed');
          }
          break;

        case 'customer.subscription.updated':
          const updatedSubscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdate(updatedSubscription);
          console.log('Successfully handled customer.subscription.updated');
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDelete(deletedSubscription);
          console.log('Successfully handled customer.subscription.deleted');
          break;

        case 'invoice.payment_succeeded':
          const successInvoice = event.data.object as Stripe.Invoice;
          await handlePaymentSuccess(successInvoice);
          console.log('Successfully handled invoice.payment_succeeded');
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailure(failedInvoice);
          console.log('Successfully handled invoice.payment_failed');
          break;

        case 'customer.subscription.trial_will_end':
          // Handle trial ending soon (optional)
          console.log('Trial ending soon for subscription');
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Return 200 to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).json({
        error: 'Webhook handler failed',
        message: error.message,
      });
    }
  }
);

export default router;
