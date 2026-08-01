import React, { useState, useEffect, useRef } from 'react';
import { Search, Goal, Trophy, Activity, BookOpen, Settings } from 'lucide-react';
import { Habit, Goal as GoalType, Challenge } from '../../../lib/habitTypes';
import { NavTab } from './charts/TitleBanner';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  goals: GoalType[];
  challenges: Challenge[];
  onNavigate: (tab: NavTab) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  habits,
  goals,
  challenges,
  onNavigate
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lowerQuery = query.toLowerCase();

  const filteredHabits = habits.filter(h => h.name.toLowerCase().includes(lowerQuery));
  const filteredGoals = goals.filter(g => g.title.toLowerCase().includes(lowerQuery));
  const filteredChallenges = challenges.filter(c => c.title.toLowerCase().includes(lowerQuery));

  const navActions = [
    { label: 'Daily Focus', tab: 'focus', icon: Activity },
    { label: 'Dashboard Grid', tab: 'dashboard', icon: Activity },
    { label: 'Goals', tab: 'goals', icon: Goal },
    { label: 'Challenges', tab: 'challenges', icon: Trophy },
    { label: 'Timeline & Journal', tab: 'timeline', icon: BookOpen },
    { label: 'Settings', tab: 'settings', icon: Settings },
  ].filter(action => action.label.toLowerCase().includes(lowerQuery));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 backdrop-blur-sm bg-slate-900/40">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search size={20} className="text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-lg font-medium"
            placeholder="Search habits, goals, or commands..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">ESC</div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query === '' && navActions.length > 0 && (
            <div className="mb-4">
              <h3 className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</h3>
              {navActions.map(action => (
                <button
                  key={action.tab}
                  className="w-full flex items-center px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                  onClick={() => {
                    onNavigate(action.tab as NavTab);
                    onClose();
                  }}
                >
                  <action.icon size={16} className="mr-3 opacity-70" />
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {filteredHabits.length > 0 && (
            <div className="mb-2">
              <h3 className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Habits</h3>
              {filteredHabits.map(habit => (
                <button
                  key={habit.id}
                  className="w-full flex items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  onClick={() => {
                    onNavigate('focus');
                    onClose();
                  }}
                >
                  <span className="mr-3 text-lg">{habit.emoji}</span>
                  <span className="font-medium">{habit.name}</span>
                </button>
              ))}
            </div>
          )}

          {filteredGoals.length > 0 && (
            <div className="mb-2">
              <h3 className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Goals</h3>
              {filteredGoals.map(goal => (
                <button
                  key={goal.id}
                  className="w-full flex items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  onClick={() => {
                    onNavigate('goals');
                    onClose();
                  }}
                >
                  <Goal size={16} className="mr-3 text-slate-400" />
                  <span className="font-medium">{goal.title}</span>
                </button>
              ))}
            </div>
          )}
          
          {query !== '' && filteredHabits.length === 0 && filteredGoals.length === 0 && filteredChallenges.length === 0 && navActions.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
