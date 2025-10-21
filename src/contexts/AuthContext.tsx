import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import { ref, onValue, set, onDisconnect, serverTimestamp, remove } from 'firebase/database';
import { auth, database } from '@/firebase/config';

// Guest user interface for database-only guests
interface GuestUser {
  uid: string;
  displayName: string;
  isGuest: true;
  createdAt: number;
}

// Combined user type (Firebase User or Guest User)
type AppUser = User | GuestUser;

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isGuest: boolean;
  signInAsGuest: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to check if user is a guest
function isGuestUser(user: AppUser | null): user is GuestUser {
  return user !== null && 'isGuest' in user && user.isGuest === true;
}

// Helper to generate guest ID
function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to get or create guest user from localStorage
function getOrCreateGuestUser(): GuestUser {
  const stored = localStorage.getItem('guestUser');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Validate it's a valid guest user
      if (parsed.uid && parsed.isGuest) {
        return parsed;
      }
    } catch {
      // Invalid stored data, create new
    }
  }

  // Create new guest user
  const guestUser: GuestUser = {
    uid: generateGuestId(),
    displayName: 'Guest',
    isGuest: true,
    createdAt: Date.now(),
  };
  localStorage.setItem('guestUser', JSON.stringify(guestUser));
  return guestUser;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Set up presence system for all users (guest and authenticated)
  useEffect(() => {
    if (!user) return;

    const presenceRef = ref(database, `presence/${user.uid}`);
    const userRef = ref(database, `users/${user.uid}`);
    const connectedRef = ref(database, '.info/connected');

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // Store user info in database with proper structure for guest users
        const userData = {
          uid: user.uid,
          displayName: user.displayName || (isGuestUser(user) ? 'Guest' : 'User'),
          isGuest: isGuestUser(user),
          lastSeen: serverTimestamp(),
        };

        set(userRef, userData).catch((error) => {
          console.error('Error setting user data:', error);
        });

        // Set user as online with uid for security rules validation
        const presenceData = {
          uid: user.uid,
          online: true,
          lastSeen: serverTimestamp(),
        };

        set(presenceRef, presenceData).catch((error) => {
          console.error('Error setting presence:', error);
        });

        // For guest users, clean up their data on disconnect
        if (isGuestUser(user)) {
          // Remove user data
          onDisconnect(userRef).remove().catch((error) => {
            console.error('Error setting onDisconnect for user removal:', error);
          });
          // Remove presence data
          onDisconnect(presenceRef).remove().catch((error) => {
            console.error('Error setting onDisconnect for presence removal:', error);
          });
        } else {
          // For authenticated users, just set them as offline when disconnected
          onDisconnect(presenceRef).set({
            uid: user.uid,
            online: false,
            lastSeen: serverTimestamp(),
          }).catch((error) => {
            console.error('Error setting onDisconnect for presence:', error);
          });
        }
      }
    });

    return () => unsubscribe();
  }, [user, isGuest]);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Real authenticated user
        setUser(firebaseUser);
        setIsGuest(false);
        // Clear any guest user from localStorage
        localStorage.removeItem('guestUser');
      } else {
        // No authenticated user, use guest
        const guestUser = getOrCreateGuestUser();
        setUser(guestUser);
        setIsGuest(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAsGuest = async () => {
    try {
      // Sign out of any Firebase auth
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      // Create new guest user
      const guestUser = getOrCreateGuestUser();
      setUser(guestUser);
      setIsGuest(true);
    } catch (error) {
      console.error('Error signing in as guest:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase auth state listener will handle setting the user
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      // Firebase auth state listener will handle setting the user
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Firebase auth state listener will handle setting the user
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      // Clear guest user and create new one
      localStorage.removeItem('guestUser');
      const guestUser = getOrCreateGuestUser();
      setUser(guestUser);
      setIsGuest(true);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateDisplayName = async (displayName: string) => {
    if (!user) {
      throw new Error('Must be signed in to update display name');
    }

    try {
      if (isGuestUser(user)) {
        // Update guest user in localStorage and state
        const updatedGuest: GuestUser = { ...user, displayName };
        localStorage.setItem('guestUser', JSON.stringify(updatedGuest));
        setUser(updatedGuest);

        // Update in database
        const userRef = ref(database, `users/${user.uid}`);
        await set(userRef, {
          uid: user.uid,
          displayName,
          isGuest: true,
          lastSeen: serverTimestamp(),
        });
      } else {
        // Update Firebase auth user
        await updateProfile(user, { displayName });
        // Force refresh user object
        setUser({ ...user, displayName });
      }
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      throw new Error('Must be signed in to delete account');
    }

    try {
      if (isGuestUser(user)) {
        // Guest users can't delete accounts (they're temporary)
        throw new Error('Guest accounts cannot be deleted');
      }

      // Delete user data from database
      const userRef = ref(database, `users/${user.uid}`);
      const presenceRef = ref(database, `presence/${user.uid}`);

      await remove(userRef);
      await remove(presenceRef);

      // Delete Firebase auth user
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      // Clear state and create new guest user
      localStorage.removeItem('guestUser');
      const guestUser = getOrCreateGuestUser();
      setUser(guestUser);
      setIsGuest(true);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isGuest,
    signInAsGuest,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    updateDisplayName,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

