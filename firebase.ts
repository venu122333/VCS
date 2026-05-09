import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  User, 
  setPersistence, 
  browserLocalPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
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

export const githubProvider = new GithubAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');

// Helper to format Firebase Auth errors
export const formatAuthError = (error: any): string => {
  switch (error.code) {
    case 'auth/network-request-failed':
      return "Network request failed. Please check your internet connection or disable any ad-blockers/VPNs that might be blocking Google authentication.";
    case 'auth/unauthorized-domain':
      return `This domain ("${window.location.hostname}") is not authorized for Google Sign-in. Please add it to "Authorized Domains" in the Firebase Console.`;
    case 'auth/popup-blocked':
      return "The login popup was blocked. Please enable popups or try 'Open in new tab'.";
    case 'auth/operation-not-allowed':
      return "This authentication method is not enabled. Please go to the Firebase Console -> Authentication -> Sign-in Method and enable Google, GitHub, Microsoft, or Email/Password as needed.";
    case 'auth/admin-restricted-operation':
      return "Authentication method not enabled. Please go to the Firebase Console -> Authentication -> Sign-in Method and enable 'Anonymous', 'Google', 'GitHub', 'Microsoft' and 'Email/Password' as needed.";
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return "Incorrect email or password. Please check your credentials.";
    case 'auth/email-already-in-use':
      return "This email is already in use. Try signing in or using another email.";
    case 'auth/weak-password':
      return "Password must be at least 6 characters long.";
    case 'auth/invalid-email':
      return "Please enter a valid email address.";
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return ""; // Silent fail
    case 'auth/internal-error':
      return "An internal Firebase error occurred. Please try again later.";
    default:
      return error.message || "An unexpected authentication error occurred.";
  }
};

export const signInWithProvider = async (provider: GoogleAuthProvider | GithubAuthProvider | OAuthProvider) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isInIframe = window.self !== window.top;

  try {
    if (isMobile && !isInIframe) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (popupError: any) {
      if (isMobile && !isInIframe) {
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw popupError;
    }
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return null;
    }
    error.friendlyMessage = formatAuthError(error);
    throw error;
  }
};

export const signInWithGoogle = () => signInWithProvider(googleProvider);
export const signInWithGithub = () => signInWithProvider(githubProvider);
export const signInWithMicrosoft = () => signInWithProvider(microsoftProvider);

export const loginWithEmail = async (email: string, password: string) => {
  try {
    // Try sign in first
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    // If user doesn't exist, try sign up (infinite/continuous flow)
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
      } catch (signUpError: any) {
        // If creation fails with email-already-in-use after sign-in failed, it means wrong password
        if (signUpError.code === 'auth/email-already-in-use') {
          error.friendlyMessage = formatAuthError(error);
          throw error;
        }
        signUpError.friendlyMessage = formatAuthError(signUpError);
        throw signUpError;
      }
    }
    error.friendlyMessage = formatAuthError(error);
    throw error;
  }
};

export const continueAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    console.error("Guest sign-in error:", error);
    error.friendlyMessage = formatAuthError(error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    // Clear persisted travel data
    const keys = [
      'nomad_view', 'nomad_isGenerating', 'nomad_destination', 
      'nomad_duration', 'nomad_budget', 'nomad_currency', 
      'nomad_mood', 'nomad_travelerType', 'nomad_travelerCount', 
      'nomad_activitiesPerDay', 'nomad_notes', 'nomad_plan', 'nomad_heroImage'
    ];
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload(); // Hard reload to clear all state
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
