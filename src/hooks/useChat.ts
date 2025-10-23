import { useState, useCallback } from "react";
import {
  ref,
  push,
  onValue,
  off,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { database } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatMessage {
  id: string;
  senderId: string;
  displayName: string;
  message: string;
  timestamp: number;
}

export function useChat() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(
    async (roomId: string, message: string) => {
      if (!user || !message.trim()) return;

      setLoading(true);
      try {
        const chatRef = ref(database, `rooms/${roomId}/chat`);

        const chatMessage: Omit<ChatMessage, "id"> = {
          senderId: user.uid,
          displayName: user.displayName || "Guest",
          message: message.trim(),
          timestamp: Date.now(),
        };

        await push(chatRef, chatMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const subscribeToMessages = useCallback(
    (
      roomId: string,
      callback: (messages: ChatMessage[]) => void,
      messageLimit: number = 50,
    ) => {
      const chatRef = ref(database, `rooms/${roomId}/chat`);
      const chatQuery = query(
        chatRef,
        orderByChild("timestamp"),
        limitToLast(messageLimit),
      );

      const listener = onValue(chatQuery, (snapshot) => {
        const messages: ChatMessage[] = [];

        snapshot.forEach((childSnapshot) => {
          const messageData = childSnapshot.val();
          if (messageData && typeof messageData === "object") {
            messages.push({
              id: childSnapshot.key || "",
              ...messageData,
            });
          }
        });

        // Sort by timestamp to ensure correct order
        messages.sort((a, b) => a.timestamp - b.timestamp);
        callback(messages);
      });

      return () => off(chatQuery, "value", listener);
    },
    [],
  );

  return {
    loading,
    sendMessage,
    subscribeToMessages,
  };
}
