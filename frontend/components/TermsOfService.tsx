import React from 'react';

interface TermsOfServiceProps {
  setPage?: (page: string) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ setPage }) => {
  const handleBack = () => {
    if (setPage) {
      setPage('landing');
    } else {
      // Fallback to home page if setPage not available
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-600">
            <strong>Last Updated:</strong> 21 November 2025
          </p>
          <p className="text-sm text-slate-600 mt-2">
            <strong>ABN:</strong> 11 770 610 482
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-slate-700 leading-relaxed mb-4">
            Welcome to Career Hub AI. These Terms of Service ("Terms") govern your access to and use of our web application and services available at <a href="https://careerhubai.com.au" className="text-indigo-600 hover:underline">careerhubai.com.au</a> (the "Service").
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            By accessing or using Career Hub AI, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use our Service.
          </p>
          <p className="text-slate-700 leading-relaxed font-semibold">
            Please read these Terms carefully before using our Service.
          </p>
        </section>

        {/* Table of Contents */}
        <nav className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li><a href="#acceptance" className="text-indigo-600 hover:underline">Acceptance of Terms</a></li>
            <li><a href="#description" className="text-indigo-600 hover:underline">Description of Service</a></li>
            <li><a href="#accounts" className="text-indigo-600 hover:underline">User Accounts</a></li>
            <li><a href="#subscriptions" className="text-indigo-600 hover:underline">Subscriptions and Payments</a></li>
            <li><a href="#user-content" className="text-indigo-600 hover:underline">User Content and Data</a></li>
            <li><a href="#ai-content" className="text-indigo-600 hover:underline">AI-Generated Content</a></li>
            <li><a href="#third-party" className="text-indigo-600 hover:underline">Third-Party Services</a></li>
            <li><a href="#intellectual-property" className="text-indigo-600 hover:underline">Intellectual Property</a></li>
            <li><a href="#acceptable-use" className="text-indigo-600 hover:underline">Acceptable Use Policy</a></li>
            <li><a href="#availability" className="text-indigo-600 hover:underline">Service Availability</a></li>
            <li><a href="#disclaimers" className="text-indigo-600 hover:underline">Disclaimers</a></li>
            <li><a href="#limitation" className="text-indigo-600 hover:underline">Limitation of Liability</a></li>
            <li><a href="#indemnification" className="text-indigo-600 hover:underline">Indemnification</a></li>
            <li><a href="#governing-law" className="text-indigo-600 hover:underline">Governing Law and Jurisdiction</a></li>
            <li><a href="#changes" className="text-indigo-600 hover:underline">Changes to Terms</a></li>
            <li><a href="#contact" className="text-indigo-600 hover:underline">Contact and Notices</a></li>
            <li><a href="#severability" className="text-indigo-600 hover:underline">Severability</a></li>
            <li><a href="#entire-agreement" className="text-indigo-600 hover:underline">Entire Agreement</a></li>
          </ol>
        </nav>

        {/* 1. Acceptance of Terms */}
        <section id="acceptance" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            By creating an account, accessing, or using Career Hub AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            These Terms constitute a legally binding agreement between you and Career Hub AI (ABN: 11 770 610 482).
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.1 Age Requirements</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            To use Career Hub AI, you must be:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li><strong>18 years of age or older</strong>, OR</li>
            <li><strong>Between 13-17 years of age</strong> with verifiable parental or guardian consent</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            We do not knowingly permit children under 13 to use our Service. If we discover a user is under 13 without proper consent, we will immediately terminate their account.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            By using our Service, you represent and warrant that you meet these age requirements.
          </p>
        </section>

        {/* 2. Description of Service */}
        <section id="description" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI is an AI-powered career development platform that provides the following services:
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.1 Core Features (Available to All Users)</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li><strong>AI Resume Builder:</strong> Create professional resumes with AI-powered content enhancement and multiple templates</li>
            <li><strong>Resume Tailoring:</strong> Optimize resumes for specific job descriptions to improve ATS (Applicant Tracking System) compatibility</li>
            <li><strong>AI Cover Letter Generator:</strong> Generate personalized cover letters based on your resume and job descriptions</li>
            <li><strong>Job Listings:</strong> Browse curated and aggregated job postings from external sources (Adzuna API)</li>
            <li><strong>Course Catalog:</strong> Discover free and paid courses for career development and upskilling</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.2 Premium Features (Subscription Required)</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li><strong>AI Resume Analyzer:</strong> Receive detailed ATS scoring and improvement recommendations</li>
            <li><strong>Application Tracker:</strong> Track job applications, manage interview dates, and monitor application status</li>
            <li><strong>Resume Version History:</strong> Save and manage multiple versions of your resume for different applications</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.3 Subscription Plans</h3>
          <p className="text-slate-700 leading-relaxed mb-3">
            Career Hub AI offers the following subscription tiers (pricing in AUD):
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li><strong>Free Plan:</strong> Access to core features (resume builder, cover letter generator, job listings, courses)</li>
            <li><strong>Pro Plan:</strong> $9.99 AUD per week - Includes all core features plus premium features</li>
            <li><strong>Premium Plan:</strong> $24.99 AUD per month - Includes all core features plus premium features</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            All prices are in Australian Dollars (AUD) and include applicable taxes.
          </p>
        </section>

        {/* 3. User Accounts */}
        <section id="accounts" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">3.1 Account Registration</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            To use Career Hub AI, you must create an account by providing:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>A valid email address</li>
            <li>A secure password, OR</li>
            <li>Authentication via Google OAuth or Facebook OAuth</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">3.2 Account Security</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You are responsible for:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access or security breach</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI will not be liable for any loss or damage arising from your failure to protect your account credentials.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">3.3 Accurate Information</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">3.4 Account Termination</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Your Rights:</strong> You may delete your account at any time through the account settings. Upon deletion, your personal data will be permanently removed within 30 days (see our Privacy Policy for details).
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Our Rights:</strong> We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or use our Service in a manner that could damage our reputation or operations.
          </p>
        </section>

        {/* 4. Subscriptions and Payments */}
        <section id="subscriptions" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Subscriptions and Payments</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">4.1 Subscription Plans</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI offers Free, Pro (weekly), and Premium (monthly) subscription plans. Premium features are only accessible with an active paid subscription.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">4.2 Payment Processing</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            All payments are processed securely through <strong>Stripe</strong>, a third-party payment processor. By subscribing, you agree to Stripe's Terms of Service and Privacy Policy.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            We do not store your credit card information. All payment data is handled by Stripe in accordance with PCI-DSS standards.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">4.3 Recurring Billing</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Paid subscriptions renew automatically at the end of each billing period:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li><strong>Pro Plan:</strong> Renews weekly</li>
            <li><strong>Premium Plan:</strong> Renews monthly</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            Your payment method will be charged automatically on each renewal date unless you cancel your subscription before the renewal date.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">4.4 Cancellation Policy</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You may cancel your subscription at any time through the Subscription Management page in your account settings.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Important:</strong> When you cancel, you will retain access to premium features until the end of your current billing period. After that, your account will revert to the Free plan.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            No future charges will be made after cancellation, but you will not receive a refund for any remaining time in your current billing period.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">4.5 Refund Policy</h3>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
            <p className="text-slate-700 leading-relaxed font-semibold">
              No Refunds: Career Hub AI does not offer refunds for subscription fees.
            </p>
          </div>
          <p className="text-slate-700 leading-relaxed mb-4">
            All subscription fees are non-refundable. However, you may cancel your subscription at any time to prevent future charges. Upon cancellation, you will retain access to premium features until the end of your current billing period.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Australian Consumer Law:</strong> This refund policy does not affect your rights under the Australian Consumer Law, including your right to a remedy for faulty services or services that do not match their description.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">4.6 Price Changes</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            We reserve the right to change subscription prices at any time. If we increase prices, we will:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Provide at least 30 days' notice via email</li>
            <li>Give you the option to cancel before the price increase takes effect</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            Continued use of the Service after a price change constitutes acceptance of the new pricing.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">4.7 Failed Payments</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            If a recurring payment fails (e.g., expired card, insufficient funds):
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>We will attempt to notify you via email</li>
            <li>You will have a grace period to update your payment method</li>
            <li>If payment is not resolved, your subscription will be downgraded to the Free plan</li>
          </ul>
        </section>

        {/* 5. User Content and Data */}
        <section id="user-content" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. User Content and Data</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">5.1 Ownership of Your Content</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You retain all ownership rights to the content you create and upload to Career Hub AI, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Resumes and resume data</li>
            <li>Cover letters</li>
            <li>Personal information</li>
            <li>Job application tracking data</li>
            <li>Notes and other user-generated content</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">5.2 License Grant to Career Hub AI</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            By using our Service, you grant Career Hub AI a limited, non-exclusive, royalty-free license to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Store and process your content to provide the Service</li>
            <li>Send your resume content to Google Gemini AI for enhancement and analysis</li>
            <li>Create backups for disaster recovery purposes</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            This license terminates when you delete your content or account, except for backup copies retained for disaster recovery (up to 90 days).
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">5.3 Responsibility for Content</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You are solely responsible for:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>The accuracy and legality of the content you submit</li>
            <li>Ensuring your content does not infringe on third-party rights</li>
            <li>Reviewing and editing AI-generated suggestions before use</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">5.4 Prohibited Content</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You may not upload or submit content that:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Is illegal, fraudulent, defamatory, or offensive</li>
            <li>Infringes on intellectual property or privacy rights</li>
            <li>Contains malware, viruses, or malicious code</li>
            <li>Violates any applicable laws or regulations</li>
          </ul>
        </section>

        {/* 6. AI-Generated Content */}
        <section id="ai-content" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. AI-Generated Content</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.1 AI as an Assistive Tool</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI uses Google Gemini AI to provide content suggestions, enhancements, and analysis. These AI features are <strong>assistive tools</strong> designed to help you create better resumes and cover letters.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Important:</strong> AI-generated content is not guaranteed to be accurate, complete, or suitable for your specific situation. You are responsible for reviewing, editing, and verifying all AI suggestions before use.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.2 No Guarantee of Outcomes</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI does not guarantee:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Job placement, interviews, or employment offers</li>
            <li>Specific ATS scores or acceptance rates</li>
            <li>Career advancement or salary increases</li>
            <li>Accuracy or suitability of AI-generated content for any particular job or industry</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            Your career success depends on many factors beyond our control, including your qualifications, experience, market conditions, and employer preferences.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.3 Not Professional Advice</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            AI suggestions and analysis provided by Career Hub AI are <strong>not professional career advice</strong>. For personalized career guidance, consult with a qualified career counselor or recruitment professional.
          </p>
        </section>

        {/* 7. Third-Party Services */}
        <section id="third-party" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Third-Party Services</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">7.1 External Job Listings</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Job listings displayed on Career Hub AI are aggregated from external sources, including the Adzuna API. These listings are provided "as is" without verification by us.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            We are not responsible for:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>The accuracy, legality, or availability of job postings</li>
            <li>The conduct or practices of employers</li>
            <li>Employment outcomes or disputes with employers</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">7.2 External Course Links</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Course links may direct you to external platforms (YouTube, Udemy, etc.). We do not endorse, verify, or guarantee the quality of these courses.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">7.3 External Links Disclaimer</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or terms of service of external sites. Use external links at your own risk.
          </p>
        </section>

        {/* 8. Intellectual Property */}
        <section id="intellectual-property" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Intellectual Property</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">8.1 Career Hub AI Ownership</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI and all related intellectual property, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Software code and architecture</li>
            <li>User interface and design</li>
            <li>Logos, branding, and trademarks</li>
            <li>Resume templates (excluding user-generated content)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            are owned by Career Hub AI and protected by Australian and international copyright, trademark, and intellectual property laws.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">8.2 User Content Ownership</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You retain ownership of all content you create using Career Hub AI (resumes, cover letters, personal data). See Section 5 for details.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">8.3 Prohibited Actions</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You may not:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Copy, modify, or distribute our software or platform code</li>
            <li>Reverse-engineer, decompile, or disassemble our Service</li>
            <li>Scrape, crawl, or extract data from our platform using automated tools</li>
            <li>Use our branding, logos, or trademarks without written permission</li>
            <li>Create derivative works based on our Service</li>
          </ul>
        </section>

        {/* 9. Acceptable Use Policy */}
        <section id="acceptable-use" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Acceptable Use Policy</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">9.1 Prohibited Activities</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li><strong>Unauthorized Access:</strong> Attempt to access accounts, systems, or networks you are not authorized to access</li>
            <li><strong>System Abuse:</strong> Interfere with or disrupt the Service, servers, or networks</li>
            <li><strong>AI Feature Abuse:</strong> Use AI features for spam, manipulation, or generating harmful content</li>
            <li><strong>Fraudulent Activity:</strong> Provide false information, create fake accounts, or engage in payment fraud</li>
            <li><strong>Illegal Activities:</strong> Use the Service for any unlawful purpose or in violation of any laws</li>
            <li><strong>Violating Others' Rights:</strong> Infringe on the privacy, intellectual property, or other rights of third parties</li>
            <li><strong>Commercial Exploitation:</strong> Resell, redistribute, or commercialize our Service without authorization</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">9.2 Consequences of Violations</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Violation of this Acceptable Use Policy may result in:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Immediate account suspension or termination</li>
            <li>Removal of content</li>
            <li>Legal action and reporting to law enforcement authorities</li>
            <li>No refund of subscription fees</li>
          </ul>
        </section>

        {/* 10. Service Availability */}
        <section id="availability" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Service Availability</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">10.1 Uptime Target</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            We strive to provide a reliable service with a target uptime of 99.9%. However, we do not guarantee uninterrupted or error-free access.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">10.2 Maintenance and Downtime</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI may be temporarily unavailable due to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Scheduled maintenance (we will attempt to provide advance notice)</li>
            <li>Emergency updates or security patches</li>
            <li>Technical issues beyond our control (hosting provider outages, network disruptions)</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">10.3 Right to Modify or Discontinue</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            We reserve the right to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Modify, suspend, or discontinue any feature or aspect of the Service</li>
            <li>Change subscription plans, features, or pricing</li>
            <li>Impose usage limits or restrictions</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            We will make reasonable efforts to notify users of significant changes.
          </p>
        </section>

        {/* 11. Disclaimers */}
        <section id="disclaimers" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Disclaimers</h2>

          <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 mb-4">
            <p className="text-slate-700 leading-relaxed mb-4 font-semibold">
              CAREER HUB AI IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, Career Hub AI disclaims all warranties, express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
              <li>Merchantability and fitness for a particular purpose</li>
              <li>Accuracy, reliability, or completeness of content (including AI-generated content)</li>
              <li>Uninterrupted, secure, or error-free service</li>
              <li>Results, outcomes, or job placement from using our Service</li>
            </ul>
          </div>

          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>No Guarantee of Job Placement:</strong> Career Hub AI is a tool to assist with resume building and career development. We do not guarantee employment, interviews, job offers, or any specific career outcomes.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>External Content:</strong> Job listings, courses, and external links are provided for informational purposes only. We do not verify, endorse, or guarantee the accuracy or quality of external content.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Australian Consumer Law:</strong> These disclaimers do not exclude guarantees under the Australian Consumer Law that cannot be excluded. Nothing in these Terms limits your rights under the Australian Consumer Law.
          </p>
        </section>

        {/* 12. Limitation of Liability */}
        <section id="limitation" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Limitation of Liability</h2>

          <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 mb-4">
            <p className="text-slate-700 leading-relaxed mb-4 font-semibold">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              Career Hub AI and its directors, employees, partners, and service providers will not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Damages arising from job search outcomes, employment decisions, or career results</li>
              <li>Damages resulting from use or inability to use the Service</li>
              <li>Damages caused by third-party services, external links, or job listings</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Maximum Liability Cap</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Our total liability for any claims arising from these Terms or your use of Career Hub AI shall not exceed the total amount you paid to us in subscription fees during the 12 months preceding the claim.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            For free accounts, our maximum liability is AUD $100.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Consumer Guarantees</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Nothing in these Terms excludes, restricts, or modifies any consumer rights or guarantees under the Australian Consumer Law or other applicable laws that cannot be lawfully excluded.
          </p>
        </section>

        {/* 13. Indemnification */}
        <section id="indemnification" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Indemnification</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            You agree to indemnify, defend, and hold harmless Career Hub AI, its officers, directors, employees, partners, and service providers from any claims, liabilities, damages, losses, costs, or expenses (including reasonable legal fees) arising from:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li>Your use or misuse of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights (including intellectual property, privacy, or employment rights)</li>
            <li>Content you submit or create using our Service</li>
            <li>Any fraudulent, illegal, or unauthorized activity conducted through your account</li>
          </ul>
        </section>

        {/* 14. Governing Law and Jurisdiction */}
        <section id="governing-law" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Governing Law and Jurisdiction</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">14.1 Governing Law</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            These Terms of Service are governed by and construed in accordance with the laws of the State of <strong>Victoria, Australia</strong>.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">14.2 Jurisdiction</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Any disputes arising from these Terms or your use of Career Hub AI shall be subject to the exclusive jurisdiction of the courts of <strong>Victoria, Australia</strong>.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">14.3 Dispute Resolution</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            Before initiating formal legal proceedings, we encourage you to contact us at <a href="mailto:careerhubaiaus@gmail.com" className="text-indigo-600 hover:underline">careerhubaiaus@gmail.com</a> to attempt to resolve the dispute informally.
          </p>
        </section>

        {/* 15. Changes to Terms */}
        <section id="changes" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">15. Changes to These Terms</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We may update these Terms of Service from time to time to reflect changes in our practices, legal requirements, or business operations.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            When we make material changes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>We will update the "Last Updated" date at the top of this page</li>
            <li>We will notify you via email (if you have an active account)</li>
            <li>We may display a prominent notice on our website or application</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            Your continued use of Career Hub AI after changes are posted constitutes acceptance of the updated Terms. If you do not agree with the changes, you must stop using our Service and may delete your account.
          </p>
        </section>

        {/* 16. Contact and Notices */}
        <section id="contact" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">16. Contact and Notices</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">16.1 How to Contact Us</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            If you have questions, concerns, or feedback regarding these Terms of Service, please contact us:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
            <p className="text-slate-700 mb-2"><strong>Career Hub AI</strong></p>
            <p className="text-slate-700 mb-2"><strong>Email:</strong> <a href="mailto:careerhubaiaus@gmail.com" className="text-indigo-600 hover:underline">careerhubaiaus@gmail.com</a></p>
            <p className="text-slate-700 mb-2"><strong>Location:</strong> Melbourne, Victoria, Australia</p>
            <p className="text-slate-700"><strong>ABN:</strong> 11 770 610 482</p>
          </div>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">16.2 How We Contact You</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            We will send notices and communications to the email address associated with your account. It is your responsibility to keep your email address current and to check for messages from us.
          </p>
        </section>

        {/* 17. Severability */}
        <section id="severability" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">17. Severability</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent.
          </p>
        </section>

        {/* 18. Entire Agreement */}
        <section id="entire-agreement" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">18. Entire Agreement</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and Career Hub AI regarding your use of our Service.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            These Terms supersede all prior or contemporaneous agreements, understandings, representations, or communications (whether written or oral) regarding the subject matter herein.
          </p>
        </section>

        {/* Acknowledgment */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-10">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Acknowledgment</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            By using Career Hub AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you must not use our Service.
          </p>
        </section>

        {/* Legal Disclaimer */}
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">Legal Disclaimer</h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            These Terms of Service are provided as a binding legal agreement between Career Hub AI and its users. While we have made every effort to ensure compliance with Australian law and international best practices, we recommend users consult with a legal professional if they have specific concerns. Nothing in these Terms is intended to exclude rights under the Australian Consumer Law or other applicable consumer protection laws.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
