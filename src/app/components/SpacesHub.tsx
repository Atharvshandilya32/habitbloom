import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Plus, Compass, LogIn } from 'lucide-react';
import { Space, SpaceInvite } from '../../../lib/spaceTypes';

interface SpacesHubProps {
  userSpaces: Space[];
  publicSpaces?: Space[];
  pendingInvites: SpaceInvite[];
  onCreateSpaceClick: () => void;
  onEnterSpace: (spaceId: string) => void;
  onAcceptInvite: (inviteId: string) => void;
}

export default function SpacesHub({
  userSpaces,
  publicSpaces = [],
  pendingInvites,
  onCreateSpaceClick,
  onEnterSpace,
  onAcceptInvite
}: SpacesHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    if (joinCode.trim()) {
      router.push(`/invite/${joinCode.trim()}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Users size={32} className="text-indigo-500" />
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
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
            />
            <button 
              onClick={handleJoin}
              disabled={!joinCode.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 disabled:opacity-50 transition-colors"
            >
              <LogIn size={18} />
            </button>
          </div>
          <button 
            onClick={onCreateSpaceClick}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm whitespace-nowrap"
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
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-1">{space.name}</h4>
                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg mb-3">
                  {space.type}
                </span>
                <p className="text-sm text-slate-500 line-clamp-2">{space.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>


      <div className="space-y-4 pt-8 border-t border-slate-200/60">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Discover Public Spaces</h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        
        {searchQuery.trim() === '' ? (
          <div className="text-center py-12 bg-slate-100/50 rounded-3xl border border-slate-200">
            <p className="text-slate-500 font-medium">Use the search bar to find public organizations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicSpaces
              .filter(space => 
                space.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                space.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(space => {
                const isMember = userSpaces.some(us => us.id === space.id);
                return (
                  <div 
                    key={space.id} 
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
                  >
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Users size={24} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-1">{space.name}</h4>
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg mb-3">
                      {space.type}
                    </span>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{space.description}</p>
                    {isMember ? (
                      <button 
                        onClick={() => onEnterSpace(space.id)}
                        className="w-full py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl transition-colors"
                      >
                        Enter Space
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          // For a public space, we could auto-join or prompt for an invite code.
                          // Usually public spaces don't need invites, but since joining isn't hooked up for public spaces directly yet:
                          alert('Joining public spaces directly will be available soon! For now, please use an invite code.');
                        }}
                        className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl transition-colors"
                      >
                        Join Organization
                      </button>
                    )}
                  </div>
                );
              })}
            {publicSpaces.filter(space => space.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-100/50 rounded-3xl border border-slate-200">
                <p className="text-slate-500 font-medium">No organizations found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
