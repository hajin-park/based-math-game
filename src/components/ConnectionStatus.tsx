import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/firebase/config";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const connectedRef = ref(database, ".info/connected");

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val() === true;
      setIsConnected(connected);

      // Show alert when disconnected
      if (!connected) {
        setShowAlert(true);
      } else {
        // Hide alert after reconnection with a delay
        setTimeout(() => setShowAlert(false), 3000);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!showAlert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert variant={isConnected ? "default" : "destructive"}>
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          {isConnected
            ? "Connection restored"
            : "No internet connection. Some features may be unavailable."}
        </AlertDescription>
      </Alert>
    </div>
  );
}
