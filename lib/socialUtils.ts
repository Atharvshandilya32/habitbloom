import {
  ref,
  get,
  set,
  remove,
  push,
  update,
  query as dbQuery,
  orderByChild,
  limitToLast,
  startAt,
  endAt,
  limitToFirst,
} from "firebase/database";
import { database } from "./firebase";
import {
  UserSocialProfile,
  FriendRequest,
  ActivityFeedItem,
  UserNotification,
  UserPrivacySettings,
  UserBadge,
  ReactionType,
  LeaderboardEntry,
} from "./socialTypes";
import { formatHbId } from "./identityUtils";
import { XP_CONSTANTS, getLevelFromXp, getUniverseTitle } from "./xpEngine";

export const DEFAULT_PRIVACY: UserPrivacySettings = {
  profileVisibility: "public",
  streakVisibility: "public",
  habitsVisibility: "friends",
  activityVisibility: "friends",
};

/**
 * Calculates user XP, level, level title, and badges based on completed logs and habits
 */
export function calculateXPAndGamification(
  logs: Record<string, boolean> = {},
  habitsCount: number = 0,
  currentStreak: number = 0,
) {
  const completedCount = Object.values(logs).filter(Boolean).length;

  // XP Formula: Base completion + streak bonus
  const totalXP =
    completedCount * XP_CONSTANTS.HABIT_COMPLETION +
    currentStreak * XP_CONSTANTS.STREAK_BONUS +
    habitsCount * 50;

  // Unified Level & Title logic
  const level = getLevelFromXp(totalXP);
  const titleData = getUniverseTitle(level);
  const levelTitle = `${titleData.title} ${titleData.icon} Level ${level}`;

  // Evaluate unlockable badges
  const badges: UserBadge[] = [];
  const now = new Date().toISOString();

  if (completedCount >= 1) {
    badges.push({
      id: "badge_first_bloom",
      title: "First Bloom",
      description: "Completed your first habit entry!",
      icon: "🌱",
      rarity: "common",
      unlockedAt: now,
    });
  }

  if (currentStreak >= 3) {
    badges.push({
      id: "badge_streak_3",
      title: "Ignition Streak",
      description: "Maintained a 3-day active streak!",
      icon: "🔥",
      rarity: "common",
      unlockedAt: now,
    });
  }

  if (currentStreak >= 7) {
    badges.push({
      id: "badge_streak_7",
      title: "Weekly Warrior",
      description: "Completed a 7-day uninterrupted streak!",
      icon: "⚡",
      rarity: "rare",
      unlockedAt: now,
    });
  }

  if (currentStreak >= 30) {
    badges.push({
      id: "badge_streak_30",
      title: "Monthly Titan",
      description: "Achieved a legendary 30-day streak!",
      icon: "🏆",
      rarity: "epic",
      unlockedAt: now,
    });
  }

  if (completedCount >= 100) {
    badges.push({
      id: "badge_centurion",
      title: "Habit Centurion",
      description: "Logged over 100 total habit completions!",
      icon: "💯",
      rarity: "legendary",
      unlockedAt: now,
    });
  }

  return { totalXP, level, levelTitle, badges, completedCount };
}

/**
 * Ensures user social profile exists and updates stats & online status
 */
export async function ensureSocialProfile(
  uid: string,
  email: string | null,
  displayName: string | null,
  photoURL: string | null,
  hbId: string,
  logs: Record<string, boolean> = {},
  habitsCount: number = 0,
  currentStreak: number = 0,
  longestStreak: number = 0,
): Promise<UserSocialProfile | null> {
  if (!database || !uid) return null;

  try {
    const profileRef = ref(database, `socialProfiles/${uid}`);
    const snapshot = await get(profileRef);
    const now = new Date().toISOString();

    const { totalXP, level, levelTitle, badges, completedCount } =
      calculateXPAndGamification(logs, habitsCount, currentStreak);

    const formattedUsername = (
      displayName ||
      email?.split("@")[0] ||
      `user_${uid.slice(0, 5)}`
    )
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");

    if (!snapshot.exists()) {
      const newProfile: UserSocialProfile = {
        uid,
        hbId,
        username: formattedUsername,
        displayName: displayName || `User ${hbId.slice(0, 4)}`,
        photoURL: photoURL || null,
        bio: "Building better habits with HabitBloom.",
        currentStreak,
        longestStreak: Math.max(currentStreak, longestStreak),
        habitScore: Math.round(currentStreak * 10 + completedCount * 5),
        totalXP,
        level,
        levelTitle,
        badges,
        status: "online",
        lastActive: now,
        friendCount: 0,
        completedHabitsCount: completedCount,
        privacy: DEFAULT_PRIVACY,
      };

      await set(profileRef, newProfile);
      return newProfile;
    } else {
      const existing = snapshot.val() as UserSocialProfile;
      const updatedProfile: UserSocialProfile = {
        ...existing,
        hbId: existing.hbId || hbId,
        displayName: displayName || existing.displayName,
        photoURL: photoURL || existing.photoURL,
        currentStreak,
        longestStreak: Math.max(
          currentStreak,
          longestStreak,
          existing.longestStreak || 0,
        ),
        habitScore: Math.round(currentStreak * 10 + completedCount * 5),
        totalXP,
        level,
        levelTitle,
        badges: Array.from(
          new Set([...(existing.badges || []), ...badges].map((b) => b.id)),
        ).map((id) =>
          [...(existing.badges || []), ...badges].find((b) => b.id === id)!,
        ),
        status: "online",
        lastActive: now,
        completedHabitsCount: completedCount,
        privacy: existing.privacy || DEFAULT_PRIVACY,
      };

      await set(profileRef, updatedProfile);
      return updatedProfile;
    }
  } catch (err) {
    console.warn("Failed to ensure social profile:", err);
    return null;
  }
}

/**
 * Searches users by HabitBloom ID, Username, or Display Name
 */
export async function searchUsers(
  query: string,
  currentUid: string,
): Promise<UserSocialProfile[]> {
  if (!database || !query.trim()) return [];

  const rawQuery = query.trim().replace(/-/g, "").toLowerCase();
  const results: UserSocialProfile[] = [];
  const seenUids = new Set<string>([currentUid]);

  try {
    // 1. Direct HB-ID lookup check
    const hbSnap = await get(ref(database, `hbIds/${rawQuery}`));
    if (hbSnap.exists()) {
      const matchedUid = hbSnap.val() as string;
      if (!seenUids.has(matchedUid)) {
        const profSnap = await get(
          ref(database, `socialProfiles/${matchedUid}`),
        );
        if (profSnap.exists()) {
          results.push(profSnap.val() as UserSocialProfile);
          seenUids.add(matchedUid);
        }
      }
    }

    // 2. Query indexed username prefix
    const usernameQuery = dbQuery(
      ref(database, "socialProfiles"),
      orderByChild("username"),
      startAt(rawQuery),
      endAt(rawQuery + "\uf8ff"),
      limitToFirst(10),
    );
    const usernameSnap = await get(usernameQuery);
    if (usernameSnap.exists()) {
      const usersMap = usernameSnap.val() as Record<string, UserSocialProfile>;
      Object.values(usersMap).forEach((prof) => {
        if (!seenUids.has(prof.uid)) {
          results.push(prof);
          seenUids.add(prof.uid);
        }
      });
    }

    // 3. If still under limit, query indexed displayName
    if (results.length < 10) {
      const nameQuery = dbQuery(
        ref(database, "socialProfiles"),
        orderByChild("displayName"),
        startAt(query.trim()),
        endAt(query.trim() + "\uf8ff"),
        limitToFirst(10),
      );
      const nameSnap = await get(nameQuery);
      if (nameSnap.exists()) {
        const nameMap = nameSnap.val() as Record<string, UserSocialProfile>;
        Object.values(nameMap).forEach((prof) => {
          if (!seenUids.has(prof.uid)) {
            results.push(prof);
            seenUids.add(prof.uid);
          }
        });
      }
    }
  } catch (err) {
    console.warn("User search error:", err);
  }

  return results.slice(0, 15);
}

/**
 * Sends a Friend Request
 */
export async function sendFriendRequest(
  sender: UserSocialProfile,
  receiver: UserSocialProfile,
): Promise<{ success: boolean; message: string }> {
  if (!database) return { success: false, message: "Database disconnected." };

  try {
    // Check if already friends
    const friendshipSnap = await get(
      ref(database, `friends/${sender.uid}/${receiver.uid}`),
    );
    if (friendshipSnap.exists()) {
      return {
        success: false,
        message: "You are already friends with this user.",
      };
    }

    // Check if user blocked sender or vice versa
    const blockedSnap = await get(
      ref(database, `blocked/${receiver.uid}/${sender.uid}`),
    );
    if (blockedSnap.exists()) {
      return { success: false, message: "Unable to send friend request." };
    }

    // Create unique request ID
    const requestId = `${sender.uid}_${receiver.uid}`;
    const requestRef = ref(database, `friendRequests/${requestId}`);
    const now = new Date().toISOString();

    const request: FriendRequest = {
      id: requestId,
      senderUid: sender.uid,
      senderName: sender.displayName,
      senderHbId: formatHbId(sender.hbId),
      senderPhotoURL: sender.photoURL || null,
      receiverUid: receiver.uid,
      receiverName: receiver.displayName,
      receiverHbId: formatHbId(receiver.hbId),
      receiverPhotoURL: receiver.photoURL || null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await set(requestRef, request);

    // Send Realtime Notification to receiver
    await sendNotification({
      recipientUid: receiver.uid,
      senderUid: sender.uid,
      senderName: sender.displayName,
      senderPhotoURL: sender.photoURL,
      type: "friend_request",
      title: "New Friend Request 🤝",
      message: `${sender.displayName} (${formatHbId(sender.hbId)}) wants to connect with you!`,
      read: false,
      createdAt: now,
    });

    return {
      success: true,
      message: `Friend request sent to ${receiver.displayName}!`,
    };
  } catch (err) {
    console.warn("Send friend request error:", err);
    return { success: false, message: "Failed to send request." };
  }
}

/**
 * Accepts a Friend Request
 */
export async function acceptFriendRequest(
  request: FriendRequest,
): Promise<{ success: boolean; message: string }> {
  if (!database) return { success: false, message: "Database disconnected." };

  try {
    const now = new Date().toISOString();

    // 1. Add friendship bidirectionally
    await set(ref(database, `friends/${request.senderUid}/${request.receiverUid}`), {
      since: now,
      displayName: request.receiverName,
      hbId: request.receiverHbId,
    });
    await set(ref(database, `friends/${request.receiverUid}/${request.senderUid}`), {
      since: now,
      displayName: request.senderName,
      hbId: request.senderHbId,
    });

    // 2. Increment friend counts
    const snapSender = await get(ref(database, `socialProfiles/${request.senderUid}/friendCount`));
    const snapReceiver = await get(ref(database, `socialProfiles/${request.receiverUid}/friendCount`));
    const countSender = (snapSender.val() || 0) + 1;
    const countReceiver = (snapReceiver.val() || 0) + 1;

    await update(ref(database, `socialProfiles/${request.senderUid}`), { friendCount: countSender });
    await update(ref(database, `socialProfiles/${request.receiverUid}`), { friendCount: countReceiver });

    // 3. Mark request accepted
    await update(ref(database, `friendRequests/${request.id}`), {
      status: "accepted",
      updatedAt: now,
    });

    // 4. Send acceptance notification
    await sendNotification({
      recipientUid: request.senderUid,
      senderUid: request.receiverUid,
      senderName: request.receiverName,
      senderPhotoURL: request.receiverPhotoURL,
      type: "friend_accepted",
      title: "Friend Request Accepted 🎉",
      message: `${request.receiverName} accepted your friend request!`,
      read: false,
      createdAt: now,
    });

    return {
      success: true,
      message: `You are now friends with ${request.senderName}!`,
    };
  } catch (err) {
    console.warn("Accept friend request error:", err);
    return { success: false, message: "Failed to accept friend request." };
  }
}

/**
 * Rejects or Cancels a Friend Request
 */
export async function updateFriendRequestStatus(
  requestId: string,
  newStatus: "rejected" | "cancelled",
): Promise<boolean> {
  if (!database) return false;
  try {
    await update(ref(database, `friendRequests/${requestId}`), {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn("Update friend request status error:", err);
    return false;
  }
}

/**
 * Removes a Friendship
 */
export async function removeFriend(
  uidA: string,
  uidB: string,
): Promise<boolean> {
  if (!database) return false;
  try {
    await remove(ref(database, `friends/${uidA}/${uidB}`));
    await remove(ref(database, `friends/${uidB}/${uidA}`));

    const snapA = await get(
      ref(database, `socialProfiles/${uidA}/friendCount`),
    );
    const snapB = await get(
      ref(database, `socialProfiles/${uidB}/friendCount`),
    );

    const cA = Math.max(0, (snapA.val() || 1) - 1);
    const cB = Math.max(0, (snapB.val() || 1) - 1);

    await update(ref(database, `socialProfiles/${uidA}`), { friendCount: cA });
    await update(ref(database, `socialProfiles/${uidB}`), { friendCount: cB });
    return true;
  } catch (err) {
    console.warn("Remove friend error:", err);
    return false;
  }
}

/**
 * Blocks a User
 */
export async function blockUser(
  currentUid: string,
  targetUid: string,
): Promise<boolean> {
  if (!database) return false;
  try {
    const now = new Date().toISOString();
    await set(ref(database, `blocked/${currentUid}/${targetUid}`), {
      blockedAt: now,
    });
    // Remove any existing friendship & pending requests
    await removeFriend(currentUid, targetUid);
    await remove(ref(database, `friendRequests/${currentUid}_${targetUid}`));
    await remove(ref(database, `friendRequests/${targetUid}_${currentUid}`));
    return true;
  } catch (err) {
    console.warn("Block user error:", err);
    return false;
  }
}

/**
 * Unblocks a User
 */
export async function unblockUser(
  currentUid: string,
  targetUid: string,
): Promise<boolean> {
  if (!database) return false;
  try {
    await remove(ref(database, `blocked/${currentUid}/${targetUid}`));
    return true;
  } catch (err) {
    console.warn("Unblock user error:", err);
    return false;
  }
}

/**
 * Publishes an activity to the global/friends activity feed
 */
export async function publishActivityItem(
  author: UserSocialProfile,
  type: ActivityFeedItem["type"],
  title: string,
  description: string,
  icon: string = "⭐",
  metadata?: Record<string, unknown>,
): Promise<boolean> {
  if (!database) return false;
  try {
    const feedRef = ref(database, "activityFeed");
    const newItemRef = push(feedRef);
    const now = new Date().toISOString();

    const activity: ActivityFeedItem = {
      id: newItemRef.key!,
      authorUid: author.uid,
      authorName: author.displayName,
      authorHbId: formatHbId(author.hbId),
      authorPhotoURL: author.photoURL || null,
      type,
      title,
      description,
      icon,
      metadata,
      createdAt: now,
    };

    await set(newItemRef, activity);
    return true;
  } catch (err) {
    console.warn("Publish activity error:", err);
    return false;
  }
}

/**
 * Toggles a reaction (celebrate, fire, clap, heart) on an activity item
 */
export async function toggleActivityReaction(
  activityId: string,
  user: UserSocialProfile,
  type: ReactionType,
): Promise<boolean> {
  if (!database) return false;
  try {
    const reactionRef = ref(
      database,
      `activityFeed/${activityId}/reactions/${user.uid}`,
    );
    const snap = await get(reactionRef);

    if (snap.exists() && snap.val().type === type) {
      // Toggle off if clicking exact same reaction
      await remove(reactionRef);
    } else {
      await set(reactionRef, {
        uid: user.uid,
        displayName: user.displayName,
        type,
        timestamp: new Date().toISOString(),
      });
    }
    return true;
  } catch (err) {
    console.warn("Toggle activity reaction error:", err);
    return false;
  }
}

/**
 * Dispatches a Realtime Notification to a User
 */
export async function sendNotification(
  notification: Omit<UserNotification, "id">,
): Promise<boolean> {
  if (!database || !notification.recipientUid) return false;
  try {
    const notifRef = push(
      ref(database, `notifications/${notification.recipientUid}`),
    );
    const newNotif: UserNotification = {
      ...notification,
      id: notifRef.key!,
    };
    await set(notifRef, newNotif);
    return true;
  } catch (err) {
    console.warn("Send notification error:", err);
    return false;
  }
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(
  recipientUid: string,
  notificationId: string,
): Promise<boolean> {
  if (!database) return false;
  try {
    await update(
      ref(database, `notifications/${recipientUid}/${notificationId}`),
      { read: true },
    );
    return true;
  } catch (err) {
    console.warn("Mark notification as read error:", err);
    return false;
  }
}

/**
 * Marks all notifications for a user as read
 */
export async function markAllNotificationsAsRead(
  recipientUid: string,
): Promise<boolean> {
  if (!database) return false;
  try {
    const notifsSnap = await get(
      ref(database, `notifications/${recipientUid}`),
    );
    if (notifsSnap.exists()) {
      const notifsMap = notifsSnap.val() as Record<string, UserNotification>;
      const updates: Record<string, boolean> = {};
      Object.keys(notifsMap).forEach((id) => {
        updates[`${id}/read`] = true;
      });
      await update(ref(database, `notifications/${recipientUid}`), updates);
    }
    return true;
  } catch (err) {
    console.warn("Mark all notifications error:", err);
    return false;
  }
}

/**
 * Updates User Privacy Settings
 */
export async function updateUserPrivacySettings(
  uid: string,
  privacy: UserPrivacySettings,
): Promise<boolean> {
  if (!database) return false;
  try {
    await set(ref(database, `privacySettings/${uid}`), privacy);
    await update(ref(database, `socialProfiles/${uid}`), { privacy });
    return true;
  } catch (err) {
    console.warn("Update privacy settings error:", err);
    return false;
  }
}

/**
 * Calculates dynamic leaderboards for Streaks, XP, or Habit Score
 */
export async function fetchLeaderboardEntries(
  metric: "xp" | "streak" | "habits",
  scope: "global" | "friends",
  currentUid: string,
  friendUids: string[] = [],
): Promise<LeaderboardEntry[]> {
  if (!database) return [];

  try {
    let profilesList: UserSocialProfile[] = [];

    if (scope === "friends") {
      const allowedUids = Array.from(new Set([currentUid, ...friendUids]));
      const promises = allowedUids.map(async (uid) => {
        const snap = await get(ref(database, `socialProfiles/${uid}`));
        if (snap.exists()) {
          return snap.val() as UserSocialProfile;
        }
        return null;
      });

      const results = await Promise.all(promises);
      profilesList = results.filter((p): p is UserSocialProfile => p !== null);
    } else {
      let queryField = "totalXP";
      if (metric === "streak") queryField = "currentStreak";
      if (metric === "habits") queryField = "completedHabitsCount";

      const q = dbQuery(
        ref(database, "socialProfiles"),
        orderByChild(queryField),
        limitToLast(100),
      );

      const snap = await get(q);
      if (snap.exists()) {
        const profilesMap = snap.val() as Record<string, UserSocialProfile>;
        profilesList = Object.values(profilesMap);
      }
    }

    profilesList.sort((a, b) => {
      if (metric === "xp") return (b.totalXP || 0) - (a.totalXP || 0);
      if (metric === "streak")
        return (b.currentStreak || 0) - (a.currentStreak || 0);
      return (b.completedHabitsCount || 0) - (a.completedHabitsCount || 0);
    });

    return profilesList.map((p, idx) => ({
      uid: p.uid,
      displayName: p.displayName,
      username: p.username,
      hbId: formatHbId(p.hbId),
      photoURL: p.photoURL,
      currentStreak: p.currentStreak || 0,
      longestStreak: p.longestStreak || 0,
      totalXP: p.totalXP || 0,
      level: p.level || 1,
      completionRate: Math.min(
        100,
        Math.round(((p.currentStreak || 0) / 30) * 100),
      ),
      habitScore: p.habitScore || 0,
      rank: idx + 1,
    }));
  } catch (err) {
    console.warn("Fetch leaderboards error:", err);
    return [];
  }
}
