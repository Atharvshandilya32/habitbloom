'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Users, Calendar, CheckCircle2, X } from 'lucide-react';
import { SocialChallenge, UserSocialProfile, ChallengeType, ChallengeMode } from '../../../../lib/socialTypes';

interface ChallengesHubProps {
  challenges: SocialChallenge[];
  currentUserProfile: UserSocialProfile | null;
  onCreateChallenge: (challenge: Omit<SocialChallenge, 'id' | 'createdAt'>) => void;
  onJoinChallenge: (challengeId: string) => void;
}

export default function ChallengesHub({
  challenges,
  currentUserProfile,
  onCreateChallenge,
  onJoinChallenge,
}: ChallengesHubProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type] = useState<ChallengeType>('weekly');
  const [mode, setMode] = useState<ChallengeMode>('friends_only');
  const [targetDays, setTargetDays] = useState(7);
  const [emoji] = useState('🔥');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUserProfile) return;

    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + targetDays * 86400000).toISOString();

    const newChallenge: Omit<SocialChallenge, 'id' | 'createdAt'> = {
      title,
      description: description || 'Complete your daily target habits together!',
      emoji,
      creatorUid: currentUserProfile.uid,
      creatorName: currentUserProfile.displayName,
      type,
      mode,
      targetDays,
      minCompletionPerDay: 1,
      requiredStreak: targetDays,
      startDate,
      endDate,
      participants: {
        [currentUserProfile.uid]: {
          uid: currentUserProfile.uid,
          displayName: currentUserProfile.displayName,
          photoURL: currentUserProfile.photoURL,
          progress: 0,
          completedDays: 0,
          currentStreak: currentUserProfile.currentStreak || 0,
          joinedAt: startDate,
        },
      },
      status: 'active',
    };

    onCreateChallenge(newChallenge);
    setCreateModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="text-amber-500" size={18} /> Social & Team Challenges
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compete, collaborate, and maintain consistency with friends or the community
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} /> Create Challenge
        </button>
      </div>

      {/* Challenge Cards Grid */}
      {challenges.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
          <Trophy className="mx-auto text-slate-300 dark:text-slate-700" size={36} />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active challenges</p>
          <p className="text-xs text-slate-500">Create a new 7-day habit challenge or invite your friends!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((c) => {
            const isParticipant = currentUserProfile && c.participants && c.participants[currentUserProfile.uid];
            const participantCount = Object.keys(c.participants || {}).length;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 uppercase tracking-wider">
                      {c.type} • {c.mode.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {c.description}
                  </p>

                  {/* Challenge details badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-600" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{c.targetDays} Days</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Users size={14} className="text-indigo-600" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{participantCount} Joined</span>
                    </div>
                  </div>

                  {/* Participants Avatar Stack */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400">Created by {c.creatorName}</span>
                    <div className="flex -space-x-2">
                      {Object.values(c.participants || {}).slice(0, 4).map((p) => (
                        <div
                          key={p.uid}
                          className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-slate-900"
                          title={p.displayName}
                        >
                          {p.displayName.slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Join / Active Status Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {isParticipant ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={16} /> Challenge Active
                    </div>
                  ) : (
                    <button
                      onClick={() => onJoinChallenge(c.id)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      Join Challenge
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Challenge Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" /> Create Habit Challenge
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Challenge Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 7-Day Morning Meditation Duel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Rules and motivation..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Duration
                    </label>
                    <select
                      value={targetDays}
                      onChange={(e) => setTargetDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value={3}>3 Days</option>
                      <option value={7}>7 Days (1 Week)</option>
                      <option value={14}>14 Days (2 Weeks)</option>
                      <option value={30}>30 Days (1 Month)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mode
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as ChallengeMode)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="friends_only">Friends Only</option>
                      <option value="public">Public</option>
                      <option value="invite_only">Invite Only</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all mt-2"
                >
                  Publish Challenge
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
