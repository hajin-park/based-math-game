import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { roomApi } from "@/hooks/useRoom";
import { codeHalves } from "./roomCode";

/** Plain-language reason a join failed. */
export function joinErrorMessage(error: unknown, code: string): string {
  const text = String((error as Error)?.message ?? error).toLowerCase();
  const shown = codeHalves(code).join(" ");
  if (text.includes("not found"))
    return `There is no open room with code ${shown}. Check the code with your host.`;
  if (text.includes("removed"))
    return "The host removed you from this room, so you can't rejoin it.";
  if (text.includes("full"))
    return "This room is full. Ask the host to add seats.";
  if (text.includes("not accepting"))
    return "A round is in progress. You can join as soon as it ends.";
  return "Couldn't join the room. Check your connection and try again.";
}

/** Join a room (optionally renaming first) and open its lobby. */
export function useJoinRoom() {
  const navigate = useNavigate();
  const { ensureUser, updateDisplayName } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = useCallback(
    async (code: string, name?: string) => {
      setPending(true);
      setError(null);
      try {
        const user = await ensureUser();
        if (name && name.trim() !== (user.displayName ?? "")) {
          await updateDisplayName(name.trim());
        }
        await roomApi.joinRoom(code);
        navigate(`/multiplayer/lobby/${code}`);
        return true;
      } catch (e) {
        setError(joinErrorMessage(e, code));
        return false;
      } finally {
        setPending(false);
      }
    },
    [ensureUser, updateDisplayName, navigate],
  );

  return { join, pending, error, setError };
}
