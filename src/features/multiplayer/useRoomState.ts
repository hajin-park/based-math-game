/**
 * One live subscription per room page: the normalised room, a feed of
 * derived system events, and the realtime connection state.
 */
import { useEffect, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "@/firebase/config";
import { roomApi, type Room } from "@/hooks/useRoom";
import { subscribeToChat, type ChatMessage } from "@/hooks/useChat";
import { serverNow } from "@/lib/serverTime";
import { diffRoomEvents, type RoomEvent } from "./roomEvents";

export interface FeedEvent extends RoomEvent {
  id: string;
  at: number;
}

export type RoomLoadState = "loading" | "ready" | "missing";

/** A connection drop shorter than this is not announced. */
const DROP_GRACE_MS = 5000;

function modeLabel(room: Room): string {
  return room.engineMode?.name ?? "a custom set";
}

export function useRoomState(roomId: string | undefined, myUid: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null);
  const [state, setState] = useState<RoomLoadState>("loading");
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const prevRef = useRef<Room | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!roomId || !myUid) return;
    prevRef.current = null;
    setRoom(null);
    setState("loading");
    setEvents([]);
    // "Lost connection" is only worth saying if it lasts: a reload or a
    // short blip produces a lost/back pair that is dropped silently.
    const pendingDrops = new Map<string, number>();
    const add = (list: RoomEvent[]) => {
      if (!list.length) return;
      const at = serverNow();
      setEvents((prev) =>
        [
          ...prev,
          ...list.map((e) => ({ ...e, id: `sys-${++seq.current}`, at })),
        ].slice(-60),
      );
    };
    const unsubscribe = roomApi.subscribeToRoom(roomId, (next) => {
      const prev = prevRef.current;
      prevRef.current = next;
      if (!next) {
        setRoom(null);
        setState("missing");
        return;
      }
      const fresh = diffRoomEvents(
        prev && { ...prev, modeName: modeLabel(prev) },
        { ...next, modeName: modeLabel(next) },
        myUid,
      ).filter((e) => {
        if (e.kind === "disconnected") {
          pendingDrops.set(
            e.uid,
            window.setTimeout(() => {
              pendingDrops.delete(e.uid);
              add([e]);
            }, DROP_GRACE_MS),
          );
          return false;
        }
        if (e.kind === "reconnected" || e.kind === "left" || e.kind === "removed") {
          const pending = pendingDrops.get(e.uid);
          if (pending !== undefined) {
            window.clearTimeout(pending);
            pendingDrops.delete(e.uid);
            return e.kind !== "reconnected";
          }
        }
        return true;
      });
      add(fresh);
      setRoom(next);
      setState("ready");
    });
    return () => {
      pendingDrops.forEach((t) => window.clearTimeout(t));
      unsubscribe();
    };
  }, [roomId, myUid]);

  return { room, state, events };
}

/** Live chat messages for a room (oldest first). */
export function useChatMessages(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => subscribeToChat(roomId, setMessages, 80), [roomId]);
  return messages;
}

/**
 * Realtime connection state in words. "connecting" only before the first
 * successful connection; drops shorter than `graceMs` are not reported.
 */
export type LinkState = "connecting" | "online" | "reconnecting";

export function useLinkState(graceMs = 1500): LinkState {
  const [link, setLink] = useState<LinkState>("connecting");
  useEffect(() => {
    let everConnected = false;
    let timer: number | undefined;
    const unsubscribe = onValue(ref(database, ".info/connected"), (snap) => {
      window.clearTimeout(timer);
      if (snap.val() === true) {
        everConnected = true;
        setLink("online");
      } else if (everConnected) {
        timer = window.setTimeout(() => setLink("reconnecting"), graceMs);
      }
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [graceMs]);
  return link;
}
