import React, { useState, useEffect } from 'react';
import { Space, SpaceMember, CustomRole } from '../../../../lib/spaceTypes';
import { database } from '../../../../lib/firebase';
import { ref, onValue, off, DataSnapshot, set } from 'firebase/database';
import { Search, User, Filter, AlertCircle, Edit2 } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { hasPermission } from '../../../../lib/spacePermissions';

interface SpaceMembersProps {
  space: Space;
  currentUserRole: CustomRole | null | undefined;
}

interface MemberWithProfile extends SpaceMember {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  dbKey: string;
}

export default function SpaceMembers({ space, currentUserRole }: SpaceMembersProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }
    const membersRef = ref(database, 'spaceMembers');
    const rolesRef = ref(database, `spaceRoles/${space.id}`);
    
    let roles: Record<string, CustomRole> = {};

    const handleRoles = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        roles = snapshot.val();
        const rolesList = Object.values(roles).sort((a, b) => (a.order || 0) - (b.order || 0));
        setAvailableRoles(rolesList);
      }
    };

    const handleData = (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // Fetch all members for this space
      const spaceMembers: (SpaceMember & { dbKey: string })[] = [];
      Object.keys(data).forEach(key => {
        const member = data[key];
        if (member.spaceId === space.id) {
          spaceMembers.push({ ...member, dbKey: key } as SpaceMember & { dbKey: string });
        }
      });

      const membersWithProfiles: MemberWithProfile[] = spaceMembers.map((m) => ({
        ...m,
        displayName: `User ${m.userId.substring(0, 5)}`, // Fallback display name
        bio: m.roleId ? 'Habit Builder' : 'Community Leader',
      }));

      // Sort by joinedAt
      membersWithProfiles.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

      setMembers(membersWithProfiles);
      setLoading(false);
    };

    onValue(rolesRef, handleRoles);
    onValue(membersRef, handleData);

    return () => {
      off(membersRef, 'value', handleData);
      off(rolesRef, 'value', handleRoles);
    };
  }, [space.id]);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.roleId === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (roleId?: string) => {
    if (!roleId) return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    const role = availableRoles.find(r => r.id === roleId);
    if (!role) return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
    
    // Dynamic color classes based on CustomRole color
    if (role.color.includes('purple')) return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
    if (role.color.includes('indigo')) return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' };
    if (role.color.includes('emerald')) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (role.color.includes('amber') || role.color.includes('orange')) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
    if (role.color.includes('pink') || role.color.includes('rose')) return { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' };
    
    return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
  };

  const getRoleName = (roleId?: string) => {
    if (!roleId) return 'Member';
    const role = availableRoles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  const handleChangeRole = (dbKey: string, newRoleId: string) => {
    if (database) {
      set(ref(database, `spaceMembers/${dbKey}/roleId`), newRoleId);
      setEditingMemberId(null);
    }
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
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>{role.name}s</option>
            ))}
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
          {filteredMembers.map(member => {
            const style = getRoleBadgeStyle(member.roleId);
            return (
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
                  <div className="flex flex-col gap-1 mt-1">
                    
                    {editingMemberId === member.userId && hasPermission(currentUserRole, 'manageMembers') ? (
                      <select
                        autoFocus
                        onBlur={() => setEditingMemberId(null)}
                        value={member.roleId}
                        onChange={(e) => handleChangeRole(member.dbKey, e.target.value)}
                        className="text-xs font-bold border border-slate-200 rounded px-1 py-1"
                      >
                        {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    ) : (
                      <div 
                        className={`inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[10px] font-bold border ${style.bg} ${style.text} ${style.border} ${hasPermission(currentUserRole, 'manageMembers') ? 'cursor-pointer hover:opacity-80' : ''}`}
                        onClick={() => {
                          if (hasPermission(currentUserRole, 'manageMembers')) {
                            setEditingMemberId(member.userId);
                          }
                        }}
                        title={hasPermission(currentUserRole, 'manageMembers') ? "Click to change role" : ""}
                      >
                        {getRoleName(member.roleId)}
                        {hasPermission(currentUserRole, 'manageMembers') && <Edit2 size={8} className="ml-1 opacity-50" />}
                      </div>
                    )}
                    
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-1">
                      Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
