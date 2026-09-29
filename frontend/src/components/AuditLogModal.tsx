'use client';

import React, { useState, useEffect } from 'react';
import { AuditLogItem } from '../types';
import { apiRequest } from '../lib/api';
import { X, ShieldAlert, History, ArrowRight } from 'lucide-react';

interface AuditLogModalProps {
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/audit-logs');
      if (res.success && res.logs) {
        setLogs(res.logs);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-2xl my-6">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Score Modification & Audit Trail</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">Loading audit records...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No audit records found yet</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-violet-100 text-violet-700 border border-violet-200 mt-0.5">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 uppercase">{log.action.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-400">• {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Student: <span className="font-semibold text-slate-900">{log.studentId?.name || 'N/A'}</span> ({log.studentId?.studentId})
                        {log.questionId && (
                          <> • Question: <span className="text-violet-700 font-medium">{log.questionId.title}</span></>
                        )}
                      </p>
                      {log.details && (
                        <p className="text-[11px] text-slate-600 italic mt-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                          &quot;{log.details}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {log.newMarks !== undefined && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-mono font-bold shadow-sm">
                      {log.oldMarks !== undefined ? (
                        <>
                          <span className="text-rose-600 line-through">{log.oldMarks}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-emerald-700 font-bold">{log.newMarks} pts</span>
                        </>
                      ) : (
                        <span className="text-emerald-700 font-bold">{log.newMarks} pts</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
