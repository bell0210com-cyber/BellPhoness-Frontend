import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  browserLocalPersistence,
  browserSessionPersistence,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';

import { auth, firebaseClientReady } from './firebaseClient';

const firebaseConfigured = firebaseClientReady;

const db =
  firebaseConfigured && auth
    ? getFirestore(auth.app)
    : null;

function requireFirebase() {
  if (!firebaseConfigured || !auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please check your Firebase configuration.'
    );
  }
}

/**
 * Wraps a Firebase auth call with one automatic retry on auth/network-request-failed.
 * Waits 1 500 ms before the retry to give transient network drops time to recover.
 * Logs the failure details in development to aid debugging.
 *
 * @param {() => Promise<any>} fn - The async auth operation to run.
 * @returns {Promise<any>}
 */
async function withNetworkRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err?.code === 'auth/network-request-failed') {
      if (import.meta.env.DEV) {
        console.warn('[FirebaseAuth] Network failure (attempt 1):', err.message);
      }
      // Wait 1.5 s then retry once
      await new Promise((resolve) => setTimeout(resolve, 1500));
      try {
        if (import.meta.env.DEV) {
          console.info('[FirebaseAuth] Retrying after network failure...');
        }
        return await fn();
      } catch (retryErr) {
        if (import.meta.env.DEV) {
          console.error('[FirebaseAuth] Network failure (attempt 2 — final):', retryErr.message);
        }
        // Re-throw with a flag so callers can show a network-specific UI message
        retryErr.isNetworkError = true;
        throw retryErr;
      }
    }
    throw err;
  }
}

export async function signInWithEmail(
  email,
  password,
  remember = false
) {
  requireFirebase();

  // Persistence is set globally in firebaseClient.js (browserLocalPersistence).
  // We still honour the `remember` flag by switching to sessionPersistence when false.
  if (!remember) {
    await setPersistence(auth, browserSessionPersistence);
  }

  const result = await withNetworkRetry(() =>
    signInWithEmailAndPassword(auth, email.trim(), password)
  );

  if (!result.user.emailVerified) {
    await signOut(auth);
    const error = new Error('Please verify your email address to log in.');
    error.code = 'auth/email-unverified';
    throw error;
  }

  return result.user;
}

export async function registerWithEmail({
  name,
  email,
  phone,
  password,
}) {
  requireFirebase();

  const result = await withNetworkRetry(() =>
    createUserWithEmailAndPassword(auth, email.trim(), password)
  );

  const user = result.user;

  if (name?.trim()) {
    await updateProfile(user, {
      displayName: name.trim(),
    });
  }

  if (db) {
    await setDoc(
      doc(db, 'customers', user.uid),
      {
        uid: user.uid,
        name: name?.trim() || '',
        email: user.email || email.trim(),
        phone: phone?.trim() || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  await sendEmailVerification(user);
  await signOut(auth);

  return user;
}

export async function getCustomerProfile(uid) {
  requireFirebase();

  if (!db || !uid) {
    return null;
  }

  const snapshot = await getDoc(
    doc(db, 'customers', uid)
  );

  return snapshot.exists()
    ? snapshot.data()
    : null;
}

export async function sendPasswordReset(email) {
  requireFirebase();

  await sendPasswordResetEmail(
    auth,
    email.trim()
  );
}

export async function signInWithGoogle() {
  requireFirebase();

  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const result = await withNetworkRetry(() =>
    signInWithPopup(auth, provider)
  );

  const user = result.user;

  if (db) {
    // isNewUser = first Google sign-in; preserve createdAt if already exists
    const isNew = result.additionalUserInfo?.isNewUser;
    await setDoc(
      doc(db, 'customers', user.uid),
      {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        updatedAt: serverTimestamp(),
        ...(isNew ? { createdAt: serverTimestamp() } : {}),
      },
      { merge: true }
    );
  }

  return user;
}

export async function logout() {
  requireFirebase();

  await signOut(auth);
}

export function subscribeToAuth(callback) {
  if (!firebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(
    auth,
    callback
  );
}

export const authConfigurationReady =
  firebaseConfigured;
export function subscribeToProfile(uid, callback) {
  if (!db || !uid) {
    callback(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, "customers", uid),
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    },
    (error) => {
      console.warn('[authService] Profile snapshot listener notice:', error?.message || error);
      callback(null);
    }
  );
}


