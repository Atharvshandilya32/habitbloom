'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Habit, HabitLog } from './habitTypes';
import { makeLogKey } from './habitUtils';
import { messaging, firebaseConfig, database, auth } from './firebase';
import { getToken } from 'firebase/messaging';
import { ref, set } from 'firebase/database';

export interface ReminderConfig {
  globalEnabled: boolean;
  globalTime: string; // "HH:MM" 24h format
  soundEnabled: boolean;
}

const DEFAULT_CONFIG: ReminderConfig = {
  globalEnabled: false,
  globalTime: '20:00', // Default 8 PM
  soundEnabled: true,
};

const STORAGE_KEY = 'habitbloom_reminder_config';
const LAST_NOTIFIED_KEY = 'habitbloom_last_notified_date';

export function useHabitReminders(habits: Habit[], logs: HabitLog) {
  const [config, setConfig] = useState<ReminderConfig>(DEFAULT_CONFIG);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const habitsRef = useRef(habits);
  const logsRef = useRef(logs);
  const configRef = useRef(config);
  const permissionRef = useRef(permission);

  useEffect(() => {
    habitsRef.current = habits;
    logsRef.current = logs;
    configRef.current = config;
    permissionRef.current = permission;
  }, [habits, logs, config, permission]);

  // Sync state from localStorage & browser permissions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setConfig(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse reminder config', e);
        }
      }
    }
  }, []);

  // Update config
  const updateConfig = (newConfig: Partial<ReminderConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Request browser Notification permission
  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser notifications are not supported by your browser.');
      return false;
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        updateConfig({ globalEnabled: true });

        if (messaging && auth?.currentUser) {
          try {
            const configStr = encodeURIComponent(JSON.stringify(firebaseConfig));
            const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?config=${configStr}`);
            
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            if (vapidKey) {
              const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
              if (currentToken) {
                await set(ref(database, `users/${auth.currentUser.uid}/fcmTokens/${currentToken}`), true);
              }
            }
          } catch (fcmErr) {
            console.warn('FCM Token notice:', fcmErr);
          }
        }

        sendNotification('🌸 HabitBloom Reminders Enabled!', {
          body: 'You will receive daily reminders to complete your habits.',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Notification permission notice:', err);
      return false;
    }
  };

  // Send native browser notification
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/assets/notification-icon.png',
          badge: '/assets/notification-icon.png',
          ...options,
        });

        if (configRef.current.soundEnabled) {
          try {
            const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
          } catch {
            // Audio context might be restricted
          }
        }

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.warn('Notification dispatch notice:', err);
      }
    }
  }, []);

  // Check if today's habits need reminder
  const checkAndTriggerReminders = useCallback(() => {
    const currentConfig = configRef.current;
    if (!currentConfig.globalEnabled || permissionRef.current !== 'granted') return;

    const currentHabits = habitsRef.current;
    const currentLogs = logsRef.current;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const dateStr = `${currentYear}-${currentMonth}-${currentDay}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    // Get uncompleted habits for today
    const uncompleted = currentHabits.filter((habit) => {
      const key = makeLogKey(habit.id, currentYear, currentMonth, currentDay);
      return !currentLogs[key];
    });

    if (uncompleted.length === 0) return;

    // Global daily reminder trigger (fires if current time reached or passed the reminder time today)
    const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);
    if (currentTimeStr >= currentConfig.globalTime && lastNotified !== dateStr) {
      localStorage.setItem(LAST_NOTIFIED_KEY, dateStr);
      sendNotification(`🌸 HabitBloom Daily Reminder`, {
        body: `You have ${uncompleted.length} habit${uncompleted.length > 1 ? 's' : ''} left to complete today: ${uncompleted.map(h => `${h.emoji} ${h.name}`).join(', ')}`,
      });
      return;
    }

    // Per-habit custom reminder trigger
    currentHabits.forEach((habit) => {
      if (habit.reminderEnabled && habit.reminderTime && currentTimeStr >= habit.reminderTime) {
        const key = makeLogKey(habit.id, currentYear, currentMonth, currentDay);
        const habitLastNotifiedKey = `habitbloom_last_notified_${habit.id}`;
        if (!currentLogs[key] && localStorage.getItem(habitLastNotifiedKey) !== dateStr) {
          localStorage.setItem(habitLastNotifiedKey, dateStr);
          sendNotification(`${habit.emoji} Time for ${habit.name}!`, {
            body: `Don't break your streak! Mark ${habit.name} as complete.`,
          });
        }
      }
    });
  }, [sendNotification]);

  // Interval check every 30 seconds with stable reference
  useEffect(() => {
    const timer = setInterval(() => {
      checkAndTriggerReminders();
    }, 30000);
    return () => clearInterval(timer);
  }, [checkAndTriggerReminders]);

  return {
    config,
    updateConfig,
    permission,
    requestPermission,
    sendNotification,
  };
}
