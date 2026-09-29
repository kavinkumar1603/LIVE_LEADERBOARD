'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { 
  X, 
  UploadCloud, 
  CheckCircle, 
  FileImage, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Terminal, 
  Award, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';

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
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-lg my-3 text-left font-mono">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-sm" />
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
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Code Table with Gutter Numbers */}
      <div className="p-3.5 overflow-x-auto text-xs sm:text-[13px] leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="w-8 select-none pr-3 text-right text-slate-600 text-xs font-mono align-top py-0.5">
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
                <div key={paraIdx} className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {lines.map((line, lIdx) => {
                    const trimmed = line.trim();
                    const isBoldHeader = trimmed.startsWith('**') && trimmed.endsWith('**');
                    if (isBoldHeader) {
                      return (
                        <h5 key={lIdx} className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-3 mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                          {trimmed.replace(/\*\*/g, '')}
                        </h5>
                      );
                    }
                    if (/^\d+\.\s/.test(trimmed)) {
                      return (
                        <div key={lIdx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 my-1 text-slate-800">
                          <span className="w-5 h-5 rounded-lg bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {trimmed.match(/^(\d+)\./)?.[1]}
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-snug">{trimmed.replace(/^\d+\.\s*/, '')}</span>
                        </div>
                      );
                    }
                    return <p key={lIdx} className="text-slate-700 leading-relaxed">{line}</p>;
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
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestionDetails();
  }, [questionId]);

  // Support direct Ctrl+V clipboard screenshot paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (data?.evaluation) return;
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          setErrorMsg(null);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [data?.evaluation]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!data?.evaluation) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (data?.evaluation) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setErrorMsg(null);
      } else {
        setErrorMsg('Please drop an image file (PNG, JPG, WEBP).');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFile && !data?.submission) {
      setErrorMsg('Please select or paste a screenshot image of your code output.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('questionId', questionId);
      if (assessmentId && assessmentId !== 'assessment-active') {
        formData.append('assessmentId', assessmentId);
      }
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
        }, 1200);
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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 lg:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-[28px] sm:rounded-[32px] border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-slate-200/80 bg-white shrink-0">
          <div className="min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                data?.question?.difficulty === 'easy'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : data?.question?.difficulty === 'medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {data?.question?.difficulty || 'easy'}
              </span>

              {data?.question?.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {data.question.category}
                </span>
              )}

              {data?.question?.marks && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  <Award className="w-3 h-3 text-violet-600" />
                  {data.question.marks} Marks
                </span>
              )}

              {/* Status Indicator */}
              {data?.evaluation ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Evaluated: {data.evaluation.marksObtained}/{data.evaluation.maximumMarks} Marks
                </span>
              ) : data?.submission ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  <Clock className="w-3 h-3 text-sky-600" />
                  Submitted • Pending Review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                  Not Submitted
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 truncate">
              {loading ? 'Loading Problem Specification...' : data?.question?.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split Grid */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500 font-medium">
            <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading problem specification & test cases...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80">
            
            {/* Left Column: Problem Details (7 cols, smooth scroll) */}
            <div className="lg:col-span-7 p-6 sm:p-7 overflow-y-auto space-y-5 max-h-[75vh]">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  Problem Specification & Code
                </h3>
                <FormattedDescription description={data?.question?.description || ''} />
              </div>

              {/* Formats Grid */}
              {(data?.question?.inputFormat || data?.question?.outputFormat || data?.question?.constraints) && (
                <div className="space-y-3 pt-2">
                  {data?.question?.inputFormat && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Input Format
                      </h4>
                      <p className="text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                        {data?.question?.inputFormat}
                      </p>
                    </div>
                  )}

                  {data?.question?.outputFormat && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Output Format
                      </h4>
                      <p className="text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                        {data?.question?.outputFormat}
                      </p>
                    </div>
                  )}

                  {data?.question?.constraints && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Constraints
                      </h4>
                      <p className="text-xs text-slate-600 font-mono whitespace-pre-line leading-relaxed">
                        {data?.question?.constraints}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sample Test Cases */}
              {(data?.question?.sampleInput || data?.question?.sampleOutput) && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                    Sample Test Cases
                  </h3>

                  {data?.question?.sampleInput && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                          Sample Input
                        </span>
                      </div>
                      <pre className="text-xs text-slate-800 font-mono font-medium whitespace-pre-wrap break-words leading-relaxed">
                        {data.question.sampleInput}
                      </pre>
                    </div>
                  )}

                  {data?.question?.sampleOutput && (
                    <div className="p-3.5 rounded-2xl bg-violet-50/50 border border-violet-200/80 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-200/70 text-violet-800">
                          Sample Output
                        </span>
                      </div>
                      <pre className="text-xs text-slate-900 font-mono font-medium whitespace-pre-wrap break-words leading-relaxed">
                        {data.question.sampleOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Output Verification & Submission Terminal (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-7 bg-[#f8fafc] flex flex-col justify-between overflow-y-auto max-h-[75vh] space-y-5">
              
              <div className="space-y-4">
                {/* Faculty Evaluation Result Banner (When graded) */}
                {data?.evaluation && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Evaluation Published
                      </span>
                      <span className="text-base font-black text-emerald-900">
                        {data.evaluation.marksObtained} / {data.evaluation.maximumMarks} Marks
                      </span>
                    </div>
                    {data.evaluation.remarks && (
                      <p className="text-xs text-emerald-800 mt-2 pt-2 border-t border-emerald-200/60 leading-relaxed">
                        <span className="font-bold">Faculty Remarks:</span> {data.evaluation.remarks}
                      </p>
                    )}
                  </div>
                )}

                {/* Section Header */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-violet-600" />
                      {data?.evaluation ? 'Submitted Output Screenshot' : 'Output Screenshot Verification'}
                    </span>
                    {!data?.evaluation && (
                      <span className="text-[11px] font-semibold text-slate-400">PNG, JPG, WEBP (Max 15MB)</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {data?.evaluation 
                      ? 'Official screenshot verified and evaluated by faculty.' 
                      : 'Capture your terminal or compiler output and upload as evidence.'}
                  </p>
                </div>

                {/* Hidden File Input */}
                {!data?.evaluation && (
                  <input
                    id="screenshot-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                )}

                {/* Dropzone & Preview Container */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all bg-white shadow-xs ${
                    isDragging
                      ? 'border-violet-600 bg-violet-50/60 ring-4 ring-violet-500/10'
                      : 'border-slate-300 hover:border-violet-500'
                  }`}
                >
                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                        <img
                          src={previewUrl}
                          alt="Screenshot Preview"
                          className="max-h-56 w-full object-contain mx-auto"
                        />
                      </div>

                      {!data?.evaluation && (
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-violet-700 font-bold truncate max-w-[200px] flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            {selectedFile?.name}
                          </span>
                          <label
                            htmlFor="screenshot-file-input"
                            className="text-violet-600 hover:text-violet-800 font-bold cursor-pointer underline shrink-0"
                          >
                            Change picture
                          </label>
                        </div>
                      )}
                    </div>
                  ) : existingScreenshot ? (
                    <div className="space-y-3">
                      <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                        <img
                          src={existingScreenshot}
                          alt="Submitted Screenshot"
                          className="max-h-56 w-full object-contain mx-auto"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      {!data?.evaluation && (
                        <div className="pt-1">
                          <label
                            htmlFor="screenshot-file-input"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Replace with new screenshot
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label
                      htmlFor="screenshot-file-input"
                      className="py-6 flex flex-col items-center justify-center cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform shadow-xs">
                        <FileImage className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload or drag & drop output screenshot
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        Supports high-res PNG, JPG, or WEBP
                      </p>
                      <div className="mt-3.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                        Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-800 shadow-2xs">Ctrl + V</kbd> to paste directly
                      </div>
                    </label>
                  )}
                </div>

                {/* Notifications */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}
              </div>

              {/* Bottom Submit Action */}
              {!data?.evaluation ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Uploading Screenshot to Ledger...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>{data?.submission ? 'Update Screenshot Submission' : 'Submit Screenshot Output'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2 font-medium">
                    Submissions are timestamped and queued for faculty mark evaluation.
                  </p>
                </div>
              ) : (
                <div className="pt-2 text-center text-xs text-slate-400 font-medium border-t border-slate-200/80">
                  Evaluation finalized by faculty administrator.
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
