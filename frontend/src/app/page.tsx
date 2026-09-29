'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { OvalSidebar } from '../components/OvalSidebar';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { EvaluationModal } from '../components/EvaluationModal';
import { QuestionDetailModal } from '../components/QuestionDetailModal';
import { QuestionBankModal } from '../components/QuestionBankModal';
import { AuditLogModal } from '../components/AuditLogModal';
import { apiRequest } from '../lib/api';
import { getSocket } from '../lib/socket';
import { LeaderboardEntry, AssignedQuestionItem, SubmissionItem, DashboardStats } from '../types';
import {
  Trophy,
  Code,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  UserCheck,
  Sparkles,
  Layers,
  Search,
  Plus,
  History,
  FileCode,
  Flame,
  AlertTriangle,
  Lock,
  BookOpen,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

function ArenaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, loading, login, switchAccount } = useAuth();

  // Common State
  const [activeTab, setActiveTab] = useState<'questions' | 'leaderboard' | 'submissions' | 'bank'>('questions');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [assessmentInfo, setAssessmentInfo] = useState<{ id: string; title: string; status: string } | null>(null);

  // Student State
  const [studentStats, setStudentStats] = useState<any>(null);
  const [assignedQuestions, setAssignedQuestions] = useState<AssignedQuestionItem[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Admin State
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [subFilter, setSubFilter] = useState<'ALL' | 'PENDING' | 'EVALUATED'>('PENDING');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [questionsBank, setQuestionsBank] = useState<any[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Login Form State
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeLoginTab, setActiveLoginTab] = useState<'student' | 'faculty'>('student');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const fillCredentials = (type: 'student' | 'faculty') => {
    if (type === 'student') {
      setEmailInput('naveen.m2026cse@sece.ac.in');
      setPassInput('naveen.m2026cse@sece.ac.in');
      setActiveLoginTab('student');
    } else {
      setEmailInput('anandaraj.a@sece.ac.in');
      setPassInput('anandaraj.a@sece.ac.in');
      setActiveLoginTab('faculty');
    }
    setLoginError(null);
  };

  // Socket.IO Real-time listeners
  useEffect(() => {
    const socket = getSocket();

    if (user?.role === 'student') {
      socket.emit('join:student', user.id);
    }

    const onLeaderboardUpdate = (data: { assessmentId: string; leaderboard: LeaderboardEntry[] }) => {
      if (data?.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
      if (user?.role === 'admin') {
        fetchAdminDashboard();
        fetchSubmissions();
      } else if (user?.role === 'student') {
        fetchStudentDashboard();
      }
    };

    const onScoreUpdate = (data: any) => {
      if (user?.role === 'student') {
        if (!data.studentId || data.studentId === user.id) {
          setStudentStats((prev: any) =>
            prev
              ? {
                  ...prev,
                  totalMarks: data.totalMarks ?? prev.totalMarks,
                  percentage: data.percentage ?? prev.percentage,
                  completedQuestions: data.completedQuestions ?? prev.completedQuestions,
                  totalQuestions: data.totalAssignedQuestions ?? prev.totalQuestions,
                  currentRank: data.rank ?? prev.currentRank
                }
              : prev
          );
        }
        fetchStudentDashboard();
        fetchLeaderboard();
      }
    };

    socket.on('leaderboard:update', onLeaderboardUpdate);
    socket.on('student:score_update', onScoreUpdate);

    return () => {
      socket.off('leaderboard:update', onLeaderboardUpdate);
      socket.off('student:score_update', onScoreUpdate);
    };
  }, [user]);

  // Initial Data Fetching based on role
  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentDashboard();
      fetchLeaderboard();
    } else if (user?.role === 'admin') {
      fetchAdminDashboard();
      fetchSubmissions();
      fetchLeaderboard();
      fetchQuestionBank();
    }
  }, [user]);

  // Re-fetch leaderboard on navigating to leaderboard tab
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  // Router & URL Tab Synchronization (Preserves exact page & modal on refresh!)
  useEffect(() => {
    if (!user) return;

    const urlTab = searchParams ? (searchParams.get('tab') as any) : null;
    const savedTab = typeof window !== 'undefined' ? localStorage.getItem(`live_tab_${user.role}`) : null;

    let targetTab: 'questions' | 'leaderboard' | 'submissions' | 'bank';
    if (user.role === 'admin') {
      const validAdminTabs = ['submissions', 'leaderboard', 'bank'];
      if (urlTab && validAdminTabs.includes(urlTab)) {
        targetTab = urlTab;
      } else if (savedTab && validAdminTabs.includes(savedTab)) {
        targetTab = savedTab as any;
      } else {
        targetTab = 'submissions';
      }
    } else {
      const validStudentTabs = ['questions', 'leaderboard'];
      if (urlTab && validStudentTabs.includes(urlTab)) {
        targetTab = urlTab;
      } else if (savedTab && validStudentTabs.includes(savedTab)) {
        targetTab = savedTab as any;
      } else {
        targetTab = 'questions';
      }
    }

    setActiveTab(targetTab);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`live_tab_${user.role}`, targetTab);
    }

    // Restore opened question modal if present in URL
    const urlQuestion = searchParams ? searchParams.get('question') : null;
    if (urlQuestion && user.role === 'student') {
      setSelectedQuestionId(urlQuestion);
    }

    // Restore submission filter if present in URL
    const urlFilter = searchParams ? searchParams.get('filter') : null;
    if (urlFilter && ['ALL', 'PENDING', 'EVALUATED'].includes(urlFilter)) {
      setSubFilter(urlFilter as any);
    }

    // Sync URL query without unnecessary reload
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('tab', targetTab);
    const queryString = params.toString();
    if (typeof window !== 'undefined' && window.location.search.slice(1) !== queryString) {
      router.replace(`/?${queryString}`, { scroll: false });
    }
  }, [user, searchParams]);

  // Navigation handlers syncing state + router
  const navigateTab = (newTab: 'questions' | 'leaderboard' | 'submissions' | 'bank') => {
    setActiveTab(newTab);
    if (newTab === 'leaderboard') {
      fetchLeaderboard();
    }
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(`live_tab_${user.role}`, newTab);
    }
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('tab', newTab);
    if (newTab !== 'questions') {
      params.delete('question');
      setSelectedQuestionId(null);
    }
    if (newTab !== 'submissions') {
      params.delete('submission');
      setSelectedSubmission(null);
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const openQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('tab', 'questions');
    params.set('question', questionId);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const closeQuestion = () => {
    setSelectedQuestionId(null);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.delete('question');
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const openSubmission = (sub: SubmissionItem) => {
    setSelectedSubmission(sub);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('tab', 'submissions');
    params.set('submission', sub.id);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const closeSubmission = () => {
    setSelectedSubmission(null);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.delete('submission');
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const changeSubFilter = (filter: 'ALL' | 'PENDING' | 'EVALUATED') => {
    setSubFilter(filter);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('tab', 'submissions');
    params.set('filter', filter);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const fetchLeaderboard = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/admin/leaderboard' : '/student/leaderboard';
      const res = await apiRequest(endpoint);
      if (res.success && res.leaderboard) {
        setLeaderboard(res.leaderboard);
        if (res.assessmentTitle) {
          setAssessmentInfo(prev => ({
            id: res.assessmentId || prev?.id || '',
            title: res.assessmentTitle,
            status: res.assessmentStatus || 'LIVE'
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const fetchStudentDashboard = async () => {
    try {
      const res = await apiRequest('/student/dashboard');
      if (res.success) {
        setStudentStats(res.stats);
        setAssignedQuestions(res.questions || []);
        if (res.assessment) {
          setAssessmentInfo({
            id: res.assessment.id,
            title: res.assessment.title,
            status: res.assessment.status
          });
          getSocket().emit('join:assessment', res.assessment.id);
        }
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    }
  };

  const fetchAdminDashboard = async () => {
    try {
      const res = await apiRequest('/admin/dashboard-stats');
      if (res.success && res.stats) {
        setAdminStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await apiRequest('/admin/submissions');
      if (res.success && res.submissions) {
        setSubmissions(res.submissions);
        // If submission modal was active before refresh, restore it
        const urlSubId = searchParams ? searchParams.get('submission') : null;
        if (urlSubId) {
          const match = res.submissions.find((s: SubmissionItem) => s.id === urlSubId);
          if (match) setSelectedSubmission(match);
        }
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const fetchQuestionBank = async () => {
    try {
      const res = await apiRequest('/admin/questions');
      if (res.success && res.questions) {
        setQuestionsBank(res.questions);
      }
    } catch (err) {
      console.error('Error fetching question bank:', err);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const res = await login(emailInput.trim(), passInput.trim());
    if (!res.success) {
      setLoginError(res.message || 'Login failed. Please verify your email and password.');
    }
    setLoginLoading(false);
  };

  /* ------------------------------------------------------------- */
  /* LOADING STATE: Smooth branded loader during token verification */
  /* (Prevents flash of login screen during browser refresh!)       */
  /* ------------------------------------------------------------- */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-2xl shadow-violet-500/30 animate-pulse mb-5">
          <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-violet-400" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm font-bold text-white">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
          <span>Resuming your contest session...</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">COMPILER CLASH : Battle of Bug</p>
      </main>
    );
  }

  /* ------------------------------------------------------------- */
  /* UN-AUTHENTICATED: OFFICIAL SECE CONTEST SIGN IN               */
  /* REDESIGNED: Neat, Clean, and Ultra-Professional Split Screen  */
  /* ------------------------------------------------------------- */
  if (!user) {
    return (
      <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0B0F19] text-slate-100 selection:bg-violet-500 selection:text-white">
        
        {/* LEFT BRAND / SHOWCASE PANEL (Sleek dark obsidian with ambient glow) */}
        <div className="relative w-full lg:w-[48%] xl:w-[46%] p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-[#0B0F19] via-[#10172A] to-[#0B0F19]">
          
          {/* Subtle Ambient background gradients & grid */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/60 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">
                Sri Eshwar College of Engineering (Autonomous)
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-lg shadow-violet-500/20">
                <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-violet-400" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-violet-400 font-bold">Department of CCE</p>
                <h2 className="text-base font-bold text-white tracking-tight">Academic Year 2026-2027 [ODD SEM]</h2>
              </div>
            </div>
          </div>

          {/* Middle Contest Hero & Value Cards */}
          <div className="relative z-10 my-10 lg:my-0 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Live Competitive Assessment Platform
              </div>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
                COMPILER CLASH <br />
                <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Battle of Bug
                </span>
              </h1>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                Section C official competitive programming arena. Solve assigned challenges, upload code output screenshots, and witness live rank changes in real-time.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-2.5">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Real-Time Leaderboard</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Socket-driven live score calculation and dynamic rank reordering.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Dual Faculty Evaluation</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Direct screenshot verification and transparent score tracking.
                </p>
              </div>
            </div>

            {/* Active Candidates Count */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center">NM</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">AK</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-cyan-600 text-[10px] font-bold text-white flex items-center justify-center">SR</div>
              </div>
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">67 Section C Candidates</span> loaded from MongoDB Atlas
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              256-bit SSL Protected Contest Session
            </span>
            <span>SECE • CCE Arena</span>
          </div>
        </div>

        {/* RIGHT AUTHENTICATION PANEL (Clean, crisp, modern studio canvas) */}
        <div className="w-full lg:w-[52%] xl:w-[54%] bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
          <div className="max-w-md w-full mx-auto my-auto py-6">
            
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-[11px] font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                Contest Authentication Portal
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Access your personalized question set, solve problems, and climb the leaderboard.
              </p>
            </div>

            {/* Role Tab Selector (Student vs Faculty) */}
            <div className="flex p-1 mb-6 rounded-2xl bg-slate-200/70 border border-slate-300/60 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveLoginTab('student');
                  setLoginError(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeLoginTab === 'student'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-violet-600" />
                Student Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLoginTab('faculty');
                  setLoginError(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeLoginTab === 'faculty'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Faculty / Admin
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {activeLoginTab === 'student' ? 'Official College Email' : 'Faculty Administrator Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={
                      activeLoginTab === 'student'
                        ? 'e.g. naveen.m2026cse@sece.ac.in'
                        : 'e.g. anandaraj.a@sece.ac.in'
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 shadow-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {activeLoginTab === 'student' ? 'Default: same as college email' : 'Admin password'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-white border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 shadow-xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Informational Hint Card */}
              <div className="p-3.5 rounded-2xl bg-violet-50/70 border border-violet-200/80 text-xs text-violet-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {activeLoginTab === 'student' ? (
                    <>
                      <span className="font-bold">Student Notice:</span> Enter your official SECE college email address as both username and password to log in.
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Faculty Notice:</span> Sign in with your faculty administrator credentials to review submissions and manage live evaluations.
                    </>
                  )}
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 text-sm font-bold text-white shadow-md shadow-violet-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group"
              >
                {loginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in to Contest...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Contest Arena</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials for Fast Testing */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3 text-center">
                Quick Fill Credentials (One-Click)
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => fillCredentials('student')}
                  className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 text-[11px] font-semibold text-slate-700 text-center transition-all cursor-pointer shadow-xs"
                >
                  <span className="block text-violet-700 font-bold">Student Demo</span>
                  <span className="text-[10px] text-slate-400 truncate block">Naveen M (26CSE001)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('faculty')}
                  className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-[11px] font-semibold text-slate-700 text-center transition-all cursor-pointer shadow-xs"
                >
                  <span className="block text-indigo-700 font-bold">Faculty Demo</span>
                  <span className="text-[10px] text-slate-400 truncate block">Anandaraj A (Admin)</span>
                </button>
              </div>
            </div>

          </div>

          {/* Footer */}
          <footer className="text-center text-xs text-slate-400 py-3 font-medium">
            COMPILER CLASH : Battle of Bug © 2026 • Sri Eshwar College of Engineering • Dept. of CSE
          </footer>
        </div>

      </main>
    );
  }

  /* ------------------------------------------------------------- */
  /* AUTHENTICATED: STUDENT PORTAL (With Oval Sidebar)             */
  /* ------------------------------------------------------------- */
  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row p-4 sm:p-6 gap-6 items-start">
        {/* Full Top-to-Bottom Oval Navigation Sidebar */}
        <OvalSidebar
          activeTab={activeTab}
          setActiveTab={navigateTab}
          assessmentTitle={assessmentInfo?.title || 'COMPILER CLASH : Battle of Bug'}
          assessmentStatus={assessmentInfo?.status || 'LIVE'}
          completedQuestions={studentStats?.completedQuestions ?? 0}
          totalQuestions={studentStats?.totalQuestions ?? 6}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col w-full">
          <main className="flex-1 w-full max-w-[1560px] space-y-6">
            
            {/* Student Welcome & Symmetrical Metrics Banner */}
            <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                    Student Assessment Portal
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2.5">
                    Welcome, {user.name} 👋
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    {user.department} • Section {user.section || 'C'}
                  </p>
                </div>

                {/* Symmetrical KPI Cards */}
                <div className="grid grid-cols-3 gap-3 w-full xl:w-auto shrink-0">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Total Score
                    </span>
                    <div className="flex items-baseline justify-center gap-1 mt-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        {studentStats?.totalMarks ?? 0}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">/{studentStats?.maxPossibleMarks ?? 85}</span>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Current Rank
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <span className="text-2xl sm:text-3xl font-black text-amber-700">
                        #{studentStats?.currentRank ?? '-'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[110px]">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Solved
                    </span>
                    <div className="flex items-baseline justify-center gap-1 mt-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-violet-700">
                        {studentStats?.completedQuestions ?? 0}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">/{studentStats?.totalQuestions ?? 6}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB 1: Assigned Questions Grid (Symmetrical 3x2 Grid) */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-600" />
                    Your Deterministically Assigned Problem Set
                  </h3>
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Click any question to view details & submit screenshot
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {assignedQuestions.map((q, idx) => (
                    <div
                      key={q.questionId || idx}
                      onClick={() => openQuestion(q.questionId)}
                      className="bg-white rounded-[28px] p-5 cursor-pointer border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all flex flex-col justify-between group h-full min-h-[200px]"
                    >
                      <div>
                        {/* Top tags */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                            Q{q.order}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              q.difficulty === 'easy'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : q.difficulty === 'medium'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800">
                              {q.marks} pts
                            </span>
                          </div>
                        </div>

                        {/* Title & category */}
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                          {q.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{q.category}</p>
                      </div>

                      {/* Status badge & action */}
                      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        {q.isEvaluated ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Awarded: {q.marksObtained}/{q.marks}</span>
                          </div>
                        ) : q.isSubmitted ? (
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                            <Clock className="w-4 h-4 animate-spin text-amber-600" />
                            <span>Under Review</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Pending Submission</span>
                        )}

                        <span className="text-xs font-bold text-violet-600 group-hover:text-indigo-600 flex items-center gap-1">
                          Solve ↗
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Live Leaderboard (Visible after login!) */}
            {activeTab === 'leaderboard' && (
              <LeaderboardTable
                entries={leaderboard}
                currentStudentId={user.id}
                onRefresh={fetchLeaderboard}
              />
            )}

          </main>
        </div>

        {/* Question Solving Modal */}
        {selectedQuestionId && (
          <QuestionDetailModal
            questionId={selectedQuestionId}
            assessmentId={assessmentInfo?.id || ''}
            onClose={closeQuestion}
            onSubmitted={() => {
              fetchStudentDashboard();
              fetchLeaderboard();
            }}
          />
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* AUTHENTICATED: ADMIN / FACULTY PORTAL (With Oval Sidebar)     */
  /* ------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row p-4 sm:p-6 gap-6 items-start">
      {/* Full Top-to-Bottom Oval Navigation Sidebar */}
      <OvalSidebar
        activeTab={activeTab}
        setActiveTab={navigateTab}
        pendingCount={adminStats?.pendingEvaluations ?? 0}
        assessmentTitle={adminStats?.assessmentTitle || 'COMPILER CLASH : Battle of Bug'}
        assessmentStatus={adminStats?.assessmentStatus || 'LIVE'}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col w-full">
        <main className="flex-1 w-full max-w-[1560px] space-y-6">
          
          {/* Admin Header with KPI Cards */}
          <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-slate-200/90 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Evaluation & Contest Control Room
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2.5">
                  Faculty Evaluator Studio
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Review student screenshots, award marks per question, and watch the leaderboard recalculate live.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="px-4 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-md shadow-violet-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Problem
                </button>
                <button
                  onClick={() => setShowAuditModal(true)}
                  className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <History className="w-4 h-4 text-violet-600" /> Audit Log
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Students</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{adminStats?.totalStudents ?? 67}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Submissions</span>
                <span className="text-2xl font-black text-violet-700 mt-1 block">{adminStats?.totalSubmissions ?? 0}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center relative overflow-hidden">
                {(adminStats?.pendingEvaluations ?? 0) > 0 && (
                  <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Pending Review</span>
                <span className="text-2xl font-black text-rose-600 mt-1 block">{adminStats?.pendingEvaluations ?? 0}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Evaluated</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">{adminStats?.evaluatedCount ?? 0}</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Top Score</span>
                <span className="text-2xl font-black text-amber-700 mt-1 block">{adminStats?.highestScore ?? 0} pts</span>
              </div>
            </div>
          </div>

          {/* TAB 1: Live Submissions Review Workspace */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              
              {/* Filter Pills */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  {(['PENDING', 'ALL', 'EVALUATED'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => changeSubFilter(filter)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        subFilter === filter
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {filter === 'PENDING' ? '⏳ Pending Review' : filter === 'EVALUATED' ? '✓ Evaluated' : 'All Submissions'}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Click any submission card to launch review studio
                </span>
              </div>

              {/* Submission Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {submissions
                  .filter((s) => {
                    if (subFilter === 'PENDING') return !s.isEvaluated;
                    if (subFilter === 'EVALUATED') return s.isEvaluated;
                    return true;
                  })
                  .map((sub) => {
                    const backendHost = process.env.SOCKET_URL || 'https://live-leaderboard-fnm0.onrender.com';
                    const imgUrl = sub.screenshotUrl.startsWith('http')
                      ? sub.screenshotUrl
                      : `${backendHost}${sub.screenshotUrl}`;

                    return (
                      <div
                        key={sub.id}
                        onClick={() => openSubmission(sub)}
                        className="bg-white rounded-[28px] p-5 cursor-pointer border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all flex flex-col justify-between group h-full min-h-[240px]"
                      >
                        <div>
                          {/* Student Info & Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                                {sub.student?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{sub.student?.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{sub.student?.email || 'Section C'}</p>
                              </div>
                            </div>

                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              sub.isEvaluated
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                            }`}>
                              {sub.isEvaluated ? 'Evaluated' : 'Needs Review'}
                            </span>
                          </div>

                          {/* Screenshot thumbnail preview */}
                          <div className="h-32 w-full rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center my-3 relative shadow-inner">
                            <img
                              src={imgUrl}
                              alt="Submission Thumbnail"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                              <span className="text-[11px] font-bold text-white">
                                {sub.question?.title}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card bottom: status & action */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Submitted {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <button className="px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white transition-all text-xs font-bold flex items-center gap-1">
                            {sub.isEvaluated ? 'Edit Marks' : 'Evaluate'} <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {submissions.filter((s) => {
                if (subFilter === 'PENDING') return !s.isEvaluated;
                if (subFilter === 'EVALUATED') return s.isEvaluated;
                return true;
              }).length === 0 && (
                <div className="bg-white rounded-[28px] p-12 text-center border border-slate-200/90 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No submissions found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {subFilter === 'PENDING'
                      ? 'All caught up! No pending submissions to evaluate.'
                      : 'No submissions found under this filter.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Live Leaderboard Monitor */}
          {activeTab === 'leaderboard' && (
            <LeaderboardTable
              entries={leaderboard}
              isProjectorMode={false}
              onRefresh={fetchLeaderboard}
            />
          )}

          {/* TAB 3: Question Bank Manager */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-600" /> Question Repository ({questionsBank.length} Problems)
                </h3>
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="px-3.5 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {questionsBank.map((q) => (
                  <div key={q._id} className="bg-white rounded-[28px] p-5 border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        q.difficulty === 'easy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.difficulty === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs font-bold text-violet-700">{q.marks} Marks</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{q.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{q.description}</p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Category: {q.category}</span>
                      <span>Language: {q.language}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Admin Evaluation Modal */}
      {selectedSubmission && (
        <EvaluationModal
          submission={selectedSubmission}
          onClose={closeSubmission}
          onEvaluated={() => {
            fetchSubmissions();
            fetchAdminDashboard();
            fetchLeaderboard();
          }}
        />
      )}

      {/* Question Creator Modal */}
      {showQuestionModal && (
        <QuestionBankModal
          onClose={() => setShowQuestionModal(false)}
          onQuestionAdded={() => {
            fetchQuestionBank();
            fetchAdminDashboard();
          }}
        />
      )}

      {/* Audit Log Modal */}
      {showAuditModal && (
        <AuditLogModal onClose={() => setShowAuditModal(false)} />
      )}

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-xl shadow-violet-500/20 animate-pulse mb-4">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Trophy className="w-7 h-7 text-violet-600" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-ping" />
          <span>Loading live arena...</span>
        </div>
      </main>
    }>
      <ArenaPageContent />
    </Suspense>
  );
}
