'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Heart, Flame, PartyPopper, HandMetal, Clock } from 'lucide-react';
import { ActivityFeedItem, UserSocialProfile, ReactionType } from '../../../../lib/socialTypes';
import { toggleActivityReaction } from '../../../../lib/socialUtils';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  items: ActivityFeedItem[];
  currentUserProfile: UserSocialProfile | null;
  onOpenProfile: (authorUid: string) => void;
}

export default function ActivityFeed({ items, currentUserProfile, onOpenProfile }: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'milestones'>('all');

  const filteredItems = items.filter((item) => {
    if (filter === 'milestones') {
      return item.type === 'streak_milestone' || item.type === 'badge_unlocked' || item.type === 'challenge_won';
    }
    return true;
  });

  const handleReaction = async (activityId: string, type: ReactionType) => {
    if (!currentUserProfile) return;
    await toggleActivityReaction(activityId, currentUserProfile, type);
  };

  return (
    <div className="space-y-4">
      {/* Feed Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-emerald-500" size={16} /> Social Timeline
        </h3>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilter('milestones')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'milestones'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏆 Milestones
          </button>
        </div>
      </div>

      {/* Feed List */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
          <MessageSquare className="mx-auto text-slate-300 dark:text-slate-700" size={32} />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No activity logged yet</p>
          <p className="text-xs text-slate-500">
            Complete your habits or connect with friends to see social celebrations here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredItems.map((item) => {
              const reactionsMap = item.reactions || {};
              const reactionsList = Object.values(reactionsMap);
              const celebrateCount = reactionsList.filter((r) => r.type === 'celebrate').length;
              const fireCount = reactionsList.filter((r) => r.type === 'fire').length;
              const clapCount = reactionsList.filter((r) => r.type === 'clap').length;
              const heartCount = reactionsList.filter((r) => r.type === 'heart').length;

              const myReaction = currentUserProfile ? reactionsMap[currentUserProfile.uid]?.type : null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onOpenProfile(item.authorUid)}
                      className="flex-shrink-0 group"
                    >
                      {item.authorPhotoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.authorPhotoURL}
                          alt={item.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-500/30 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
                          {item.authorName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenProfile(item.authorUid)}
                            className="text-xs font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors"
                          >
                            {item.authorName}
                          </button>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.authorHbId}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={11} />
                          {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : 'Just now'}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-lg">{item.icon || '⭐'}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Micro-Reaction Bar */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                        <button
                          onClick={() => handleReaction(item.id, 'celebrate')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                            myReaction === 'celebrate'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <PartyPopper size={13} className="text-amber-500" />
                          <span>{celebrateCount > 0 ? celebrateCount : ''} Celebrate</span>
                        </button>

                        <button
                          onClick={() => handleReaction(item.id, 'fire')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                            myReaction === 'fire'
                              ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Flame size={13} className="text-orange-500" />
                          <span>{fireCount > 0 ? fireCount : ''} Fire</span>
                        </button>

                        <button
                          onClick={() => handleReaction(item.id, 'clap')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                            myReaction === 'clap'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <HandMetal size={13} className="text-emerald-500" />
                          <span>{clapCount > 0 ? clapCount : ''} Clap</span>
                        </button>

                        <button
                          onClick={() => handleReaction(item.id, 'heart')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                            myReaction === 'heart'
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Heart size={13} className="text-rose-500" />
                          <span>{heartCount > 0 ? heartCount : ''} Heart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
