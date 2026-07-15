import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

// TODO: Replace these with your Firebase config from Firebase Console
// Steps to get your config:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use existing)
// 3. Click "Add app" → Web
// 4. Copy the config object and paste below
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
};

let app: ReturnType<typeof initializeApp> | undefined;
let database: Database | undefined;
let auth: Auth | undefined;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase not configured yet. Configure your .env.local file.', error);
}

export { database, auth, app };
