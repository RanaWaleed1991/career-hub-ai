import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
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
            Career Hub AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application at <a href="https://careerhubai.com.au" className="text-indigo-600 hover:underline">careerhubai.com.au</a>.
          </p>
          <p className="text-slate-700 leading-relaxed">
            By using Career Hub AI, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our service.
          </p>
        </section>

        {/* Table of Contents */}
        <nav className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li><a href="#info-collect" className="text-indigo-600 hover:underline">Information We Collect</a></li>
            <li><a href="#how-use" className="text-indigo-600 hover:underline">How We Use Your Information</a></li>
            <li><a href="#how-share" className="text-indigo-600 hover:underline">How We Share Your Information</a></li>
            <li><a href="#data-security" className="text-indigo-600 hover:underline">Data Security</a></li>
            <li><a href="#data-retention" className="text-indigo-600 hover:underline">Data Retention</a></li>
            <li><a href="#your-rights" className="text-indigo-600 hover:underline">Your Rights</a></li>
            <li><a href="#cookies" className="text-indigo-600 hover:underline">Cookies and Tracking</a></li>
            <li><a href="#third-party" className="text-indigo-600 hover:underline">Third-Party Links</a></li>
            <li><a href="#children" className="text-indigo-600 hover:underline">Children's Privacy</a></li>
            <li><a href="#international" className="text-indigo-600 hover:underline">International Data Transfers</a></li>
            <li><a href="#changes" className="text-indigo-600 hover:underline">Changes to This Privacy Policy</a></li>
            <li><a href="#contact" className="text-indigo-600 hover:underline">Contact Us</a></li>
          </ol>
        </nav>

        {/* 1. Information We Collect */}
        <section id="info-collect" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.1 Account Information</h3>
          <p className="text-slate-700 leading-relaxed mb-3">
            When you create an account, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Email address (required for account creation and login)</li>
            <li>Name (if provided during registration)</li>
            <li>Password (encrypted and securely hashed using bcrypt)</li>
            <li>Authentication data (if you sign up via Google OAuth or Facebook OAuth)</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.2 Resume and Career Data</h3>
          <p className="text-slate-700 leading-relaxed mb-3">
            To provide our resume-building services, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Personal details (full name, job title, contact information, address, LinkedIn profile, website)</li>
            <li>Professional summary</li>
            <li>Work experience (job titles, companies, dates, descriptions)</li>
            <li>Education history (degrees, institutions, graduation dates)</li>
            <li>Skills and qualifications</li>
            <li>Resume versions and edit history</li>
            <li>Cover letters generated through our AI tools</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.3 Job Application Tracking Data</h3>
          <p className="text-slate-700 leading-relaxed mb-3">
            If you use our Application Tracker feature, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Company names you've applied to</li>
            <li>Job positions/roles</li>
            <li>Application dates</li>
            <li>Application status (Applied, Interviewing, Offer, Rejected)</li>
            <li>Personal notes about applications</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.4 Course Enrollment Data</h3>
          <p className="text-slate-700 leading-relaxed mb-3">
            When you enroll in courses, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Course titles and providers</li>
            <li>Enrollment dates</li>
            <li>Progress tracking information</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.5 Payment Information</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            When you purchase a subscription, payment processing is handled by <strong>Stripe</strong>. We collect:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Subscription plan type (Free, Pro, Premium)</li>
            <li>Subscription status and billing dates</li>
            <li>Stripe customer ID (for subscription management)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Important:</strong> We do NOT store your credit card details. All payment card information is securely processed and stored by Stripe, a PCI-DSS compliant payment processor.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.6 Usage Data</h3>
          <p className="text-slate-700 leading-relaxed mb-3">
            We may collect information about how you access and use our service, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Pages visited and features used</li>
            <li>Time and date of visits</li>
            <li>Time spent on pages</li>
            <li>Browser type and version</li>
            <li>Device type and operating system</li>
            <li>IP address (for security and fraud prevention)</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">1.7 Cookies and Tracking Technologies</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            We use essential cookies for authentication and session management. We may implement analytics cookies (such as Google Analytics) in the future. See the <a href="#cookies" className="text-indigo-600 hover:underline">Cookies and Tracking</a> section for details.
          </p>
        </section>

        {/* 2. How We Use Your Information */}
        <section id="how-use" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li><strong>Provide Services:</strong> To create and manage your account, build and store your resumes, generate AI-enhanced content, track job applications, and recommend courses and jobs.</li>
            <li><strong>AI Enhancement:</strong> Your resume data is sent to Google Gemini AI to provide content suggestions, improvements, and cover letter generation. This data is processed securely and in accordance with Google's privacy policies.</li>
            <li><strong>Process Payments:</strong> To manage subscriptions, process payments via Stripe, and handle billing inquiries.</li>
            <li><strong>Send Service Emails:</strong> To send transactional emails such as account verification, password resets, subscription confirmations, and important service updates.</li>
            <li><strong>Improve Our Service:</strong> To analyze usage patterns, identify bugs, and enhance features based on user behavior.</li>
            <li><strong>Security and Fraud Prevention:</strong> To detect and prevent unauthorized access, abuse, or fraudulent activity.</li>
            <li><strong>Comply with Legal Obligations:</strong> To respond to legal requests, court orders, or regulatory requirements.</li>
          </ul>
        </section>

        {/* 3. How We Share Your Information */}
        <section id="how-share" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Share Your Information</h2>
          <p className="text-slate-700 leading-relaxed mb-4 font-semibold">
            We DO NOT sell, rent, or trade your personal information to third parties.
          </p>
          <p className="text-slate-700 leading-relaxed mb-3">
            We may share your information only in the following circumstances:
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">3.1 Third-Party Service Providers</h3>
          <p className="text-slate-700 leading-relaxed mb-3">
            We work with trusted third-party services to operate our platform:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li><strong>Supabase (PostgreSQL):</strong> Database hosting and authentication services. Data is stored in secure, encrypted databases.</li>
            <li><strong>Stripe:</strong> Payment processing for subscriptions. Stripe is PCI-DSS Level 1 certified and handles all payment card data.</li>
            <li><strong>Google Gemini AI:</strong> AI-powered resume enhancement and cover letter generation. Resume content is sent to Google's API for processing and improvement suggestions.</li>
            <li><strong>Adzuna API:</strong> External job listing aggregation. We fetch job data from Adzuna to display on our platform.</li>
            <li><strong>Vercel:</strong> Cloud hosting platform for our application infrastructure.</li>
            <li><strong>Google OAuth / Facebook OAuth:</strong> Third-party authentication providers (if you choose to sign in via these services).</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">3.2 Legal Requirements</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            We may disclose your information if required to do so by law or in response to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Court orders or subpoenas</li>
            <li>Legal processes or government requests</li>
            <li>Protection of our rights, property, or safety</li>
            <li>Investigation of fraud, security issues, or violations of our Terms of Service</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">3.3 Business Transfers</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            If Career Hub AI is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our website of any change in ownership or use of your personal information.
          </p>
        </section>

        {/* 4. Data Security */}
        <section id="data-security" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We take the security of your personal information seriously and implement industry-standard measures to protect it:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using HTTPS (SSL/TLS). Sensitive data at rest is encrypted using AES-256-GCM encryption.</li>
            <li><strong>Password Security:</strong> User passwords are hashed using bcrypt, a secure one-way hashing algorithm. We never store plain-text passwords.</li>
            <li><strong>Access Controls:</strong> Strict authentication and authorization controls ensure only authorized users can access their own data.</li>
            <li><strong>Database Security:</strong> Our database (Supabase) implements Row Level Security (RLS) policies to prevent unauthorized data access.</li>
            <li><strong>Regular Security Reviews:</strong> We conduct regular security audits and updates to protect against vulnerabilities.</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Important:</strong> While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        {/* 5. Data Retention */}
        <section id="data-retention" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Retention</h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li><strong>Active Accounts:</strong> Your data is retained for as long as your account remains active.</li>
            <li><strong>Deleted Accounts:</strong> When you delete your account, your personal data is permanently deleted or anonymized within 30 days. Some data may be retained longer if required by law.</li>
            <li><strong>Backups:</strong> Backup copies are retained for disaster recovery purposes for up to 90 days and are securely deleted thereafter.</li>
            <li><strong>Legal Requirements:</strong> Some information may be retained longer if required by law, such as financial records for tax purposes (typically 7 years in Australia).</li>
          </ul>
        </section>

        {/* 6. Your Rights */}
        <section id="your-rights" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Rights (Australian Privacy Principles & GDPR)</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Under the Australian Privacy Principles (APPs) and the General Data Protection Regulation (GDPR), you have the following rights:
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.1 Right to Access</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You have the right to access your personal data at any time. Career Hub AI provides a <strong>Data Export</strong> feature that allows you to download all your data in a structured format.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.2 Right to Rectification</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You can update or correct your personal information (profile details, resume data, etc.) directly through our application interface at any time.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.3 Right to Deletion</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You have the right to request deletion of your personal data. Career Hub AI provides an <strong>Account Deletion</strong> feature. When you delete your account, all personal data is permanently removed within 30 days.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.4 Right to Withdraw Consent</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You can withdraw your consent for data processing at any time by deleting your account or contacting us at <a href="mailto:careerhubaiaus@gmail.com" className="text-indigo-600 hover:underline">careerhubaiaus@gmail.com</a>.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.5 Right to Object</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You have the right to object to certain types of data processing. Contact us if you wish to exercise this right.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">6.6 Right to Lodge a Complaint</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            If you believe we have not handled your personal information properly, you have the right to lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at <a href="https://www.oaic.gov.au" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">www.oaic.gov.au</a>.
          </p>
        </section>

        {/* 7. Cookies and Tracking */}
        <section id="cookies" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies and Tracking Technologies</h2>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">7.1 Essential Cookies</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            We use essential cookies that are necessary for the operation of our service:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li><strong>Authentication Cookies:</strong> To keep you logged in and maintain your session securely.</li>
            <li><strong>Security Cookies:</strong> To detect and prevent fraudulent activity and abuse.</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            These cookies are essential for the service to function and cannot be disabled.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">7.2 Analytics Cookies (Future Implementation)</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            We may implement analytics tools (such as Google Analytics) in the future to understand how users interact with our service. If we do, we will:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>Update this Privacy Policy to reflect the change</li>
            <li>Provide clear notice to users</li>
            <li>Offer the ability to opt out of analytics tracking</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">7.3 How to Control Cookies</h3>
          <p className="text-slate-700 leading-relaxed mb-4">
            You can configure your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you disable essential cookies, some features of our service may not function properly.
          </p>
        </section>

        {/* 8. Third-Party Links */}
        <section id="third-party" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Third-Party Links</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI may contain links to external websites and services that are not operated by us:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li><strong>Job Listings:</strong> Links to external job postings (sourced from Adzuna)</li>
            <li><strong>Course Links:</strong> Links to course providers (YouTube, Udemy, and other platforms)</li>
            <li><strong>Social Media:</strong> Links to our social media profiles (Facebook)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            <strong>Important:</strong> We are not responsible for the privacy practices or content of these third-party websites. We encourage you to read the privacy policies of any external sites you visit.
          </p>
        </section>

        {/* 9. Children's Privacy */}
        <section id="children" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Children's Privacy</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI is intended for users aged 18 and over. Users between the ages of 13-17 may use our service with parental or guardian consent. We do not knowingly collect personal information from children under 13.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            If we discover that we have collected personal information from a child under 13 without parental consent, we will take immediate steps to delete that information from our servers.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us at <a href="mailto:careerhubaiaus@gmail.com" className="text-indigo-600 hover:underline">careerhubaiaus@gmail.com</a>.
          </p>
        </section>

        {/* 10. International Data Transfers */}
        <section id="international" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">10. International Data Transfers</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Career Hub AI operates primarily in Australia. Your data is stored in secure databases located in Australia (Supabase Sydney region).
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            However, some of our third-party service providers may process data internationally:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-4">
            <li><strong>Google Gemini AI:</strong> May process resume data on Google's international infrastructure</li>
            <li><strong>Stripe:</strong> Payment data may be processed internationally in accordance with Stripe's global infrastructure</li>
            <li><strong>Vercel:</strong> Hosting infrastructure may span multiple regions</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            We ensure that all third-party providers implement appropriate safeguards to protect your data in compliance with applicable privacy laws, including the Australian Privacy Principles and GDPR.
          </p>
        </section>

        {/* 11. Changes to This Privacy Policy */}
        <section id="changes" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Changes to This Privacy Policy</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            When we make material changes to this Privacy Policy:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4 mb-4">
            <li>We will update the "Last Updated" date at the top of this page</li>
            <li>We will notify you via email (if you have an active account)</li>
            <li>We may display a prominent notice on our website</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mb-4">
            Your continued use of Career Hub AI after changes are posted constitutes your acceptance of the updated Privacy Policy. We encourage you to review this page periodically.
          </p>
        </section>

        {/* 12. Contact Us */}
        <section id="contact" className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Contact Us</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact us:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <p className="text-slate-700 mb-2"><strong>Career Hub AI</strong></p>
            <p className="text-slate-700 mb-2"><strong>Email:</strong> <a href="mailto:careerhubaiaus@gmail.com" className="text-indigo-600 hover:underline">careerhubaiaus@gmail.com</a></p>
            <p className="text-slate-700 mb-2"><strong>Location:</strong> Melbourne, Victoria, Australia</p>
            <p className="text-slate-700"><strong>ABN:</strong> 11 770 610 482</p>
          </div>
          <p className="text-slate-700 leading-relaxed mt-4">
            We aim to respond to all privacy-related inquiries within 7 business days.
          </p>
        </section>

        {/* Disclaimer */}
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-10">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">Legal Disclaimer</h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            This Privacy Policy is provided as a guideline for transparency and compliance with Australian Privacy Principles and international privacy regulations. While we strive to ensure accuracy and compliance, we recommend consulting with a legal professional for specific advice. If you have concerns about how your data is handled, please contact us or consult the Office of the Australian Information Commissioner.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
