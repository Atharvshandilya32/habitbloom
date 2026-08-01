import React from 'react';
import { Space, SpaceRole } from '../../../lib/spaceTypes';
import { ArrowLeft, Users, Trophy, Target, Settings, Link as LinkIcon } from 'lucide-react';

interface SpaceDashboardProps {
  space: Space;
  role: SpaceRole;
  onBack: () => void;
  onGenerateInvite: () => void;
}

export default function SpaceDashboard({ space, role, onBack, onGenerateInvite }: SpaceDashboardProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Navigation & Context Switcher */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to Spaces Hub
        </button>

        {role === 'admin' && (
          <button 
            onClick={onGenerateInvite}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 transition-colors"
          >
            <LinkIcon size={16} />
            Invite Members
          </button>
        )}
      </div>

      {/* Space Header Banner */}
      <div className="relative w-full h-48 bg-slate-900 rounded-3xl overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
        
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="flex items-end gap-5">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              {space.type === 'gym' ? '🏋️' : space.type === 'school' ? '🎓' : space.type === 'company' ? '🏢' : '🚀'}
            </div>
            <div className="pb-1 text-white">
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                  {space.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/80 backdrop-blur-md text-xs font-bold capitalize">
                  Role: {role}
                </span>
              </div>
              <h1 className="text-3xl font-black drop-shadow-md">{space.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <p className="text-slate-600 font-medium px-2">{space.description}</p>

      {/* Placeholder Grid for Phase 4B Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* Left Column: Organization Activity */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 border-dashed text-center">
            <Trophy className="mx-auto text-slate-300 mb-3" size={32} />
            <h3 className="font-bold text-slate-700">Community Challenges</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              (Coming in Phase 4B) Participate in time-bound challenges with other members.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 border-dashed text-center">
            <Target className="mx-auto text-slate-300 mb-3" size={32} />
            <h3 className="font-bold text-slate-700">Shared Habit Templates</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              (Coming in Phase 4B) 1-click install habits recommended by your organization.
            </p>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-slate-400" />
                Members
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">You are currently viewing the foundation. Member list will appear here.</p>
            {role === 'admin' && (
              <button 
                onClick={onGenerateInvite}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
              >
                Manage Members
              </button>
            )}
          </div>

          {role === 'admin' && (
            <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-3">
                <Settings size={18} className="text-slate-400" />
                <h3 className="font-bold">Admin Tools</h3>
              </div>
              <ul className="space-y-2 mt-4 text-sm font-medium text-slate-300">
                <li className="hover:text-white cursor-pointer flex items-center justify-between">
                  Space Settings <span>→</span>
                </li>
                <li className="hover:text-white cursor-pointer flex items-center justify-between">
                  Announcement <span>→</span>
                </li>
                <li className="hover:text-white cursor-pointer flex items-center justify-between">
                  Create Challenge <span>→</span>
                </li>
              </ul>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
