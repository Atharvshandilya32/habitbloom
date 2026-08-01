import React from 'react';
import { Trophy } from 'lucide-react';
import { Challenge } from '../../../lib/habitTypes';

interface ChallengesViewProps {
  challenges: Challenge[];
  onJoinChallenge: (challenge: Challenge) => void;
}

const PRESET_CHALLENGES: Challenge[] = [
  { id: 'c1', title: '30 Day Workout', description: 'Exercise for 30 consecutive days.', totalDays: 30, daysCompleted: 0, startDate: '', isActive: false },
  { id: 'c2', title: '100 Push-ups', description: 'Build up to 100 push-ups a day.', totalDays: 60, daysCompleted: 0, startDate: '', isActive: false },
  { id: 'c3', title: 'Read Daily', description: 'Read at least 10 pages every day for a month.', totalDays: 30, daysCompleted: 0, startDate: '', isActive: false },
  { id: 'c4', title: 'No Sugar', description: 'Cut out added sugar completely.', totalDays: 21, daysCompleted: 0, startDate: '', isActive: false },
];

export default function ChallengesView({ challenges, onJoinChallenge }: ChallengesViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-300">
      
      <div>
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Trophy size={24} className="text-amber-500" />
          Challenges
        </h2>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Push your limits with structured time-bound challenges.
        </p>
      </div>

      {challenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Challenges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map(c => {
              const pct = Math.round((c.daysCompleted / c.totalDays) * 100);
              return (
                <div key={c.id} className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/20">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-bold text-xl">{c.title}</h4>
                      <p className="text-amber-100 text-sm mt-1">{c.description}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      <Trophy size={24} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{c.daysCompleted} days</span>
                      <span>{c.totalDays - c.daysCompleted} left</span>
                    </div>
                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Discover Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_CHALLENGES.filter(pc => !challenges.find(c => c.id === pc.id)).map(pc => (
            <div key={pc.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy size={18} />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{pc.title}</h4>
              <p className="text-xs text-slate-500 font-medium mb-4 h-10 line-clamp-2">{pc.description}</p>
              
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-bold text-slate-400">{pc.totalDays} Days</span>
                <button 
                  onClick={() => onJoinChallenge({ ...pc, startDate: new Date().toISOString(), isActive: true })}
                  className="text-xs font-bold bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
