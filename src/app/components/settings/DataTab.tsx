import React from 'react';
import { Habit, HabitLog } from '../../../../lib/habitTypes';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DataTabProps {
  habits: Habit[];
  logs: HabitLog;
  onClearData?: () => void;
}

export default function DataTab({ habits, logs, onClearData }: DataTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Data Storage & Storage Options</h2>
      <p className="text-xs text-slate-500">
        HabitBloom seamlessly mirrors your data between local browser storage and your free Firebase Realtime Database.
      </p>

      <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100 space-y-2">
        <div className="text-xs font-bold text-slate-800">Storage Summary</div>
        <div className="text-xs text-slate-600">Total Habits: <span className="font-bold">{habits.length}</span></div>
        <div className="text-xs text-slate-600">Logged Entries: <span className="font-bold">{Object.keys(logs).length}</span></div>
      </div>

      {onClearData && (
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your local habit cache? This cannot be undone.')) {
                onClearData();
                toast.success('Local cache cleared');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all"
          >
            <Trash2 size={15} />
            Reset Local Habit Cache
          </button>
        </div>
      )}
    </div>
  );
}
