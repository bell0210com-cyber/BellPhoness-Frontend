import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseClientReady = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

const app = firebaseClientReady ? getApps()[0] || initializeApp(config) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Set browserLocalPersistence at startup so sessions survive page refreshes.
// This also helps avoid auth/network-request-failed on browsers that block
// sessionStorage (e.g. Safari ITP, private browsing, strict ad-blockers).
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    if (import.meta.env.DEV) {
      console.warn('[FirebaseAuth] Failed to set persistence:', err.message);
    }
  });
}

// Development audit: log authDomain so misconfigurations are immediately visible.
if (import.meta.env.DEV && firebaseClientReady) {
  console.info(
    '[FirebaseAuth] Initialized — authDomain:',
    config.authDomain,
    '| projectId:',
    config.projectId
  );
  if (!config.authDomain?.includes(config.projectId)) {
    console.warn(
      '[FirebaseAuth] authDomain does not contain the projectId — verify it matches your Firebase project.'
    );
  }
}