'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Trophy, Award, Shield, Swords, UserMinus, Ban, Sparkles } from 'lucide-react';
import { UserSocialProfile } from '../../../../lib/socialTypes';
import { formatHbId } from '../../../../lib/identityUtils';
import { removeFriend, blockUser } from '../../../../lib/socialUtils';

interface FriendProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserSocialProfile | null;
  currentUid: string;
  isFriend: boolean;
  onOpenChallengeModal?: (targetUser: UserSocialProfile) => void;
  onOpenShareCard?: (profile: UserSocialProfile) => void;
  onShowToast: (msg: string) => void;
  onRefreshData?: () => void;
}

export default function FriendProfileModal({
  isOpen,
  onClose,
  profile,
  currentUid,
  isFriend,
  onOpenChallengeModal,
  onOpenShareCard,
  onShowToast,
  onRefreshData,
}: FriendProfileModalProps) {
  if (!isOpen || !profile) return null;

  const isOwner = currentUid === profile.uid;
  const canViewStats = isOwner || profile.privacy?.profileVisibility === 'public' || (profile.privacy?.profileVisibility === 'friends' && isFriend);

  const handleRemoveFriend = async () => {
    if (!confirm(`Are you sure you want to remove ${profile.displayName} from your friends?`)) return;
    const ok = await removeFriend(currentUid, profile.uid);
    if (ok) {
      onShowToast(`Removed ${profile.displayName} from friends.`);
      if (onRefreshData) onRefreshData();
      onClose();
    }
  };

  const handleBlockUser = async () => {
    if (!confirm(`Block ${profile.displayName}? They won't be able to search or request you.`)) return;
    const ok = await blockUser(currentUid, profile.uid);
    if (ok) {
      onShowToast(`Blocked ${profile.displayName}.`);
      if (onRefreshData) onRefreshData();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
        >
          {/* Top Banner Gradient */}
          <div className="h-32 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 relative p-4 flex items-start justify-between">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-mono font-bold tracking-wider">
              {formatHbId(profile.hbId)}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Profile Header Card */}
          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex justify-between items-end -mt-14 mb-4">
              <div className="relative">
                {profile.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center text-white text-3xl font-black">
                    {profile.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Online Indicator */}
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ${
                    profile.status === 'online'
                      ? 'bg-emerald-500'
                      : profile.status === 'away'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                  title={`Status: ${profile.status}`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {onOpenShareCard && (
                  <button
                    onClick={() => onOpenShareCard(profile)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Sparkles size={14} className="text-amber-500" /> Share Card
                  </button>
                )}

                {!isOwner && isFriend && onOpenChallengeModal && (
                  <button
                    onClick={() => onOpenChallengeModal(profile)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Swords size={14} /> Challenge
                  </button>
                )}
              </div>
            </div>

            {/* Name & Bio */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {profile.displayName}
                </h2>
                <span className="text-xs text-slate-400 font-medium">@{profile.username}</span>
              </div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {profile.levelTitle || 'Habit Bloom Explorer'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                {profile.bio || 'Building better habits with HabitBloom.'}
              </p>
            </div>

            {/* Privacy Shield Notice if stats hidden */}
            {!canViewStats ? (
              <div className="mt-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                <Shield className="mx-auto text-slate-400" size={28} />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Private Profile
                </h4>
                <p className="text-xs text-slate-500">
                  {profile.displayName} has restricted their streak and habit stats to friends only.
                </p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs">
                      <Flame size={14} /> Current Streak
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {profile.currentStreak || 0} <span className="text-xs font-semibold">days</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <Trophy size={14} /> Longest Streak
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {profile.longestStreak || 0} <span className="text-xs font-semibold">days</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                      <Award size={14} /> Total XP
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {profile.totalXP || 0} <span className="text-xs font-semibold">XP</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Award size={14} className="text-amber-500" /> Unlocked Badges ({profile.badges?.length || 0})
                  </h4>

                  {!profile.badges || profile.badges.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No badges unlocked yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {profile.badges.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                        >
                          <span className="text-xl">{b.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{b.title}</p>
                            <p className="text-[10px] text-slate-500 truncate">{b.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Remove / Block Actions for non-owner friends */}
            {!isOwner && isFriend && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 text-xs">
                <button
                  onClick={handleRemoveFriend}
                  className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserMinus size={14} /> Remove Friend
                </button>
                <button
                  onClick={handleBlockUser}
                  className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Ban size={14} /> Block
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
