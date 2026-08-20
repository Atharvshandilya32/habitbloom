'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, get, child, set, query, orderByChild, equalTo } from 'firebase/database';
import { auth, database } from '../../../../lib/firebase';
import { CheckCircle2, Users, AlertTriangle } from 'lucide-react';
import { Space, SpaceInvite } from '../../../../lib/spaceTypes';
import { logAuditEvent } from '../../../../lib/auditLogger';
import { toast } from 'sonner';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingInvite, setCheckingInvite] = useState(true);
  
  const [space, setSpace] = useState<Space | null>(null);
  const [inviteData, setInviteData] = useState<SpaceInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [enteredOrgId, setEnteredOrgId] = useState('');

  useEffect(() => {
    if (!auth || !database) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      
      if (!u) {
        // Unauthenticated -> redirect to login with invite code
        router.push(`/login?space_invite=${inviteCode}`);
        return;
      }

      // Validate Invite Code against Firebase
      try {
        const dbRef = ref(database);
        const inviteQuery = query(ref(database, 'spaceInvites'), orderByChild('code'), equalTo(inviteCode));
        const inviteSnapshot = await get(inviteQuery);
        
        let foundInvite: SpaceInvite | null = null;
        if (inviteSnapshot.exists()) {
          const invites = inviteSnapshot.val();
          foundInvite = Object.values(invites)[0] as SpaceInvite;
        }

        if (!foundInvite) {
          setError('Invalid or expired invitation link.');
          setCheckingInvite(false);
          return;
        }

        setInviteData(foundInvite);

        // Fetch Space Details
        const spaceSnapshot = await get(child(dbRef, `spaces/${foundInvite.spaceId}`));
        if (spaceSnapshot.exists()) {
          setSpace(spaceSnapshot.val());
        } else {
          setError('The space for this invitation no longer exists.');
          setCheckingInvite(false);
          return;
        }

        // Count Members and Check Duplicate
        const membersSnapshot = await get(child(dbRef, 'spaceMembers'));
        if (membersSnapshot.exists()) {
          const members = membersSnapshot.val();
          let count = 0;
          for (const key in members) {
            if (members[key].spaceId === foundInvite.spaceId) {
              count++;
              if (members[key].userId === u.uid) {
                // User is already a member, just redirect
                router.push(`/?joined_space=${foundInvite.spaceId}`);
                return;
              }
            }
          }
          setMemberCount(count);
        }

        setCheckingInvite(false);
      } catch {
        setError('A network error occurred while validating the invitation.');
        setCheckingInvite(false);
      }
    });
    
    return () => unsub();
  }, [inviteCode, router]);

  const handleJoinSpace = async () => {
    if (!user || !space || !inviteData || !database) return;
    
    try {
      const now = new Date().toISOString();
      // Resolve default member roleId from spaceRoles if available
      let defaultRoleId = '';
      const rolesSnapshot = await get(child(ref(database), `spaceRoles/${space.id}`));
      if (rolesSnapshot.exists()) {
        const rolesMap = rolesSnapshot.val();
        const rolesList = Object.values(rolesMap) as import('../../../../lib/spaceTypes').CustomRole[];
        const memberRole = rolesList.find(r => r.name.toLowerCase().includes('member') || r.name.toLowerCase().includes('student')) || rolesList[rolesList.length - 1];
        if (memberRole) defaultRoleId = memberRole.id;
      }

      // Check Roster verification
      const cleanOrgId = enteredOrgId.trim().toUpperCase();
      let isVerified = false;
      let verStatus: 'verified' | 'pending' = 'pending';

      if (cleanOrgId) {
        const rosterSnap = await get(child(ref(database), `spaceRosters/${space.id}/${cleanOrgId}`));
        if (rosterSnap.exists()) {
          isVerified = true;
          verStatus = 'verified';
          const rosterData = rosterSnap.val();
          if (rosterData.roleId) defaultRoleId = rosterData.roleId;
        }
      }

      // Add user to space
      const newMember = {
        spaceId: space.id,
        userId: user.uid,
        roleId: defaultRoleId,
        role: 'member',
        orgId: cleanOrgId || undefined,
        verified: isVerified,
        verificationStatus: verStatus,
        joinedAt: now,
      };
      
      await set(ref(database, `spaceMembers/${space.id}_${user.uid}`), newMember);

      await logAuditEvent(
        space.id,
        { id: user.uid, name: user.displayName || user.email || 'Member' },
        { id: user.uid, name: user.displayName || user.email || 'Member' },
        'JOIN',
        `Joined space (${verStatus === 'verified' ? 'Auto-Verified via Roster' : 'Joined as Pending Verification'})`
      );
      
      router.push(`/?joined_space=${space.id}`);
    } catch {
      toast.error('Could not join the space. Please try again later or check your connection.');
    }
  };

  if (loading || checkingInvite) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading invitation...</p>
      </div>
    );
  }

  if (!user) return null; // Redirecting

  if (error || !space) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8 text-center border border-slate-200">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Invitation Error</h1>
          <p className="text-slate-500 mb-6">{error || 'Something went wrong.'}</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900"></div>
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
      
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500 border border-white/20">
        
        {/* Header Cover */}
        <div className="h-40 bg-slate-900 relative">
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/60 to-purple-600/60 mix-blend-overlay"></div>
           <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-5xl shadow-xl border-[6px] border-white z-20">
             {space.type === 'gym' ? '🏋️' : space.type === 'company' ? '🏢' : space.type === 'school' ? '🏫' : '🌍'}
           </div>
        </div>

        {/* Content */}
        <div className="pt-16 p-8 text-center bg-white">
          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            You&apos;ve been invited
          </div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-3">{space.name}</h1>
          <p className="text-slate-500 font-medium leading-relaxed">{space.description}</p>
          
          <div className="flex justify-center items-center gap-4 mt-6 py-5 border-y border-slate-100">
            <div className="flex flex-col items-center gap-1">
              <Users size={20} className="text-indigo-400" />
              <span className="text-xs font-bold text-slate-700">{memberCount} Members</span>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <span className="text-xs font-bold text-slate-700">Official {space.type}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 mt-6 text-left border border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Benefits of joining</h4>
            <ul className="space-y-2 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Access exclusive habit templates
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Participate in community challenges
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> View organization-wide analytics
              </li>
            </ul>
          </div>

          <div className="mt-6 text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {space.identityConfig?.primaryIdLabel || 'Organization ID / Admission No'} (Optional)
            </label>
            <input
              type="text"
              placeholder={`Enter your ${space.identityConfig?.primaryIdLabel || 'ID'} for auto-verification...`}
              value={enteredOrgId}
              onChange={(e) => setEnteredOrgId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Entering a matching ID auto-verifies your official membership.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button 
              onClick={handleJoinSpace}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg"
            >
              Join Community
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full py-3 text-slate-500 hover:text-slate-800 font-bold rounded-xl transition-colors text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
