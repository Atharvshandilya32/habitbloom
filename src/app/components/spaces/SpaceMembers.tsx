import React, { useState, useEffect } from 'react';
import { Space, SpaceMember, SpaceRole } from '../../../../lib/spaceTypes';
import { database } from '../../../../lib/firebase';
import { ref, onValue, off, DataSnapshot } from 'firebase/database';
import { Search, Shield, User, Filter, AlertCircle } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface SpaceMembersProps {
  space: Space;
}

interface MemberWithProfile extends SpaceMember {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}

export default function SpaceMembers({ space }: SpaceMembersProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<SpaceRole | 'all'>('all');

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }
    const membersRef = ref(database, 'spaceMembers');
    
    const handleData = (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // Fetch all members for this space
      const spaceMembers: SpaceMember[] = [];
      Object.keys(data).forEach(key => {
        const member = data[key];
        if (member.spaceId === space.id) {
          spaceMembers.push(member);
        }
      });

      // To respect data privacy (Closed Beta limitation), we are mocking the user profile data
      // since the "users" table may not have public profiles configured yet.
      // In production, you would join this with the `users` table or a `public_profiles` table.
      const membersWithProfiles: MemberWithProfile[] = spaceMembers.map((m) => ({
        ...m,
        displayName: `User ${m.userId.substring(0, 5)}`, // Fallback display name
        bio: m.role === 'admin' || m.role === 'owner' ? 'Community Leader' : 'Habit Builder',
      }));

      // Sort by joinedAt
      membersWithProfiles.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

      setMembers(membersWithProfiles);
      setLoading(false);
    };

    onValue(membersRef, handleData);

    return () => {
      off(membersRef, 'value', handleData);
    };
  }, [space.id]);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: SpaceRole) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'admin': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'coach': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'moderator': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getRoleIcon = (role: SpaceRole) => {
    if (role === 'owner' || role === 'admin') return <Shield size={12} className="mr-1" />;
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Member Directory</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {members.length} {members.length === 1 ? 'member' : 'members'} in {space.name}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
          />
        </div>
        
        <div className="relative min-w-[140px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as SpaceRole | 'all')}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owners</option>
            <option value="admin">Admins</option>
            <option value="coach">Coaches</option>
            <option value="moderator">Moderators</option>
            <option value="member">Members</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-12 text-center shadow-sm">
          <AlertCircle size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No members found</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            {searchQuery || roleFilter !== 'all' 
              ? "We couldn't find anyone matching your search criteria. Try adjusting your filters." 
              : "This space doesn't have any members yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <div key={member.userId} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                <User size={20} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {member.displayName}
                  </h4>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
