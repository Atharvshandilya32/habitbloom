import React from 'react';
import { Rocket, Target, Users, Sparkles, X } from 'lucide-react';

interface WelcomeSpacesProps {
  onClose: () => void;
  onBrowseSpaces: () => void;
  onCreateSpace: () => void;
}

export default function WelcomeSpaces({ onClose, onBrowseSpaces, onCreateSpace }: WelcomeSpacesProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white text-slate-500 hover:text-slate-800 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header Hero Area */}
        <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center text-white mb-6 border border-white/30 shadow-xl">
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
              Welcome to HabitBloom Spaces
            </h1>
            <p className="text-indigo-100 text-lg max-w-md mx-auto font-medium">
              Achieve more, together. Connect with your community to track shared habits and crush collective goals.
            </p>
          </div>
        </div>

        {/* Features Content */}
        <div className="px-8 py-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-indigo-100">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Find Your Tribe</h3>
              <p className="text-sm text-slate-500">Join your gym, school, or company to track habits together.</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-amber-100">
                <Target size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Shared Templates</h3>
              <p className="text-sm text-slate-500">1-click install powerful habit packs curated by community leaders.</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-emerald-100">
                <Rocket size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Epic Challenges</h3>
              <p className="text-sm text-slate-500">Compete in time-bound challenges to build unshakeable consistency.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onBrowseSpaces}
              className="flex-1 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Browse Spaces
            </button>
            <button 
              onClick={onCreateSpace}
              className="flex-1 px-6 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-2xl transition-colors"
            >
              Create a Space
            </button>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-xs text-slate-400 font-medium">
              Your personal tracking remains 100% private. Spaces are just an optional collaboration layer.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
