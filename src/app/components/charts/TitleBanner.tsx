'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import {
  LogOut,
  BookOpen,
  LayoutDashboard,
  Award,
  Menu,
  X,
  Settings,
  Activity,
  Target,
  Trophy,
  Clock,
  Search,
  Users,
  CreditCard,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export type NavTab = 'focus' | 'dashboard' | 'analytics' | 'records' | 'goals' | 'challenges' | 'timeline' | 'settings' | 'spaces' | 'social';

interface NavbarProps {
  user: FirebaseUser | null;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenGuide: () => void;
  onOpenSearch?: () => void;
  onOpenIdentityModal?: () => void;
}

export default function Navbar({ user, activeTab, onTabChange, onOpenGuide, onOpenSearch, onOpenIdentityModal }: NavbarProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setSigningOut(false);
    }
  };

  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  const initials = user
    ? (user.displayName || user.email || '?')
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('focus')}
          className="flex items-center gap-2 flex-shrink-0 group text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-base leading-none">🌱</span>
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            Habit<span className="text-emerald-600">Bloom</span>
            <span className="ml-1.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">v2.0</span>
          </span>
        </button>

        {/* Center Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto hide-scrollbar">
          {[
            { id: 'focus' as NavTab, label: 'Daily Focus', icon: Activity },
            { id: 'goals' as NavTab, label: 'Goals', icon: Target },
            { id: 'challenges' as NavTab, label: 'Challenges', icon: Trophy },
            { id: 'timeline' as NavTab, label: 'Timeline', icon: Clock },
            { id: 'dashboard' as NavTab, label: 'Grid', icon: LayoutDashboard },
            { id: 'analytics' as NavTab, label: 'Analytics', icon: Activity },
          ].map((tabItem) => {
            const IconComponent = tabItem.icon;
            const isActive = activeTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                onClick={() => handleNavClick(tabItem.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <IconComponent size={13} />
                  {tabItem.label}
                </span>
              </button>
            );
          })}
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          <button
            onClick={() => handleNavClick('social')}
            className={`relative flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'social' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {activeTab === 'social' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/80 rounded-lg shadow-sm border border-emerald-200/50"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Users size={13} className="text-emerald-600" />
              Social Network
            </span>
          </button>
          <button
            onClick={() => handleNavClick('spaces')}
            className={`relative flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'spaces' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {activeTab === 'spaces' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/80 rounded-lg shadow-sm border border-indigo-200/50"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Users size={13} />
              Spaces
            </span>
          </button>
        </div>


        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
              title="Search / Command Palette (/)"
            >
              <Search size={13} className="text-emerald-600" />
              <span className="hidden sm:inline text-slate-400 font-medium">/</span >
            </button>
          )}

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
          >
            <BookOpen size={13} className="text-emerald-600" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {user && onOpenIdentityModal && (
            <button
              onClick={onOpenIdentityModal}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-1.5 text-xs font-bold hover:bg-indigo-100 transition-all shadow-sm"
              title="Universal HabitBloom ID Pass"
            >
              <CreditCard size={13} className="text-indigo-600" />
              <span className="hidden sm:inline">ID Pass</span>
            </button>
          )}

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => handleNavClick('settings')}
                className="flex items-center gap-2 group"
                title="View settings & profile"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-emerald-300 object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-2 border-emerald-300 shadow-sm group-hover:scale-105 transition-transform">
                    <span className="text-white text-xs font-black">{initials}</span>
                  </div>
                )}
              </button>

              <button
                onClick={handleLogout}
                disabled={signingOut}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all disabled:opacity-50"
                title="Log out"
              >
                <LogOut size={13} />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 space-y-1 shadow-lg h-80 overflow-y-auto">
          <button
            onClick={() => handleNavClick('focus')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'focus' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity size={15} />
            Daily Focus
          </button>
          <button
            onClick={() => handleNavClick('social')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'social' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users size={15} className="text-emerald-600" />
            Social Network
          </button>
          <button
            onClick={() => handleNavClick('goals')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'goals' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Target size={15} />
            Goals
          </button>
          <button
            onClick={() => handleNavClick('challenges')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'challenges' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Trophy size={15} />
            Challenges
          </button>
          <button
            onClick={() => handleNavClick('timeline')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'timeline' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock size={15} />
            Timeline
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={15} />
            Dashboard Grid
          </button>
          <button
            onClick={() => handleNavClick('analytics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'analytics' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity size={15} />
            Analytics
          </button>
          <button
            onClick={() => handleNavClick('records')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'records' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Award size={15} />
            Personal Records
          </button>
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Settings size={15} />
            Settings
          </button>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => { setMobileOpen(false); onOpenGuide(); }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
            >
              <BookOpen size={14} className="text-emerald-600" />
              User Guide
            </button>
            {user && (
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                disabled={signingOut}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all disabled:opacity-50"
              >
                <LogOut size={14} />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
