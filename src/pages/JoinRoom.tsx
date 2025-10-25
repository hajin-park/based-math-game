import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PaperCard,
  PaperCardContent,
  PaperCardDescription,
  PaperCardHeader,
  PaperCardTitle,
  SectionHeader,
  StickyNote,
  NotebookInput,
} from "@/components/ui/academic";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/hooks/useRoom";
import { LogIn, Hash } from "lucide-react";

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
    <div className="container mx-auto px-fluid py-fluid flex items-center justify-center safe-vh-full">
      <div className="w-full max-w-md flex-gap-fluid flex flex-col animate-in">
        {/* Header */}
        <SectionHeader
          title="Join Room"
          description="Enter the room code to join your friends"
          icon={LogIn}
          align="center"
          titleSize="xl"
        />

        <PaperCard variant="folded" padding="none" className="shadow-lg">
          <PaperCardHeader className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Hash className="h-6 w-6 text-primary" />
              </div>
              <div>
                <PaperCardTitle className="text-2xl">Room Code</PaperCardTitle>
                <PaperCardDescription className="text-base">
                  Enter the 8-character code shared by the host
                </PaperCardDescription>
              </div>
            </div>
          </PaperCardHeader>
          <PaperCardContent className="p-6 pt-0 space-y-6">
            {error && <StickyNote variant="warning">{error}</StickyNote>}

            <div className="space-y-3">
              <NotebookInput
                id="roomId"
                placeholder="ABCD1234"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                maxLength={8}
                className="uppercase font-mono tracking-wider text-2xl h-14 text-center"
                autoFocus
                variant="ruled"
              />
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
          </PaperCardContent>
        </PaperCard>
      </div>
    </div>
  );
}
