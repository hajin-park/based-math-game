import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

/** Big, readable room code with copy code / copy link actions. */
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
    <section aria-labelledby="room-code-label" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="room-code-label" className="eyebrow">
          Room code
        </h2>
        <p
          data-testid="room-code"
          className="flex select-all items-baseline font-mono text-[clamp(2.25rem,11vw,4.25rem)] font-medium leading-none tracking-[0.12em] text-foreground"
        >
          <span>{a}</span>
          <span aria-hidden className="w-[0.45em]" />
          <span>{b}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copy("code")}
        >
          {copied === "code" ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied === "code" ? "Copied" : "Copy code"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copy("link")}
        >
          {copied === "link" ? <Check aria-hidden /> : <Link2 aria-hidden />}
          {copied === "link" ? "Copied" : "Copy invite link"}
        </Button>
        <span
          className={cn(
            "min-w-0 truncate font-mono text-[0.75rem] text-muted-foreground",
            "basis-full sm:basis-auto",
          )}
        >
          {inviteLabel(code)}
        </span>
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
