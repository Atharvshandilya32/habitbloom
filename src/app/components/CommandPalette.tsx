import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Goal, Trophy, Activity, BookOpen, Settings, Users } from 'lucide-react';
import { Habit, Goal as GoalType, Challenge } from '../../../lib/habitTypes';
import { NavTab } from './charts/TitleBanner';
import { backdropVariants, modalVariants } from '../../../lib/motion/motionTokens';

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

  const lowerQuery = query.toLowerCase();

  const filteredHabits = habits.filter(h => h.name.toLowerCase().includes(lowerQuery));
  const filteredGoals = goals.filter(g => g.title.toLowerCase().includes(lowerQuery));
  const filteredChallenges = challenges.filter(c => c.title.toLowerCase().includes(lowerQuery));

  const navActions = [
    { label: 'Daily Focus', tab: 'focus', icon: Activity },
    { label: 'Social Network & Friends', tab: 'social', icon: Users },
    { label: 'Dashboard Grid', tab: 'dashboard', icon: Activity },
    { label: 'Goals', tab: 'goals', icon: Goal },
    { label: 'Challenges', tab: 'challenges', icon: Trophy },
    { label: 'Timeline & Journal', tab: 'timeline', icon: BookOpen },
    { label: 'Settings', tab: 'settings', icon: Settings },
  ].filter(action => action.label.toLowerCase().includes(lowerQuery));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
          <motion.div 
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 z-10"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <Search size={20} className="text-slate-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-lg font-bold"
                placeholder="Search habits, goals, or commands..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">ESC</div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query === '' && navActions.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</h3>
                  {navActions.map(action => (
                    <button
                      key={action.tab}
                      className="w-full flex items-center px-3 py-2.5 text-left text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl transition-colors font-bold"
                      onClick={() => {
                        onNavigate(action.tab as NavTab);
                        onClose();
                      }}
                    >
                      <action.icon size={16} className="mr-3 opacity-70" />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredHabits.length > 0 && (
                <div className="mb-2">
                  <h3 className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Habits</h3>
                  {filteredHabits.map(habit => (
                    <button
                      key={habit.id}
                      className="w-full flex items-center px-3 py-2 text-left text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-bold"
                      onClick={() => {
                        onNavigate('focus');
                        onClose();
                      }}
                    >
                      <span className="mr-3 text-lg">{habit.emoji}</span>
                      <span>{habit.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredGoals.length > 0 && (
                <div className="mb-2">
                  <h3 className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Goals</h3>
                  {filteredGoals.map(goal => (
                    <button
                      key={goal.id}
                      className="w-full flex items-center px-3 py-2 text-left text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-bold"
                      onClick={() => {
                        onNavigate('goals');
                        onClose();
                      }}
                    >
                      <Goal size={16} className="mr-3 text-slate-400" />
                      <span>{goal.title}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {query !== '' && filteredHabits.length === 0 && filteredGoals.length === 0 && filteredChallenges.length === 0 && navActions.length === 0 && (
                <div className="py-8 text-center text-slate-500 font-bold text-sm">
                  No results found for &quot;{query}&quot;
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

