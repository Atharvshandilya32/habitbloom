'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LogOut, BookOpen, Menu, X, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  user: FirebaseUser | null;
  onOpenGuide: () => void;
  onScrollToProfile: () => void;
}

export default function Navbar({ user, onOpenGuide, onScrollToProfile }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

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

  const initials = user
    ? (user.displayName || user.email || '?')
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-base leading-none">🌱</span>
          </div>
          <span className="text-base font-bold text-slate-800 tracking-tight">
            Habit<span className="text-emerald-500">Bloom</span>
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          <NavBtn
            icon={<BookOpen size={14} />}
            label="Guide"
            onClick={onOpenGuide}
          />
          <NavBtn
            icon={<User size={14} />}
            label="Profile"
            onClick={onScrollToProfile}
          />
        </div>

        {/* User avatar + logout */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 ml-2">
            {/* Avatar */}
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-emerald-200 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-2 border-emerald-200">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
            )}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Log out"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          <MobileNavBtn icon={<BookOpen size={15} />} label="Guide" onClick={() => { onOpenGuide(); setMobileOpen(false); }} />
          <MobileNavBtn icon={<User size={15} />} label="Profile" onClick={() => { onScrollToProfile(); setMobileOpen(false); }} />
          {user && (
            <MobileNavBtn
              icon={<LogOut size={15} />}
              label={signingOut ? 'Signing out…' : 'Logout'}
              onClick={handleLogout}
              danger
            />
          )}
        </div>
      )}
    </nav>
  );
}

function NavBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavBtn({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
