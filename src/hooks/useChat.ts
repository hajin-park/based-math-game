/**
 * Room chat on the Realtime Database.
 *
 * Schema: `rooms/{roomId}/chat/{uid}_{previous lastChatAt or 0}` =
 *   { senderId, displayName, message (1..300 chars), timestamp (server), isSystem }
 * plus `rooms/{roomId}/lastChatAt/{uid}` (server time of the sender's last
 * message). Rules require the sender to be the signed-in, non-kicked member,
 * `timestamp == now`, at least CHAT_MIN_INTERVAL_MS between messages, and
 * exactly one message per write: its key is derived from the sender's
 * previous lastChatAt, which moves to `now` in the same atomic update.
 */
import {
  ref,
  onValue,
  query,
  orderByChild,
  limitToLast,
  update,
  serverTimestamp,
} from "firebase/database";
import { auth } from "@/firebase/app";
import { database } from "@/firebase/database";
import { clampDisplayName } from "@/data/profile";
import { chatKeyFor } from "@/hooks/useRoom";

export const CHAT_MAX_LENGTH = 300;
/** Must match the rate limit in database.rules.json. */
export const CHAT_MIN_INTERVAL_MS = 1000;
/** Most messages a chat view keeps (the subscription is limited to this). */
export const CHAT_HISTORY_LIMIT = 100;

export interface ChatMessage {
  id: string;
  senderId: string;
  displayName: string;
  message: string;
  timestamp: number;
  isSystem?: boolean; // True for host-sent system messages
}

let lastSentAt = 0;

/** Sends a chat message as the signed-in user (plain function, no React). */
export async function postMessage(
  roomId: string,
  text: string,
  isSystem = false,
) {
  const user = auth.currentUser;
  const message = text.trim().slice(0, CHAT_MAX_LENGTH);
  if (!user || !message) return;

  // Small margin over the server-side limit to absorb network jitter.
  const wait = lastSentAt + CHAT_MIN_INTERVAL_MS + 200 - Date.now();
  if (wait > 0) {
    throw new Error(
      "You're sending messages too quickly. Please wait a moment.",
    );
  }

  const roomPath = `rooms/${roomId}`;
  const send = async () =>
    update(ref(database, roomPath), {
      [`chat/${await chatKeyFor(roomId, user.uid)}`]: {
        senderId: user.uid,
        displayName: clampDisplayName(user.displayName),
        message,
        timestamp: serverTimestamp(),
        isSystem,
      },
      [`lastChatAt/${user.uid}`]: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    });
  lastSentAt = Date.now();
  try {
    try {
      await send();
    } catch (error) {
      // The key comes from our lastChatAt as last seen; if it moved meanwhile
      // (our previous message's server time not seen yet, or another tab of
      // ours sent one), let the room snapshot catch up and try once more.
      if (!isPermissionDenied(error)) throw error;
      await new Promise((r) => setTimeout(r, 400));
      await send();
    }
  } catch (error) {
    if (isPermissionDenied(error)) {
      throw new Error(
        "Message not sent. You may be sending too quickly or are no longer in this room.",
      );
    }
    throw error;
  }
}

function isPermissionDenied(error: unknown): boolean {
  return String((error as Error)?.message ?? error)
    .toLowerCase()
    .includes("permission");
}

/** Live list of the last `messageLimit` (at most 100) messages, oldest first. */
export function subscribeToChat(
  roomId: string,
  callback: (messages: ChatMessage[]) => void,
  messageLimit: number = 50,
) {
  const chatQuery = query(
    ref(database, `rooms/${roomId}/chat`),
    orderByChild("timestamp"),
    limitToLast(Math.min(Math.max(1, messageLimit), CHAT_HISTORY_LIMIT)),
  );

  return onValue(
    chatQuery,
    (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((child) => {
        const data = child.val();
        if (data && typeof data === "object") {
          messages.push({ id: child.key || "", ...data });
        }
      });
      messages.sort((a, b) => a.timestamp - b.timestamp);
      callback(messages);
    },
    (error) => {
      // Permission is only refused to players removed from the room; the
      // room view explains that, so it is not an error worth logging.
      if (!isPermissionDenied(error))
        console.error("Chat subscription error:", error);
      callback([]);
    },
  );
}
