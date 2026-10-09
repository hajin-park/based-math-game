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
import { useState, useCallback } from "react";
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
import { auth, database } from "@/firebase/config";
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

async function postMessage(roomId: string, text: string, isSystem: boolean) {
  const user = auth.currentUser;
  const message = text.trim().slice(0, CHAT_MAX_LENGTH);
  if (!user || !message) return;

  const wait = lastSentAt + CHAT_MIN_INTERVAL_MS - Date.now();
  if (wait > 0) {
    throw new Error("You're sending messages too quickly. Please wait a moment.");
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

export function useChat() {
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (roomId: string, message: string) => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await postMessage(roomId, message, false);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Host-only announcement (rules reject isSystem from non-hosts). */
  const sendSystemMessage = useCallback(
    async (roomId: string, message: string) => {
      if (!message.trim()) return;
      try {
        await postMessage(roomId, message, true);
      } catch (error) {
        console.error("Error sending system message:", error);
        throw error;
      }
    },
    [],
  );

  const subscribeToMessages = useCallback(
    (
      roomId: string,
      callback: (messages: ChatMessage[]) => void,
      messageLimit: number = 50,
    ) => {
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
    },
    [],
  );

  return {
    loading,
    sendMessage,
    sendSystemMessage,
    subscribeToMessages,
  };
}
