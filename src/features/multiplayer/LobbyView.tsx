import { useState } from "react";
import { Check, MessageSquare, Play } from "lucide-react";

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
      description: `${name} leaves the room and can't rejoin with this code.${p.disconnected ? " To keep the door open for them, free their seat instead." : ""}`,
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

  const freeSeat = (p: RoomPlayer) => {
    const name = names.get(p.uid) ?? p.displayName;
    confirm({
      title: `Free ${name}'s seat?`,
      description: `${name} lost connection. Their seat opens for someone else. They aren't banned: they can rejoin with the code or link while a seat is free, starting again as a new player.`,
      confirm: "Free seat",
      onConfirm: () =>
        roomApi.freeSeat(room.id, p.uid).catch(() =>
          toast({
            variant: "destructive",
            title: "Seat not freed",
            description: `${name} may be back already.`,
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
      <div className="container grid flex-1 gap-8 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] md:gap-8 md:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-9 pb-36 md:pb-0">
          <RoomCodePanel code={room.id} />

          <section aria-labelledby="lobby-mode" className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-foreground/25 pb-1.5">
              <h2 id="lobby-mode" className="smallcaps">
                Drill
              </h2>
              {isHost && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="font-sans text-label"
                  onClick={() => setSettingsOpen(true)}
                >
                  Room settings
                </Button>
              )}
            </div>
            <p className="font-serif text-title font-bold">
              {mode?.name ?? "Custom set"}
            </p>
            <p className="text-body-sm text-muted-foreground">
              {mode && <>{describeRoomMode(mode)} · </>}
              <span className="font-mono">{room.maxPlayers}</span> seats ·
              visual aids {room.allowVisualAids ? "allowed" : "off"} · same
              questions for everyone
            </p>
          </section>

          <section
            aria-labelledby="lobby-players"
            className="flex flex-col gap-3"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id="lobby-players"
                className="font-serif text-title font-bold"
              >
                Register
              </h2>
              <span className="font-sans text-label text-muted-foreground">
                <span className="font-mono text-foreground">
                  {present.length}
                </span>{" "}
                of <span className="font-mono">{room.maxPlayers}</span> seats
                taken
              </span>
            </div>
            <PlayerList
              room={room}
              myUid={myUid}
              names={names}
              onRename={rename}
              onKick={kick}
              onFreeSeat={freeSeat}
              onMakeHost={makeHost}
            />
          </section>

          {/* Actions: fixed to the bottom on phones, the foot of the page on desktop. Solid paper, no glass. */}
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-20 border-t-[3px] border-double border-foreground/60 bg-background",
              "px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3",
              "md:sticky md:bottom-0 md:-mt-3 md:px-0 md:pb-6 md:pt-4",
            )}
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-3 md:max-w-none md:flex-row md:items-center md:justify-between md:gap-6">
              <p
                id="lobby-status"
                className="text-body-sm text-muted-foreground"
                aria-live="polite"
              >
                {statusText}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="relative md:hidden"
                  onClick={() => setChatOpen(true)}
                  aria-label={unread ? `Chat, ${unread} unread` : "Chat"}
                >
                  <MessageSquare aria-hidden />
                  <span>Chat</span>
                  {unread > 0 && (
                    <span
                      aria-hidden
                      className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-foreground px-1 font-mono text-[0.6875rem] text-background"
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Button>
                {isHost ? (
                  <Button
                    type="button"
                    size="lg"
                    className="flex-1 md:min-w-44 md:flex-none"
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
                    className="flex-1 md:min-w-36 md:flex-none"
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
          className="paper-sheet sticky top-20 hidden h-[min(44rem,calc(100dvh-7rem))] flex-col overflow-hidden rounded-sm md:flex"
        >
          <h2
            id="lobby-chat"
            className="flex items-baseline justify-between border-b border-foreground/25 px-4 py-3 font-serif text-title-sm font-bold"
          >
            Chat
            <span className="font-sans text-[0.75rem] font-medium text-muted-foreground">
              Everyone in the room
            </span>
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
          className="flex h-[85dvh] flex-col gap-0 rounded-t-sm p-0"
        >
          <SheetHeader className="border-b border-foreground/25 px-4 py-3 text-left">
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
