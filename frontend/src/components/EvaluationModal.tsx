'use client';

import React, { useState } from 'react';
import { SubmissionItem } from '../types';
import { apiRequest } from '../lib/api';
import { X, CheckCircle, AlertCircle, FileCode, ExternalLink, Sparkles, Send } from 'lucide-react';

interface EvaluationModalProps {
  submission: SubmissionItem;
  onClose: () => void;
  onEvaluated: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  submission,
  onClose,
  onEvaluated
}) => {
  const maxMarks = submission.question.marks || 10;
  const initialMarks = submission.evaluation?.marksObtained ?? '';
  const initialFeedback = submission.evaluation?.feedback ?? '';

  const [marks, setMarks] = useState<number | string>(initialMarks);
  const [feedback, setFeedback] = useState<string>(initialFeedback);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numericMarks = Number(marks);
    if (isNaN(numericMarks) || marks === '') {
      setErrorMsg('Please enter a valid numeric mark.');
      return;
    }

    if (numericMarks < 0 || numericMarks > maxMarks) {
      setErrorMsg(`Marks must be between 0 and ${maxMarks}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/admin/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          submissionId: submission.id,
          marksObtained: numericMarks,
          feedback: feedback.trim()
        })
      });

      if (res.success) {
        setSuccessMsg('Evaluation saved! Live leaderboard updated.');
        setTimeout(() => {
          onEvaluated();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Failed to save evaluation.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this screenshot? This will remove any awarded marks and reset the student\'s submission status.')) return;
    
    setErrorMsg(null);
    setSuccessMsg(null);
    setDeleting(true);

    try {
      const res = await apiRequest(`/admin/submissions/${submission.id}`, {
        method: 'DELETE'
      });

      if (res.success) {
        setSuccessMsg('Screenshot deleted! Marks reduced and student status updated.');
        setTimeout(() => {
          onEvaluated();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Failed to delete screenshot.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setDeleting(false);
    }
  };

  const backendHost = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.SOCKET_URL || 'https://live-leaderboard-fnm0.onrender.com';
  const fullScreenshotUrl = submission.screenshotUrl.startsWith('http') || submission.screenshotUrl.startsWith('data:')
    ? submission.screenshotUrl
    : `${backendHost}${submission.screenshotUrl}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                Evaluation Studio
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {submission.student?.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              <span className="text-slate-900 font-semibold">{submission.student?.email}</span> • Question:{' '}
              <span className="text-violet-700 font-semibold">{submission.question?.title}</span> (Max: {maxMarks} marks)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          
          {/* Left: Screenshot & Code Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-violet-600" />
                  Submitted Code Screenshot
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Screenshot'}
                  </button>
                  <a
                    href={fullScreenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-violet-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    Open High-Res ↗
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-950 flex items-center justify-center p-2 min-h-[300px] max-h-[420px] shadow-inner">
                <img
                  src={fullScreenshotUrl}
                  alt="Submission Screenshot"
                  className="w-full h-auto max-h-[400px] object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            {submission.codeSnippet && (
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  Submitted Code Snippet
                </span>
                <pre className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-100 font-mono overflow-x-auto max-h-36">
                  {submission.codeSnippet}
                </pre>
              </div>
            )}
          </div>

          {/* Right: Marking Form (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Award Marks & Feedback
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Marks immediately update the student total and recalculate all contest rankings in real time.
                </p>
              </div>

              {/* Status Alert */}
              {submission.isEvaluated && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  Currently awarded: <span className="font-bold">{submission.evaluation?.marksObtained} / {maxMarks} marks</span>
                </div>
              )}

              {/* Marks Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Marks Obtained (out of {maxMarks})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={maxMarks}
                    step="0.5"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder={`0 - ${maxMarks}`}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-base font-bold text-slate-900 focus:outline-none focus:border-violet-600 transition-colors shadow-sm"
                    required
                  />
                  <span className="text-slate-500 font-bold text-sm">/ {maxMarks}</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5">
                {[0, Math.floor(maxMarks * 0.5), Math.floor(maxMarks * 0.8), maxMarks].map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setMarks(preset)}
                    className="flex-1 py-1 text-[11px] font-bold rounded-lg bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 shadow-sm"
                  >
                    {preset} pts
                  </button>
                ))}
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reviewer Notes / Feedback for Student
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Clean solution, optimal complexity O(N). Well structured code."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-violet-600 transition-colors resize-none placeholder-slate-400 shadow-sm"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  {successMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-xs font-bold text-white shadow-md shadow-violet-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    'Saving...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {submission.isEvaluated ? 'Update Marks' : 'Award Marks'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
