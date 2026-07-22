'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogOut, BookOpen, User, LayoutDashboard, Calendar, BarChart2, Award } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  user: FirebaseUser | null;
  onOpenGuide: () => void;
  onScrollToProfile: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export default function Navbar({ user, onOpenGuide, onScrollToProfile, onScrollToSection }: NavbarProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'statistics' | 'achievements' | 'profile'>('dashboard');

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

  const handleNavClick = (tab: 'dashboard' | 'calendar' | 'statistics' | 'achievements' | 'profile') => {
    setActiveTab(tab);
    setMobileOpen(false);
    if (tab === 'profile' || tab === 'achievements') {
      onScrollToProfile();
    } else if (onScrollToSection) {
      onScrollToSection(tab);
    }
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
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-base leading-none">🌱</span>
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            Habit<span className="text-emerald-600">Bloom</span>
          </span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard size={13} />
            Dashboard
          </button>
          <button
            onClick={() => handleNavClick('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'calendar' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={13} />
            Calendar
          </button>
          <button
            onClick={() => handleNavClick('statistics')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'statistics' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 size={13} />
            Statistics
          </button>
          <button
            onClick={() => handleNavClick('achievements')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'achievements' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award size={13} />
            Achievements
          </button>
          <button
            onClick={() => handleNavClick('profile')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'profile' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User size={13} />
            Profile
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
          >
            <BookOpen size={13} className="text-emerald-600" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={onScrollToProfile}
                className="flex items-center gap-2 group"
                title="View profile"
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
        </div>
      </div>
    </nav>
  );
}
