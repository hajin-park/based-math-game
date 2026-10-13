import { useId, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { PageHeader } from "@/components/ui/page-header";
import { RoomCodeInput } from "@/features/multiplayer/RoomCodeInput";
import {
  codeHalves,
  isRoomCode,
  normalizeRoomCode,
} from "@/features/multiplayer/roomCode";
import { useJoinRoom } from "@/features/multiplayer/useJoinRoom";

const REASONS: Record<string, (code: string) => string> = {
  "room-closed": (c) => `Room ${c} has closed. Everyone left, or it sat idle.`,
  "room-not-found": (c) =>
    `There is no open room with code ${c}. Check the code with your host.`,
  kicked: (c) => `The host removed you from room ${c}.`,
  left: (c) =>
    `You left room ${c}. The code still works while others are in it.`,
  "closed-by-you": (c) =>
    `You were the last one in room ${c}, so it has closed.`,
};

/** The real sequence of a room, in order. */
const STEPS = [
  "The host creates a room and picks a drill and a format. The room gets an 8-character code and a link.",
  "Players join with the code or the link. Guests need no account.",
  "Each player presses Ready. The host starts the round once everyone is ready.",
  "A 3-second countdown, then everyone gets the same questions in the same order. Scores update live on every screen.",
  "The class results: standings and a chart of the round. The host can play again in the same room.",
];

export default function MultiplayerHome() {
  const [params] = useSearchParams();
  const reason = params.get("reason");
  const reasonCode = normalizeRoomCode(params.get("code") ?? "");
  const notice =
    reason && REASONS[reason]
      ? REASONS[reason](
          isRoomCode(reasonCode) ? codeHalves(reasonCode).join(" ") : "",
        ).replace(/\s+\./, ".")
      : null;

  const [code, setCode] = useState(
    isRoomCode(reasonCode) && reason === "left" ? reasonCode : "",
  );
  const [touched, setTouched] = useState(false);
  const { join, pending, error, setError } = useJoinRoom();
  const codeId = useId();
  const complete = isRoomCode(code);
  const fieldError =
    error ??
    (touched && !complete ? "Room codes have 8 letters and digits." : null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!complete || pending) return;
    void join(code);
  };

  return (
    <div className="container flex max-w-5xl flex-col gap-10 py-10 md:gap-14 md:py-14">
      <PageHeader
        folio="2–10 seats"
        title="Rooms"
        lede="Play a class: everyone gets the same questions, in the same order, starting at the same second."
        divider
      />

      {notice && (
        <Alert variant="info" role="status" className="max-w-2xl">
          <Info aria-hidden />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {/* Two printed forms on one sheet, framed like the cover label. */}
      <div className="bg-card p-1.5 shadow-sm sm:p-2 dark:bg-card">
        <div className="grid border-[1.5px] border-foreground/70 outline outline-1 outline-offset-[3px] outline-foreground/30 md:grid-cols-2">
          <section
            aria-labelledby="mp-host-title"
            className="flex flex-col gap-6 border-b border-foreground/25 px-5 py-6 sm:px-8 sm:py-8 md:border-b-0 md:border-r"
          >
            <div className="flex flex-col gap-2">
              <h2
                id="mp-host-title"
                className="font-serif text-headline font-bold"
              >
                Host a room
              </h2>
              <p className="max-w-sm text-body text-muted-foreground">
                Pick a drill, share the code, start when the class is ready.
              </p>
            </div>
            <div className="mt-auto">
              <Button
                asChild
                size="lg"
                className="w-full justify-between xs:w-auto"
              >
                <Link to="/multiplayer/create">
                  Create a room
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </section>

          <section
            aria-labelledby="mp-join-title"
            className="flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8"
          >
            <h2
              id="mp-join-title"
              className="font-serif text-headline font-bold"
            >
              Join a room
            </h2>
            <form
              onSubmit={onSubmit}
              noValidate
              className="flex flex-col gap-3"
              aria-describedby={`${codeId}-msg`}
            >
              <label
                htmlFor={codeId}
                className="font-serif text-[1.0625rem] font-medium tracking-[0.05em] [font-variant-caps:all-small-caps]"
              >
                Room code
              </label>
              <RoomCodeInput
                id={codeId}
                value={code}
                onValueChange={(v) => {
                  setCode(v);
                  setError(null);
                }}
                invalid={!!fieldError}
                describedBy={`${codeId}-msg`}
                size="md"
              />
              <p
                id={`${codeId}-msg`}
                aria-live="polite"
                className={
                  fieldError
                    ? "font-sans text-[0.8125rem] text-destructive"
                    : "font-sans text-[0.8125rem] text-muted-foreground"
                }
              >
                {fieldError ?? "Type the code, or paste the whole invite link."}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  disabled={pending}
                  className="w-full xs:w-auto"
                >
                  {pending ? "Joining…" : "Join room"}
                  {!pending && <ArrowRight aria-hidden />}
                </Button>
                <span className="hidden whitespace-nowrap font-sans text-label text-muted-foreground pointer-fine:inline-flex pointer-fine:items-center pointer-fine:gap-1.5">
                  or press <Kbd size="sm">Enter</Kbd>
                </span>
              </div>
            </form>
          </section>
        </div>
      </div>

      <section
        aria-labelledby="mp-how-title"
        className="flex max-w-prose flex-col gap-4"
      >
        <h2 id="mp-how-title" className="font-serif text-title font-bold">
          How a class round works
        </h2>
        <ol className="flex flex-col gap-2.5">
          {STEPS.map((step, i) => (
            <li
              key={i}
              className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-baseline"
            >
              <span className="font-mono text-[0.9375rem] text-primary">
                {i + 1}.
              </span>
              <span className="text-body text-pretty">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
