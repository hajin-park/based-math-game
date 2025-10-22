import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRoom, Room } from '@/hooks/useRoom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Check, Link2, Settings, ChevronDown, ChevronUp, X, Eye, Timer, UserCog } from 'lucide-react';
import { OFFICIAL_GAME_MODES, GameMode, getDifficultyColor } from '@/types/gameMode';
import KickedModal from '@/components/KickedModal';
import { PlaygroundSettings } from '@features/quiz';
import { QuestionSetting } from '@/contexts/GameContexts';

export default function RoomLobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaveRoom, setPlayerReady, startGame, subscribeToRoom, updateGameMode, kickPlayer, updateRoomSettings, transferHost } = useRoom();
  const [room, setRoom] = useState<Room | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [transferHostUid, setTransferHostUid] = useState<string | null>(null);
  const [showKickedModal, setShowKickedModal] = useState(false);
  const [showPlaygroundSettings, setShowPlaygroundSettings] = useState(false);
  const { toast } = useToast();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      // Handle room deletion (host disconnected)
      if (!updatedRoom) {
        // Prevent multiple navigations
        if (hasNavigatedRef.current) return;
        hasNavigatedRef.current = true;

        // Navigate first, then show toast
        navigate('/multiplayer', { replace: true });

        // Show toast after navigation
        setTimeout(() => {
          toast({
            title: 'Host Disconnected',
            description: 'The host has left the room.',
            variant: 'destructive',
          });
        }, 100);
        return;
      }

      // Check if current user was kicked
      if (user && updatedRoom.players[user.uid]?.kicked) {
        // Prevent multiple navigations
        if (hasNavigatedRef.current) return;
        hasNavigatedRef.current = true;

        // Show modal first
        setShowKickedModal(true);
        return;
      }

      setRoom(updatedRoom);

      // Navigate to game when it starts
      if (updatedRoom.status === 'playing') {
        navigate(`/multiplayer/game/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [roomId, subscribeToRoom, navigate, toast, user]);

  const handleLeave = async () => {
    if (!roomId) return;
    await leaveRoom(roomId);
    navigate('/multiplayer');
  };

  const handleToggleReady = async () => {
    if (!roomId) return;
    const newReady = !isReady;
    setIsReady(newReady);
    await setPlayerReady(roomId, newReady);
  };

  const handleStart = async () => {
    if (!roomId) return;
    try {
      await startGame(roomId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start game';
      alert(errorMessage);
    }
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Room code copied!",
        description: "Share this code with your friends to join.",
      });
    }
  };

  const handleKickPlayer = async (playerUid: string) => {
    if (!roomId) return;
    try {
      await kickPlayer(roomId, playerUid);
      toast({
        title: "Player removed",
        description: "The player has been removed from the room.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to kick player';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCopyInviteLink = () => {
    if (roomId) {
      const inviteLink = `${window.location.origin}/multiplayer/join?code=${roomId}`;
      navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({
        title: "Invite link copied!",
        description: "Share this link with your friends to join directly.",
      });
    }
  };

  const handleChangeGameMode = async (mode: GameMode) => {
    if (!roomId) return;
    try {
      await updateGameMode(roomId, mode);
      toast({
        title: "Game mode updated!",
        description: `Changed to ${mode.name}`,
      });
      setShowSettings(false);
      setShowPlaygroundSettings(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update game mode';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCustomPlayground = async (settings: { questions: QuestionSetting[]; duration: number }) => {
    if (!roomId) return;

    // Create a custom game mode from the playground settings
    const customMode: GameMode = {
      id: 'custom-playground',
      name: 'Custom Playground',
      description: 'Your custom quiz settings',
      isOfficial: false,
      questions: settings.questions,
      duration: settings.duration,
      difficulty: 'Custom',
    };

    try {
      await updateGameMode(roomId, customMode);
      toast({
        title: "Game mode updated!",
        description: "Changed to Custom Playground",
      });
      setShowSettings(false);
      setShowPlaygroundSettings(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update game mode';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleTransferHost = async () => {
    if (!roomId || !transferHostUid) return;

    try {
      await transferHost(roomId, transferHostUid);
      toast({
        title: "Host transferred!",
        description: "You are no longer the host.",
      });
      setTransferHostUid(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to transfer host';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isHost = user?.uid === room.hostUid;
  // Filter out host, disconnected, and kicked players from ready check
  const nonHostPlayers = Object.values(room.players).filter(
    (p) => p.uid !== room.hostUid && !p.disconnected && !p.kicked
  );
  const allReady = nonHostPlayers.length > 0 && nonHostPlayers.every((p) => p.ready);
  const readyCount = nonHostPlayers.filter((p) => p.ready).length;
  // Count only active (non-kicked) players
  const playerCount = Object.values(room.players).filter((p) => !p.kicked).length;

  const handleKickedModalClose = () => {
    setShowKickedModal(false);
    navigate('/multiplayer', { replace: true });
  };

  return (
    <>
      <KickedModal open={showKickedModal} onClose={handleKickedModalClose} />
      <div className="container mx-auto p-4">
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{room.gameMode.name}</CardTitle>
              <CardDescription>{room.gameMode.description}</CardDescription>
            </div>
            <Badge>{room.gameMode.difficulty}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Code & Invite */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Room Code</p>
                <p className="font-mono font-bold text-lg tracking-wider uppercase">{roomId}</p>
              </div>
              <Button
                onClick={handleCopyRoomId}
                variant="outline"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={handleCopyInviteLink}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              {linkCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Invite Link Copied!
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy Invite Link
                </>
              )}
            </Button>
          </div>

          {/* Game Settings (Host Only) */}
          {isHost && (
            <div className="border rounded-md">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="ghost"
                className="w-full justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="font-semibold">Game Settings</span>
                </div>
                {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {showSettings && !showPlaygroundSettings && (
                <div className="p-4 pt-0 space-y-4">
                  {/* Game Mode Selection */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select a different game mode (win counters will be preserved)
                    </p>
                    <div className="grid gap-2 max-h-64 overflow-y-auto">
                      {OFFICIAL_GAME_MODES.map((mode) => (
                        <Button
                          key={mode.id}
                          onClick={() => handleChangeGameMode(mode)}
                          variant={room.gameMode.id === mode.id ? "default" : "outline"}
                          className="justify-start h-auto p-3"
                          disabled={room.gameMode.id === mode.id}
                        >
                          <div className="flex flex-col items-start gap-1 w-full">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-semibold">{mode.name}</span>
                              <Badge className={getDifficultyColor(mode.difficulty)} variant="outline">
                                {mode.difficulty}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {mode.duration}s • {mode.questions.length} question types
                            </span>
                          </div>
                        </Button>
                      ))}

                      {/* Custom Playground Button */}
                      <Button
                        onClick={() => setShowPlaygroundSettings(true)}
                        variant={room.gameMode.id === 'custom-playground' ? "default" : "outline"}
                        className="justify-start h-auto p-3"
                      >
                        <div className="flex flex-col items-start gap-1 w-full">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-semibold">Custom Playground</span>
                            <Badge className={getDifficultyColor('Custom')} variant="outline">
                              Custom
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Create your own custom quiz settings
                          </span>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Host Controls */}
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm font-semibold">Host Controls</p>

                    {/* Allow Visual Aids Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="allow-visual-aids" className="cursor-pointer">
                            Allow Visual Aids
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Let players use grouped digits and index hints
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="allow-visual-aids"
                        checked={room.allowVisualAids ?? true}
                        onCheckedChange={async (checked) => {
                          if (roomId) {
                            try {
                              await updateRoomSettings(roomId, { allowVisualAids: checked });
                            } catch {
                              toast({
                                title: 'Error',
                                description: 'Failed to update visual aids setting',
                                variant: 'destructive',
                              });
                            }
                          }
                        }}
                      />
                    </div>

                    {/* Enable Countdown Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor="enable-countdown" className="cursor-pointer">
                            Enable Countdown
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Show 3-2-1 countdown before game starts
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="enable-countdown"
                        checked={room.enableCountdown ?? true}
                        onCheckedChange={async (checked) => {
                          if (roomId) {
                            try {
                              await updateRoomSettings(roomId, { enableCountdown: checked });
                            } catch {
                              toast({
                                title: 'Error',
                                description: 'Failed to update countdown setting',
                                variant: 'destructive',
                              });
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Playground Settings */}
              {showSettings && showPlaygroundSettings && (
                <div className="p-4 pt-0 space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Custom Playground Settings</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPlaygroundSettings(false)}
                    >
                      Back to Modes
                    </Button>
                  </div>
                  <PlaygroundSettings
                    onStartQuiz={handleCustomPlayground}
                    buttonText="Update Room Settings"
                    showHeader={false}
                  />
                </div>
              )}
            </div>
          )}

          {/* Players */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                Players ({playerCount}/{room.maxPlayers || 4})
              </h3>
              {nonHostPlayers.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {readyCount}/{nonHostPlayers.length} ready
                </span>
              )}
            </div>
            <div className="space-y-2">
              {Object.values(room.players).map((player) => {
                const isPlayerHost = player.uid === room.hostUid;
                const wins = player.wins || 0;
                const isDisconnected = player.disconnected === true;
                const isKicked = player.kicked === true;

                // Don't show kicked players
                if (isKicked) return null;

                return (
                  <div
                    key={player.uid}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className={isDisconnected ? 'text-muted-foreground' : ''}>
                        {player.displayName}
                        {wins > 0 && (
                          <span className="text-sm text-muted-foreground ml-1">
                            ({wins} {wins === 1 ? 'win' : 'wins'})
                          </span>
                        )}
                      </span>
                      {isPlayerHost && (
                        <Badge variant="outline">Host</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isDisconnected ? (
                        <Badge variant="destructive">Disconnected</Badge>
                      ) : isPlayerHost ? (
                        <Badge variant="secondary">Hosting</Badge>
                      ) : player.ready ? (
                        <Badge className="bg-green-600">Ready</Badge>
                      ) : (
                        <Badge variant="outline">Not Ready</Badge>
                      )}
                      {/* Transfer host button - only show for host, not for themselves, and not for disconnected players */}
                      {isHost && !isPlayerHost && !isDisconnected && (
                        <Button
                          onClick={() => setTransferHostUid(player.uid)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                          title="Transfer host to this player"
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Kick button - only show for host, not for themselves */}
                      {isHost && !isPlayerHost && (
                        <Button
                          onClick={() => handleKickPlayer(player.uid)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Game Info */}
          <div className="p-4 rounded-md bg-muted/50">
            <p className="text-sm">
              <span className="font-semibold">Duration:</span> {room.gameMode.duration}s
            </p>
            <p className="text-sm">
              <span className="font-semibold">Question Types:</span> {room.gameMode.questions.length}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleLeave} variant="outline" className="flex-1">
              Leave Room
            </Button>
            {isHost ? (
              <Button
                onClick={handleStart}
                disabled={!allReady || playerCount < 2}
                className="flex-1"
              >
                Start Game
              </Button>
            ) : (
              <Button
                onClick={handleToggleReady}
                variant={isReady ? 'outline' : 'default'}
                className="flex-1"
              >
                {isReady ? 'Not Ready' : 'Ready'}
              </Button>
            )}
          </div>

          {isHost && !allReady && nonHostPlayers.length > 0 && (
            <p className="text-sm text-center text-muted-foreground">
              Waiting for {nonHostPlayers.length - readyCount} player{nonHostPlayers.length - readyCount !== 1 ? 's' : ''} to be ready...
            </p>
          )}
          {isHost && playerCount < 2 && (
            <p className="text-sm text-center text-muted-foreground">
              Need at least 2 players to start
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transfer Host Confirmation Dialog */}
      <AlertDialog open={transferHostUid !== null} onOpenChange={(open) => !open && setTransferHostUid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Host Privileges?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer host privileges to{' '}
              <span className="font-semibold">
                {transferHostUid && room?.players[transferHostUid]?.displayName}
              </span>
              ? You will no longer be the host and will need to ready up to start the game.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTransferHost}>
              Transfer Host
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  );
}

