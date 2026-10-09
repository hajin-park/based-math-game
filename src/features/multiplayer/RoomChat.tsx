import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CHAT_MAX_LENGTH,
  postMessage,
  type ChatMessage,
} from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import type { FeedEvent } from "./useRoomState";
import { YouTag } from "./PlayerAvatar";

type FeedItem =
  | { type: "chat"; id: string; at: number; message: ChatMessage }
  | { type: "event"; id: string; at: number; event: FeedEvent };

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

/**
 * Room chat: messages and system lines (joins, leaves, host changes) in one
 * log. The field stays enabled while a message is in flight, so focus never
 * drops after Enter.
 */
export function RoomChat({
  roomId,
  myUid,
  names,
  messages,
  events,
  className,
  autoFocus,
}: {
  roomId: string;
  myUid: string;
  names: Map<string, string>;
  messages: ChatMessage[];
  events: FeedEvent[];
  className?: string;
  autoFocus?: boolean;
}) {
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const items = useMemo<FeedItem[]>(() => {
    const list: FeedItem[] = [
      ...messages
        .filter((m) => !m.isSystem)
        .map((m) => ({
          type: "chat" as const,
          id: m.id,
          at: m.timestamp,
          message: m,
        })),
      ...events.map((e) => ({
        type: "event" as const,
        id: e.id,
        at: e.at,
        event: e,
      })),
    ];
    return list.sort((a, b) => a.at - b.at);
  }, [messages, events]);

  // Follow new lines unless the reader scrolled up.
  useLayoutEffect(() => {
    const el = logRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [items]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      setDraft("");
      stick.current = true;
      await postMessage(roomId, text);
    } catch (err) {
      setDraft((d) => d || text);
      setError(
        err instanceof Error && /quickly/i.test(err.message)
          ? "One message per second. Try again."
          : "Message not sent. Check your connection.",
      );
    } finally {
      setSending(false);
    }
  };

  const left = CHAT_MAX_LENGTH - draft.length;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Room chat"
        tabIndex={0}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
        }}
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3"
      >
        {items.length === 0 ? (
          <p className="m-auto max-w-[16rem] text-center text-body-sm text-muted-foreground">
            No messages yet. Say hi, or share a tip before the round.
          </p>
        ) : (
          items.map((item) =>
            item.type === "event" ? (
              <p
                key={item.id}
                className="text-center text-[0.8125rem] text-muted-foreground"
              >
                <span className="font-mono text-[0.6875rem]">
                  {timeFormat.format(item.at)}
                </span>{" "}
                · {item.event.text}
              </p>
            ) : (
              <ChatLine
                key={item.id}
                message={item.message}
                mine={item.message.senderId === myUid}
                name={
                  names.get(item.message.senderId) ?? item.message.displayName
                }
              />
            ),
          )
        )}
      </div>
      <form onSubmit={send} className="flex flex-col gap-1 border-t p-3">
        <label htmlFor={inputId} className="sr-only">
          Message
        </label>
        <div className="flex items-center gap-2">
          <Input
            id={inputId}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value.slice(0, CHAT_MAX_LENGTH));
              setError(null);
            }}
            placeholder="Message the room…"
            autoComplete="off"
            enterKeyHint="send"
            maxLength={CHAT_MAX_LENGTH}
            aria-describedby={`${inputId}-status`}
            autoFocus={autoFocus}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            variant="secondary"
            aria-label="Send message"
            disabled={!draft.trim()}
            aria-busy={sending || undefined}
          >
            <SendHorizontal aria-hidden />
          </Button>
        </div>
        <p
          id={`${inputId}-status`}
          aria-live="polite"
          className={cn(
            "min-h-4 text-[0.75rem]",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? (left <= 40 ? `${left} characters left` : "")}
        </p>
      </form>
    </div>
  );
}

function ChatLine({
  message,
  mine,
  name,
}: {
  message: ChatMessage;
  mine: boolean;
  name: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", mine && "items-end")}>
      <p className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
        <span className="max-w-[12rem] truncate font-medium text-foreground">
          {name}
        </span>
        {mine && <YouTag className="h-4 px-1 text-[0.625rem]" />}
        <span className="font-mono text-[0.6875rem]">
          {Number.isFinite(message.timestamp)
            ? timeFormat.format(message.timestamp)
            : ""}
        </span>
      </p>
      <p
        className={cn(
          "max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-3 py-1.5 text-body-sm",
          mine ? "bg-secondary text-foreground" : "border bg-card",
        )}
      >
        {message.message}
      </p>
    </div>
  );
}
