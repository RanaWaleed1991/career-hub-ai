import React, { useState, useCallback } from 'react';
import { generateSelectionCriteria } from '../services/geminiService';
import type { SelectionCriteriaResult, SelectionCriterion } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const confidenceStyle: Record<string, { badge: string; label: string; icon: string }> = {
  high: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Strong Evidence', icon: '✅' },
  medium: { badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Partial Evidence', icon: '⚠️' },
  low: { badge: 'bg-red-100 text-red-700 border-red-200', label: 'Limited Evidence', icon: '⚠️' },
};

function copyToClipboard(text: string, setCopied: (s: string) => void, id: string) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  });
}

function StarCard({ criterion, index, copied, setCopied }: {
  criterion: SelectionCriterion;
  index: number;
  copied: string;
  setCopied: (s: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const conf = confidenceStyle[criterion.confidence];
  const copyId = `criterion-${index}`;

  return (
    <div className={`border rounded-2xl overflow-hidden transition-shadow hover:shadow-md ${
      criterion.type === 'essential' ? 'border-indigo-200' : 'border-slate-200'
    }`}>
      {/* Card Header */}
      <div
        className={`flex items-start justify-between p-4 cursor-pointer ${
          criterion.type === 'essential' ? 'bg-indigo-50' : 'bg-slate-50'
        }`}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="mt-0.5 text-xl flex-shrink-0">
            {criterion.type === 'essential' ? '⭐' : '➕'}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                criterion.type === 'essential'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {criterion.type}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${conf.badge}`}>
                {conf.icon} {conf.label}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{criterion.criterion}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-2 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* STAR Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                { key: 'situation', label: 'Situation', color: 'bg-blue-50 border-blue-100', icon: '🏢' },
                { key: 'task', label: 'Task', color: 'bg-purple-50 border-purple-100', icon: '📋' },
                { key: 'action', label: 'Action', color: 'bg-amber-50 border-amber-100', icon: '⚡' },
                { key: 'result', label: 'Result', color: 'bg-emerald-50 border-emerald-100', icon: '🎯' },
              ] as const
            ).map(({ key, label, color, icon }) => (
              <div key={key} className={`p-3 rounded-xl border ${color}`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  {icon} {label}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {criterion.starResponse[key]}
                </p>
              </div>
            ))}
          </div>

          {/* Full Response */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                📝 Full Response
              </p>
              <button
                onClick={() => copyToClipboard(criterion.fullResponse, setCopied, copyId)}
                className={`text-xs px-3 py-1 rounded-lg border transition-colors font-medium flex items-center gap-1 ${
                  copied === copyId
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                }`}
              >
                {copied === copyId ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {criterion.fullResponse}
            </p>
          </div>

          {criterion.confidence === 'low' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <span>⚠️</span>
              <p>
                <strong>Limited evidence in your resume</strong> for this criterion. Consider adding relevant experience, or be prepared to address this in an interview.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  triggerPremiumFlow?: () => void;
  setActionToRetry?: (fn: (() => void) | null) => void;
}

const SelectionCriteriaPage: React.FC<Props> = ({ triggerPremiumFlow, setActionToRetry }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<SelectionCriteriaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'essential' | 'desirable'>('all');

  const handleGenerate = useCallback(async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please paste both your resume and the job description.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateSelectionCriteria(resumeText, jobDescription);
      setResult(data);
    } catch (err: any) {
      if (err?.limitReached) {
        if (triggerPremiumFlow) triggerPremiumFlow();
        if (setActionToRetry) setActionToRetry(() => handleGenerate);
        return;
      }
      setError(err?.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [resumeText, jobDescription, triggerPremiumFlow, setActionToRetry]);

  const handleCopyAll = () => {
    if (!result) return;
    const filtered = result.criteria.filter(c =>
      activeFilter === 'all' ? true : c.type === activeFilter
    );
    const text = filtered.map((c, i) =>
      `--- Criterion ${i + 1}: ${c.type.toUpperCase()} ---\n${c.criterion}\n\n${c.fullResponse}`
    ).join('\n\n\n');
    copyToClipboard(text, setCopied, 'all');
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setResumeText('');
    setJobDescription('');
  };

  const filteredCriteria = result?.criteria.filter(c =>
    activeFilter === 'all' ? true : c.type === activeFilter
  ) ?? [];

  const essentialCount = result?.criteria.filter(c => c.type === 'essential').length ?? 0;
  const desirableCount = result?.criteria.filter(c => c.type === 'desirable').length ?? 0;

  return (
    <div className="min-h-full bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📋</span>
            <h1 className="text-3xl font-bold text-slate-800">Selection Criteria Generator</h1>
          </div>
          <p className="text-gray-500 ml-12">
            Automatically identify essential and desirable criteria from any job description and generate assertive, evidence-based STAR responses using only your actual experience.
          </p>
        </div>

        {!result ? (
          /* ── Input Panel ── */
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <div className="text-sm text-indigo-800">
                <p className="font-semibold mb-1">How it works</p>
                <p>The AI extracts every selection criterion from the job description, then drafts a structured STAR response for each one using only the experience in your resume. No invented facts — only evidence-based responses.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📄 Your Resume
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Paste the plain text of your resume. Include specific metrics, achievements, and dates.
                </p>
                <textarea
                  className="flex-1 min-h-64 p-3 text-sm text-slate-700 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-slate-50"
                  placeholder="Jane Smith&#10;Project Manager · PMP Certified&#10;&#10;Experience&#10;Senior Project Manager — TechCorp (2020–present)&#10;- Delivered $2.4M infrastructure project 3 weeks ahead of schedule&#10;- Managed cross-functional team of 12 across 3 time zones..."
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                />
                <span className="text-xs text-gray-400 mt-2 text-right">
                  {resumeText.length.toLocaleString()} chars
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  💼 Job Description
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Paste the full job posting. If it has a "Selection Criteria" section, include it — otherwise the AI will infer criteria from responsibilities and requirements.
                </p>
                <textarea
                  className="flex-1 min-h-64 p-3 text-sm text-slate-700 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-slate-50"
                  placeholder="Position: Senior Project Manager&#10;Organisation: City Council&#10;&#10;Essential Criteria:&#10;1. Demonstrated ability to manage complex, multi-stakeholder projects...&#10;2. Strong experience in budget management..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                />
                <span className="text-xs text-gray-400 mt-2 text-right">
                  {jobDescription.length.toLocaleString()} chars
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !resumeText.trim() || !jobDescription.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-base shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating STAR responses... (this may take 30–60 seconds)
                </>
              ) : (
                <>📋 Generate Selection Criteria</>
              )}
            </button>
            <p className="text-xs text-center text-gray-400 -mt-4">
              Uses Gemini 2.5 Pro · Free plan: 3 documents/period
            </p>
          </div>
        ) : (
          /* ── Results Panel ── */
          <div className="space-y-5">
            {/* Result Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{result.jobTitle || 'Role'}</h2>
                  {result.organization && (
                    <p className="text-sm text-gray-500 mt-0.5">🏢 {result.organization}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                      {essentialCount} Essential
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-semibold">
                      {desirableCount} Desirable
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleCopyAll}
                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
                      copied === 'all'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                    }`}
                  >
                    {copied === 'all' ? '✓ Copied All' : '📋 Copy All Responses'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    ← New Document
                  </button>
                </div>
              </div>

              {result.generalNotes && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
                  <p className="font-semibold mb-1">💡 Coach's Notes</p>
                  <p>{result.generalNotes}</p>
                </div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {(
                [
                  { key: 'all', label: `All (${result.criteria.length})` },
                  { key: 'essential', label: `⭐ Essential (${essentialCount})` },
                  { key: 'desirable', label: `➕ Desirable (${desirableCount})` },
                ] as const
              ).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === tab.key
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Criteria Cards */}
            <div className="space-y-4">
              {filteredCriteria.map((criterion, i) => (
                <StarCard
                  key={i}
                  criterion={criterion}
                  index={i}
                  copied={copied}
                  setCopied={setCopied}
                />
              ))}
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 rounded-xl transition-colors text-sm font-medium"
            >
              ← Generate for a Different Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionCriteriaPage;
