import React from 'react';
import { Target, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">About HabitBloom</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            We are on a mission to help individuals and organizations build unshakeable consistency.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">The Mission</h3>
            <p className="text-slate-600 font-medium text-sm">
              To provide the most intuitive, intelligent platform for tracking personal growth and team objectives.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">The Community</h3>
            <p className="text-slate-600 font-medium text-sm">
              We believe that while habits start personal, they thrive in community. Spaces brings teams together.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">The Technology</h3>
            <p className="text-slate-600 font-medium text-sm">
              Powered by advanced AI, HabitBloom intelligently suggests the routines you need to succeed.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 text-center">
          <h2 className="text-3xl font-black text-slate-800 mb-6">Join the Beta</h2>
          <p className="text-slate-600 font-medium mb-8 max-w-lg mx-auto">
            HabitBloom Spaces is currently in closed beta. We are working closely with early adopters to refine the platform before our public launch.
          </p>
          <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5">
            Get Early Access
          </button>
        </div>
      </div>
    </div>
  );
}
