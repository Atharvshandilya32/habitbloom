'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Flame,
  Trophy,
  Activity,
  Bot,
  Bell,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  UserSocialProfile,
  FriendRequest,
  ActivityFeedItem,
  UserNotification,
  SocialChallenge,
  AiChallengeRecommendation,
} from '../../../../lib/socialTypes';
import {
  ensureSocialProfile,
  publishActivityItem,
} from '../../../../lib/socialUtils';
import { generateAiChallengeRecommendations } from '../../../../lib/socialAiUtils';
import { formatHbId } from '../../../../lib/identityUtils';
import FriendSearchModal from './FriendSearchModal';
import FriendProfileModal from './FriendProfileModal';
import ActivityFeed from './ActivityFeed';
import NotificationCenter from './NotificationCenter';
import ShareCardModal from './ShareCardModal';
import LeaderboardView from './LeaderboardView';
import ChallengesHub from './ChallengesHub';
import AiCoachWidget from './AiCoachWidget';
import { Habit, HabitLog } from '../../../../lib/habitTypes';
import { User } from 'firebase/auth';
import { ref, onValue, set, push } from 'firebase/database';
import { database } from '../../../../lib/firebase';

interface SocialHubViewProps {
  currentUser: User | null;
  habits: Habit[];
  logs: HabitLog;
  onShowToast: (msg: string) => void;
}

export default function SocialHubView({
  currentUser,
  habits,
  logs,
  onShowToast,
}: SocialHubViewProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'leaderboards' | 'challenges' | 'ai'>('feed');

  // Modals state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserSocialProfile | null>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);

  // Social Data State
  const [mySocialProfile, setMySocialProfile] = useState<UserSocialProfile | null>(null);
  const [friends, setFriends] = useState<UserSocialProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityFeedItem[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  const [aiRecs, setAiRecs] = useState<AiChallengeRecommendation[]>([]);

  // Calculate stats
  const completedLogCount = Object.values(logs).filter(Boolean).length;
  const currentStreak = Math.min(30, Math.floor(completedLogCount / Math.max(1, habits.length)));

  // 1. Sync User Social Profile
  useEffect(() => {
    if (!currentUser) return;
    const hbId = currentUser.uid.slice(0, 10).toUpperCase();

    ensureSocialProfile(
      currentUser.uid,
      currentUser.email,
      currentUser.displayName,
      currentUser.photoURL,
      hbId,
      logs,
      habits.length,
      currentStreak,
      currentStreak
    ).then((prof) => {
      if (prof) {
        setMySocialProfile(prof);
        const recs = generateAiChallengeRecommendations(habits, logs, friends, currentStreak);
        setAiRecs(recs);
      }
    });
  }, [currentUser, logs, habits, currentStreak, friends]);

  // 2. Real-time Firebase Listeners for Social System
  useEffect(() => {
    if (!database || !currentUser) return;

    // Realtime Friends Listener
    const friendsRef = ref(database, `friends/${currentUser.uid}`);
    const unsubFriends = onValue(friendsRef, async (snap) => {
      if (snap.exists()) {
        const friendKeys = Object.keys(snap.val());
        const friendProfiles: UserSocialProfile[] = [];

        for (const fUid of friendKeys) {
          const pSnap = await ref(database, `socialProfiles/${fUid}`);
          onValue(
            pSnap,
            (ps) => {
              if (ps.exists()) {
                friendProfiles.push(ps.val() as UserSocialProfile);
              }
            },
            { onlyOnce: true }
          );
        }
        setFriends(friendProfiles);
      } else {
        setFriends([]);
      }
    });

    // Realtime Friend Requests Listener
    const requestsRef = ref(database, 'friendRequests');
    const unsubReqs = onValue(requestsRef, (snap) => {
      if (snap.exists()) {
        const allReqs = Object.values(snap.val()) as FriendRequest[];
        setIncomingRequests(
          allReqs.filter((r) => r.receiverUid === currentUser.uid && r.status === 'pending')
        );
        setSentRequests(allReqs.filter((r) => r.senderUid === currentUser.uid));
      } else {
        setIncomingRequests([]);
        setSentRequests([]);
      }
    });

    // Realtime Activity Feed Listener
    const feedRef = ref(database, 'activityFeed');
    const unsubFeed = onValue(feedRef, (snap) => {
      if (snap.exists()) {
        const itemsMap = snap.val() as Record<string, ActivityFeedItem>;
        const list = Object.values(itemsMap).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setActivityItems(list);
      } else {
        setActivityItems([]);
      }
    });

    // Realtime Notifications Listener
    const notifRef = ref(database, `notifications/${currentUser.uid}`);
    const unsubNotifs = onValue(notifRef, (snap) => {
      if (snap.exists()) {
        const notifMap = snap.val() as Record<string, UserNotification>;
        const list = Object.values(notifMap).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(list);
      } else {
        setNotifications([]);
      }
    });

    // Realtime Challenges Listener
    const challengesRef = ref(database, 'socialChallenges');
    const unsubChallenges = onValue(challengesRef, (snap) => {
      if (snap.exists()) {
        const map = snap.val() as Record<string, SocialChallenge>;
        setChallenges(Object.values(map));
      } else {
        setChallenges([]);
      }
    });

    return () => {
      unsubFriends();
      unsubReqs();
      unsubFeed();
      unsubNotifs();
      unsubChallenges();
    };
  }, [currentUser]);

  const handleOpenProfileModal = async (uid: string) => {
    if (!database) return;
    const snap = await ref(database, `socialProfiles/${uid}`);
    onValue(
      snap,
      (ps) => {
        if (ps.exists()) {
          setSelectedProfile(ps.val() as UserSocialProfile);
          setProfileModalOpen(true);
        }
      },
      { onlyOnce: true }
    );
  };

  const handleCreateChallenge = async (challengeData: Omit<SocialChallenge, 'id' | 'createdAt'>) => {
    if (!database) return;
    const newRef = push(ref(database, 'socialChallenges'));
    const now = new Date().toISOString();
    const challenge: SocialChallenge = {
      ...challengeData,
      id: newRef.key!,
      createdAt: now,
    };

    await set(newRef, challenge);
    onShowToast(`Challenge "${challenge.title}" published!`);

    // Publish to feed
    if (mySocialProfile) {
      await publishActivityItem(
        mySocialProfile,
        'challenge_won',
        `Created Challenge: ${challenge.title}`,
        challenge.description,
        '🏆'
      );
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!database || !currentUser || !mySocialProfile) return;
    const path = `socialChallenges/${challengeId}/participants/${currentUser.uid}`;
    await set(ref(database, path), {
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'User',
      photoURL: currentUser.photoURL || null,
      progress: 0,
      completedDays: 0,
      currentStreak: currentStreak,
      joinedAt: new Date().toISOString(),
    });
    onShowToast('Joined challenge successfully!');
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length + incomingRequests.length;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              Universal ID Pass: {formatHbId(mySocialProfile?.hbId)}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
              {mySocialProfile?.levelTitle || 'Level 1'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Social Accountability Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            Connect with friends, duel in habit challenges, earn XP levels, and stay consistent together.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 z-10 w-full md:w-auto">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-white text-slate-950 hover:bg-emerald-50 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={16} className="text-emerald-600" /> Find Friends
          </button>

          <button
            onClick={() => setShareCardOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
            title="Generate Achievement Share Card"
          >
            <Sparkles size={16} className="text-amber-300" /> Share
          </button>

          <button
            onClick={() => setNotificationDrawerOpen(true)}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all relative"
            title="Notification Center"
          >
            <Bell size={18} />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-slate-800/80 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
        {[
          { id: 'feed', label: 'Timeline Feed', icon: Activity },
          { id: 'friends', label: `Friends (${friends.length})`, icon: Users },
          { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
          { id: 'challenges', label: `Challenges (${challenges.length})`, icon: Flame },
          { id: 'ai', label: 'AI Coach', icon: Bot },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as 'feed' | 'friends' | 'leaderboards' | 'challenges' | 'ai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Views */}
      {activeTab === 'feed' && (
        <ActivityFeed
          items={activityItems}
          currentUserProfile={mySocialProfile}
          onOpenProfile={handleOpenProfileModal}
        />
      )}

      {activeTab === 'friends' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="text-emerald-500" size={18} /> My Friends Network ({friends.length})
            </h3>
            <button
              onClick={() => setSearchModalOpen(true)}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <UserPlus size={14} /> Add New Friend
            </button>
          </div>

          {friends.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <UserPlus className="mx-auto text-slate-300 dark:text-slate-700" size={36} />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No friends added yet</p>
              <p className="text-xs text-slate-500">
                Search using your friend&apos;s HabitBloom ID (e.g. <span className="font-mono text-emerald-600">HB-8F4A92</span>) to connect!
              </p>
              <button
                onClick={() => setSearchModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-all inline-flex items-center gap-1.5"
              >
                <Search size={14} /> Search HabitBloom ID
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {friends.map((f) => (
                <div
                  key={f.uid}
                  onClick={() => handleOpenProfileModal(f.uid)}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5"
                >
                  <div className="relative">
                    {f.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.photoURL}
                        alt={f.displayName}
                        className="w-12 h-12 rounded-full object-cover border border-emerald-500/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                        {f.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                        f.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {f.displayName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {formatHbId(f.hbId)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold">
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <Flame size={12} /> {f.currentStreak || 0}d
                      </span>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        Lvl {f.level || 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboards' && (
        <LeaderboardView
          currentUserProfile={mySocialProfile}
          friendUids={friends.map((f) => f.uid)}
          onOpenProfile={handleOpenProfileModal}
        />
      )}

      {activeTab === 'challenges' && (
        <ChallengesHub
          challenges={challenges}
          currentUserProfile={mySocialProfile}
          onCreateChallenge={handleCreateChallenge}
          onJoinChallenge={handleJoinChallenge}
        />
      )}

      {activeTab === 'ai' && (
        <AiCoachWidget
          recommendations={aiRecs}
          onAcceptRecommendation={(rec) => {
            handleCreateChallenge({
              title: rec.title,
              description: rec.description,
              emoji: rec.emoji,
              creatorUid: currentUser?.uid || '',
              creatorName: currentUser?.displayName || 'User',
              type: 'weekly',
              mode: 'friends_only',
              targetDays: rec.targetDays,
              minCompletionPerDay: 1,
              requiredStreak: rec.targetDays,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + rec.targetDays * 86400000).toISOString(),
              participants: {
                [currentUser?.uid || '']: {
                  uid: currentUser?.uid || '',
                  displayName: currentUser?.displayName || 'User',
                  photoURL: currentUser?.photoURL || null,
                  progress: 0,
                  completedDays: 0,
                  currentStreak: currentStreak,
                  joinedAt: new Date().toISOString(),
                },
              },
              status: 'active',
            });
          }}
        />
      )}

      {/* Modals */}
      <FriendSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        currentUserProfile={mySocialProfile}
        existingFriends={friends}
        sentRequests={sentRequests}
        onShowToast={onShowToast}
      />

      <FriendProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={selectedProfile}
        currentUid={currentUser?.uid || ''}
        isFriend={friends.some((f) => f.uid === selectedProfile?.uid)}
        onOpenShareCard={() => setShareCardOpen(true)}
        onShowToast={onShowToast}
      />

      <NotificationCenter
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        incomingRequests={incomingRequests}
        currentUid={currentUser?.uid || ''}
        onShowToast={onShowToast}
      />

      <ShareCardModal
        isOpen={shareCardOpen}
        onClose={() => setShareCardOpen(false)}
        profile={mySocialProfile}
        onShowToast={onShowToast}
      />
    </div>
  );
}
