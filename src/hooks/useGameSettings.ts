import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export interface GameSettings {
  groupedDigits: boolean;
  indexValueHints: boolean;
  countdownStart: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  groupedDigits: false,
  indexValueHints: false,
  countdownStart: true,
};

export function useGameSettings() {
  const { user, isGuest } = useAuth();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guest users always use default settings
    if (!user || isGuest) {
      setSettings(DEFAULT_GAME_SETTINGS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userRef = doc(firestore, `users/${user.uid}`);

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.gameSettings) {
            setSettings({
              groupedDigits:
                data.gameSettings.groupedDigits ??
                DEFAULT_GAME_SETTINGS.groupedDigits,
              indexValueHints:
                data.gameSettings.indexValueHints ??
                DEFAULT_GAME_SETTINGS.indexValueHints,
              countdownStart:
                data.gameSettings.countdownStart ??
                DEFAULT_GAME_SETTINGS.countdownStart,
            });
          } else {
            setSettings(DEFAULT_GAME_SETTINGS);
          }
        } else {
          setSettings(DEFAULT_GAME_SETTINGS);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading game settings:", error);
        setSettings(DEFAULT_GAME_SETTINGS);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, isGuest]);

  return { settings, loading };
}
