import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { codeHalves, inviteLabel, inviteUrl } from "./roomCode";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / denied permission: fall back to a hidden textarea.
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand?.("copy") ?? false;
    el.remove();
    return ok;
  }
}

/**
 * The room code written on the board: a chalkboard panel (chalkboard tokens
 * in either theme) with the code in big typewriter chalk, readable from the
 * back of a room on a projector, the join link under it, and copy actions.
 */
export function RoomCodePanel({ code }: { code: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const [a, b] = codeHalves(code);

  const copy = async (what: "code" | "link") => {
    const ok = await copyText(what === "code" ? code : inviteUrl(code));
    setFailed(!ok);
    setCopied(ok ? what : null);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 2200);
  };

  return (
    <section
      aria-labelledby="room-code-label"
      className="dark rounded-sm bg-background p-1.5 text-foreground shadow-md ring-1 ring-inset ring-border-strong"
    >
      <div className="relative flex flex-col gap-5 rounded-[1px] border border-foreground/10 bg-[radial-gradient(70%_90%_at_30%_20%,rgb(var(--foreground)/0.05),transparent_70%)] px-5 pb-5 pt-4 sm:px-8 sm:pb-6 sm:pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="room-code-label" className="smallcaps text-[1rem]">
            Room code
          </h2>
          <span className="hidden font-sans text-[0.8125rem] text-muted-foreground sm:inline">
            Type it at the join page, or open the link
          </span>
        </div>
        <p
          data-testid="room-code"
          className="flex select-all flex-wrap items-baseline justify-center gap-x-[0.4em] font-mono text-[clamp(2.75rem,13vw,6.25rem)] font-medium leading-[0.95] tracking-[0.1em] text-foreground md:text-[clamp(3rem,6.6vw,6.25rem)]"
        >
          <span>{a}</span>
          <span>{b}</span>
        </p>
        <div className="flex flex-col gap-3 border-t border-foreground/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 truncate font-mono text-[0.9375rem] text-muted-foreground sm:text-[1rem]">
            <span className="sr-only">Join link: </span>
            {inviteLabel(code)}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => copy("link")}
            >
              {copied === "link" ? (
                <Check aria-hidden />
              ) : (
                <Link2 aria-hidden />
              )}
              {copied === "link" ? "Copied" : "Copy link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => copy("code")}
            >
              {copied === "code" ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied === "code" ? "Copied" : "Copy code"}
            </Button>
          </div>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied === "code"
          ? "Room code copied"
          : copied === "link"
            ? "Invite link copied"
            : failed
              ? "Couldn't copy. Select the code and copy it manually."
              : ""}
      </p>
    </section>
  );
}
