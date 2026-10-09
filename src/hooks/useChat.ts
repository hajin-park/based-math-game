/**
 * Room chat on the Realtime Database.
 *
 * Schema: `rooms/{roomId}/chat/{pushId}` =
 *   { senderId, displayName, message (1..300 chars), timestamp (server), isSystem }
 * plus `rooms/{roomId}/lastChatAt/{uid}` (server time of the sender's last
 * message). Rules require the sender to be the signed-in, non-kicked member,
 * `timestamp == now`, and at least CHAT_MIN_INTERVAL_MS between messages
 * (the message and lastChatAt are written in one atomic update).
 */
import {
  ref,
  push,
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

export const CHAT_MAX_LENGTH = 300;
/** Must match the rate limit in database.rules.json. */
export const CHAT_MIN_INTERVAL_MS = 1000;

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
  const key = push(ref(database, `${roomPath}/chat`)).key;
  if (!key) return;
  lastSentAt = Date.now();
  try {
    await update(ref(database, roomPath), {
      [`chat/${key}`]: {
        senderId: user.uid,
        displayName: clampDisplayName(user.displayName),
        message,
        timestamp: serverTimestamp(),
        isSystem,
      },
      [`lastChatAt/${user.uid}`]: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    });
  } catch (error) {
    const text = String((error as Error)?.message ?? error).toLowerCase();
    if (text.includes("permission")) {
      throw new Error(
        "Message not sent. You may be sending too quickly or are no longer in this room.",
      );
    }
    throw error;
  }
}

/** Live list of the last `messageLimit` messages, oldest first. */
export function subscribeToChat(
  roomId: string,
  callback: (messages: ChatMessage[]) => void,
  messageLimit: number = 50,
) {
  const chatQuery = query(
    ref(database, `rooms/${roomId}/chat`),
    orderByChild("timestamp"),
    limitToLast(messageLimit),
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
      console.error("Chat subscription error:", error);
      callback([]);
    },
  );
}
