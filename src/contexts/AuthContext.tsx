import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
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
} from "firebase/auth";
import {
  ref,
  onValue,
  set,
  onDisconnect,
  serverTimestamp,
  remove,
} from "firebase/database";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { auth, database, firestore } from "@/firebase/config";
import { validateDisplayName } from "@/utils/displayNameValidator";
import {
  startCleanupService,
  stopCleanupService,
} from "@/services/cleanupService";

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
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to check if user is a guest
function isGuestUser(user: AppUser | null): user is GuestUser {
  return user !== null && "isGuest" in user && user.isGuest === true;
}

// Helper to generate guest ID
function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to generate random display name
function generateRandomDisplayName(): string {
  const adjectives = [
    "Swift",
    "Clever",
    "Bright",
    "Quick",
    "Sharp",
    "Smart",
    "Wise",
    "Bold",
    "Brave",
    "Cool",
    "Epic",
    "Fast",
    "Keen",
    "Nimble",
    "Rapid",
    "Sleek",
    "Stellar",
    "Super",
    "Turbo",
    "Ultra",
    "Vivid",
    "Witty",
    "Zesty",
    "Agile",
  ];
  const nouns = [
    "Coder",
    "Hacker",
    "Ninja",
    "Wizard",
    "Master",
    "Guru",
    "Pro",
    "Ace",
    "Champion",
    "Expert",
    "Genius",
    "Hero",
    "Legend",
    "Maven",
    "Sage",
    "Star",
    "Tiger",
    "Wolf",
    "Eagle",
    "Falcon",
    "Phoenix",
    "Dragon",
    "Lion",
    "Bear",
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);

  return `${adjective}${noun}${number}`;
}

// Helper to set cookie
function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Helper to get cookie
function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Helper to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Helper to get or create guest user from cookies/localStorage
function getOrCreateGuestUser(): GuestUser {
  // Try cookie first (persists across sessions)
  const cookieData = getCookie("guestUser");
  if (cookieData) {
    try {
      const parsed = JSON.parse(decodeURIComponent(cookieData));
      // Validate it's a valid guest user and not expired
      if (parsed.uid && parsed.isGuest && parsed.createdAt) {
        const daysSinceCreation =
          (Date.now() - parsed.createdAt) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 30) {
          // 30 day expiration
          // Update cookie expiration
          setCookie(
            "guestUser",
            encodeURIComponent(JSON.stringify(parsed)),
            30,
          );
          // Also store in localStorage for quick access
          localStorage.setItem("guestUser", JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch {
      // Invalid cookie data, create new
    }
  }

  // Try localStorage as fallback
  const stored = localStorage.getItem("guestUser");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Validate it's a valid guest user and not expired
      if (parsed.uid && parsed.isGuest && parsed.createdAt) {
        const daysSinceCreation =
          (Date.now() - parsed.createdAt) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 30) {
          // 30 day expiration
          // Store in cookie for persistence
          setCookie(
            "guestUser",
            encodeURIComponent(JSON.stringify(parsed)),
            30,
          );
          return parsed;
        }
      }
    } catch {
      // Invalid stored data, create new
    }
  }

  // Create new guest user
  const guestUser: GuestUser = {
    uid: generateGuestId(),
    displayName: "Guest",
    isGuest: true,
    createdAt: Date.now(),
  };

  // Store in both localStorage and cookie
  localStorage.setItem("guestUser", JSON.stringify(guestUser));
  setCookie("guestUser", encodeURIComponent(JSON.stringify(guestUser)), 30);

  return guestUser;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Start cleanup service when app loads
  useEffect(() => {
    startCleanupService();

    return () => {
      stopCleanupService();
    };
  }, []);

  // Set up presence system for all users (guest and authenticated)
  useEffect(() => {
    if (!user) return;

    const presenceRef = ref(database, `presence/${user.uid}`);
    const userRef = ref(database, `users/${user.uid}`);
    const connectedRef = ref(database, ".info/connected");

    const unsubscribe = onValue(connectedRef, async (snapshot) => {
      if (snapshot.val() === true) {
        // For guest users: Store in RTDB only (ephemeral)
        if (isGuestUser(user)) {
          const userData = {
            uid: user.uid,
            displayName: user.displayName || "Guest",
            isGuest: true,
            lastSeen: serverTimestamp(),
            lastConnected: serverTimestamp(), // Track last connection time for TTL
          };

          set(userRef, userData).catch((error) => {
            console.error("Error setting guest user data:", error);
          });

          // Set presence
          set(presenceRef, {
            uid: user.uid,
            online: true,
            lastSeen: serverTimestamp(),
          }).catch((error) => {
            console.error("Error setting guest presence:", error);
          });

          // Cancel any existing disconnect handlers before setting new ones
          await onDisconnect(userRef)
            .cancel()
            .catch(() => {
              // Ignore errors if no disconnect handler exists
            });
          await onDisconnect(presenceRef)
            .cancel()
            .catch(() => {
              // Ignore errors if no disconnect handler exists
            });

          // Set up disconnect handler to mark as disconnected with TTL
          // When guest disconnects, set lastDisconnected timestamp for 5-minute TTL
          onDisconnect(userRef)
            .update({
              online: false,
              lastSeen: serverTimestamp(),
              lastDisconnected: serverTimestamp(), // Track disconnect time for 5-minute TTL
            })
            .catch((error) => {
              console.error("Error setting guest disconnect handler:", error);
            });

          onDisconnect(presenceRef)
            .update({
              online: false,
              lastSeen: serverTimestamp(),
            })
            .catch((error) => {
              console.error(
                "Error setting guest presence disconnect handler:",
                error,
              );
            });
        } else {
          // For authenticated users: Store profile in Firestore (persistent)
          const userProfileRef = doc(firestore, `users/${user.uid}`);
          try {
            await setDoc(
              userProfileRef,
              {
                uid: user.uid,
                displayName: user.displayName || "User",
                email: user.email || null,
                photoURL: user.photoURL || null,
                createdAt: Date.now(),
                lastSeen: Date.now(),
              },
              { merge: true },
            );
          } catch (error) {
            console.error("Error setting user profile in Firestore:", error);
          }

          // Set presence in RTDB (ephemeral)
          set(presenceRef, {
            uid: user.uid,
            online: true,
            lastSeen: serverTimestamp(),
          }).catch((error) => {
            console.error("Error setting authenticated user presence:", error);
          });

          // Set offline status on disconnect
          onDisconnect(presenceRef)
            .set({
              uid: user.uid,
              online: false,
              lastSeen: serverTimestamp(),
            })
            .catch((error) => {
              console.error(
                "Error setting onDisconnect for authenticated user presence:",
                error,
              );
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
        localStorage.removeItem("guestUser");
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
      console.error("Error signing in as guest:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase auth state listener will handle setting the user
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    // Validate display name
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName });
      // Firebase auth state listener will handle setting the user
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if this is a new user by checking Firestore
      const userDocRef = doc(firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user - set random display name and clear photoURL
        const randomDisplayName = generateRandomDisplayName();
        await updateProfile(user, {
          displayName: randomDisplayName,
          photoURL: null, // Clear Google profile picture
        });

        // Create user profile in Firestore with generated avatar
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: randomDisplayName,
          email: user.email || null,
          photoURL: null, // Don't use Google profile picture
          createdAt: Date.now(),
          lastSeen: Date.now(),
        });
      }

      // Firebase auth state listener will handle setting the user
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      // Clear guest user data and create new one
      localStorage.removeItem("guestUser");
      deleteCookie("guestUser");
      const guestUser = getOrCreateGuestUser();
      setUser(guestUser);
      setIsGuest(true);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const updateDisplayName = async (displayName: string) => {
    if (!user) {
      throw new Error("Must be signed in to update display name");
    }

    // Validate display name
    const validation = validateDisplayName(displayName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      if (isGuestUser(user)) {
        // Update guest user in localStorage, cookie, and state
        const updatedGuest: GuestUser = { ...user, displayName };
        localStorage.setItem("guestUser", JSON.stringify(updatedGuest));
        setCookie(
          "guestUser",
          encodeURIComponent(JSON.stringify(updatedGuest)),
          30,
        );
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

        // Update user profile in Firestore
        const userProfileRef = doc(firestore, `users/${user.uid}`);
        await setDoc(
          userProfileRef,
          {
            displayName,
            lastSeen: Date.now(),
          },
          { merge: true },
        );

        // Update all leaderboard entries for this user
        // Query all leaderboard collections and update displayName
        const { writeBatch } = await import("firebase/firestore");
        const batch = writeBatch(firestore);

        // Get all leaderboard collections (they follow pattern: leaderboard-{gameModeId})
        // We need to update entries where the document ID matches the user's UID
        // Since we can't query across collections, we'll use a different approach:
        // Update the user's stats document which is used as source of truth
        const userStatsRef = doc(firestore, `userStats/${user.uid}`);
        await setDoc(
          userStatsRef,
          {
            displayName,
          },
          { merge: true },
        );

        // For leaderboards, we need to update each game mode's leaderboard entry
        // We'll do this by querying for documents with this user's ID
        // Since leaderboard entries use userId as document ID, we can directly update them
        // However, we don't know which game modes the user has entries in
        // So we'll use a batch update approach with known game modes
        const { OFFICIAL_GAME_MODES } = await import("@/types/gameMode");

        for (const mode of OFFICIAL_GAME_MODES) {
          const leaderboardEntryRef = doc(
            firestore,
            `leaderboard-${mode.id}`,
            user.uid,
          );
          // Check if entry exists before updating
          const entrySnapshot = await getDoc(leaderboardEntryRef);
          if (entrySnapshot.exists()) {
            batch.update(leaderboardEntryRef, { displayName });
          }
        }

        await batch.commit();

        // Force refresh user object
        setUser({ ...user, displayName });
      }
    } catch (error) {
      console.error("Error updating display name:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      throw new Error("Must be signed in to delete account");
    }

    try {
      if (isGuestUser(user)) {
        // Guest users can't delete accounts (they're temporary)
        throw new Error("Guest accounts cannot be deleted");
      }

      // Delete user data from Firestore (persistent data)
      const userProfileRef = doc(firestore, `users/${user.uid}`);
      const userStatsRef = doc(firestore, `userStats/${user.uid}`);

      await deleteDoc(userProfileRef).catch((error) => {
        console.error("Error deleting user profile from Firestore:", error);
      });

      await deleteDoc(userStatsRef).catch((error) => {
        console.error("Error deleting user stats from Firestore:", error);
      });

      // Delete presence from RTDB (ephemeral data)
      const presenceRef = ref(database, `presence/${user.uid}`);
      await remove(presenceRef);

      // Delete Firebase auth user
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      // Clear state and create new guest user
      localStorage.removeItem("guestUser");
      const guestUser = getOrCreateGuestUser();
      setUser(guestUser);
      setIsGuest(true);
    } catch (error) {
      console.error("Error deleting account:", error);
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
