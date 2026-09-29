'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Code,
  FileCode,
  Layers,
  LogOut,
  Shield,
  UserCheck
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
  pendingCount = 0
}) => {
  const { user, logout } = useAuth();

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

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] z-30">
      <div className="w-full h-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-[44px] p-6 flex flex-col justify-between overflow-y-auto">
        
        {/* Top: Logo & Navigation */}
        <div className="space-y-6">
          {/* Brand Header */}
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

          {/* Navigation Links */}
          <nav className="space-y-2">
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-xs font-bold transition-all duration-200 group cursor-pointer ${
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
        </div>

        {/* Bottom: Compact User Profile with Quick Sign Out */}
        <div className="pt-4 border-t border-slate-100 mt-auto">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                isStudent
                  ? 'bg-violet-100 text-violet-700 border border-violet-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {isStudent ? <UserCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  {isStudent ? `Section ${user.section || 'C'}` : 'Faculty Evaluator'}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};
