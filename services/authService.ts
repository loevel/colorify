import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { User } from '../types';

// Map Firebase User to our App User type
const mapUser = (u: FirebaseUser): User => ({
  id: u.uid,
  name: u.displayName || u.email?.split('@')[0] || 'Artist',
  email: u.email || ''
});

export const register = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return mapUser(userCredential.user);
  } catch (error: any) {
    throw new Error(formatAuthError(error.code));
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapUser(userCredential.user);
  } catch (error: any) {
    throw new Error(formatAuthError(error.code));
  }
};

export const logout = async () => {
  await firebaseSignOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapUser(firebaseUser) : null);
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
