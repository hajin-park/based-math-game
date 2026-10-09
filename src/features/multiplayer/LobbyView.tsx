import { useState } from "react";
import { Check, MessageSquare, Play, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { roomApi, type Room, type RoomPlayer } from "@/hooks/useRoom";
import type { ChatMessage } from "@/hooks/useChat";
import { describeRoomMode } from "@/lib/roomMode";
import { cn } from "@/lib/utils";
import type { ConfirmRequest } from "./ConfirmDialog";
import { startBlocker } from "./lobbyRules";
import { PlayerList } from "./PlayerList";
import { RoomChat } from "./RoomChat";
import { RoomCodePanel } from "./RoomCodePanel";
import { RoomSettingsDialog } from "./RoomSettingsDialog";
import type { FeedEvent } from "./useRoomState";

export function LobbyView({
  room,
  myUid,
  names,
  messages,
  events,
  confirm,
}: {
  room: Room;
  myUid: string;
  names: Map<string, string>;
  messages: ChatMessage[];
  events: FeedEvent[];
  confirm: (request: ConfirmRequest) => void;
}) {
  const { updateDisplayName } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [seenChatAt, setSeenChatAt] = useState(() => Date.now());
  const [starting, setStarting] = useState(false);
  const me = room.players[myUid];
  const isHost = room.hostUid === myUid;
  const mode = room.engineMode;
  const blocker = startBlocker(room, names);
  const present = Object.values(room.players).filter((p) => !p.kicked);
  const hostName = names.get(room.hostUid) ?? "the host";

  const unread = chatOpen
    ? 0
    : messages.filter(
        (m) => m.senderId !== myUid && !m.isSystem && m.timestamp > seenChatAt,
      ).length;

  const rename = async (name: string) => {
    await roomApi.renamePlayer(room.id, name);
    // Keep the profile in sync so chat and future rooms use the new name.
    await updateDisplayName(name).catch(() => undefined);
  };

  const kick = (p: RoomPlayer) => {
    const name = names.get(p.uid) ?? p.displayName;
    confirm({
      title: `Remove ${name}?`,
      description: `${name} leaves the room and can't rejoin with this code.`,
      confirm: "Remove",
      destructive: true,
      onConfirm: () =>
        roomApi.kickPlayer(room.id, p.uid).catch(() =>
          toast({
            variant: "destructive",
            title: `Couldn't remove ${name}`,
            description: "Try again in a moment.",
          }),
        ),
    });
  };

  const makeHost = (p: RoomPlayer) => {
    const name = names.get(p.uid) ?? p.displayName;
    confirm({
      title: `Make ${name} the host?`,
      description: `${name} will start rounds and manage the room. You stay in as a player.`,
      confirm: "Make host",
      onConfirm: () =>
        roomApi.transferHost(room.id, p.uid).catch(() =>
          toast({
            variant: "destructive",
            title: "Host not changed",
            description: `${name} may have just left. Try again.`,
          }),
        ),
    });
  };

  const start = async () => {
    setStarting(true);
    try {
      await roomApi.startGame(room.id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Round not started",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setStarting(false);
    }
  };

  const toggleReady = () =>
    roomApi.setPlayerReady(room.id, !me?.ready).catch(() =>
      toast({
        variant: "destructive",
        title: "Couldn't update",
        description: "Check your connection.",
      }),
    );

  const statusText = isHost
    ? (blocker ?? "Everyone is ready. Start when you are.")
    : me?.ready
      ? `You're ready. Waiting for ${hostName} to start.`
      : "Press Ready when you're set.";

  return (
    <>
      <h1 className="sr-only">
        Lobby of room {room.id.slice(0, 4)} {room.id.slice(4)}
      </h1>
      <div className="container grid flex-1 gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:gap-10 lg:py-10">
        <div className="flex min-w-0 flex-col gap-8 pb-36 lg:pb-0">
          <RoomCodePanel code={room.id} />

          <section
            aria-labelledby="lobby-mode"
            className="flex flex-col gap-3 border-t pt-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <h2 id="lobby-mode" className="eyebrow">
                  Mode
                </h2>
                <p className="text-title font-semibold">
                  {mode?.name ?? "Custom set"}
                </p>
                {mode && (
                  <p className="text-body-sm text-muted-foreground">
                    {describeRoomMode(mode)}
                  </p>
                )}
              </div>
              {isHost && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings2 aria-hidden />
                  Room settings
                </Button>
              )}
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-body-sm text-muted-foreground">
              <li>{room.maxPlayers} seats</li>
              <li>Visual aids {room.allowVisualAids ? "allowed" : "off"}</li>
              <li>Same questions for everyone</li>
            </ul>
          </section>

          <section
            aria-labelledby="lobby-players"
            className="flex flex-col gap-3 border-t pt-6"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="lobby-players" className="text-title font-semibold">
                Players
              </h2>
              <span className="font-mono text-[0.8125rem] tabular-nums text-muted-foreground">
                {present.length} of {room.maxPlayers}
              </span>
            </div>
            <PlayerList
              room={room}
              myUid={myUid}
              names={names}
              onRename={rename}
              onKick={kick}
              onMakeHost={makeHost}
            />
          </section>

          {/* Actions: fixed to the bottom on phones/tablets, inline on desktop. */}
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur-sm",
              "px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3",
              "lg:static lg:rounded-lg lg:border lg:bg-card lg:p-4 lg:backdrop-blur-none",
            )}
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-3 lg:max-w-none">
              <p
                id="lobby-status"
                className="text-body-sm text-muted-foreground"
                aria-live="polite"
              >
                {statusText}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="relative lg:hidden"
                  onClick={() => setChatOpen(true)}
                  aria-label={unread ? `Chat, ${unread} unread` : "Chat"}
                >
                  <MessageSquare aria-hidden />
                  <span>Chat</span>
                  {unread > 0 && (
                    <span
                      aria-hidden
                      className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[0.6875rem] text-primary-foreground"
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Button>
                {isHost ? (
                  <Button
                    type="button"
                    size="lg"
                    className="flex-1 lg:flex-none"
                    onClick={start}
                    disabled={!!blocker || starting}
                    aria-describedby="lobby-status"
                  >
                    <Play aria-hidden />
                    {starting ? "Starting…" : "Start round"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    variant={me?.ready ? "secondary" : "default"}
                    className="flex-1 lg:flex-none"
                    aria-pressed={!!me?.ready}
                    onClick={toggleReady}
                  >
                    {me?.ready && <Check aria-hidden />}
                    Ready
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside
          aria-labelledby="lobby-chat"
          className="sticky top-20 hidden h-[min(42rem,calc(100dvh-7rem))] flex-col overflow-hidden rounded-lg border bg-card lg:flex"
        >
          <h2
            id="lobby-chat"
            className="border-b px-4 py-3 text-title-sm font-semibold"
          >
            Chat
          </h2>
          <RoomChat
            roomId={room.id}
            myUid={myUid}
            names={names}
            messages={messages}
            events={events}
            className="flex-1"
          />
        </aside>
      </div>

      <Sheet
        open={chatOpen}
        onOpenChange={(open) => {
          setChatOpen(open);
          if (!open) setSeenChatAt(Date.now());
        }}
      >
        <SheetContent
          side="bottom"
          className="flex h-[85dvh] flex-col gap-0 rounded-t-xl p-0"
        >
          <SheetHeader className="border-b px-4 py-3 text-left">
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription className="sr-only">
              Messages from everyone in the room
            </SheetDescription>
          </SheetHeader>
          <RoomChat
            roomId={room.id}
            myUid={myUid}
            names={names}
            messages={messages}
            events={events}
            className="flex-1"
          />
        </SheetContent>
      </Sheet>

      {isHost && (
        <RoomSettingsDialog
          room={room}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      )}
    </>
  );
}
