import { useEffect, useId, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { roomApi, type Room } from "@/hooks/useRoom";
import { describeRoomMode } from "@/lib/roomMode";
import { RoomCodeInput } from "@/features/multiplayer/RoomCodeInput";
import { DisplayNameField } from "@/features/multiplayer/DisplayNameField";
import { nameError } from "@/features/multiplayer/names";
import {
  codeHalves,
  isRoomCode,
  normalizeRoomCode,
} from "@/features/multiplayer/roomCode";
import { roomNames } from "@/features/multiplayer/names";
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
  const nameProblem = nameTouched ? nameError(name) : null;
  const shown = complete ? codeHalves(code).join(" ") : "";
  const codeMessage =
    error ??
    (preview.state === "missing"
      ? `There is no open room with code ${shown}. Check the code with your host.`
      : kicked
        ? "The host removed you from this room, so you can't rejoin it."
        : null);

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
    <div className="container max-w-md py-10 md:py-16">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-3 mb-6 text-muted-foreground"
      >
        <Link to="/multiplayer">
          <ArrowLeft aria-hidden />
          Multiplayer
        </Link>
      </Button>
      <PageHeader
        size="sm"
        eyebrow="Join a room"
        title={
          room ? (
            <>
              Join{" "}
              <em>
                {roomNames(Object.values(room.players)).get(room.hostUid) ??
                  "the host"}
              </em>
              ’s room
            </>
          ) : (
            <>
              Join a <em>room</em>
            </>
          )
        }
        lede={
          room
            ? undefined
            : "Type the 8-character code your host shared, or paste the invite link."
        }
      />

      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor={codeId} className="text-label font-medium">
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
                ? "text-[0.8125rem] text-destructive"
                : "text-[0.8125rem] text-muted-foreground"
            }
          >
            {codeMessage ??
              (complete ? "Code complete." : "Letters and digits, 8 in total.")}
          </p>
        </div>

        <RoomPreview preview={preview} />

        {!member && (
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
          className="w-full"
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

function RoomPreview({ preview }: { preview: Preview }) {
  if (preview.state === "loading")
    return (
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  if (preview.state !== "ready") return null;
  const { room } = preview;
  const players = Object.values(room.players).filter((p) => !p.disconnected);
  const status =
    room.status === "waiting"
      ? "In the lobby"
      : room.status === "playing"
        ? "Round in progress"
        : "Showing results";
  return (
    <section
      aria-label="Room"
      className="flex flex-col gap-1.5 rounded-lg border bg-card p-4"
    >
      <p className="text-title-sm font-semibold">
        {room.engineMode?.name ?? "Custom mode"}
      </p>
      {room.engineMode && (
        <p className="text-body-sm text-muted-foreground">
          {describeRoomMode(room.engineMode)}
        </p>
      )}
      <p className="mt-1 flex items-center gap-2 text-body-sm text-muted-foreground">
        <Users aria-hidden className="size-4" />
        <span>
          {players.length} of {room.maxPlayers} seats taken · {status}
        </span>
      </p>
    </section>
  );
}
