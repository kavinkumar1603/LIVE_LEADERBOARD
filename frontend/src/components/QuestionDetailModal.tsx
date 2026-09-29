'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { X, UploadCloud, CheckCircle, FileImage, Check, AlertCircle, Sparkles, Copy, Terminal } from 'lucide-react';

// Code Snippet Block with Mac Header, Line Numbers, Syntax Styling & Copy Button
const CodeSnippetBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang = 'cpp' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  const highlightToken = (token: string, key: number) => {
    const keywords = ['int', 'while', 'if', 'else', 'for', 'return', 'continue', 'break', 'void', 'bool', 'char', 'float', 'double', 'def', 'const'];
    const stdCalls = ['cout', 'cin', 'endl', 'print', 'printf', 'vector', 'string'];

    if (keywords.includes(token)) {
      return <span key={key} className="text-purple-400 font-semibold">{token}</span>;
    }
    if (stdCalls.includes(token)) {
      return <span key={key} className="text-cyan-400 font-semibold">{token}</span>;
    }
    if (/^\d+$/.test(token)) {
      return <span key={key} className="text-amber-300 font-medium">{token}</span>;
    }
    if (token.startsWith('"') || token.startsWith("'")) {
      return <span key={key} className="text-emerald-300">{token}</span>;
    }
    if (['<<', '>>', '==', '!=', '<=', '>=', '+=', '-=', '++', '--', '{', '}', '(', ')', ';', ',', '<', '>', '+', '=', '-', '%', '*', '/', '&', '|', '!'].includes(token)) {
      return <span key={key} className="text-slate-400 font-medium">{token}</span>;
    }
    return <span key={key} className="text-slate-200">{token}</span>;
  };

  const highlightLine = (line: string) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }
    const tokens = line.split(/(\b[a-zA-Z_]\w*\b|\d+|"[^"]*"|'[^']*'|<<|>>|==|!=|<=|>=|\+=|-=|\+\+|--|[{}();,<>+=\-%*\/&|!])/g);
    return tokens.map((token, i) => highlightToken(token, i));
  };

  const fileExt = lang?.toLowerCase() === 'python' ? 'py' : lang?.toLowerCase() === 'java' ? 'java' : 'cpp';

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-xl my-3 text-left font-mono">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
          </div>
          <span className="text-slate-400 text-xs font-mono font-medium ml-1.5 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-violet-400" />
            solution.{fileExt}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-violet-900/60 text-violet-300 border border-violet-700/60 tracking-wider">
            {lang ? lang.toUpperCase() : 'C++'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-700/70 border border-slate-700/60 transition-all cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Code Table with Gutter Numbers */}
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="w-8 select-none pr-4 text-right text-slate-600 text-xs font-mono align-top py-0.5">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-slate-100 align-top py-0.5 pl-2 border-l border-slate-800/80">
                  {highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Formatted Description that parses markdown text and renders code snippets as real code blocks
const FormattedDescription: React.FC<{ description: string }> = ({ description }) => {
  if (!description) return null;

  const parts: Array<{ type: 'text' | 'code'; lang?: string; content: string }> = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(description)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: description.substring(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'cpp',
      content: match[2]
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < description.length) {
    parts.push({
      type: 'text',
      content: description.substring(lastIndex)
    });
  }

  return (
    <div className="space-y-3">
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return <CodeSnippetBlock key={pIdx} code={part.content} lang={part.lang} />;
        }

        const paragraphs = part.content.split('\n\n').filter(Boolean);

        return (
          <div key={pIdx} className="space-y-2">
            {paragraphs.map((p, paraIdx) => {
              const lines = p.split('\n').filter(Boolean);
              return (
                <div key={paraIdx} className="text-sm text-slate-800 leading-relaxed font-medium">
                  {lines.map((line, lIdx) => {
                    const trimmed = line.trim();
                    const isBoldHeader = trimmed.startsWith('**') && trimmed.endsWith('**');
                    if (isBoldHeader) {
                      return (
                        <h5 key={lIdx} className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-3 mb-1">
                          {trimmed.replace(/\*\*/g, '')}
                        </h5>
                      );
                    }
                    if (/^\d+\.\s/.test(trimmed)) {
                      return (
                        <div key={lIdx} className="flex items-start gap-2 pl-1 py-0.5 text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {trimmed.match(/^(\d+)\./)?.[1]}
                          </span>
                          <span className="text-sm font-medium">{trimmed.replace(/^\d+\.\s*/, '')}</span>
                        </div>
                      );
                    }
                    return <p key={lIdx} className="text-slate-800">{line}</p>;
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

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
        onSubmitted();
        setTimeout(() => {
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

  const backendHost = process.env.SOCKET_URL || 'https://live-leaderboard-fnm0.onrender.com';
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
              {data?.evaluation && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {data.evaluation.marksObtained}/{data.evaluation.maximumMarks} Marks
                </span>
              )}
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
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Problem Description & Code Snippet
                </h4>
                <FormattedDescription description={data?.question?.description || ''} />
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

              {/* Sample Input & Sample Output: Stacked one-by-one with light color styling & no horizontal scrolling */}
              <div className="space-y-3 pt-1">
                {data?.question?.sampleInput && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                        Sample Input
                      </span>
                    </div>
                    <pre className="text-xs sm:text-[13px] text-slate-800 font-mono font-medium whitespace-pre-wrap break-words leading-relaxed overflow-x-hidden">
                      {data.question.sampleInput}
                    </pre>
                  </div>
                )}

                {data?.question?.sampleOutput && (
                  <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-violet-200/70 text-violet-800">
                        Sample Output
                      </span>
                    </div>
                    <pre className="text-xs sm:text-[13px] text-slate-900 font-mono font-medium whitespace-pre-wrap break-words leading-relaxed overflow-x-hidden">
                      {data.question.sampleOutput}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Screenshot Upload & Evaluation (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/80 rounded-3xl p-5 sm:p-6 border border-slate-200">
              
              <div className="space-y-4">
                {/* Only after mark awarded, mark comes */}
                {data?.evaluation && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-sm flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Mark Awarded
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {data.evaluation.marksObtained} / {data.evaluation.maximumMarks} Marks
                    </span>
                  </div>
                )}

                {/* Space for Upload a Screenshot */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-violet-600" />
                    {data?.evaluation ? 'Uploaded Screenshot' : 'Upload Screenshot'}
                  </h4>

                  {/* File Dropzone & Image Preview */}
                  <label className={`block w-full ${data?.evaluation ? 'cursor-default' : 'cursor-pointer'}`}>
                    <div className="border-2 border-dashed border-slate-300 hover:border-violet-500 rounded-3xl p-4 text-center bg-white transition-all shadow-sm">
                      {!data?.evaluation && (
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      )}
                      {previewUrl ? (
                        <div className="space-y-2 py-1">
                          <img
                            src={previewUrl}
                            alt="Screenshot Preview"
                            className="max-h-52 mx-auto rounded-2xl border border-slate-200 object-contain shadow-sm"
                          />
                          {!data?.evaluation && (
                            <p className="text-xs text-violet-700 font-bold flex items-center justify-center gap-1 pt-1">
                              <Sparkles className="w-3.5 h-3.5" /> Screenshot Selected
                            </p>
                          )}
                        </div>
                      ) : existingScreenshot ? (
                        <div className="space-y-2 py-1">
                          <img
                            src={existingScreenshot}
                            alt="Current Submission"
                            className="max-h-52 mx-auto rounded-2xl border border-slate-200 object-contain shadow-sm bg-slate-900"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          {!data?.evaluation && (
                            <p className="text-xs text-slate-500 font-medium pt-1">
                              Click to replace screenshot
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-2">
                            <FileImage className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Click to upload screenshot
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

              {/* Action Submit Button (Only before evaluation) */}
              {!data?.evaluation && (
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
                        {data?.submission ? 'Update Submission' : 'Submit Screenshot'}
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
