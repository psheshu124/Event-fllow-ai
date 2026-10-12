import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics';

/**
 * Firebase Web App Configuration for EventFlow AI
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCJkyKxwchfjG0YMV7eA2AlfdK9lgw3JLs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "event-flow-ai-1cb02.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "event-flow-ai-1cb02",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "event-flow-ai-1cb02.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "915086520413",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:915086520413:web:ce5f98e834c06651991db4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EH80Y7TLMY"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

// Initialize Firebase App
export const app: FirebaseApp = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

// Initialize Firebase Authentication (modular SDK)
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore (modular SDK)
export const db: Firestore = getFirestore(app);

// Initialize Analytics (safely guarded for browser environments)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}
