'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Search, Clock, Sparkles, Crown, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentStudentId?: string;
  isProjectorMode?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentStudentId,
  isProjectorMode = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Top 3 champions for the top podium showcase
  const topThree = entries.slice(0, 3);
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  // Filter entries for full table
  const filtered = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trigger celebration if current student is rank 1
  useEffect(() => {
    if (currentStudentId) {
      const me = entries.find((e) => e.studentId === currentStudentId);
      if (me && me.rank === 1 && me.totalMarks > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [entries, currentStudentId]);

  const getRankBadge = (entry: LeaderboardEntry, index: number) => {
    // Only the top 3 positions receive gold, silver, and bronze badges
    if (index === 0) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-xs shadow-sm">
          <span>🥇</span>
          <span>1st</span>
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs shadow-sm">
          <span>🥈</span>
          <span>2nd</span>
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-extrabold text-xs shadow-sm">
          <span>🥉</span>
          <span>3rd</span>
        </div>
      );
    }

    // For ALL remaining members (Position 4 and onwards), show their sequential serial number
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-xs text-slate-600 font-mono">
        {index + 1}
      </div>
    );
  };

  return (
    <div className={`w-full glass-panel rounded-3xl overflow-hidden shadow-xl bg-white border border-slate-200 ${isProjectorMode ? 'p-6 sm:p-8' : 'p-5 sm:p-7'}`}>
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Live Competition Leaderboard
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            Rankings recalculate instantly as submissions are evaluated runtime
          </p>
        </div>

        {!isProjectorMode && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student by name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
            />
          </div>
        )}
      </div>

      {/* TOP 3 STUDENTS PODIUM SHOWCASE (SEPARATE HIGHLIGHT SECTION ON TOP) */}
      {topThree.length > 0 && (
        <div className="my-6 p-5 sm:p-6 rounded-[28px] bg-gradient-to-b from-slate-50/90 to-slate-100/50 border border-slate-200/90">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Top 3 Contest Champions
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Leading Section C students with highest evaluated marks & solved problems
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Live Podium
            </span>
          </div>

          {/* 3-Column Responsive Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-end">
            
            {/* 🥈 2ND PLACE PODIUM CARD (Left on desktop) */}
            {second && (
              <div className="order-2 md:order-1 bg-white rounded-[24px] p-5 border border-slate-300 shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-400 to-slate-500" />
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-[11px]">
                    🥈 2nd Place
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Runner-up
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-600 to-slate-400 text-white font-black text-lg flex items-center justify-center shadow-md ring-4 ring-slate-100 shrink-0">
                    {second.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-slate-900 text-sm truncate group-hover:text-violet-600 transition-colors">
                        {second.name}
                      </h4>
                      {currentStudentId && second.studentId === currentStudentId && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-violet-600 text-white shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {second.department} • Section {second.section || 'C'}
                    </p>
                  </div>
                </div>

                {/* Score & Solved Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Marks</span>
                    <span className="text-sm font-black text-slate-900">{second.totalMarks}</span>
                    <span className="text-[10px] text-slate-400">/{second.maxPossibleMarks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Solved</span>
                    <span className="text-sm font-black text-violet-700">{second.completedQuestions}</span>
                    <span className="text-[10px] text-slate-400">/{second.totalAssignedQuestions || 6}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Accuracy</span>
                    <span className="text-sm font-black text-slate-800">{second.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-slate-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (second.completedQuestions / (second.totalAssignedQuestions || 6)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* 🥇 1ST PLACE PODIUM CARD (Center, elevated with Gold Glow) */}
            {first && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 rounded-[28px] p-5 sm:p-6 border-2 border-amber-300 shadow-xl shadow-amber-500/10 hover:shadow-2xl hover:shadow-amber-500/15 transition-all relative overflow-hidden group md:-translate-y-2">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />
                
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-xs shadow-sm">
                    <Crown className="w-3.5 h-3.5 fill-white text-white" />
                    🥇 1st Place
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Leader
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20 ring-4 ring-amber-200 shrink-0">
                    {first.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-slate-900 text-base truncate group-hover:text-amber-600 transition-colors">
                        {first.name}
                      </h4>
                      {currentStudentId && first.studentId === currentStudentId && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-violet-600 text-white shadow-sm shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {first.department} • Section {first.section || 'C'}
                    </p>
                  </div>
                </div>

                {/* Score & Solved Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/90 border border-amber-200 shadow-sm text-center mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700/80 block">Score</span>
                    <span className="text-base font-black text-amber-900">{first.totalMarks}</span>
                    <span className="text-[10px] text-slate-400">/{first.maxPossibleMarks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-violet-700/80 block">Solved</span>
                    <span className="text-base font-black text-violet-700">{first.completedQuestions}</span>
                    <span className="text-[10px] text-slate-400">/{first.totalAssignedQuestions || 6}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700/80 block">Accuracy</span>
                    <span className="text-base font-black text-emerald-700">{first.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden border border-amber-200">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (first.completedQuestions / (first.totalAssignedQuestions || 6)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* 🥉 3RD PLACE PODIUM CARD (Right on desktop) */}
            {third && (
              <div className="order-3 md:order-3 bg-white rounded-[24px] p-5 border border-orange-300 shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 to-orange-500" />
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-extrabold text-[11px]">
                    🥉 3rd Place
                  </span>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                    2nd Runner-up
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-700 to-orange-500 text-white font-black text-lg flex items-center justify-center shadow-md ring-4 ring-orange-100 shrink-0">
                    {third.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-slate-900 text-sm truncate group-hover:text-violet-600 transition-colors">
                        {third.name}
                      </h4>
                      {currentStudentId && third.studentId === currentStudentId && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-violet-600 text-white shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {third.department} • Section {third.section || 'C'}
                    </p>
                  </div>
                </div>

                {/* Score & Solved Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Marks</span>
                    <span className="text-sm font-black text-slate-900">{third.totalMarks}</span>
                    <span className="text-[10px] text-slate-400">/{third.maxPossibleMarks}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Solved</span>
                    <span className="text-sm font-black text-violet-700">{third.completedQuestions}</span>
                    <span className="text-[10px] text-slate-400">/{third.totalAssignedQuestions || 6}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Accuracy</span>
                    <span className="text-sm font-black text-slate-800">{third.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (third.completedQuestions / (third.totalAssignedQuestions || 6)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* FULL LEADERBOARD TABLE SECTION */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>All Standings</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
            {filtered.length} Students
          </span>
        </h3>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Rank / S.No</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Questions Solved</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Accuracy %</th>
              <th className="py-3 px-4">Last Eval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  No participating students found
                </td>
              </tr>
            ) : (
              filtered.map((entry, index) => {
                const isMe = currentStudentId && entry.studentId === currentStudentId;

                return (
                  <tr
                    key={entry.studentId}
                    className={`transition-colors duration-200 group ${
                      isMe
                        ? 'bg-violet-50/70 border-l-4 border-violet-600 shadow-sm'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Rank / Serial Number */}
                    <td className="py-4 px-4 whitespace-nowrap min-w-[70px]">
                      {getRankBadge(entry, index)}
                    </td>

                    {/* Student Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                          index === 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : index === 1
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : index === 2
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {entry.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                              {entry.name}
                            </span>
                            {isMe && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-600 text-white shadow-sm">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {entry.department} • Section {entry.section || 'C'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Questions Solved */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (entry.completedQuestions / (entry.totalAssignedQuestions || 6)) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {entry.completedQuestions}/{entry.totalAssignedQuestions || 6}
                        </span>
                      </div>
                    </td>

                    {/* Total Marks */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-slate-900 group-hover:text-violet-600 transition-colors">
                          {entry.totalMarks}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          /{entry.maxPossibleMarks}
                        </span>
                      </div>
                    </td>

                    {/* Percentage */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                        entry.percentage >= 80
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : entry.percentage >= 50
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {entry.percentage}%
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {entry.lastEvaluationTime ? (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(entry.lastEvaluationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 font-medium">
        <span>⚡ Socket.IO Connected: Real-time broadcast pushed directly from server</span>
        <span>Tie-breaker: Marks DESC → Solved Count DESC → Earliest Submission ASC</span>
      </div>

    </div>
  );
};
