import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Check,
  Circle,
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
import type { Room, RoomPlayer } from "@/hooks/useRoom";
import { cn } from "@/lib/utils";
import { NAME_MAX, nameError } from "./names";
import { seatOrder } from "./lobbyRules";
import { PlayerAvatar, YouTag } from "./PlayerAvatar";

export interface PlayerListProps {
  room: Room;
  myUid: string;
  names: Map<string, string>;
  onRename: (name: string) => Promise<void>;
  onKick: (player: RoomPlayer) => void;
  onMakeHost: (player: RoomPlayer) => void;
}

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
  return (
    <ul className="flex flex-col divide-y rounded-lg border bg-card">
      {players.map((p) => (
        <PlayerRow
          key={p.uid}
          player={p}
          name={names.get(p.uid) ?? p.displayName}
          you={p.uid === myUid}
          host={p.uid === room.hostUid}
          canManage={iAmHost && p.uid !== myUid}
          onRename={onRename}
          onKick={() => onKick(p)}
          onMakeHost={() => onMakeHost(p)}
        />
      ))}
      {Array.from(
        { length: Math.max(0, Math.min(room.maxPlayers - players.length, 2)) },
        (_, i) => (
          <li
            key={`empty-${i}`}
            className="flex min-h-14 items-center gap-3 px-3 text-body-sm text-muted-foreground sm:px-4"
          >
            <span
              aria-hidden
              className="size-9 shrink-0 rounded-full border border-dashed border-border-strong"
            />
            {i === 0 ? "Open seat · share the code" : "Open seat"}
          </li>
        ),
      )}
    </ul>
  );
}

function PlayerRow({
  player,
  name,
  you,
  host,
  canManage,
  onRename,
  onKick,
  onMakeHost,
}: {
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
      className={cn(
        "flex min-h-14 items-center gap-3 px-3 py-2 sm:px-4",
        you && "bg-primary/[0.035]",
      )}
      data-player={player.uid}
    >
      <PlayerAvatar name={name} you={you} muted={away} />
      {editing ? (
        <NameEditor
          initial={player.displayName}
          onCancel={() => setEditing(false)}
          onSave={async (n) => {
            await onRename(n);
            setEditing(false);
          }}
        />
      ) : (
        <>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "truncate text-[0.9375rem] font-medium",
                  away && "text-muted-foreground",
                )}
              >
                {name}
              </span>
              {you && <YouTag />}
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.8125rem] text-muted-foreground">
              {host && (
                <span className="inline-flex items-center gap-1 text-foreground">
                  <Crown aria-hidden className="size-3.5" />
                  Host
                </span>
              )}
              <PlayerState player={player} host={host} />
            </span>
          </div>
          {you && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditing(true)}
              aria-label="Change your name"
              className="text-muted-foreground"
            >
              <Pencil aria-hidden />
            </Button>
          )}
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Manage ${name}`}
                  className="text-muted-foreground"
                >
                  <MoreHorizontal aria-hidden />
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
        </>
      )}
    </li>
  );
}

function PlayerState({ player, host }: { player: RoomPlayer; host: boolean }) {
  if (player.disconnected)
    return (
      <span className="inline-flex items-center gap-1 text-warning">
        <WifiOff aria-hidden className="size-3.5" />
        Disconnected
      </span>
    );
  if (host) return null;
  return player.ready ? (
    <span className="inline-flex items-center gap-1 text-success">
      <Check aria-hidden className="size-3.5" />
      Ready
    </span>
  ) : (
    <span className="inline-flex items-center gap-1">
      <Circle aria-hidden className="size-3" />
      Not ready
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
