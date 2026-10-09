import { onValue, ref } from "firebase/database";
import { database } from "@/firebase/config";

let offsetMs = 0;
let listening = false;

function listen() {
  if (listening) return;
  listening = true;
  onValue(ref(database, ".info/serverTimeOffset"), (snap) => {
    offsetMs = Number(snap.val()) || 0;
  });
}

/** Estimated (server time - local time) in ms, from the RTDB connection. */
export function serverTimeOffset(): number {
  listen();
  return offsetMs;
}

/** Current server time estimate (ms since epoch). */
export function serverNow(): number {
  return Date.now() + serverTimeOffset();
}

/** Converts a server timestamp to the local clock. */
export function serverToLocal(serverMs: number): number {
  return serverMs - serverTimeOffset();
}
