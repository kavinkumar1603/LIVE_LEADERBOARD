'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../lib/socket';
import { Trophy, LogOut, UserCheck, Shield, ChevronDown, Sparkles } from 'lucide-react';

interface NavbarProps {
  assessmentTitle?: string;
  assessmentStatus?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  assessmentTitle = '1st Year Algorithmic Sprint 2026',
  assessmentStatus = 'LIVE'
}) => {
  const { user, logout, switchAccount } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const demoAccounts = [
    { label: '👑 Admin (Prof. Vikram)', email: 'admin@livecode.edu', pass: 'AdminPassword123!', role: 'admin' },
    { label: '🧑‍💻 Student 1: Arun (24CSE001)', email: 'arun@livecode.edu', pass: 'StudentPass123!', role: 'student' },
    { label: '🧑‍💻 Student 2: Priya (24CSE042)', email: 'priya@livecode.edu', pass: 'StudentPass123!', role: 'student' },
    { label: '🧑‍💻 Student 3: Kavin (24CSE089)', email: 'kavin@livecode.edu', pass: 'StudentPass123!', role: 'student' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 px-4 lg:px-8 py-3.5 backdrop-blur-xl bg-white/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand & Contest Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-md shadow-violet-500/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                LiveCode<span className="text-violet-600">Arena</span>
              </h1>
              <span className={`px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-full flex items-center gap-1.5 ${
                assessmentStatus === 'LIVE'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-amber-100 text-amber-700 border border-amber-300'
              }`}>
                {assessmentStatus === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live" />}
                {assessmentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              {assessmentTitle}
            </p>
          </div>
        </div>

        {/* Center: Live Socket Status */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-slate-700 font-medium">
            {isConnected ? 'Real-Time Sync Active' : 'Connecting WebSocket...'}
          </span>
        </div>

        {/* Right: User Pill, Quick Switcher, & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all text-left"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  user.role === 'admin'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-violet-100 text-violet-800 border border-violet-200'
                }`}>
                  {user.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize mt-0.5">
                    {user.role === 'admin' ? 'Faculty Evaluator' : `${user.studentId} • Section ${user.section || 'A'}`}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Quick Switch Dropdown */}
              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 glass-panel rounded-3xl p-2.5 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 bg-white"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-violet-600" /> Switch Demo Account
                    </p>
                  </div>
                  {demoAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => switchAccount(acc.email, acc.pass)}
                      className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs flex items-center justify-between transition-colors ${
                        user.email === acc.email
                          ? 'bg-violet-50 text-violet-700 font-bold border border-violet-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{acc.label}</span>
                      {user.email === acc.email && <span className="text-[10px] text-violet-600 font-bold">Active</span>}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-3 py-2 rounded-2xl text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
