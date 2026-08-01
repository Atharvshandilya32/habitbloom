import React, { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../../../../lib/firebase';
import { AuditLogEntry } from '../../../../../lib/identityTypes';
import { History, Shield, Search } from 'lucide-react';

interface AuditLogViewerProps {
  spaceId: string;
}

export default function AuditLogViewer({ spaceId }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!database || !spaceId) return;

    const logsRef = ref(database, `spaceAuditLogs/${spaceId}`);
    const unsub = onValue(logsRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = Object.values(val) as AuditLogEntry[];
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(list);
      } else {
        setLogs([]);
      }
      setLoading(false);
    });

    return () => off(logsRef, 'value', unsub);
  }, [spaceId]);

  const filteredLogs = logs.filter(l => {
    const q = search.toLowerCase();
    return (
      l.actorName.toLowerCase().includes(q) ||
      l.targetUserName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      (l.details && l.details.toLowerCase().includes(q))
    );
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('APPROVE') || action.includes('PROMOTED')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
    if (action.includes('REJECT') || action.includes('REMOVED') || action.includes('DEMOTED')) {
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
    }
    if (action.includes('ROSTER')) {
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
    }
    return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History size={18} className="text-indigo-500" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Space Audit Trail</h3>
            <p className="text-xs text-slate-400">Immutable security logs for administrative & member actions.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading audit history...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-400">No audit log entries recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredLogs.map(log => (
            <div key={log.id} className="bg-white dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                  <Shield size={14} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{log.actorName}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                      → {log.targetUserName}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
