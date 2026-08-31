import { initializeApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";
import { getMessaging, Messaging } from "firebase/messaging";

// TODO: Replace these with your Firebase config from Firebase Console
// Steps to get your config:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (or use existing)
// 3. Click "Add app" → Web
// 4. Copy the config object and paste below

// These are intentionally safe mock values used for local development and build processes
// to prevent SDK initialization errors. They do not grant access to any real Firebase project.
const MOCK_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA-mock-api-key",
  authDomain: "mock-project.firebaseapp.com",
  projectId: "mock-project",
  storageBucket: "mock-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  databaseURL: "https://mock-project.firebaseio.com",
};

export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || MOCK_FIREBASE_CONFIG.apiKey,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    MOCK_FIREBASE_CONFIG.authDomain,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    MOCK_FIREBASE_CONFIG.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    MOCK_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    MOCK_FIREBASE_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || MOCK_FIREBASE_CONFIG.appId,
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    MOCK_FIREBASE_CONFIG.databaseURL,
};

const isValidDatabaseUrl = (url?: string) =>
  Boolean(url && (url.startsWith("https://") || url.startsWith("http://")));

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
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      messaging = getMessaging(app);
    }
  } catch (error) {
    console.info(
      "Firebase initialization deferred. App running in offline local mode.",
      error,
    );
  }
}

export { database, auth, messaging, app };
