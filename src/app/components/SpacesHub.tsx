import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Compass, LogIn, Trophy } from 'lucide-react';
import { Space, SpaceInvite } from '../../../lib/spaceTypes';
import { fetchLeaderboardEntries } from '../../../lib/socialUtils';
import { LeaderboardEntry } from '../../../lib/socialTypes';

interface SpacesHubProps {
  userSpaces: Space[];
  publicSpaces?: Space[];
  pendingInvites: SpaceInvite[];
  onCreateSpaceClick: () => void;
  onEnterSpace: (spaceId: string) => void;
  onAcceptInvite: (inviteId: string) => void;
  onJoinWithCode?: (code: string) => void;
}

export default function SpacesHub({
  userSpaces,
  pendingInvites,
  onCreateSpaceClick,
  onEnterSpace,
  onAcceptInvite,
  onJoinWithCode
}: SpacesHubProps) {
  const [joinCode, setJoinCode] = useState('');
  const [topBloomers, setTopBloomers] = useState<LeaderboardEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    fetchLeaderboardEntries('xp', 'global', '')
      .then((entries) => {
        if (isMounted) {
          setTopBloomers(entries.slice(0, 3));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleJoin = () => {
    if (joinCode.trim()) {
      if (onJoinWithCode) {
        onJoinWithCode(joinCode.trim());
      } else {
        router.push(`/invite/${joinCode.trim()}`);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Users size={32} className="text-emerald-500" />
            HabitBloom Spaces
          </h2>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">
            Join organizations, schools, or gyms to build habits together. 
            Your personal habits always remain private.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Enter invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="w-full pl-4 pr-10 py-2.5 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium transition-all"
            />
            <button 
              onClick={handleJoin}
              disabled={!joinCode.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 disabled:opacity-50 transition-colors"
            >
              <LogIn size={18} />
            </button>
          </div>
          <button 
            onClick={onCreateSpaceClick}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-sm whitespace-nowrap"
          >
            <Plus size={18} />
            Create Space
          </button>
        </div>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-4">Pending Invitations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Invitation</h4>
                  <p className="text-xs text-slate-500 mt-1">Code: {invite.code}</p>
                </div>
                <button 
                  onClick={() => onAcceptInvite(invite.id)}
                  className="mt-4 w-full py-2 bg-amber-100 text-amber-800 font-bold rounded-xl hover:bg-amber-200 transition-colors"
                >
                  Accept Invite
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Leaderboard Snapshot / Community Highlight */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 border-b border-emerald-400/30 pb-4 mb-4">
          <Trophy className="text-yellow-400" size={24} />
          <h3 className="text-lg font-bold">{topBloomers.length > 0 ? 'Global Top Bloomers' : 'HabitBloom Community'}</h3>
        </div>
        {topBloomers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topBloomers.map((user, idx) => {
              const rankColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];
              return (
                <div key={user.uid || idx} className="bg-white/10 rounded-2xl p-4 flex items-center justify-between border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-xl ${rankColors[idx] || 'text-white'}`}>#{user.rank || idx + 1}</span>
                    <span className="font-bold text-sm truncate max-w-[130px]">{user.displayName || user.username || 'Bloomer'}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-lg">{user.totalXP} XP</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-emerald-50 text-sm font-medium leading-relaxed">
            Collaborate with your school, company, gym, or friends to build habits together while keeping your personal reflection notes completely private.
          </div>
        )}
      </div>

      {/* My Spaces */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">My Spaces</h3>
        
        {userSpaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
            <Compass size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No spaces yet</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2 mb-6">
              You haven&apos;t joined any organizations yet. Discover communities below or create your own.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSpaces.map(space => (
              <div 
                key={space.id} 
                onClick={() => onEnterSpace(space.id)}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-emerald-50 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-1">{space.name}</h4>
                <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-lg mb-3">
                  {space.type}
                </span>
                <p className="text-sm text-slate-500 line-clamp-2">{space.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>




    </div>
  );
}
