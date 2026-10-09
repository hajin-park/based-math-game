/**
 * The room route (/multiplayer/lobby/:roomId). One live subscription drives
 * three phases rendered in place: lobby (waiting), game (playing) and
 * results (finished). Components live in src/features/multiplayer.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { DoorOpen, Info, LogOut, Wifi, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logomark } from "@/components/ui/logo";
import RouteFallback from "@/components/RouteFallback";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { roomApi, type Room } from "@/hooks/useRoom";
import { cn } from "@/lib/utils";
import {
  ConfirmDialog,
  KickedDialog,
  type ConfirmRequest,
} from "@/features/multiplayer/ConfirmDialog";
import { GameView } from "@/features/multiplayer/GameView";
import { LobbyView } from "@/features/multiplayer/LobbyView";
import { ResultsView } from "@/features/multiplayer/ResultsView";
import { roomNames } from "@/features/multiplayer/names";
import {
  codeHalves,
  isRoomCode,
  normalizeRoomCode,
} from "@/features/multiplayer/roomCode";
import {
  useChatMessages,
  useLinkState,
  useRoomState,
  type FeedEvent,
  type LinkState,
} from "@/features/multiplayer/useRoomState";

export default function RoomLobby() {
  const params = useParams();
  const roomId = normalizeRoomCode(params.roomId ?? "");
  const { user, loading } = useAuth();

  if (!isRoomCode(roomId)) return <MissingRoom code={params.roomId ?? ""} />;
  if (!user) return loading ? <RouteFallback /> : <MissingRoom code={roomId} />;
  return <RoomPage key={roomId} roomId={roomId} myUid={user.uid} />;
}

/** Old per-phase URLs (/multiplayer/game|results/:id) land on the room page. */
export function ToRoom() {
  const { roomId } = useParams();
  return <Navigate to={`/multiplayer/lobby/${roomId ?? ""}`} replace />;
}

function RoomPage({ roomId, myUid }: { roomId: string; myUid: string }) {
  const navigate = useNavigate();
  const { room, state, events } = useRoomState(roomId, myUid);
  const messages = useChatMessages(roomId);
  const link = useLinkState();
  const [confirmReq, setConfirmReq] = useState<ConfirmRequest | null>(null);
  const leaving = useRef(false);
  const seenRoom = useRef(false);
  if (room) seenRoom.current = true;

  const names = useMemo(
    () => roomNames(room ? Object.values(room.players) : []),
    [room],
  );

  const leave = useCallback(
    async (closes = false) => {
      leaving.current = true;
      try {
        await roomApi.leaveRoom(roomId);
      } catch {
        // Already gone or offline: the server marks us disconnected anyway.
      }
      navigate(
        `/multiplayer?reason=${closes ? "closed-by-you" : "left"}&code=${roomId}`,
      );
    },
    [navigate, roomId],
  );

  const askLeave = useCallback(() => {
    if (!room) return leave();
    const others = Object.values(room.players).filter(
      (p) => p.uid !== myUid && !p.kicked,
    );
    const present = others.filter((p) => !p.disconnected);
    const successor = [...present].sort(
      (a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0),
    )[0];
    const description =
      present.length === 0
        ? "You're the only one here, so the room closes."
        : room.hostUid === myUid && successor
          ? `${names.get(successor.uid) ?? "Another player"} becomes the host.${room.status === "playing" ? " The round ends for everyone." : ""}`
          : room.status === "playing"
            ? "Your progress in this round stays on the scoreboard."
            : "You can rejoin with the code while the room is open.";
    setConfirmReq({
      title: "Leave this room?",
      description,
      confirm: "Leave room",
      onConfirm: () => leave(present.length === 0),
    });
  }, [room, myUid, names, leave]);

  const me = room?.players[myUid];

  if (state === "loading") return <RouteFallback />;
  if (state === "missing" || !room) {
    if (leaving.current) return <RouteFallback />;
    return <MissingRoom code={roomId} closed={seenRoom.current} />;
  }
  if (me?.kicked) {
    return (
      <KickedDialog
        open
        onClose={() => navigate(`/multiplayer?reason=kicked&code=${roomId}`)}
      />
    );
  }
  if (!me) {
    if (leaving.current) return <RouteFallback />;
    // Opened the room URL without being in it: one click to join.
    return <Navigate to={`/multiplayer/join/${roomId}`} replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <RoomBar room={room} link={link} onLeave={askLeave} />
      <EventBanner events={events} />
      {room.status === "waiting" || !room.engineMode ? (
        <LobbyView
          room={room}
          myUid={myUid}
          names={names}
          messages={messages}
          events={events}
          confirm={setConfirmReq}
        />
      ) : room.status === "playing" ? (
        <GameView
          key={room.serverStartedAt}
          room={room}
          myUid={myUid}
          names={names}
          link={link}
          confirm={setConfirmReq}
        />
      ) : (
        <ResultsView
          room={room}
          myUid={myUid}
          names={names}
          messages={messages}
          events={events}
          onLeave={askLeave}
        />
      )}
      <ConfirmDialog request={confirmReq} onClose={() => setConfirmReq(null)} />
    </div>
  );
}

function RoomBar({
  room,
  link,
  onLeave,
}: {
  room: Room;
  link: LinkState;
  onLeave: () => void;
}) {
  const [a, b] = codeHalves(room.id);
  const phase =
    room.status === "waiting"
      ? "Lobby"
      : room.status === "playing"
        ? "Playing"
        : "Results";
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center gap-3">
        <Logomark className="size-6 shrink-0" aria-hidden />
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="eyebrow hidden xs:inline">{phase}</span>
          <span className="font-mono text-[0.9375rem] font-medium tracking-[0.12em]">
            {a}
            <span aria-hidden className="inline-block w-[0.35em]" />
            {b}
          </span>
        </div>
        <LinkBadge link={link} />
        <div className="ml-auto">
          <Button type="button" variant="ghost" size="sm" onClick={onLeave}>
            <LogOut aria-hidden />
            Leave
          </Button>
        </div>
      </div>
    </header>
  );
}

function LinkBadge({ link }: { link: LinkState }) {
  const text =
    link === "online"
      ? "Connected"
      : link === "reconnecting"
        ? "Reconnecting…"
        : "Connecting…";
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 text-[0.75rem]",
        link === "online" ? "text-muted-foreground" : "text-warning",
      )}
    >
      {link === "online" ? (
        <Wifi aria-hidden className="size-3.5" />
      ) : (
        <WifiOff aria-hidden className="size-3.5" />
      )}
      <span className={cn(link === "online" && "sr-only sm:not-sr-only")}>
        {text}
      </span>
    </span>
  );
}

/** Brief, visible notice for host changes and departures (also spoken). */
function EventBanner({ events }: { events: FeedEvent[] }) {
  const [shown, setShown] = useState<FeedEvent | null>(null);
  const lastId = useRef<string | null>(null);
  useEffect(() => {
    const latest = [...events].reverse().find((e) => e.important);
    if (!latest || latest.id === lastId.current) return;
    lastId.current = latest.id;
    setShown(latest);
    const t = window.setTimeout(() => setShown(null), 6000);
    return () => window.clearTimeout(t);
  }, [events]);
  return (
    <div role="status" aria-live="polite" className="container">
      {shown && (
        <p className="mt-3 flex items-center gap-2 rounded-md border border-info/25 bg-info/[0.06] px-3 py-2 text-body-sm motion-safe:animate-rise">
          <Info aria-hidden className="size-4 shrink-0 text-info" />
          {shown.text}
        </p>
      )}
    </div>
  );
}

function MissingRoom({ code, closed }: { code: string; closed?: boolean }) {
  const shown = isRoomCode(code) ? codeHalves(code).join(" ") : code;
  useEffect(() => {
    if (closed)
      toast({ title: "Room closed", description: `Room ${shown} has closed.` });
  }, [closed, shown]);
  return (
    <div className="container flex min-h-dvh items-center justify-center py-16">
      <section className="flex max-w-md flex-col items-center gap-5 rounded-xl border border-dashed border-border-strong px-6 py-12 text-center">
        <span
          aria-hidden
          className="grid size-11 place-items-center rounded-lg border bg-card text-muted-foreground shadow-xs"
        >
          <DoorOpen className="size-5" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-headline font-medium">
            {closed ? "This room has closed" : "Room not found"}
          </h1>
          <p className="text-body-sm text-muted-foreground text-pretty">
            {closed
              ? "Everyone left, or the room sat idle. Start a new one, or join another with its code."
              : `There is no open room with code ${shown || "this code"}. Check the code with your host; rooms close when everyone leaves.`}
          </p>
        </div>
        <div className="flex flex-col gap-2 xs:flex-row">
          <Button asChild>
            <Link to="/multiplayer">Join another room</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/multiplayer/create">Create a room</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
