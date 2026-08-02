'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, X, Check, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { UserSocialProfile, FriendRequest } from '../../../../lib/socialTypes';
import { formatHbId } from '../../../../lib/identityUtils';
import { searchUsers as searchSocialUsers, sendFriendRequest as sendSocialRequest } from '../../../../lib/socialUtils';

interface FriendSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserSocialProfile | null;
  existingFriends: UserSocialProfile[];
  sentRequests: FriendRequest[];
  onShowToast: (msg: string) => void;
}

export default function FriendSearchModal({
  isOpen,
  onClose,
  currentUserProfile,
  existingFriends,
  sentRequests,
  onShowToast,
}: FriendSearchModalProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<UserSocialProfile[]>([]);
  const [requestSentState, setRequestSentState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (!currentUserProfile) return;
      setIsSearching(true);
      const res = await searchSocialUsers(query, currentUserProfile.uid);
      setResults(res);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentUserProfile]);

  if (!isOpen) return null;

  const handleSendRequest = async (targetUser: UserSocialProfile) => {
    if (!currentUserProfile) return;
    setRequestSentState((prev) => ({ ...prev, [targetUser.uid]: true }));

    const res = await sendSocialRequest(currentUserProfile, targetUser);
    onShowToast(res.message);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Find & Connect Friends
                </h2>
                <p className="text-xs text-slate-500">
                  Search by Universal HabitBloom ID (<span className="font-mono font-semibold text-emerald-600">HB-XXXX-XXXX-XX</span>), username, or display name
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. HB-8F4A92 or rahul_dev..."
                autoFocus
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {isSearching && (
                <div className="absolute right-4 top-3.5 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {!query.trim() && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Sparkles className="mx-auto text-emerald-500/50" size={32} />
                <p className="text-sm font-semibold">Enter a HabitBloom ID or username to discover users</p>
                <p className="text-xs text-slate-500">Every user has a unique 10-digit HabitBloom ID.</p>
              </div>
            )}

            {query.trim() && !isSearching && results.length === 0 && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShieldAlert className="mx-auto text-slate-300 dark:text-slate-700" size={32} />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No user found matching &quot;{query}&quot;</p>
                <p className="text-xs">Check for typos in the HabitBloom ID or username.</p>
              </div>
            )}

            {results.map((user) => {
              const isAlreadyFriend = existingFriends.some((f) => f.uid === user.uid);
              const isRequestPending = sentRequests.some((r) => r.receiverUid === user.uid && r.status === 'pending') || requestSentState[user.uid];

              return (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-11 h-11 rounded-full object-cover border border-emerald-500/30"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {user.displayName}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          {formatHbId(user.hbId)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>@{user.username}</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          🔥 {user.currentStreak || 0}d streak
                        </span>
                        <span>•</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          Lvl {user.level || 1}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    {isAlreadyFriend ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                        <UserCheck size={14} /> Friends
                      </span>
                    ) : isRequestPending ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-200 dark:border-amber-800">
                        <Check size={14} /> Request Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                      >
                        <UserPlus size={14} /> Add Friend
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
