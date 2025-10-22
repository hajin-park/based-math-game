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
import { Copy, Check, Link2, Settings, ChevronDown, ChevronUp, X, Eye, Timer, UserCog, Users, Crown, Shield, WifiOff, Trophy, Clock, Layers, Play } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Room Lobby</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Waiting for players to join...
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Lobby Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-primary" />
                      <CardTitle className="text-2xl">{room.gameMode.name}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {room.gameMode.description}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`${getDifficultyColor(room.gameMode.difficulty)} shrink-0`}
                    variant="secondary"
                  >
                    {room.gameMode.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Room Code & Invite */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Room Code</p>
                        <p className="font-mono font-bold text-2xl tracking-wider uppercase text-primary">
                          {roomId}
                        </p>
                      </div>
                      <Button
                        onClick={handleCopyRoomId}
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
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
                  </CardContent>
                </Card>

                {/* Game Settings (Host Only) */}
                {isHost && (
                  <Card className="border-2">
                    <CardHeader
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">Game Settings</CardTitle>
                        </div>
                        {showSettings ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>

                    {showSettings && !showPlaygroundSettings && (
                      <CardContent className="space-y-6">
                        {/* Game Mode Selection */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Change Game Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Select a different mode (win counters will be preserved)
                          </p>
                          <div className="grid gap-3 max-h-80 overflow-y-auto pr-2">
                            {OFFICIAL_GAME_MODES.map((mode) => (
                              <Card
                                key={mode.id}
                                className={`cursor-pointer transition-all duration-300 border-2 ${
                                  room.gameMode.id === mode.id
                                    ? 'border-primary bg-primary/5'
                                    : 'hover:border-primary/50 hover:shadow-md'
                                }`}
                                onClick={() => room.gameMode.id !== mode.id && handleChangeGameMode(mode)}
                              >
                                <CardHeader className="p-4">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                      <CardTitle className="text-base">{mode.name}</CardTitle>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {mode.duration}s
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Layers className="h-3 w-3" />
                                          {mode.questions.length} types
                                        </span>
                                      </div>
                                    </div>
                                    <Badge
                                      className={getDifficultyColor(mode.difficulty)}
                                      variant="secondary"
                                    >
                                      {mode.difficulty}
                                    </Badge>
                                  </div>
                                </CardHeader>
                              </Card>
                            ))}

                            {/* Custom Playground Button */}
                            <Card
                              className={`cursor-pointer transition-all duration-300 border-2 ${
                                room.gameMode.id === 'custom-playground'
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:border-primary/50 hover:shadow-md'
                              }`}
                              onClick={() => setShowPlaygroundSettings(true)}
                            >
                              <CardHeader className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <CardTitle className="text-base">Custom Playground</CardTitle>
                                    <CardDescription className="text-xs">
                                      Create your own custom quiz settings
                                    </CardDescription>
                                  </div>
                                  <Badge
                                    className={getDifficultyColor('Custom')}
                                    variant="secondary"
                                  >
                                    Custom
                                  </Badge>
                                </div>
                              </CardHeader>
                            </Card>
                          </div>
                        </div>

                        {/* Host Controls */}
                        <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <Label className="text-base font-semibold">Host Controls</Label>
                          </div>

                          {/* Allow Visual Aids Toggle */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <div className="space-y-0.5">
                                <Label htmlFor="allow-visual-aids" className="cursor-pointer font-medium">
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
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Timer className="h-4 w-4 text-muted-foreground" />
                              <div className="space-y-0.5">
                                <Label htmlFor="enable-countdown" className="cursor-pointer font-medium">
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
                      </CardContent>
                    )}

                    {/* Custom Playground Settings */}
                    {showSettings && showPlaygroundSettings && (
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Custom Playground Settings</Label>
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
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Players List */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">
                          Players ({playerCount}/{room.maxPlayers || 4})
                        </CardTitle>
                      </div>
                      {nonHostPlayers.length > 0 && (
                        <Badge variant="secondary" className="text-sm">
                          {readyCount}/{nonHostPlayers.length} ready
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            isDisconnected
                              ? 'bg-muted/30 border-muted'
                              : 'bg-muted/50 border-muted hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${isDisconnected ? 'text-muted-foreground' : ''}`}>
                                  {player.displayName}
                                </span>
                                {isPlayerHost && (
                                  <Crown className="h-4 w-4 text-yellow-600" />
                                )}
                              </div>
                              {wins > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  {wins} {wins === 1 ? 'win' : 'wins'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isDisconnected ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <WifiOff className="h-3 w-3" />
                                Disconnected
                              </Badge>
                            ) : isPlayerHost ? (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                Host
                              </Badge>
                            ) : player.ready ? (
                              <Badge className="bg-success flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Ready
                              </Badge>
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
                                title="Kick player"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Game Info */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-lg font-bold">{room.gameMode.duration}s</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Question Types</p>
                          <p className="text-lg font-bold">{room.gameMode.questions.length}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleLeave}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    Leave Room
                  </Button>
                  {isHost ? (
                    <Button
                      onClick={handleStart}
                      disabled={!allReady || playerCount < 2}
                      size="lg"
                      className="flex-1 shadow-sm"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Start Game
                    </Button>
                  ) : (
                    <Button
                      onClick={handleToggleReady}
                      variant={isReady ? 'outline' : 'default'}
                      size="lg"
                      className="flex-1 shadow-sm"
                    >
                      {isReady ? (
                        <>
                          <X className="mr-2 h-5 w-5" />
                          Not Ready
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Ready
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Status Messages */}
                {isHost && !allReady && nonHostPlayers.length > 0 && (
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">
                      Waiting for {nonHostPlayers.length - readyCount} player{nonHostPlayers.length - readyCount !== 1 ? 's' : ''} to be ready...
                    </p>
                  </div>
                )}
                {isHost && playerCount < 2 && (
                  <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-warning-foreground">
                      Need at least 2 players to start
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Game Summary */}
          <div className="space-y-6">
            <Card className="border-2 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Game Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Mode</span>
                    <Badge variant="secondary">{room.gameMode.difficulty}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-semibold">{room.gameMode.duration}s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Players</span>
                    <span className="font-semibold">{playerCount}/{room.maxPlayers || 4}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Visual Aids</span>
                    <Badge variant={room.allowVisualAids ? "default" : "outline"}>
                      {room.allowVisualAids ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Countdown</span>
                    <Badge variant={room.enableCountdown ? "default" : "outline"}>
                      {room.enableCountdown ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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

