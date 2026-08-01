'use client';

import React, { useState } from 'react';
import { Search, Compass, Building2, GraduationCap, Dumbbell, Star, ChevronRight, Lock } from 'lucide-react';
import { Space } from '../../../../../lib/spaceTypes';

interface SpacesDirectoryProps {
  onJoinDemo: () => void;
  onJoinSpace: (spaceId: string) => void;
  onCreateSpace: () => void;
}

const DEMO_SPACE: Space = {
  id: 'demo-space',
  name: 'HabitBloom Demo Organization',
  description: 'Explore a thriving community. Join this read-only space to see how challenges, templates, and analytics work at scale.',
  type: 'company',
  createdAt: new Date().toISOString(),
  createdBy: 'system',
  branding: {
    themeColor: 'indigo-600',
    welcomeMessage: 'Welcome to the HabitBloom Demo! Feel free to click around.'
  },
  features: {
    analytics: true,
    aiReports: true,
    advancedChallenges: true
  }
};

const CATEGORIES = [
  { id: 'all', label: 'All Spaces', icon: Compass },
  { id: 'fitness', label: 'Fitness & Health', icon: Dumbbell },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'corporate', label: 'Corporate', icon: Building2 }
];

export default function SpacesDirectory({ onJoinDemo, onCreateSpace }: SpacesDirectoryProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-12">
      
      {/* Header */}
      <div className="text-center py-12 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 px-6">
          <h1 className="text-4xl font-black text-white mb-4">Discover Spaces</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto font-medium mb-8">
            Find your community, join a challenge, and build consistency together. Or create your own Space for your organization.
          </p>
          
          <div className="max-w-xl mx-auto relative flex items-center">
            <Search className="absolute left-4 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name, category, or invite code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 font-medium text-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <cat.icon size={16} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <h4 className="font-bold text-indigo-900 mb-2">Can&apos;t find your group?</h4>
            <p className="text-xs text-indigo-700/80 mb-4">
              Spaces can be hidden by admins. Ask your organizer for a direct invite link.
            </p>
            <button 
              onClick={onCreateSpace}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              Create New Space
            </button>
          </div>
        </div>

        {/* Directory List */}
        <div className="md:col-span-3 space-y-4">
          <h3 className="font-bold text-slate-800 text-xl mb-4 flex items-center gap-2">
            <Star size={20} className="text-amber-500 fill-amber-500" />
            Featured
          </h3>

          {/* Demo Space Card */}
          <div className="bg-white rounded-3xl border-2 border-indigo-100 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">Official Demo</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">1,245 Members</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">{DEMO_SPACE.name}</h4>
                </div>
              </div>
              <button 
                onClick={onJoinDemo}
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                Explore Demo <ChevronRight size={16} />
              </button>
            </div>
            
            <p className="text-slate-500 font-medium max-w-2xl">
              {DEMO_SPACE.description}
            </p>
          </div>

          {/* Private Spaces Notice */}
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full mx-auto flex items-center justify-center mb-4">
              <Lock size={24} />
            </div>
            <h4 className="font-bold text-slate-700 mb-2">Most Spaces are Private</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              HabitBloom is primarily used by private organizations. To join a private space, you will need a direct invite link from the admin.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
