
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { User, SubscriptionTier, AccountType, Child } from '../types';

// Map Firebase User to our App User type
const mapUser = async (u: FirebaseUser): Promise<User> => {
  // Fetch additional user data from Firestore
  let subscriptionTier: SubscriptionTier = 'free';
  let subscriptionStatus: 'active' | 'canceled' | 'past_due' = 'active';
  let accountType: AccountType = 'personal';
  let children: Child[] = [];

  try {
    const userDoc = await getDoc(doc(db, "users", u.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      subscriptionTier = data.subscriptionTier || 'free';
      subscriptionStatus = data.subscriptionStatus || 'active';
      accountType = data.accountType || 'personal';
      children = data.children || [];
    }
  } catch (e) {
    console.error("Error fetching user profile", e);
  }

  return {
    id: u.uid,
    name: u.displayName || u.email?.split('@')[0] || 'Artist',
    email: u.email || '',
    subscriptionTier,
    subscriptionStatus,
    accountType,
    children
  };
};

export const register = async (name: string, email: string, password: string, accountType: AccountType = 'personal'): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    // Create the user document in Firestore with default subscription
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      accountType,
      children: [],
      createdAt: Date.now()
    });

    return await mapUser(userCredential.user);
  } catch (error: any) {
    throw new Error(formatAuthError(error.code));
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return await mapUser(userCredential.user);
  } catch (error: any) {
    throw new Error(formatAuthError(error.code));
  }
};

export const logout = async () => {
  await firebaseSignOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const appUser = await mapUser(firebaseUser);
      callback(appUser);
    } else {
      callback(null);
    }
  });
};

// Helper to make Firebase errors user-friendly
const formatAuthError = (code: string) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'Email already registered.';
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    case 'auth/user-not-found': return 'User not found.';
    case 'auth/wrong-password': return 'Incorrect password.';
    default: return 'Authentication failed. Please try again.';
  }
};
