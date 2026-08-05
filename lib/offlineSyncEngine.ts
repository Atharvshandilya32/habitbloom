import { ref, set, update } from 'firebase/database';
import { database, auth } from './firebase';

export interface OfflineMutation {
  id: string;
  timestamp: number;
  type: 'set' | 'update';
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const QUEUE_KEY = 'habitbloom_offline_queue';

function getQueue(): OfflineMutation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: OfflineMutation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Enqueue a mutation to be sent to Firebase.
 * If the user is online, it will try to send it immediately.
 * If it fails (offline), it stays in the queue until `replayMutations` succeeds.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queueMutation(type: 'set' | 'update', path: string, data: any) {
  const queue = getQueue();
  const mutation: OfflineMutation = {
    id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    type,
    path,
    data,
  };
  
  queue.push(mutation);
  saveQueue(queue);

  if (navigator.onLine) {
    await replayMutations();
  }
}

/**
 * Replay all pending mutations in the queue.
 */
export async function replayMutations() {
  if (!navigator.onLine || !database || !auth.currentUser) return;

  const queue = getQueue();
  if (queue.length === 0) return;

  const remainingQueue: OfflineMutation[] = [];

  for (const mutation of queue) {
    try {
      const dbRef = ref(database, mutation.path);
      if (mutation.type === 'set') {
        await set(dbRef, mutation.data);
      } else if (mutation.type === 'update') {
        await update(dbRef, mutation.data);
      }
      // If it succeeds, we don't push it to remainingQueue
    } catch (error) {
      console.warn(`Failed to replay mutation ${mutation.id}, keeping in queue.`, error);
      remainingQueue.push(mutation);
    }
  }

  saveQueue(remainingQueue);
}

/**
 * Initialize offline sync listeners.
 * Should be called once at the top level of the app.
 */
export function initOfflineSync() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('App is online. Replaying offline mutations...');
      replayMutations();
    });
    
    // Also try to replay immediately on startup if online
    if (navigator.onLine) {
      replayMutations();
    }
  }
}
