'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, UserPlus, Trophy, Award, Sparkles } from 'lucide-react';
import { UserNotification, FriendRequest } from '../../../../lib/socialTypes';
import { markNotificationAsRead, markAllNotificationsAsRead, acceptFriendRequest, updateFriendRequestStatus } from '../../../../lib/socialUtils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: UserNotification[];
  incomingRequests: FriendRequest[];
  currentUid: string;
  onShowToast: (msg: string) => void;
  onRefreshSocialData?: () => void;
}

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  incomingRequests,
  currentUid,
  onShowToast,
  onRefreshSocialData,
}: NotificationCenterProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length + incomingRequests.length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(currentUid);
    onShowToast('All notifications marked as read.');
    if (onRefreshSocialData) onRefreshSocialData();
  };

  const handleAcceptReq = async (req: FriendRequest) => {
    const res = await acceptFriendRequest(req);
    onShowToast(res.message);
    if (onRefreshSocialData) onRefreshSocialData();
  };

  const handleRejectReq = async (req: FriendRequest) => {
    await updateFriendRequestStatus(req.id, 'rejected');
    onShowToast(`Declined friend request from ${req.senderName}.`);
    if (onRefreshSocialData) onRefreshSocialData();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Notification Center
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={14} /> Read All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Friend Requests Queue */}
            {incomingRequests.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <UserPlus size={14} /> Friend Requests ({incomingRequests.length})
                </h3>
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      {req.senderPhotoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={req.senderPhotoURL}
                          alt={req.senderName}
                          className="w-9 h-9 rounded-full object-cover border border-emerald-500/30"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                          {req.senderName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {req.senderName}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {req.senderHbId}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAcceptReq(req)}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectReq(req)}
                        className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Standard Notifications */}
            {notifications.length === 0 && incomingRequests.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Sparkles className="mx-auto text-slate-300 dark:text-slate-700" size={32} />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">All caught up!</p>
                <p className="text-[11px] text-slate-400">You have no unread notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(currentUid, n.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    !n.read
                      ? 'bg-slate-50 dark:bg-slate-800/90 border-emerald-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {n.type === 'friend_accepted' && <UserPlus size={16} className="text-emerald-500" />}
                      {n.type === 'challenge_invite' && <Trophy size={16} className="text-amber-500" />}
                      {n.type === 'milestone_reached' && <Award size={16} className="text-indigo-500" />}
                      {n.type === 'ai_recommendation' && <Sparkles size={16} className="text-teal-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
