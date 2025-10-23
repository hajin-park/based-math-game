import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoom } from "@/hooks/useRoom";
import { LogIn, Hash, AlertCircle, Info } from "lucide-react";

export default function JoinRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinRoom, loading } = useRoom();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");

  // Pre-fill room ID from URL parameter if present
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setRoomId(codeFromUrl);
    }
  }, [searchParams]);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError("Please enter a room code");
      return;
    }

    try {
      setError("");
      // Convert to uppercase for case-insensitive matching
      const normalizedRoomId = roomId.trim().toUpperCase();
      await joinRoom(normalizedRoomId);
      navigate(`/multiplayer/lobby/${normalizedRoomId}`);
    } catch (error: unknown) {
      console.error("Failed to join room:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to join room. Please check the room code and try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md space-y-6 animate-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LogIn className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Join Room</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Enter the room code to join your friends
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Hash className="h-6 w-6 text-primary" />
              Room Code
            </CardTitle>
            <CardDescription className="text-base">
              Enter the 8-character code shared by the host
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="roomId" className="text-base font-semibold">
                Code
              </Label>
              <Input
                id="roomId"
                placeholder="ABCD1234"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                maxLength={8}
                className="uppercase font-mono tracking-wider text-2xl h-14 text-center transition-all focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  The room code is case-insensitive and should be 8 characters
                  long
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("/multiplayer")}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRoom}
                disabled={loading || roomId.length !== 8}
                size="lg"
                className="flex-1 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="animate-pulse">Joining...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Join Room
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
