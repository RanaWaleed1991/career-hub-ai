import React, { useState, useCallback } from 'react';
import { analyzeSkillGap } from '../services/geminiService';
import type { SkillGapResult, MissingSkill, PresentSkill, SkillRecommendation } from '../types';
import { ChartBarIcon } from './icons';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const priorityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  important: 'bg-amber-100 text-amber-700 border-amber-200',
  'nice-to-have': 'bg-blue-100 text-blue-700 border-blue-200',
};

const strengthColor: Record<string, string> = {
  strong: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  moderate: 'bg-teal-100 text-teal-700 border-teal-200',
  mentioned: 'bg-gray-100 text-gray-600 border-gray-200',
};

const categoryLabel: Record<string, string> = {
  technical: 'Technical',
  soft: 'Soft Skill',
  certification: 'Certification',
  domain: 'Domain',
};

const recommendationLabel: Record<string, string> = {
  highlight: 'Highlight',
  learn: 'Learn',
  reframe: 'Reframe',
};

const recommendationColor: Record<string, string> = {
  learn: 'bg-purple-100 text-purple-700',
  highlight: 'bg-emerald-100 text-emerald-700',
  reframe: 'bg-blue-100 text-blue-700',
};

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth="12"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>
          {score}
        </text>
        <text x="70" y="84" textAnchor="middle" fontSize="12" fill="#6b7280">
          match
        </text>
      </svg>
      <span className="text-sm font-medium text-gray-500 mt-1">
        {score >= 75 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Needs Work'}
      </span>
    </div>
  );
}

function SkillBadge({ skill, colorClass }: { skill: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {skill}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  triggerPremiumFlow?: () => void;
  setActionToRetry?: (fn: (() => void) | null) => void;
}

const SkillGapPage: React.FC<Props> = ({ triggerPremiumFlow, setActionToRetry }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'missing' | 'present' | 'actions'>('overview');

  const handleAnalyse = useCallback(async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please paste both your resume and the job description.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeSkillGap(resumeText, jobDescription);
      setResult(data);
      setActiveTab('overview');
    } catch (err: any) {
      if (err?.limitReached) {
        if (triggerPremiumFlow) triggerPremiumFlow();
        if (setActionToRetry) setActionToRetry(() => handleAnalyse);
        return;
      }
      setError(err?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [resumeText, jobDescription, triggerPremiumFlow, setActionToRetry]);

  const handleReset = () => {
    setResult(null);
    setError(null);
    setResumeText('');
    setJobDescription('');
  };

  return (
    <div className="min-h-full bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ChartBarIcon className="w-7 h-7 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Skill Gap Audit</h1>
          </div>
          <p className="text-gray-500 ml-14">
            Compare your resume against any job description. Get an instant match score, identify missing skills, and get a clear roadmap to close the gap.
          </p>
        </div>

        {!result ? (
          /* ── Input Panel ── */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Your Resume
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Paste the plain text of your resume (use Ctrl+A, Ctrl+C from your resume document).
              </p>
              <textarea
                className="flex-1 min-h-64 p-3 text-sm text-slate-700 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-slate-50"
                placeholder="John Smith&#10;Software Engineer&#10;&#10;Experience&#10;Senior Developer at Acme Corp (2021–present)&#10;- Led migration of monolith to microservices..."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
              />
              <span className="text-xs text-gray-400 mt-2 text-right">
                {resumeText.length.toLocaleString()} chars
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Job Description
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Paste the full job description including responsibilities and requirements.
              </p>
              <textarea
                className="flex-1 min-h-64 p-3 text-sm text-slate-700 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-slate-50"
                placeholder="We are looking for a Senior Software Engineer...&#10;&#10;Requirements:&#10;- 5+ years of experience with React&#10;- Proficiency in TypeScript and Node.js&#10;- Experience with AWS or Azure..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />
              <span className="text-xs text-gray-400 mt-2 text-right">
                {jobDescription.length.toLocaleString()} chars
              </span>
            </div>

            <div className="lg:col-span-2">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}
              <button
                onClick={handleAnalyse}
                disabled={loading || !resumeText.trim() || !jobDescription.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-base shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analysing your profile...
                  </>
                ) : (
                  'Run Skill Gap Audit'
                )}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">
                Free plan: 3 audits/period — shared with Resume Analyser
              </p>
            </div>
          </div>
        ) : (
          /* ── Results Panel ── */
          <div className="space-y-6">
            {/* Score Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreRing score={result.matchScore} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Your Career Audit</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{result.matchSummary}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <p className="text-xs text-emerald-600 font-medium mb-1">Top Strengths</p>
                      {result.strengthAreas.map((s, i) => (
                        <p key={i} className="text-sm text-emerald-700 flex items-start gap-1">
                          <span className="font-bold mt-0.5">+</span> {s}
                        </p>
                      ))}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs text-amber-600 font-medium mb-1">Key Gaps</p>
                      {result.improvementAreas.map((s, i) => (
                        <p key={i} className="text-sm text-amber-700 flex items-start gap-1">
                          <span className="font-bold mt-0.5">–</span> {s}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {(
                [
                  { key: 'overview', label: 'Overview', count: null },
                  { key: 'missing', label: 'Missing Skills', count: result.missingSkills.length },
                  { key: 'present', label: 'Your Skills', count: result.presentSkills.length },
                  { key: 'actions', label: 'Action Plan', count: result.recommendations.length },
                ] as const
              ).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === tab.key
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      activeTab === tab.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3">Keyword Gaps</h3>
                    <p className="text-xs text-gray-400 mb-3">
                      Terms from the JD not found in your resume. Add these where truthful.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordGaps.length > 0
                        ? result.keywordGaps.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-medium"
                            >
                              {kw}
                            </span>
                          ))
                        : <p className="text-sm text-emerald-600 font-medium">No obvious keyword gaps found.</p>
                      }
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3">Critical Missing Skills</h3>
                    <div className="space-y-2">
                      {result.missingSkills
                        .filter(s => s.priority === 'critical')
                        .slice(0, 5)
                        .map((s, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                            <span className="text-xs font-bold px-2 py-0.5 bg-red-200 text-red-700 rounded mt-0.5">
                              {categoryLabel[s.category] || s.category}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{s.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{s.reason}</p>
                            </div>
                          </div>
                        ))}
                      {result.missingSkills.filter(s => s.priority === 'critical').length === 0 && (
                        <p className="text-sm text-emerald-600 font-medium">No critical missing skills detected.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'missing' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">
                    Skills required or desired by the employer that aren't clearly demonstrated in your resume.
                  </p>
                  {(['critical', 'important', 'nice-to-have'] as const).map(priority => {
                    const skills = result.missingSkills.filter((s: MissingSkill) => s.priority === priority);
                    if (skills.length === 0) return null;
                    const priorityLabels = { critical: 'Critical', important: 'Important', 'nice-to-have': 'Nice to Have' };
                    const priorityDot = { critical: 'bg-red-500', important: 'bg-amber-500', 'nice-to-have': 'bg-blue-500' };
                    return (
                      <div key={priority} className="mb-5">
                        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${priorityDot[priority]}`} />
                          {priorityLabels[priority]}
                        </h4>
                        <div className="space-y-2">
                          {skills.map((s: MissingSkill, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                              <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded mt-0.5 flex-shrink-0">
                                {categoryLabel[s.category] || s.category}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                                  <SkillBadge skill={s.category} colorClass={priorityColor[s.priority]} />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{s.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'present' && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Skills and competencies from the JD that your resume already demonstrates.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.presentSkills.map((s: PresentSkill, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded flex-shrink-0">
                          {categoryLabel[s.category] || s.category}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{s.name}</p>
                        </div>
                        <SkillBadge skill={s.strength} colorClass={strengthColor[s.strength]} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">
                    Your personalised action plan to improve your match score.
                  </p>
                  {result.recommendations.map((r: SkillRecommendation, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{r.skill}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{r.action}</p>
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${recommendationColor[r.type] || 'bg-gray-100 text-gray-700'}`}>
                          {recommendationLabel[r.type] || r.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 rounded-xl transition-colors text-sm font-medium"
            >
              Analyse a Different Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapPage;
