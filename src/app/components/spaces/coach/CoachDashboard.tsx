import React, { useState, useEffect } from 'react';
import { Space, SpaceRole } from '../../../../../lib/spaceTypes';
import { AlertCircle, MessageSquare, TrendingDown, Star, BrainCircuit, Loader2 } from 'lucide-react';
import { generateSpaceWeeklyReport } from '../../../../../lib/spaceAiUtils';

interface CoachDashboardProps {
  space: Space;
  role: SpaceRole;
}

export default function CoachDashboard({ space, role }: CoachDashboardProps) {
  const [aiReport, setAiReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      setIsGenerating(true);
      try {
        // Mock health score and recent issues for demonstration
        const report = await generateSpaceWeeklyReport(space.type, 72, ['Missed Hydration goals', 'Dropped engagement in challenges']);
        setAiReport(report);
      } finally {
        setIsGenerating(false);
      }
    }
    fetchReport();
  }, [space.type]);

  // Only owners, admins, and coaches can see this dashboard
  if (role !== 'owner' && role !== 'admin' && role !== 'coach') {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-500 mt-2">You do not have permission to view the coach dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* AI Coach Insights Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 shadow-md text-white">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <BrainCircuit size={20} />
          AI Coach Insights
        </h2>
        {isGenerating ? (
          <div className="flex items-center gap-2 text-emerald-100/70 text-sm py-2">
            <Loader2 size={16} className="animate-spin" /> Analyzing community engagement...
          </div>
        ) : (
          <p className="text-emerald-50 text-sm max-w-2xl leading-relaxed">
            {aiReport}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Needs Encouragement List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingDown size={18} className="text-rose-500" />
            Needs Encouragement
          </h3>
          
          <div className="space-y-4">
            {[
              { id: '1', name: 'Anonymous Member A', issue: 'Missed 3 days of Hydration template', urgency: 'high' },
              { id: '2', name: 'Anonymous Member B', issue: 'Has not joined the latest challenge', urgency: 'medium' },
              { id: '3', name: 'Anonymous Member C', issue: 'Engagement score dropped by 15%', urgency: 'low' }
            ].map(member => (
              <div key={member.id} className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="mt-1">
                  <AlertCircle size={18} className={
                    member.urgency === 'high' ? 'text-rose-500' :
                    member.urgency === 'medium' ? 'text-amber-500' : 'text-slate-400'
                  } />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-700">{member.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{member.issue}</p>
                </div>
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                  <MessageSquare size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers / Shoutouts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Star size={18} className="text-amber-400" />
            Suggested Shoutouts
          </h3>
          
          <div className="space-y-4">
             {[
              { id: '4', name: 'Anonymous Member X', reason: 'Completed 14 days streak!' },
              { id: '5', name: 'Anonymous Member Y', reason: 'First to finish the 7-Day Challenge.' },
            ].map(member => (
              <div key={member.id} className="flex items-start gap-4 p-3 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                <div className="mt-1">
                  <Star size={18} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-700">{member.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{member.reason}</p>
                </div>
                <button className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-sm">
                  Send Kudos
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
