import React, { useState, useEffect, useRef } from 'react';
import type { ExpertReview, ExpertReviewStatus } from '../types';
import {
  getAdminOrders,
  updateReviewStatus,
  setQuestionnaireQuestions,
  uploadRewrittenResume,
  downloadOriginalResume,
  getQuestionnaireAnswers,
} from '../services/expertReviewService';

const STATUS_COLORS: Record<ExpertReviewStatus, string> = {
  pending_submission: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  in_review: 'bg-indigo-100 text-indigo-800',
  questionnaire_sent: 'bg-purple-100 text-purple-800',
  questionnaire_completed: 'bg-teal-100 text-teal-800',
  revision_in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
};

const STATUS_LABELS: Record<ExpertReviewStatus, string> = {
  pending_submission: 'Pending Upload',
  submitted: 'Submitted',
  in_review: 'In Review',
  questionnaire_sent: 'Questionnaire Sent',
  questionnaire_completed: 'Answers Received',
  revision_in_progress: 'Revision In Progress',
  completed: 'Completed',
};

const ExpertReviewAdmin: React.FC = () => {
  const [orders, setOrders] = useState<ExpertReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ExpertReview | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Questionnaire builder state
  const [questions, setQuestions] = useState<{ question: string; type: string }[]>([
    { question: '', type: 'textarea' },
  ]);
  const [savingQuestions, setSavingQuestions] = useState(false);

  // Answers view
  const [answers, setAnswers] = useState<any>(null);

  // Upload state
  const [uploadingRewrite, setUploadingRewrite] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminOrders(filterStatus || undefined);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateReviewStatus(orderId, newStatus);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as ExpertReviewStatus });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleDownloadOriginal = async (orderId: string) => {
    try {
      const { downloadUrl } = await downloadOriginalResume(orderId);
      window.open(downloadUrl, '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to download');
    }
  };

  const handleSendQuestionnaire = async (orderId: string) => {
    const validQuestions = questions.filter(q => q.question.trim());
    if (validQuestions.length === 0) {
      setError('Add at least one question');
      return;
    }

    setSavingQuestions(true);
    try {
      await setQuestionnaireQuestions(orderId, validQuestions);
      setQuestions([{ question: '', type: 'textarea' }]);
      await loadOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to send questionnaire');
    } finally {
      setSavingQuestions(false);
    }
  };

  const handleViewAnswers = async (orderId: string) => {
    try {
      const data = await getQuestionnaireAnswers(orderId);
      setAnswers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load answers');
    }
  };

  const handleUploadRewrite = async (orderId: string, file: File) => {
    setUploadingRewrite(true);
    try {
      await uploadRewrittenResume(orderId, file);
      await loadOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to upload rewrite');
    } finally {
      setUploadingRewrite(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', type: 'textarea' }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800">Expert Review Orders</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600 font-bold">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg font-medium">No expert review orders yet</p>
          <p className="text-sm mt-1">Orders will appear here when users purchase the Expert Review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`bg-white border rounded-xl shadow-sm overflow-hidden ${
                selectedOrder?.id === order.id ? 'border-purple-300 ring-2 ring-purple-100' : 'border-slate-200'
              }`}
            >
              {/* Order Header */}
              <div
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{order.user_name || 'Unknown User'}</p>
                      <p className="text-xs text-slate-500">{order.user_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">
                      ${((order.amount_paid || 0) / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-AU') : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {selectedOrder?.id === order.id && (
                <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50">
                  <div className="text-xs text-slate-400">ID: {order.id}</div>

                  {/* Actions based on status */}
                  <div className="flex flex-wrap gap-2">
                    {/* Download original resume */}
                    {order.original_resume_url && (
                      <button
                        onClick={() => handleDownloadOriginal(order.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Download Original Resume
                      </button>
                    )}

                    {/* View answers */}
                    {order.questionnaire_answers && (
                      <button
                        onClick={() => handleViewAnswers(order.id)}
                        className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors"
                      >
                        View Answers
                      </button>
                    )}

                    {/* Upload rewrite */}
                    {['questionnaire_completed', 'revision_in_progress', 'in_review', 'submitted'].includes(order.status) && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadRewrite(order.id, file);
                          }}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingRewrite}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {uploadingRewrite ? 'Uploading...' : 'Upload Rewritten Resume'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Status update */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Update Status</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white w-full max-w-xs"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Questionnaire builder — show when resume submitted but no questionnaire yet */}
                  {['submitted', 'in_review'].includes(order.status) && !order.questionnaire && (
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <h4 className="font-semibold text-sm text-slate-800 mb-3">Send Questionnaire to User</h4>
                      <div className="space-y-3">
                        {questions.map((q, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[i].question = e.target.value;
                                setQuestions(updated);
                              }}
                              placeholder={`Question ${i + 1}`}
                              className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                            />
                            {questions.length > 1 && (
                              <button
                                onClick={() => removeQuestion(i)}
                                className="text-red-400 hover:text-red-600 px-2"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button
                            onClick={addQuestion}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            + Add Question
                          </button>
                        </div>
                        <button
                          onClick={() => handleSendQuestionnaire(order.id)}
                          disabled={savingQuestions}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {savingQuestions ? 'Sending...' : 'Send Questionnaire'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show answers modal */}
                  {answers && (
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-sm text-slate-800">Questionnaire Answers</h4>
                        <button onClick={() => setAnswers(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
                      </div>
                      <div className="space-y-3">
                        {answers.answers?.map((a: any, i: number) => (
                          <div key={i} className="border-b border-slate-100 pb-3">
                            <p className="text-xs font-semibold text-slate-600 mb-1">Q: {a.question}</p>
                            <p className="text-sm text-slate-800">{a.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin notes */}
                  {order.admin_notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">Admin Notes</p>
                      <p className="text-sm text-yellow-700">{order.admin_notes}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Created: {order.created_at ? new Date(order.created_at).toLocaleString('en-AU') : '-'}</p>
                    {order.submitted_at && <p>Submitted: {new Date(order.submitted_at).toLocaleString('en-AU')}</p>}
                    {order.questionnaire_sent_at && <p>Questionnaire Sent: {new Date(order.questionnaire_sent_at).toLocaleString('en-AU')}</p>}
                    {order.questionnaire_completed_at && <p>Answers Received: {new Date(order.questionnaire_completed_at).toLocaleString('en-AU')}</p>}
                    {order.completed_at && <p>Completed: {new Date(order.completed_at).toLocaleString('en-AU')}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpertReviewAdmin;
