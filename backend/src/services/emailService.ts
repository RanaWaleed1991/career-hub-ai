/**
 * Email Service using SendGrid
 *
 * Handles all transactional emails for Career Hub AI:
 * - Welcome emails
 * - Password reset emails
 * - Payment confirmations
 * - Subscription notifications
 */

import sgMail from '@sendgrid/mail';
import { env } from '../config/env.js';

// Initialize SendGrid
const SENDGRID_API_KEY = env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;
const EMAIL_FROM = env.EMAIL_FROM || process.env.EMAIL_FROM || 'careerhubaiaus@gmail.com';
const EMAIL_FROM_NAME = env.EMAIL_FROM_NAME || process.env.EMAIL_FROM_NAME || 'Career Hub AI';
const FRONTEND_URL = env.FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

// Initialize SendGrid if API key is available
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid email service initialized');
} else {
  console.warn('⚠️  SendGrid API key not found. Email sending will be disabled.');
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!SENDGRID_API_KEY;
}

/**
 * Email template footer (common across all emails)
 */
const getEmailFooter = (): string => `
  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280;">
    <p style="margin: 10px 0;">
      <strong>Career Hub AI</strong> | Melbourne, Victoria, Australia<br/>
      ABN: 11 770 610 482
    </p>
    <p style="margin: 15px 0;">
      <a href="${FRONTEND_URL}/privacy" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Privacy Policy</a> |
      <a href="${FRONTEND_URL}/terms" style="color: #3b82f6; text-decoration: none; margin: 0 10px;">Terms of Service</a>
    </p>
    <p style="margin: 10px 0; color: #9ca3af;">
      Questions? Contact us at <a href="mailto:careerhubaiaus@gmail.com" style="color: #3b82f6; text-decoration: none;">careerhubaiaus@gmail.com</a>
    </p>
  </div>
`;

/**
 * Email template wrapper
 */
const getEmailTemplate = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Career Hub AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        Career Hub AI
      </h1>
      <p style="color: #dbeafe; margin: 8px 0 0 0; font-size: 14px;">
        Your AI-Powered Career Partner
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding: 0 30px 40px 30px;">
      ${getEmailFooter()}
    </div>

  </div>
</body>
</html>
`;

/**
 * Generic email sending function
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.error('Cannot send email: SendGrid not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const msg = {
      to: to.toLowerCase().trim(),
      from: {
        email: EMAIL_FROM,
        name: EMAIL_FROM_NAME,
      },
      subject,
      html,
      text: text || stripHtml(html), // Auto-generate plain text if not provided
    };

    await sgMail.send(msg);
    console.log(`📧 Email sent successfully to: ${to} | Subject: ${subject}`);
    return { success: true };
  } catch (error: any) {
    console.error('Email sending error:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Strip HTML tags for plain text version (basic implementation)
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Send Welcome Email
 * Sent immediately after user registration
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const firstName = userName.split(' ')[0] || 'there';

  const content = `
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      Welcome to Career Hub AI! 🎉
    </h2>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Hi ${firstName},
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Thank you for joining Career Hub AI! We're excited to help you craft the perfect resume and accelerate your career journey.
    </p>

    <div style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
      <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 18px;">
        🚀 Get Started in 3 Easy Steps:
      </h3>
      <ol style="color: #4b5563; line-height: 1.8; margin: 8px 0; padding-left: 20px;">
        <li><strong>Build Your Resume:</strong> Use our AI-powered resume builder with professional templates</li>
        <li><strong>Tailor for Jobs:</strong> Optimize your resume for specific job descriptions to beat ATS systems</li>
        <li><strong>Track Applications:</strong> Monitor your job search progress all in one place</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${FRONTEND_URL}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Start Building Your Resume
      </a>
    </div>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      <strong>What's Included:</strong>
    </p>
    <ul style="color: #4b5563; line-height: 1.8; margin: 8px 0;">
      <li>✨ AI-Powered Resume Enhancement</li>
      <li>📝 Professional Cover Letter Generator</li>
      <li>🎯 Job-Specific Resume Tailoring</li>
      <li>💼 Curated Job Listings</li>
      <li>📚 Career Development Courses</li>
    </ul>

    <p style="color: #4b5563; line-height: 1.6; margin: 24px 0 16px 0;">
      Need help getting started? Just reply to this email - we're here to help!
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Best regards,<br/>
      <strong>The Career Hub AI Team</strong>
    </p>
  `;

  const subject = 'Welcome to Career Hub AI! 🚀 Let\'s Build Your Future';

  return await sendEmail(to, subject, getEmailTemplate(content));
}

/**
 * Send Password Reset Email
 * Sent when user requests password reset
 *
 * @param to - Recipient email address
 * @param actionLink - Full Supabase action link for password reset
 * @param userName - User's name for personalization
 */
export async function sendPasswordResetEmail(
  to: string,
  actionLink: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  const firstName = userName.split(' ')[0] || 'there';

  const content = `
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      Password Reset Request
    </h2>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Hi ${firstName},
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      We received a request to reset your Career Hub AI password. Click the button below to create a new password:
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${actionLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Reset My Password
      </a>
    </div>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0; font-size: 14px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #3b82f6; line-height: 1.6; margin: 8px 0; font-size: 14px; word-break: break-all;">
      ${actionLink}
    </p>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6;">
        ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
      </p>
    </div>

    <p style="color: #6b7280; line-height: 1.6; margin: 24px 0 16px 0; font-size: 14px;">
      <strong>Didn't request this?</strong> You can safely ignore this email. Your password will not be changed.
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Best regards,<br/>
      <strong>The Career Hub AI Team</strong>
    </p>
  `;

  const subject = 'Reset Your Career Hub AI Password';

  return await sendEmail(to, subject, getEmailTemplate(content));
}

/**
 * Send Payment Confirmation Email
 * Sent when subscription payment succeeds
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  userName: string,
  plan: string,
  amount: number,
  nextBillingDate: Date
): Promise<{ success: boolean; error?: string }> {
  const firstName = userName.split(' ')[0] || 'there';

  // Format plan name
  const planName = plan === 'weekly' ? 'Pro (Weekly)' : plan === 'monthly' ? 'Premium (Monthly)' : plan.charAt(0).toUpperCase() + plan.slice(1);

  // Format amount
  const formattedAmount = `$${(amount / 100).toFixed(2)} AUD`;

  // Format billing date
  const billingDate = nextBillingDate.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      Payment Confirmed! 🎉
    </h2>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Hi ${firstName},
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Thank you for subscribing to Career Hub AI! Your payment has been processed successfully.
    </p>

    <div style="background-color: #f3f4f6; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
      <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">
        📋 Subscription Details
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Plan:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Paid:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Next Billing Date:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${billingDate}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #ecfdf5; border-left: 4px solid: #10b981; padding: 20px; margin: 24px 0; border-radius: 4px;">
      <h3 style="color: #065f46; margin: 0 0 12px 0; font-size: 16px;">
        ✨ Your Premium Features Are Now Active:
      </h3>
      <ul style="color: #065f46; line-height: 1.8; margin: 8px 0; padding-left: 20px;">
        <li><strong>AI Resume Analyzer:</strong> Get detailed ATS scoring and improvement tips</li>
        <li><strong>Application Tracker:</strong> Monitor all your job applications in one place</li>
        <li><strong>Version History:</strong> Save and manage multiple resume versions</li>
        <li><strong>Priority Support:</strong> Get faster responses to your questions</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${FRONTEND_URL}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-right: 12px;">
        Access Premium Features
      </a>
      <a href="${FRONTEND_URL}/subscription" style="display: inline-block; background-color: #f3f4f6; color: #374151; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; border: 1px solid #d1d5db;">
        Manage Subscription
      </a>
    </div>

    <p style="color: #6b7280; line-height: 1.6; margin: 24px 0 16px 0; font-size: 14px;">
      Your subscription will automatically renew on ${billingDate}. You can cancel anytime from your subscription settings.
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Thank you for choosing Career Hub AI!
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Best regards,<br/>
      <strong>The Career Hub AI Team</strong>
    </p>
  `;

  const subject = `Payment Confirmed - Career Hub AI ${planName} Subscription`;

  return await sendEmail(to, subject, getEmailTemplate(content));
}

/**
 * Send Subscription Cancellation Confirmation Email
 * Sent when user cancels subscription
 */
export async function sendSubscriptionCancelledEmail(
  to: string,
  userName: string,
  expiryDate: Date
): Promise<{ success: boolean; error?: string }> {
  const firstName = userName.split(' ')[0] || 'there';

  const formattedDate = expiryDate.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      Subscription Cancelled
    </h2>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Hi ${firstName},
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Your Career Hub AI subscription has been cancelled as requested.
    </p>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
      <p style="color: #1e40af; margin: 0; font-size: 16px; line-height: 1.6;">
        <strong>📅 Important:</strong> You'll continue to have access to premium features until <strong>${formattedDate}</strong>.
      </p>
    </div>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      After ${formattedDate}, your account will revert to the Free plan. You'll still have access to:
    </p>

    <ul style="color: #4b5563; line-height: 1.8; margin: 8px 0;">
      <li>AI Resume Builder with enhancement</li>
      <li>Resume tailoring for job descriptions</li>
      <li>Cover letter generator</li>
      <li>Job listings and course catalog</li>
    </ul>

    <p style="color: #4b5563; line-height: 1.6; margin: 24px 0 16px 0;">
      <strong>We'd Love Your Feedback:</strong>
    </p>
    <p style="color: #4b5563; line-height: 1.6; margin: 8px 0;">
      Would you mind sharing why you cancelled? Your feedback helps us improve Career Hub AI for everyone. Simply reply to this email.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${FRONTEND_URL}/pricing" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Resubscribe Anytime
      </a>
    </div>

    <p style="color: #6b7280; line-height: 1.6; margin: 24px 0 16px 0; font-size: 14px;">
      You won't be charged again unless you choose to resubscribe. You can rejoin anytime to regain access to premium features.
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Thank you for being part of Career Hub AI.
    </p>

    <p style="color: #4b5563; line-height: 1.6; margin: 16px 0;">
      Best regards,<br/>
      <strong>The Career Hub AI Team</strong>
    </p>
  `;

  const subject = 'Subscription Cancelled - Career Hub AI';

  return await sendEmail(to, subject, getEmailTemplate(content));
}

/**
 * Export all email functions
 */
export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
  sendSubscriptionCancelledEmail,
  isEmailConfigured,
};
