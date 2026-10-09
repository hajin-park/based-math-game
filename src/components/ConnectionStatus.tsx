import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/firebase/config";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const connectedRef = ref(database, ".info/connected");
    // RTDB reports "disconnected" for the first moments of every page load.
    // Only surface a problem that persists, so online users never see a flash.
    let showTimer: number | undefined;
    let hideTimer: number | undefined;

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val() === true;
      setIsConnected(connected);
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);

      if (!connected) {
        showTimer = window.setTimeout(() => setShowAlert(true), 4000);
      } else {
        // Briefly confirm reconnection, then hide.
        hideTimer = window.setTimeout(() => setShowAlert(false), 3000);
      }
    });

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      unsubscribe();
    };
  }, []);

  if (!showAlert) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:max-w-sm">
      <Alert
        variant={isConnected ? "default" : "destructive"}
        className="bg-popover shadow-lg"
      >
        {isConnected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription>
          {isConnected
            ? "Connection restored"
            : "No internet connection. Some features may be unavailable."}
        </AlertDescription>
      </Alert>
    </div>
  );
}
