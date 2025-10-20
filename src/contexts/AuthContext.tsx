import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { auth, database } from '@/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signInAsGuest: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  linkGuestToEmail: (email: string, password: string, displayName: string) => Promise<void>;
  linkGuestToGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Set up presence system
  useEffect(() => {
    if (!user) return;

    const presenceRef = ref(database, `presence/${user.uid}`);
    const connectedRef = ref(database, '.info/connected');

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // Set user as online
        set(presenceRef, {
          online: true,
          lastSeen: serverTimestamp(),
        });

        // Set user as offline when disconnected
        onDisconnect(presenceRef).set({
          online: false,
          lastSeen: serverTimestamp(),
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsGuest(firebaseUser?.isAnonymous || false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto sign-in as guest if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      signInAsGuest();
    }
  }, [loading, user]);

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in as guest:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const linkGuestToEmail = async (email: string, password: string, displayName: string) => {
    if (!user || !isGuest) {
      throw new Error('Must be signed in as guest to link account');
    }

    try {
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
      await updateProfile(user, { displayName });
    } catch (error) {
      console.error('Error linking guest to email:', error);
      throw error;
    }
  };

  const linkGuestToGoogle = async () => {
    if (!user || !isGuest) {
      throw new Error('Must be signed in as guest to link account');
    }

    try {
      const provider = new GoogleAuthProvider();
      await linkWithCredential(user, GoogleAuthProvider.credential(await signInWithPopup(auth, provider).then(r => r.user.getIdToken())));
    } catch (error) {
      console.error('Error linking guest to Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Auto sign-in as guest after sign out
      await signInAsGuest();
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
      await updateProfile(user, { displayName });
      // Force refresh user object
      setUser({ ...user, displayName });
    } catch (error) {
      console.error('Error updating display name:', error);
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
    linkGuestToEmail,
    linkGuestToGoogle,
    signOut,
    updateDisplayName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

