import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  User, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Explicitly set persistence to local to ensure sessions survive refreshes and handle some network issues
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("Failed to set auth persistence:", err);
});

// Use specialized initialization for Firestore to handle mobile/APK network stability
// experimentalForceLongPolling: true ensures we don't hit WebSocket/WebChannel stream errors (Listen stream errors)
// localCache: persistentLocalCache provides offline support for a better user experience
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Helper to format Firebase Auth errors
export const formatAuthError = (error: any): string => {
  switch (error.code) {
    case 'auth/network-request-failed':
      return "Network request failed. Please check your internet connection or disable any ad-blockers/VPNs that might be blocking Google authentication.";
    case 'auth/unauthorized-domain':
      return `This domain ("${window.location.hostname}") is not authorized for Google Sign-in. Please add it to "Authorized Domains" in the Firebase Console.`;
    case 'auth/popup-blocked':
      return "The login popup was blocked. Please enable popups or try 'Open in new tab'.";
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return ""; // Silent fail
    case 'auth/internal-error':
      return "An internal Firebase error occurred. Please try again later.";
    default:
      return error.message || "An unexpected authentication error occurred.";
  }
};

// Auth functions
export const signInWithGoogle = async () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isInIframe = window.self !== window.top;

  try {
    // In mobile APK/WebView, popups are almost always blocked.
    // However, if we're in an iframe (like AI Studio preview), we MUST use popup.
    if (isMobile && !isInIframe) {
      console.log("Mobile/APK environment detected, using redirect.");
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (popupError: any) {
      console.log("Popup failed, checking fallback:", popupError.code);
      
      // Fallback to redirect if popup is blocked/unsupported and were on mobile
      if (isMobile && !isInIframe) {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      
      throw popupError;
    }
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return null;
    }
    console.error("Sign-in error:", error);
    // Attach user-friendly message
    error.friendlyMessage = formatAuthError(error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { getRedirectResult };

// Firestore error handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection and log state (silent failure is preferred for better UX)
async function testConnection() {
  // Disabled for faster boot, Firestore will reconnect automatically
}
testConnection();
