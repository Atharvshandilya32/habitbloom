'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import { CheckCircle2, Users } from 'lucide-react';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingInvite, setCheckingInvite] = useState(true);

  // Mock Space Data for the invite preview
  const mockSpace = {
    name: 'Titan Fitness Elite',
    type: 'gym',
    description: 'The premier community for athletes committed to daily growth and excellence.',
    memberCount: 142
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        // Unauthenticated -> redirect to login with invite code
        router.push(`/login?space_invite=${inviteCode}`);
      } else {
        // Authenticated -> validate invite
        setTimeout(() => setCheckingInvite(false), 800);
      }
    });
    return () => unsub();
  }, [inviteCode, router]);

  if (loading || checkingInvite) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading invitation...</p>
      </div>
    );
  }

  if (!user) return null; // Let the redirect happen

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
             🏋️
           </div>
        </div>

        {/* Content */}
        <div className="pt-16 p-8 text-center bg-white">
          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            You&apos;ve been invited
          </div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-3">{mockSpace.name}</h1>
          <p className="text-slate-500 font-medium leading-relaxed">{mockSpace.description}</p>
          
          <div className="flex justify-center items-center gap-4 mt-6 py-5 border-y border-slate-100">
            <div className="flex flex-col items-center gap-1">
              <Users size={20} className="text-indigo-400" />
              <span className="text-xs font-bold text-slate-700">{mockSpace.memberCount} Members</span>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <span className="text-xs font-bold text-slate-700">Official {mockSpace.type}</span>
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

          <div className="mt-8 space-y-3">
            <button 
              onClick={() => {
                // In a real app, write to Firebase to join space, then redirect to app
                router.push(`/?joined_space=${inviteCode}`);
              }}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg"
            >
              Join Community
            </button>
            <button 
              onClick={() => {
                // Postpone, redirect to personal dashboard
                router.push('/');
              }}
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
