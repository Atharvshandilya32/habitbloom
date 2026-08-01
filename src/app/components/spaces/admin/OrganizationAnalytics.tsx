import React, { useState, useEffect } from 'react';
import { Space, SpaceRole } from '../../../../../lib/spaceTypes';
import { BarChart3, TrendingUp, Users, Activity, Target, BrainCircuit, HeartPulse, Loader2 } from 'lucide-react';
import { generateSpaceWeeklyReport } from '../../../../../lib/spaceAiUtils';

interface OrganizationAnalyticsProps {
  space: Space;
  role: SpaceRole;
}

export default function OrganizationAnalytics({ space, role }: OrganizationAnalyticsProps) {
  const healthScore = 84;
  const [healthExplanation, setHealthExplanation] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      setIsGenerating(true);
      try {
        const explanation = await generateSpaceWeeklyReport(space.type, healthScore, ['Slight drop in weekend logins']);
        setHealthExplanation(explanation);
      } finally {
        setIsGenerating(false);
      }
    }
    fetchReport();
  }, [space.type, healthScore]);

  // Only owners and admins can see this dashboard
  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-500 mt-2">You do not have permission to view organization analytics.</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Members', value: '142', trend: '+12 this week', icon: Users, color: 'indigo' },
    { label: 'Active Daily', value: '89%', trend: '+4% vs last week', icon: Activity, color: 'emerald' },
    { label: 'Habit Adoption', value: '76%', trend: 'Installed templates', icon: Target, color: 'amber' },
    { label: 'Challenges', value: '3', trend: 'Active right now', icon: TrendingUp, color: 'rose' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Health Score Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-8 relative overflow-hidden shadow-lg border border-indigo-800">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex-1 text-white">
            <h2 className="text-xl font-bold text-indigo-200 flex items-center gap-2 mb-2">
              <HeartPulse size={20} className="text-emerald-400" />
              Organization Health Score
            </h2>
            <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-lg min-h-[3rem]">
              <span className="flex items-center gap-1.5 text-indigo-300 font-bold mb-1">
                <BrainCircuit size={14} /> AI Analysis:
              </span>
              {isGenerating ? (
                <span className="flex items-center gap-2 text-indigo-200/60">
                  <Loader2 size={14} className="animate-spin" /> Analyzing health score...
                </span>
              ) : (
                healthExplanation
              )}
            </p>
          </div>

          <div className="flex-shrink-0 relative">
             <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90 drop-shadow-xl">
               <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
               <circle 
                 cx="60" cy="60" r="50" 
                 fill="none" 
                 stroke="#34d399" 
                 strokeWidth="12" 
                 strokeDasharray={314.159} 
                 strokeDashoffset={314.159 - (314.159 * healthScore) / 100} 
                 strokeLinecap="round" 
                 className="transition-all duration-1000 ease-out"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-3xl font-black text-white">{healthScore}</span>
             </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <h4 className="text-3xl font-black text-slate-800">{stat.value}</h4>
                <p className="text-sm font-bold text-slate-500 mt-1">{stat.label}</p>
                <p className={`text-xs font-semibold mt-2 ${stat.trend.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {stat.trend}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Chart Mock */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" />
              Weekly Engagement
            </h3>
            <select className="bg-slate-50 border border-slate-200 text-xs font-bold px-2 py-1 rounded-lg text-slate-600 focus:outline-none">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
            </select>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-2 px-2 pb-2 border-b border-slate-100">
            {[40, 65, 80, 55, 90, 75, 85].map((height, i) => (
              <div key={i} className="w-full relative group">
                <div 
                  className="bg-indigo-500 hover:bg-indigo-400 rounded-t-md transition-all w-full absolute bottom-0" 
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-2 text-xs font-bold text-slate-400">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Popular Templates */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Target size={18} className="text-amber-500" />
             Top Habit Templates
           </h3>
           
           <div className="space-y-4">
             {[
               { name: "Morning Hydration", emoji: "💧", count: 112, pct: 85 },
               { name: "Daily Standup", emoji: "📢", count: 98, pct: 70 },
               { name: "Deep Work (2 hrs)", emoji: "🧠", count: 64, pct: 45 },
             ].map((template, i) => (
               <div key={i} className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">
                   {template.emoji}
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between mb-1">
                     <span className="text-sm font-bold text-slate-800">{template.name}</span>
                     <span className="text-xs font-bold text-slate-500">{template.count} installs</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                     <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${template.pct}%` }}></div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

    </div>
  );
}
