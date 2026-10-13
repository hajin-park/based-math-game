import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Check,
  Crown,
  MoreHorizontal,
  Pencil,
  UserMinus,
  WifiOff,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PenTick } from "@/components/ui/pen-mark";
import type { Room, RoomPlayer } from "@/hooks/useRoom";
import { cn } from "@/lib/utils";
import { NAME_MAX, nameError } from "./names";
import { seatOrder } from "./lobbyRules";
import { YouTag } from "./PlayerAvatar";

export interface PlayerListProps {
  room: Room;
  myUid: string;
  names: Map<string, string>;
  onRename: (name: string) => Promise<void>;
  onKick: (player: RoomPlayer) => void;
  onMakeHost: (player: RoomPlayer) => void;
}

/**
 * The class register: one ruled line per seat, numbered by the seat each
 * player actually holds. Names, the host marked, a tick in the box when a
 * player is ready (spoken as text), empty seats left as blank lines.
 */
export function PlayerList({
  room,
  myUid,
  names,
  onRename,
  onKick,
  onMakeHost,
}: PlayerListProps) {
  const players = seatOrder(room);
  const iAmHost = room.hostUid === myUid;
  const bySeat = new Map<number, RoomPlayer>();
  const unseated: RoomPlayer[] = [];
  for (const p of players) {
    const n = Number(p.slot);
    if (p.slot !== undefined && Number.isInteger(n) && !bySeat.has(n))
      bySeat.set(n, p);
    else unseated.push(p);
  }
  const lines = Math.max(
    room.maxPlayers,
    bySeat.size ? Math.max(...bySeat.keys()) + 1 : 0,
  );
  const seats: (RoomPlayer | undefined)[] = Array.from(
    { length: lines },
    (_, i) => bySeat.get(i),
  );
  // Legacy players without a seat fill the first blank lines.
  for (const p of unseated) {
    const free = seats.findIndex((x) => !x);
    if (free === -1) seats.push(p);
    else seats[free] = p;
  }
  let firstEmpty = true;

  return (
    <div>
      <div
        aria-hidden
        className="rule-double grid grid-cols-[2.25rem_minmax(0,1fr)_3.5rem] items-end gap-3 pb-1.5 sm:grid-cols-[2.5rem_minmax(0,1fr)_4rem]"
      >
        <span className="smallcaps">No.</span>
        <span className="smallcaps">Name</span>
        <span className="smallcaps text-center">Ready</span>
      </div>
      <ol aria-label="Seats">
        {seats.map((p, i) => {
          if (p)
            return (
              <PlayerRow
                key={p.uid}
                seat={i + 1}
                player={p}
                name={names.get(p.uid) ?? p.displayName}
                you={p.uid === myUid}
                host={p.uid === room.hostUid}
                canManage={iAmHost && p.uid !== myUid}
                onRename={onRename}
                onKick={() => onKick(p)}
                onMakeHost={() => onMakeHost(p)}
              />
            );
          const hint = firstEmpty;
          firstEmpty = false;
          return (
            <li
              key={`empty-${i}`}
              className="grid min-h-12 grid-cols-[2.25rem_minmax(0,1fr)_3.5rem] items-center gap-3 border-b border-primary/20 sm:grid-cols-[2.5rem_minmax(0,1fr)_4rem]"
            >
              <span className="font-mono text-[0.9375rem] text-muted-foreground/70">
                {i + 1}
              </span>
              <span className="font-serif text-body-sm italic text-muted-foreground">
                {hint ? (
                  "Empty seat · share the code"
                ) : (
                  <span className="sr-only">Empty seat</span>
                )}
              </span>
              <span />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PlayerRow({
  seat,
  player,
  name,
  you,
  host,
  canManage,
  onRename,
  onKick,
  onMakeHost,
}: {
  seat: number;
  player: RoomPlayer;
  name: string;
  you: boolean;
  host: boolean;
  canManage: boolean;
  onRename: (name: string) => Promise<void>;
  onKick: () => void;
  onMakeHost: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const away = !!player.disconnected;

  return (
    <li
      className="grid min-h-12 grid-cols-[2.25rem_minmax(0,1fr)_3.5rem] items-center gap-3 border-b border-primary/20 py-1 sm:grid-cols-[2.5rem_minmax(0,1fr)_4rem]"
      data-player={player.uid}
    >
      <span className="font-mono text-[0.9375rem] text-primary">
        <span className="sr-only">Seat </span>
        {seat}
      </span>
      {editing ? (
        <div className="col-span-2">
          <NameEditor
            initial={player.displayName}
            onCancel={() => setEditing(false)}
            onSave={async (n) => {
              await onRename(n);
              setEditing(false);
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <span
                className={cn(
                  "truncate font-serif text-[1.0625rem] font-bold leading-snug",
                  you && "highlighter",
                  away && "font-medium text-muted-foreground",
                )}
              >
                {name}
              </span>
              {you && <YouTag />}
              {host && (
                <span className="font-serif text-[0.9375rem] font-medium tracking-[0.06em] text-foreground [font-variant-caps:all-small-caps]">
                  host
                </span>
              )}
              {away && (
                <span className="inline-flex items-center gap-1 font-sans text-[0.8125rem] text-warning">
                  <WifiOff aria-hidden className="size-3.5" />
                  Disconnected
                </span>
              )}
            </span>
            <span className="ml-auto flex shrink-0 items-center">
              {you && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                  aria-label="Change your name"
                  className="px-2 text-muted-foreground"
                >
                  <Pencil aria-hidden />
                  <span aria-hidden className="hidden sm:inline">
                    Rename
                  </span>
                </Button>
              )}
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Manage ${name}`}
                      className="px-2 text-muted-foreground"
                    >
                      <MoreHorizontal aria-hidden className="sm:hidden" />
                      <span aria-hidden className="hidden sm:inline">
                        Manage
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    <DropdownMenuLabel className="truncate">
                      {name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={onMakeHost} disabled={away}>
                      <Crown aria-hidden />
                      Make host
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={onKick}
                      className="text-destructive focus:text-destructive"
                    >
                      <UserMinus aria-hidden />
                      Remove from room
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </span>
          </div>
          <ReadyBox player={player} host={host} />
        </>
      )}
    </li>
  );
}

/**
 * The ready column: a ruled box the tick goes in. The host never readies.
 *
 * PenTick draws with an inline `pen-draw` animation, but Tailwind only emits
 * `@keyframes pen-draw` when the class name animate-pen-draw appears in the
 * source; naming it here keeps the keyframes in the build (without them the
 * stroke stays at its start and the tick never shows).
 */
function ReadyBox({ player, host }: { player: RoomPlayer; host: boolean }) {
  if (host)
    return (
      <span className="text-center font-sans text-[0.75rem] text-muted-foreground">
        <span aria-hidden>—</span>
        <span className="sr-only">Host, starts the round</span>
      </span>
    );
  return (
    <span className="flex justify-center">
      <span className="relative flex size-6 items-center justify-center border border-foreground/40">
        {player.ready && (
          <PenTick className="absolute -right-1 -top-2 size-7" />
        )}
      </span>
      <span className="sr-only">{player.ready ? "Ready" : "Not ready"}</span>
    </span>
  );
}

function NameEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = nameError(value);
    if (problem) {
      setError(problem);
      return;
    }
    if (value.trim() === initial) return onCancel();
    setSaving(true);
    try {
      await onSave(value.trim());
    } catch {
      setError("Couldn't save. Try again.");
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex min-w-0 flex-1 flex-col gap-1"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <div className="flex items-center gap-2">
        <Input
          ref={input}
          variant="sm"
          value={value}
          maxLength={NAME_MAX}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          aria-label="Your name"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "name-editor-error" : undefined}
          autoComplete="nickname"
          spellCheck={false}
          enterKeyHint="done"
          className="h-9 min-w-0 flex-1"
        />
        <Button
          type="submit"
          size="icon-sm"
          variant="secondary"
          aria-label="Save name"
          disabled={saving}
        >
          <Check aria-hidden />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Cancel"
          onClick={onCancel}
        >
          <X aria-hidden />
        </Button>
      </div>
      {error && (
        <p id="name-editor-error" className="text-[0.8125rem] text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
