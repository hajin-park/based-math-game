/**
 * /join/:code and /multiplayer/join — the room code in candidate boxes, the
 * room itself on an index card (drill, seats, host), your name, Join.
 */
import { useEffect, useId, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { roomApi, type Room } from "@/hooks/useRoom";
import { describeRoomMode } from "@/lib/roomMode";
import { RoomCodeInput } from "@/features/multiplayer/RoomCodeInput";
import { DisplayNameField } from "@/features/multiplayer/DisplayNameField";
import { FIELD_LABEL } from "@/features/multiplayer/FormRow";
import { nameError, roomNames } from "@/features/multiplayer/names";
import {
  codeHalves,
  isRoomCode,
  normalizeRoomCode,
} from "@/features/multiplayer/roomCode";
import { useJoinRoom } from "@/features/multiplayer/useJoinRoom";

type Preview =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "missing" }
  | { state: "ready"; room: Room };

export default function JoinRoom() {
  const params = useParams();
  const [search] = useSearchParams();
  const { user } = useAuth();
  const initial = normalizeRoomCode(params.code ?? search.get("code") ?? "");
  const [code, setCode] = useState(initial);
  const [name, setName] = useState(user?.displayName ?? "");
  const [nameTouched, setNameTouched] = useState(false);
  const [preview, setPreview] = useState<Preview>({ state: "idle" });
  const { join, pending, error, setError } = useJoinRoom();
  const codeId = useId();
  const complete = isRoomCode(code);

  useEffect(() => {
    if (!nameTouched && user?.displayName) setName(user.displayName);
  }, [user?.displayName, nameTouched]);

  // Look the room up as soon as the code is complete.
  useEffect(() => {
    if (!complete) {
      setPreview({ state: "idle" });
      return;
    }
    let cancelled = false;
    setPreview({ state: "loading" });
    roomApi
      .peekRoom(code)
      .then((room) => {
        if (!cancelled)
          setPreview(room ? { state: "ready", room } : { state: "missing" });
      })
      .catch(() => !cancelled && setPreview({ state: "missing" }));
    return () => {
      cancelled = true;
    };
  }, [code, complete]);

  const room = preview.state === "ready" ? preview.room : null;
  const mine = room && user ? room.players[user.uid] : undefined;
  const kicked = !!mine?.kicked;
  const member = !!mine && !kicked;
  // A removed player gets no look inside the room.
  const shownRoom = kicked ? null : room;
  const nameProblem = nameTouched ? nameError(name) : null;
  const shown = complete ? codeHalves(code).join(" ") : "";
  const codeMessage =
    error ??
    (preview.state === "missing"
      ? `There is no open room with code ${shown}. Check the code with your host.`
      : kicked
        ? "The host removed you from this room, so you can't rejoin it."
        : null);
  const hostName = shownRoom
    ? (roomNames(Object.values(shownRoom.players)).get(shownRoom.hostUid) ??
      "the host")
    : null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pending || !complete) return;
    if (!member && nameError(name)) {
      setNameTouched(true);
      return;
    }
    void join(code, member ? undefined : name);
  };

  return (
    <div className="container max-w-lg py-8 md:py-14">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-3 mb-5 text-muted-foreground"
      >
        <Link to="/multiplayer">
          <ArrowLeft aria-hidden />
          Rooms
        </Link>
      </Button>
      <PageHeader
        size="sm"
        eyebrow="Rooms · Join"
        title={hostName ? `Join ${hostName}’s room` : "Join a room"}
        lede={
          shownRoom
            ? undefined
            : "Type the 8-character code your host shared, or paste the invite link."
        }
      />

      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-7">
        <div className="flex flex-col gap-2.5">
          <label htmlFor={codeId} className={FIELD_LABEL}>
            Room code
          </label>
          <RoomCodeInput
            id={codeId}
            value={code}
            onValueChange={(v) => {
              setCode(v);
              setError(null);
            }}
            invalid={!!codeMessage}
            describedBy={`${codeId}-msg`}
            autoFocus={!initial}
          />
          <p
            id={`${codeId}-msg`}
            aria-live="polite"
            className={
              codeMessage
                ? "font-sans text-[0.8125rem] text-destructive"
                : "font-sans text-[0.8125rem] text-muted-foreground"
            }
          >
            {codeMessage ??
              (complete ? "Code complete." : "Letters and digits, 8 in total.")}
          </p>
        </div>

        {!kicked && <RoomPreview preview={preview} hostName={hostName} />}

        {!member && !kicked && (
          <DisplayNameField
            value={name}
            onChange={(v) => {
              setName(v);
              setNameTouched(true);
            }}
            error={nameProblem}
          />
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full justify-between"
          disabled={
            pending || !complete || preview.state === "missing" || kicked
          }
        >
          {pending ? "Joining…" : member ? "Back to the room" : "Join room"}
          {!pending && <ArrowRight aria-hidden />}
        </Button>
      </form>
    </div>
  );
}

/** One ruled line of the index card: a small-caps label, then the value. */
function CardLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-9 grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-3 border-b border-primary/20 py-1.5 last:border-b-0">
      <dt className="smallcaps">{label}</dt>
      <dd className="min-w-0 text-body-sm">{children}</dd>
    </div>
  );
}

/** The room on an index card: a heading line in the spot colour, ruled below. */
function RoomPreview({
  preview,
  hostName,
}: {
  preview: Preview;
  hostName: string | null;
}) {
  if (preview.state === "loading")
    return (
      <div className="paper-sheet flex flex-col gap-3 rounded-sm px-5 py-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
    );
  if (preview.state !== "ready") return null;
  const { room } = preview;
  // Everyone not removed holds a seat, connected or not.
  const taken = Object.values(room.players).filter((p) => !p.kicked).length;
  const status =
    room.status === "waiting"
      ? "In the lobby"
      : room.status === "playing"
        ? "Round in progress"
        : "Showing results";
  return (
    <section
      aria-label="Room"
      className="paper-sheet rounded-sm px-5 pb-2 pt-4 dark:bg-card"
    >
      <p className="border-b-2 border-primary/70 pb-2 font-serif text-title font-bold">
        {room.engineMode?.name ?? "Custom mode"}
      </p>
      <dl className="flex flex-col">
        {room.engineMode && (
          <CardLine label="Rules">{describeRoomMode(room.engineMode)}</CardLine>
        )}
        <CardLine label="Seats">
          <span className="font-mono">{taken}</span> of{" "}
          <span className="font-mono">{room.maxPlayers}</span> taken
        </CardLine>
        {hostName && <CardLine label="Host">{hostName}</CardLine>}
        <CardLine label="Now">{status}</CardLine>
      </dl>
    </section>
  );
}
