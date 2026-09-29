'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../lib/socket';
import {
  Trophy,
  Code,
  FileCode,
  Layers,
  LogOut,
  Shield,
  UserCheck,
  Sparkles,
  ChevronDown,
  Radio,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface OvalSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  pendingCount?: number;
  assessmentTitle?: string;
  assessmentStatus?: string;
  completedQuestions?: number;
  totalQuestions?: number;
}

export const OvalSidebar: React.FC<OvalSidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount = 0,
  assessmentTitle = '1st Year Algorithmic Sprint 2026',
  assessmentStatus = 'LIVE',
  completedQuestions = 1,
  totalQuestions = 5
}) => {
  const { user, logout, switchAccount } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  if (!user) return null;

  const isStudent = user.role === 'student';

  const studentNavItems = [
    { id: 'questions', label: 'Assigned Problems', icon: Code, badge: null },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy, badge: 'Live' }
  ];

  const adminNavItems = [
    {
      id: 'submissions',
      label: 'Live Evaluations',
      icon: FileCode,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : null
    },
    { id: 'leaderboard', label: 'Leaderboard Monitor', icon: Trophy, badge: 'Live' },
    { id: 'bank', label: 'Question Bank', icon: Layers, badge: null }
  ];

  const navItems = isStudent ? studentNavItems : adminNavItems;

  const demoAccounts = [
    { label: '👑 Admin (Prof. Vikram)', email: 'admin@livecode.edu', pass: 'AdminPassword123!', role: 'admin' },
    { label: '🧑‍💻 Student 1: Arun (24CSE001)', email: 'arun@livecode.edu', pass: 'StudentPass123!', role: 'student' },
    { label: '🧑‍💻 Student 2: Priya (24CSE042)', email: 'priya@livecode.edu', pass: 'StudentPass123!', role: 'student' },
    { label: '🧑‍💻 Student 3: Kavin (24CSE089)', email: 'kavin@livecode.edu', pass: 'StudentPass123!', role: 'student' },
  ];

  const progressPercent = Math.min(100, Math.round((completedQuestions / totalQuestions) * 100));

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0">
      <div className="sticky top-6 glass-panel oval-sidebar p-5 sm:p-6 flex flex-col justify-between shadow-xl border border-slate-200/90 bg-white/95 h-full">
        
        {/* Top: Logo & Assessment Banner */}
        <div className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-1 pt-1 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-md shadow-violet-500/20 shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                LiveCode<span className="text-violet-600">Arena</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {isStudent ? 'Student Workspace' : 'Evaluator Studio'}
              </p>
            </div>
          </div>

          {/* Assessment & Real-time Status Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Event Status
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full flex items-center gap-1 ${
                assessmentStatus === 'LIVE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {assessmentStatus === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live" />}
                {assessmentStatus}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-800 leading-tight">
              {assessmentTitle}
            </p>

            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-slate-600 font-medium">
              <Radio className={`w-3 h-3 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
              <span>{isConnected ? 'Real-Time Sync Active' : 'Connecting WebSocket...'}</span>
            </div>
          </div>

          {/* Oval Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-xs font-bold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25 translate-x-1'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-violet-600'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Live'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Middle Context Widget - Bridges the vertical spacing beautifully */}
          {isStudent ? (
            <div className="p-4 rounded-3xl bg-violet-50/70 border border-violet-150 space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-violet-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                  Your Progress
                </span>
                <span className="text-violet-700 font-extrabold">{completedQuestions}/{totalQuestions} Solved</span>
              </div>
              <div className="w-full bg-violet-200/70 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Rankings update live as faculty scores each problem.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Pending Queue
                </span>
                <span className="text-amber-800 font-extrabold">{pendingCount} Submissions</span>
              </div>
              <p className="text-[11px] text-amber-900/80 font-medium leading-relaxed">
                Awarding marks instantly recalculates and broadcasts leaderboard shifts.
              </p>
            </div>
          )}
        </div>

        {/* Bottom: Quick Account Switcher & User Profile in Oval Shape */}
        <div className="pt-4 border-t border-slate-100 space-y-3 mt-6">
          
          {/* Quick Demo Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setSwitchOpen(!switchOpen)}
              className="w-full py-2 px-3.5 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                Switch Account
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {switchOpen && (
              <div
                className="absolute bottom-full mb-2 left-0 w-full glass-panel rounded-3xl p-2 shadow-2xl border border-slate-200 z-50 bg-white animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setSwitchOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Demo Accounts
                  </p>
                </div>
                {demoAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchAccount(acc.email, acc.pass)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      user.email === acc.email
                        ? 'bg-violet-50 text-violet-700 font-bold border border-violet-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{acc.label}</span>
                    {user.email === acc.email && <span className="text-[10px] text-violet-600 font-bold">Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User profile pill */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isStudent
                  ? 'bg-violet-100 text-violet-700 border border-violet-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {isStudent ? <UserCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">
                  {isStudent ? `${user.studentId} • Sec ${user.section || 'A'}` : 'Faculty Evaluator'}
                </p>
              </div>
            </div>
          </div>

          {/* Oval Sign Out button */}
          <button
            onClick={() => logout()}
            className="w-full py-2 px-4 rounded-full border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

        </div>

      </div>
    </aside>
  );
};
