import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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

type FeedItem =
  | { type: "chat"; id: string; at: number; message: ChatMessage }
  | { type: "event"; id: string; at: number; event: FeedEvent };

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

/** Ruled lines plus a margin rule (where the times sit), scrolling with the notes. */
const NOTEPAD: CSSProperties = {
  backgroundImage: [
    "linear-gradient(to right, transparent calc(3.75rem - 1px), rgb(var(--ruled) / calc(var(--ruled-alpha) * 1.6)) calc(3.75rem - 1px), rgb(var(--ruled) / calc(var(--ruled-alpha) * 1.6)) 3.75rem, transparent 3.75rem)",
    "linear-gradient(to bottom, transparent calc(var(--line) - 1px), rgb(var(--ruled) / var(--ruled-alpha)) calc(var(--line) - 1px))",
  ].join(", "),
  backgroundSize: "100% 100%, 100% var(--line)",
};

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
      {/*
       * A lined notepad: every line of text sits on a printed rule (the log's
       * line-height equals --line), times in the margin, senders in small caps.
       */}
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
        className="ruled-paper relative min-h-0 flex-1 overflow-y-auto bg-local pb-[var(--line)] pt-[var(--line)] text-body-sm leading-[var(--line)] [--line:1.75rem] focus-visible:-outline-offset-2"
        style={NOTEPAD}
      >
        {items.length === 0 ? (
          <p className="pl-[4.5rem] pr-4 font-serif italic text-muted-foreground">
            No notes yet. Say hi before the round.
          </p>
        ) : (
          items.map((item) =>
            item.type === "event" ? (
              <p
                key={item.id}
                className="grid grid-cols-[3.75rem_minmax(0,1fr)] pr-4 font-serif italic text-muted-foreground"
              >
                <Time at={item.at} />
                <span className="pl-3">{item.event.text}</span>
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
      <form
        onSubmit={send}
        className="flex flex-col gap-1 border-t border-foreground/25 bg-card px-3 pb-2 pt-3"
      >
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
            "min-h-4 font-sans text-[0.75rem]",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? (left <= 40 ? `${left} characters left` : "")}
        </p>
      </form>
    </div>
  );
}

/** The time in the notepad's margin, in typewriter. */
function Time({ at }: { at: number }) {
  return (
    <span className="pl-3 font-mono text-[0.75rem] tabular-nums text-muted-foreground">
      {Number.isFinite(at) ? timeFormat.format(at) : ""}
    </span>
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
    <p className="grid grid-cols-[3.75rem_minmax(0,1fr)] pr-4">
      <Time at={message.timestamp} />
      <span className="whitespace-pre-wrap break-words pl-3">
        <span
          className={cn(
            "mr-2 font-serif text-[1rem] font-medium tracking-[0.05em] [font-variant-caps:all-small-caps]",
            mine ? "text-primary" : "text-foreground",
          )}
        >
          {mine ? (
            <>
              you<span className="sr-only"> ({name})</span>
            </>
          ) : (
            name
          )}
        </span>
        {message.message}
      </span>
    </p>
  );
}
