import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { firebaseClientReady } from '../services/firebaseClient';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Automatically creates the Tabby test account in Firebase Auth on first load if it does not already exist.
 */
export async function createTestAccount() {
  if (!firebaseClientReady) return;

  try {
    // Use an isolated secondary Firebase app to avoid mutating the active user's session
    const appName = 'BellTestAccountInit';
    const secondaryApp = getApps().find((a) => a.name === appName) || initializeApp(config, appName);
    const secondaryAuth = getAuth(secondaryApp);

    const userCred = await createUserWithEmailAndPassword(
      secondaryAuth,
      'tabby.test@bellphones.com',
      'TabbyTest@123'
    );

    if (userCred.user) {
      await updateProfile(userCred.user, {
        displayName: 'Tabby Test User',
      });
      await signOut(secondaryAuth);
      console.log('✅ Tabby test account created successfully: tabby.test@bellphones.com');
    }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use' || error.message?.includes('email-already-in-use')) {
      // User already exists, safely ignore
      return;
    }
    console.debug('Test account creation notice:', error?.message || error);
  }
}
