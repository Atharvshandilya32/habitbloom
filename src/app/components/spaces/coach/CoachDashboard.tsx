import React from 'react';
import { CustomRole, SpaceChallenge } from '../../../../../lib/spaceTypes';
import { BrainCircuit, Activity, Users, AlertTriangle, Megaphone } from 'lucide-react';
import { hasPermission } from '../../../../../lib/spacePermissions';

interface CoachDashboardProps {
  role: CustomRole | null | undefined;
  challenges?: SpaceChallenge[];
}

export default function CoachDashboard({ role, challenges = [] }: CoachDashboardProps) {

  // Only roles with createChallenges or manageMembers can see this dashboard
  if (!hasPermission(role, 'createChallenges') && !hasPermission(role, 'manageMembers')) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-500 mt-2">You do not have permission to view the coach dashboard.</p>
      </div>
    );
  }

  // Deterministic Intelligence Engine
  const insights = [];
  const activeChallenges = challenges.filter(c => !c.endDate || new Date(c.endDate).getTime() > Date.now());
  const totalParticipants = activeChallenges.reduce((sum, c) => sum + (c.participants?.length || 0), 0);

  if (activeChallenges.length === 0) {
    insights.push({ type: 'warning', text: 'Participation is low. Consider launching a 7-day challenge to boost engagement.', icon: <AlertTriangle size={20} className="text-amber-500" /> });
  } else {
    insights.push({ type: 'positive', text: `${activeChallenges.length} active challenges are currently driving community engagement.`, icon: <Activity size={20} className="text-emerald-500" /> });
    
    if (totalParticipants > 0) {
      insights.push({ type: 'neutral', text: `${totalParticipants} members are actively participating in ongoing challenges.`, icon: <Users size={20} className="text-indigo-500" /> });
    } else {
      insights.push({ type: 'warning', text: 'You have active challenges, but no participants yet. Make an announcement to invite members!', icon: <Megaphone size={20} className="text-amber-500" /> });
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-indigo-950">Deterministic Insights</h3>
            <p className="text-sm font-medium text-indigo-800/70">Actionable intelligence based on actual community activity.</p>
          </div>
        </div>

        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm flex items-start gap-4">
              <div className="mt-0.5">{insight.icon}</div>
              <p className="text-slate-700 font-medium">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

