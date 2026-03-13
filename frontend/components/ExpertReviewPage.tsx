import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { createExpertReviewCheckout } from '../services/expertReviewService';

const ExpertReviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetStarted = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { sessionUrl } = await createExpertReviewCheckout();
      window.location.href = sessionUrl;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      num: '1',
      title: 'Purchase & Upload',
      desc: 'Complete your payment and upload your current resume (PDF) from your dashboard.',
    },
    {
      num: '2',
      title: 'Expert Review',
      desc: 'A senior career specialist reviews your resume and may ask industry-specific questions.',
    },
    {
      num: '3',
      title: 'Professional Rewrite',
      desc: 'Your resume is completely rewritten by a human expert with years of experience.',
    },
    {
      num: '4',
      title: 'Download & Apply',
      desc: 'Download your professionally crafted resume and start landing more interviews.',
    },
  ];

  const included = [
    'Complete resume rewrite by a certified career specialist',
    'Industry-specific formatting and keyword optimisation',
    'ATS-friendly structure guaranteed',
    'Personalised questionnaire for targeted improvements',
    '30 days of Premium access (all AI tools, unlimited downloads)',
    'Delivered within 1-2 business days',
    'Satisfaction guarantee — free revision if not happy',
  ];

  return (
    <div className="min-h-full bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 text-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Limited availability
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Get Your Resume<br />
            <span className="text-purple-200">Professionally Rewritten</span>
          </h1>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            AI is powerful, but sometimes you need the human touch. A senior career specialist with years
            of experience will personally review and rewrite your resume.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px]"
            >
              {isLoading ? 'Processing...' : 'Get Expert Review — $89'}
            </button>
            <p className="text-purple-200 text-sm">
              One-time payment. Includes 30 days Premium.
            </p>
          </div>
          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-3 text-red-100 text-sm max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Value Comparison */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-10 -mt-16 relative z-10">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-slate-800">$150–$500+</div>
                <p className="text-slate-500 text-sm mt-1">Traditional resume writing services in Australia</p>
              </div>
              <div className="border-t md:border-t-0 md:border-l md:border-r border-slate-200 pt-6 md:pt-0 md:px-8">
                <div className="text-4xl font-extrabold text-purple-600">$89</div>
                <p className="text-slate-600 text-sm mt-1 font-semibold">Expert Review + 30 days Premium AI tools</p>
              </div>
              <div className="border-t md:border-t-0 pt-6 md:pt-0">
                <div className="text-3xl font-bold text-green-600">1-2 days</div>
                <p className="text-slate-500 text-sm mt-1">Average turnaround time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-10">What's Included</h2>
          <div className="space-y-4">
            {included.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-green-500 mt-0.5 flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Credentials */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Your Career Expert</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Senior Resume Strategist</h3>
            <p className="text-purple-600 font-medium text-sm mb-4">Years of Professional Experience</p>
            <p className="text-slate-600 leading-relaxed max-w-lg mx-auto">
              Our expert has helped hundreds of professionals land interviews at top companies across IT, healthcare,
              government, finance, and more. Every resume is personally crafted — never templated.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div>
                <div className="text-2xl font-bold text-slate-800">200+</div>
                <p className="text-xs text-slate-500">Resumes rewritten</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">200+</div>
                <p className="text-xs text-slate-500">Clients helped</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">3x</div>
                <p className="text-xs text-slate-500">More interview callbacks</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'How long does it take?',
                a: 'You\'ll receive your professionally rewritten resume within 1-2 business days. If our expert needs additional information, they\'ll send you a short questionnaire through your dashboard.',
              },
              {
                q: 'What if I\'m not satisfied?',
                a: 'We offer a free revision if you\'re not completely happy with the result. Simply let us know what you\'d like changed.',
              },
              {
                q: 'What format will I receive?',
                a: 'Your rewritten resume will be delivered as a polished, ready-to-use PDF that you can download directly from your dashboard.',
              },
              {
                q: 'What\'s included in the 30-day Premium access?',
                a: 'You get unlimited AI resume analysis, cover letter generation, resume tailoring, clean downloads (no watermark), version history, and all other premium features for a full 30 days.',
              },
              {
                q: 'How is this different from the AI tools?',
                a: 'While our AI tools are excellent for quick improvements, the Expert Review is a full human rewrite. A career specialist reads your resume, understands your career goals, and crafts a completely new version optimised for your target industry.',
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-200 pb-6">
                <h3 className="font-semibold text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-violet-700 to-indigo-800 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Stand Out?</h2>
          <p className="text-purple-100 mb-8 text-lg">
            Invest in your career with a professionally crafted resume that gets results.
          </p>
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 min-w-[220px]"
          >
            {isLoading ? 'Processing...' : 'Get Expert Review — $89'}
          </button>
          <p className="text-purple-200 text-sm mt-4">
            Secure payment via Stripe. One-time purchase. No recurring charges.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ExpertReviewPage;
