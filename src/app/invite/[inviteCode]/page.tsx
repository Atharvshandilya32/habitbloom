'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import { CheckCircle2, Clock, Users } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Cover */}
        <div className="h-32 bg-slate-900 relative">
           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/40 to-purple-600/40 mix-blend-overlay"></div>
           <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
           <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-lg border-4 border-white">
             🏋️
           </div>
        </div>

        {/* Content */}
        <div className="pt-14 p-6 text-center">
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">You&apos;ve been invited</p>
          <h1 className="text-2xl font-black text-slate-800">{mockSpace.name}</h1>
          <p className="text-slate-500 mt-2 font-medium">{mockSpace.description}</p>
          
          <div className="flex justify-center items-center gap-4 mt-6 py-4 border-y border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <Users size={16} />
              <span className="text-sm font-bold">{mockSpace.memberCount} Members</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={16} />
              <span className="text-sm font-bold">Public Space</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button 
              onClick={() => {
                // In a real app, write to Firebase to join space, then redirect to app
                router.push(`/?joined_space=${inviteCode}`);
              }}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              Join Space
            </button>
            <button 
              onClick={() => {
                // Postpone, redirect to personal dashboard
                router.push('/');
              }}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Clock size={18} />
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
