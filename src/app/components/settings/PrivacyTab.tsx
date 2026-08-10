import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Privacy & Security</h2>
      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
          <ShieldCheck size={16} />
          Zero Paid APIs & Zero Third-Party Trackers
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          HabitBloom guarantees complete data privacy. Your data remains strictly within your browser and your private Firebase RTDB container.
        </p>
      </div>
    </div>
  );
}
