import { ref, set, update } from 'firebase/database';
import { database, auth } from './firebase';

export type OfflineMutation = {
  id: string;
  timestamp: number;
  path: string;
} & (
  | { type: 'set'; data: unknown }
  | { type: 'update'; data: object }
);

const QUEUE_KEY = 'habitbloom_offline_queue';
let isReplaying = false;

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
export async function queueMutation(type: 'set', path: string, data: unknown): Promise<void>;
export async function queueMutation(type: 'update', path: string, data: object): Promise<void>;
export async function queueMutation(type: 'set' | 'update', path: string, data: unknown): Promise<void> {
  const queue = getQueue();
  const mutation: OfflineMutation = type === 'set'
    ? {
        id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: 'set',
        path,
        data,
      }
    : {
        id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: 'update',
        path,
        data: data as object, // We can assert here because of the overload
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
  if (!navigator.onLine || !database || !auth.currentUser || isReplaying) return;

  isReplaying = true;

  try {
    const queue = getQueue();
    if (queue.length === 0) return;

    let processedCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const mutation = queue[i];
      try {
        const dbRef = ref(database, mutation.path);
        if (mutation.type === 'set') {
          await set(dbRef, mutation.data);
        } else if (mutation.type === 'update') {
          await update(dbRef, mutation.data);
        }
        processedCount++;
      } catch (error) {
        console.warn(`Failed to replay mutation ${mutation.id}, halting queue.`, error);
        break;
      }
    }

    if (processedCount > 0) {
      const latestQueue = getQueue();
      const remainingQueue = latestQueue.slice(processedCount);
      saveQueue(remainingQueue);
    }
  } finally {
    isReplaying = false;
  }
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
