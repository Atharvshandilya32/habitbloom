import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';
import { getMessaging, Messaging } from 'firebase/messaging';

// TODO: Replace these with your Firebase config from Firebase Console
// Steps to get your config:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use existing)
// 3. Click "Add app" → Web
// 4. Copy the config object and paste below
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA-mock-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://mock-project.firebaseio.com',
};

const isValidDatabaseUrl = (url?: string) => Boolean(url && (url.startsWith('https://') || url.startsWith('http://')));

let app: ReturnType<typeof initializeApp> | undefined;
let database: Database | undefined;
let auth: Auth | undefined;
let messaging: Messaging | undefined;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    if (isValidDatabaseUrl(firebaseConfig.databaseURL)) {
      database = getDatabase(app);
    }
    auth = getAuth(app);
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
    }
  } catch (error) {
    console.info('Firebase initialization deferred. App running in offline local mode.', error);
  }
}

export { database, auth, messaging, app };

