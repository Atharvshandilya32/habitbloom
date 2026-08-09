import React from 'react';
import { CustomRole } from '../../../../../lib/spaceTypes';
import { BrainCircuit } from 'lucide-react';
import { hasPermission } from '../../../../../lib/spacePermissions';

interface CoachDashboardProps {
  role: CustomRole | null | undefined;
}

export default function CoachDashboard({ role }: CoachDashboardProps) {

  // Only roles with createChallenges or manageMembers can see this dashboard
  if (!hasPermission(role, 'createChallenges') && !hasPermission(role, 'manageMembers')) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-500 mt-2">You do not have permission to view the coach dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <BrainCircuit size={48} className="text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Coach Insights Unavailable</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          We need more community activity data before we can generate meaningful insights and suggested shoutouts. Keep encouraging your members to log their habits!
        </p>
      </div>
    </div>
  );
}
