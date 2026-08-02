'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, Flame, Trophy, Award, Copy, Check } from 'lucide-react';
import { UserSocialProfile } from '../../../../lib/socialTypes';
import { formatHbId } from '../../../../lib/identityUtils';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserSocialProfile | null;
  onShowToast: (msg: string) => void;
}

export default function ShareCardModal({
  isOpen,
  onClose,
  profile,
  onShowToast,
}: ShareCardModalProps) {
  const [theme, setTheme] = useState<'emerald' | 'cyber' | 'sunset' | 'midnight'>('emerald');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !profile) return null;

  const getThemeStyles = () => {
    switch (theme) {
      case 'cyber':
        return 'from-purple-900 via-indigo-900 to-slate-950 text-white border-purple-500/30';
      case 'sunset':
        return 'from-rose-600 via-amber-600 to-orange-700 text-white border-orange-500/30';
      case 'midnight':
        return 'from-slate-900 via-slate-950 to-black text-white border-slate-700/30';
      case 'emerald':
      default:
        return 'from-emerald-700 via-teal-800 to-slate-900 text-white border-emerald-500/30';
    }
  };

  const handleCopyText = () => {
    const text = `🌱 I am on a ${profile.currentStreak || 0}-day habit streak on HabitBloom! Level ${profile.level || 1} ${profile.levelTitle || ''}. Add my HabitBloom ID: ${formatHbId(profile.hbId)} #HabitBloom`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Share text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!cardRef.current) return;

    // Standard HTML Canvas capture fallback
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    if (theme === 'cyber') {
      gradient.addColorStop(0, '#3b0764');
      gradient.addColorStop(1, '#09090b');
    } else if (theme === 'sunset') {
      gradient.addColorStop(0, '#e11d48');
      gradient.addColorStop(1, '#c2410c');
    } else if (theme === 'midnight') {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#020617');
    } else {
      gradient.addColorStop(0, '#047857');
      gradient.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Draw branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('🌱 HabitBloom Social Pass', 40, 50);

    // Draw HabitBloom ID
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`ID: ${formatHbId(profile.hbId)}`, 40, 85);

    // User Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'extrabold 32px sans-serif';
    ctx.fillText(profile.displayName, 40, 150);

    // Level Title
    ctx.fillStyle = '#fde047';
    ctx.font = 'semibold 18px sans-serif';
    ctx.fillText(profile.levelTitle || `Level ${profile.level || 1}`, 40, 180);

    // Stats Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(40, 210, 520, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`🔥 ${profile.currentStreak || 0}d`, 60, 270);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px sans-serif';
    ctx.fillText('Active Streak', 60, 295);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`⭐ ${profile.totalXP || 0}`, 230, 270);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px sans-serif';
    ctx.fillText('Total XP', 230, 295);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`🏆 ${profile.badges?.length || 0}`, 400, 270);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px sans-serif';
    ctx.fillText('Badges', 400, 295);

    const link = document.createElement('a');
    link.download = `HabitBloom_Pass_${profile.hbId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    onShowToast('Share card generated & downloaded!');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Social Achievement Card
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Card Preview Container */}
          <div className="p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50">
            <div
              ref={cardRef}
              className={`w-full aspect-[16/10] rounded-3xl p-6 bg-gradient-to-br ${getThemeStyles()} border shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300`}
            >
              {/* Decorative Blur Circles */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              {/* Top Row */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  <span className="font-extrabold text-sm tracking-tight">HabitBloom Pass</span>
                </div>
                <span className="font-mono font-bold text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                  {formatHbId(profile.hbId)}
                </span>
              </div>

              {/* Middle Row */}
              <div className="my-2 z-10">
                <h3 className="text-2xl font-black">{profile.displayName}</h3>
                <p className="text-xs font-medium text-amber-300 mt-0.5">
                  {profile.levelTitle || `Level ${profile.level || 1}`}
                </p>
              </div>

              {/* Bottom Stats Grid */}
              <div className="grid grid-cols-3 gap-2 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/10 z-10">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-amber-300 font-bold">
                    <Flame size={13} /> Streak
                  </div>
                  <div className="text-lg font-black">{profile.currentStreak || 0}d</div>
                </div>
                <div className="text-center border-x border-white/10">
                  <div className="flex items-center justify-center gap-1 text-xs text-emerald-300 font-bold">
                    <Award size={13} /> XP
                  </div>
                  <div className="text-lg font-black">{profile.totalXP || 0}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-indigo-300 font-bold">
                    <Trophy size={13} /> Badges
                  </div>
                  <div className="text-lg font-black">{profile.badges?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Theme:</span>
              {[
                { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-600' },
                { id: 'cyber', label: 'Cyber', bg: 'bg-purple-600' },
                { id: 'sunset', label: 'Sunset', bg: 'bg-orange-600' },
                { id: 'midnight', label: 'Midnight', bg: 'bg-slate-900' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as 'emerald' | 'cyber' | 'sunset' | 'midnight')}
                  className={`w-6 h-6 rounded-full ${t.bg} border-2 transition-transform ${
                    theme === t.id ? 'scale-125 border-white ring-2 ring-emerald-500' : 'border-transparent opacity-80'
                  }`}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <button
              onClick={handleCopyText}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Share Text'}
            </button>

            <button
              onClick={handleDownloadImage}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Download size={15} /> Download PNG
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
