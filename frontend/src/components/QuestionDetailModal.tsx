'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { X, UploadCloud, CheckCircle, FileImage, Check, AlertCircle, Sparkles } from 'lucide-react';

interface QuestionDetailModalProps {
  questionId: string;
  assessmentId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  questionId,
  assessmentId,
  onClose,
  onSubmitted
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestionDetails();
  }, [questionId]);

  const fetchQuestionDetails = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/student/questions/${questionId}`);
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFile && !data?.submission) {
      setErrorMsg('Please select a screenshot image of your code output.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('questionId', questionId);
      formData.append('assessmentId', assessmentId);
      formData.append('codeSnippet', '');
      if (selectedFile) {
        formData.append('screenshot', selectedFile);
      }

      const res = await apiRequest('/student/submissions', {
        method: 'POST',
        body: formData
      });

      if (res.success) {
        setSuccessMsg('Screenshot submitted successfully! Queued for faculty evaluation.');
        setTimeout(() => {
          onSubmitted();
          onClose();
        }, 1300);
      } else {
        setErrorMsg(res.message || 'Submission failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const backendHost = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
  const existingScreenshot = data?.submission?.screenshotUrl
    ? data.submission.screenshotUrl.startsWith('http')
      ? data.submission.screenshotUrl
      : `${backendHost}${data.submission.screenshotUrl}`
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-[36px] border border-slate-200 overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                data?.question?.difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : data?.question?.difficulty === 'medium'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {data?.question?.difficulty || 'easy'}
              </span>
              <span className="text-xs text-slate-500 font-medium">• {data?.question?.category}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                {data?.question?.marks || 10} Points
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              {loading ? 'Loading Problem...' : data?.question?.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-medium">Loading problem specification...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
            
            {/* Left Column: Problem Details (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4 overflow-y-auto max-h-[72vh] pr-2">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                  {data?.question?.description}
                </p>
              </div>

              {data?.question?.inputFormat && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Input Format
                  </h5>
                  <p className="text-xs text-slate-700 font-mono whitespace-pre-line">
                    {data?.question?.inputFormat}
                  </p>
                </div>
              )}

              {data?.question?.outputFormat && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Output Format
                  </h5>
                  <p className="text-xs text-slate-700 font-mono whitespace-pre-line">
                    {data?.question?.outputFormat}
                  </p>
                </div>
              )}

              {data?.question?.constraints && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Constraints
                  </h5>
                  <p className="text-xs text-slate-600 font-mono whitespace-pre-line">
                    {data?.question?.constraints}
                  </p>
                </div>
              )}

              {data?.question?.sampleInput && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Sample Input
                    </span>
                    <pre className="text-xs text-emerald-400 font-mono overflow-x-auto">
                      {data?.question?.sampleInput}
                    </pre>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Sample Output
                    </span>
                    <pre className="text-xs text-cyan-300 font-mono overflow-x-auto">
                      {data?.question?.sampleOutput}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Screenshot Upload & Evaluation Feedback (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/80 rounded-3xl p-5 sm:p-6 border border-slate-200">
              
              <div className="space-y-4">
                {/* Existing Evaluation Feedback Card */}
                {data?.evaluation && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Evaluated by Faculty
                      </span>
                      <span className="text-base font-black text-slate-900">
                        {data.evaluation.marksObtained} / {data.evaluation.maximumMarks} Marks
                      </span>
                    </div>
                    {data.evaluation.feedback && (
                      <p className="text-xs text-slate-700 mt-2 bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm font-medium">
                        &quot;{data.evaluation.feedback}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* Upload Title */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-violet-600" />
                    Submit Output Screenshot
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                    Capture your IDE terminal / execution screen showing code solution and test output.
                  </p>
                </div>

                {/* File Dropzone & Image Preview */}
                <div>
                  <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-slate-300 hover:border-violet-500 rounded-3xl p-4 text-center bg-white transition-all shadow-sm">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {previewUrl ? (
                        <div className="space-y-2 py-1">
                          <img
                            src={previewUrl}
                            alt="Screenshot Preview"
                            className="max-h-52 mx-auto rounded-2xl border border-slate-200 object-contain shadow-sm"
                          />
                          <p className="text-xs text-violet-700 font-bold flex items-center justify-center gap-1 pt-1">
                            <Sparkles className="w-3.5 h-3.5" /> Screenshot Selected. Click to change.
                          </p>
                        </div>
                      ) : existingScreenshot ? (
                        <div className="space-y-2 py-1">
                          <img
                            src={existingScreenshot}
                            alt="Current Submission"
                            className="max-h-52 mx-auto rounded-2xl border border-slate-200 object-contain shadow-sm bg-slate-900"
                            onError={(e) => {
                              // If image fails, show clear placeholder card
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <p className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1.5 pt-1">
                            <Check className="w-4 h-4 text-emerald-600" />
                            Current Screenshot Active • Click to replace
                          </p>
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
                            <FileImage className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Click to select code screenshot
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            PNG, JPG, or WEBP up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Notifications */}
                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                    {successMsg}
                  </div>
                )}
              </div>

              {/* Action Submit Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    'Uploading Screenshot...'
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      {data?.submission ? 'Re-upload / Update Submission' : 'Submit Screenshot Proof'}
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
