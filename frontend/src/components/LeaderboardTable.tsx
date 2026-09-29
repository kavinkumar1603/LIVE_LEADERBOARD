'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Search, Clock, Sparkles } from 'lucide-react';
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

  // Filter entries
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
      
      {/* Table Header with Search */}
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

      {/* Table content */}
      <div className="overflow-x-auto mt-4">
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
                              width: `${Math.min(100, (entry.completedQuestions / (entry.totalAssignedQuestions || 5)) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {entry.completedQuestions}/{entry.totalAssignedQuestions || 5}
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
