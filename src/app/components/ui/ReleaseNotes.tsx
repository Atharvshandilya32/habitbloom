import React from 'react';
import { Sparkles, Check, X } from 'lucide-react';

interface ReleaseNotesProps {
  onClose: () => void;
}

export default function ReleaseNotes({ onClose }: ReleaseNotesProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-4 border border-white/30">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">What&apos;s New in HabitBloom</h2>
            <p className="text-indigo-100 font-medium">Version 0.9.0 Beta</p>
          </div>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            
            <div>
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">🚀 Major Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <strong className="text-slate-800 block">HabitBloom Spaces</strong>
                    <span className="text-sm text-slate-500 font-medium">Create communities for your gym, school, or company. Share templates and compete in challenges.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <strong className="text-slate-800 block">AI-Powered Coach</strong>
                    <span className="text-sm text-slate-500 font-medium">Admins can now auto-generate custom habit packs and challenges perfectly tailored to their organization&apos;s goals.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">✨ Improvements</h3>
              <ul className="space-y-2 text-sm text-slate-600 font-medium list-disc pl-5">
                <li>Completely redesigned invite links for a premium onboarding experience.</li>
                <li>Added shimmering skeleton loaders for better perceived performance.</li>
                <li>Improved screen-reader accessibility across the entire dashboard.</li>
                <li>Added a built-in Beta Feedback tool (you&apos;re using it!).</li>
              </ul>
            </div>

          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            Awesome, let&apos;s go!
          </button>
        </div>

      </div>
    </div>
  );
}
