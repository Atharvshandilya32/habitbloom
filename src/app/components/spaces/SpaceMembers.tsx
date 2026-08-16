import React, { useState, useEffect } from 'react';
import { Space, SpaceMember, CustomRole } from '../../../../lib/spaceTypes';
import { database } from '../../../../lib/firebase';
import { ref, onValue, off, DataSnapshot, set, get, child } from 'firebase/database';
import { Search, User, Filter, AlertCircle, Edit2, Copy, Check, Hash, X, Download, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { hasPermission } from '../../../../lib/spacePermissions';
import { formatHbId } from '../../../../lib/identityUtils';
import { logAuditEvent } from '../../../../lib/auditLogger';

interface SpaceMembersProps {
  space: Space;
  currentUserRole: CustomRole | null | undefined;
}

interface MemberWithProfile extends SpaceMember {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  dbKey: string;
  hbId?: string;
  email?: string;
}

export default function SpaceMembers({ space, currentUserRole }: SpaceMembersProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberWithProfile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

    const handleData = async (snapshot: DataSnapshot) => {
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

      // Try resolving user profiles from /socialProfiles
      const userProfilesMap: Record<string, { displayName?: string; photoURL?: string; hbId?: string; email?: string }> = {};
      if (database && spaceMembers.length > 0) {
        try {
          const promises = spaceMembers.map(async (m) => {
            const pSnap = await get(ref(database, `socialProfiles/${m.userId}`));
            if (pSnap.exists()) {
              userProfilesMap[m.userId] = pSnap.val();
            }
          });
          await Promise.all(promises);
        } catch {
          // Fallback gracefully if permission restricted
        }
      }

      const membersWithProfiles: MemberWithProfile[] = spaceMembers.map((m) => {
        const profile = userProfilesMap[m.userId];
        return {
          ...m,
          displayName: profile?.displayName || `User ${m.userId.substring(0, 5)}`,
          avatarUrl: profile?.photoURL,
          hbId: profile?.hbId,
          email: profile?.email || undefined,
          bio: m.roleId ? 'Habit Builder' : 'Community Leader',
        };
      });

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
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      m.displayName.toLowerCase().includes(q) ||
      m.userId.toLowerCase().includes(q) ||
      (m.hbId && m.hbId.includes(q)) ||
      (m.orgId && m.orgId.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q));

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

  const handleChangeRole = (dbKey: string, newRoleId: string, targetMember?: MemberWithProfile) => {
    if (database) {
      set(ref(database, `spaceMembers/${dbKey}/roleId`), newRoleId);
      setEditingMemberId(null);
      if (selectedMember) {
        setSelectedMember(prev => prev ? { ...prev, roleId: newRoleId } : null);
      }

      if (targetMember) {
        logAuditEvent(
          space.id,
          { id: 'admin', name: 'Administrator' },
          { id: targetMember.userId, name: targetMember.displayName },
          'ROLE_CHANGE',
          `Changed role to ${getRoleName(newRoleId)}`
        );
      }
    }
  };

  const handleVerifyMember = (dbKey: string, targetMember: MemberWithProfile, status: 'verified' | 'rejected') => {
    if (database) {
      set(ref(database, `spaceMembers/${dbKey}/verified`), status === 'verified');
      set(ref(database, `spaceMembers/${dbKey}/verificationStatus`), status);

      logAuditEvent(
        space.id,
        { id: 'admin', name: 'Administrator' },
        { id: targetMember.userId, name: targetMember.displayName },
        status === 'verified' ? 'VERIFY_APPROVE' : 'VERIFY_REJECT',
        `Verification set to ${status}`
      );
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Name', 'HabitBloom ID', 'Organization ID', 'Role', 'Verified', 'Joined Date'],
      ...members.map(m => [
        m.displayName,
        m.hbId ? formatHbId(m.hbId) : m.userId,
        m.orgId || 'N/A',
        getRoleName(m.roleId),
        m.verified ? 'YES' : 'NO',
        new Date(m.joinedAt).toLocaleDateString()
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${space.name.replace(/\s+/g, '-')}-members.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyId = (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(userId);
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 2000);
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

        {hasPermission(currentUserRole, 'manageMembers') && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            <Download size={14} />
            <span>Export Directory CSV</span>
          </button>
        )}
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
              <div 
                key={member.userId} 
                onClick={() => setSelectedMember(member)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <User size={20} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {member.displayName}
                    </h4>
                  </div>
                  
                  {/* App ID & Verification Status Tag */}
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-medium">
                      <Hash size={10} className="text-slate-400" />
                      {member.hbId ? formatHbId(member.hbId) : `${member.userId.substring(0, 8)}...`}
                    </span>
                    <button 
                      onClick={(e) => handleCopyId(member.hbId || member.userId, e)}
                      className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Copy App ID"
                    >
                      {copiedId === (member.hbId || member.userId) ? <Check size={12} className="text-emerald-500" /> : <Copy size={11} />}
                    </button>

                    {member.verified ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle size={10} /> Verified
                      </span>
                    ) : member.verificationStatus === 'pending' && hasPermission(currentUserRole, 'manageMembers') ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerifyMember(member.dbKey, member, 'verified');
                        }}
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                        title="Click to approve member verification"
                      >
                        <XCircle size={10} className="text-amber-500" /> Verify
                      </button>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    {editingMemberId === member.userId && hasPermission(currentUserRole, 'manageMembers') ? (
                      <select
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => setEditingMemberId(null)}
                        value={member.roleId}
                        onChange={(e) => handleChangeRole(member.dbKey, e.target.value)}
                        className="text-xs font-bold border border-slate-200 rounded px-1.5 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    ) : (
                      <div 
                        className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border} ${hasPermission(currentUserRole, 'manageMembers') ? 'hover:opacity-80' : ''}`}
                        onClick={(e) => {
                          if (hasPermission(currentUserRole, 'manageMembers')) {
                            e.stopPropagation();
                            setEditingMemberId(member.userId);
                          }
                        }}
                        title={hasPermission(currentUserRole, 'manageMembers') ? "Click to change role" : ""}
                      >
                        {getRoleName(member.roleId)}
                        {hasPermission(currentUserRole, 'manageMembers') && <Edit2 size={8} className="ml-1 opacity-60" />}
                      </div>
                    )}
                    
                    <span className="text-[11px] font-medium text-slate-400 truncate">
                      Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setSelectedMember(null)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center pt-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                {selectedMember.displayName.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {selectedMember.displayName}
              </h3>
              
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {selectedMember.bio || 'Habit Builder & Community Member'}
              </p>

              {/* Role Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeStyle(selectedMember.roleId).bg} ${getRoleBadgeStyle(selectedMember.roleId).text} ${getRoleBadgeStyle(selectedMember.roleId).border}`}>
                  {getRoleName(selectedMember.roleId)}
                </span>
              </div>
            </div>

            {/* Profile Info Details Card */}
            <div className="mt-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 space-y-4 border border-slate-100 dark:border-slate-700/50 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  User App ID
                </label>
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate mr-2">
                    {selectedMember.userId}
                  </span>
                  <button
                    onClick={() => handleCopyId(selectedMember.userId)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs rounded-lg transition-colors shrink-0"
                  >
                    {copiedId === selectedMember.userId ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy App ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Joined Space</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {new Date(selectedMember.joinedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {hasPermission(currentUserRole, 'manageMembers') && (
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Assign Community Role
                  </label>
                  <select
                    value={selectedMember.roleId}
                    onChange={(e) => handleChangeRole(selectedMember.dbKey, e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {availableRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.name} — {role.description}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
