import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { useChat, ChatMessage } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";

interface ChatBoxProps {
  roomId: string;
  className?: string;
}

export default function ChatBox({ roomId, className = "" }: ChatBoxProps) {
  const { user } = useAuth();
  const { sendMessage, subscribeToMessages, loading } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const lastMessageCountRef = useRef(0);

  // Subscribe to messages
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToMessages(roomId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [roomId, subscribeToMessages]);

  // Auto-scroll to bottom only when user sends a message or when already at bottom
  useEffect(() => {
    if (messages.length === 0) return;

    // Check if this is a new message (not initial load)
    const isNewMessage = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    if (!isNewMessage) return;

    // Only auto-scroll if user is not manually scrolling
    if (!isUserScrollingRef.current && scrollAreaRef.current) {
      // Scroll the container, not the page
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    try {
      // Mark that user is sending a message (should auto-scroll)
      isUserScrollingRef.current = false;
      await sendMessage(roomId, inputMessage);
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Detect when user manually scrolls
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) <
      10;

    // If user scrolls away from bottom, mark as manually scrolling
    if (!isAtBottom) {
      isUserScrollingRef.current = true;
    } else {
      // If user scrolls back to bottom, enable auto-scroll again
      isUserScrollingRef.current = false;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className={`border-2 shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Room Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Messages Area */}
        <div
          className="h-64 w-full rounded-lg border-2 bg-muted/30 p-3 overflow-y-auto"
          onScroll={handleScroll}
          ref={scrollAreaRef}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => {
                const isCurrentUser = msg.senderId === user?.uid;
                return (
                  <div
                    key={msg.id}
                    className="flex flex-wrap items-baseline gap-1.5"
                  >
                    <span className="text-xs font-semibold shrink-0">
                      {isCurrentUser ? "You" : msg.displayName}:
                    </span>
                    <span className="text-sm break-words flex-1 min-w-0">
                      {msg.message}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-auto">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={500}
            disabled={loading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
