import { useId, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Info, Plus } from "lucide-react";

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
  left: (c) => `You left room ${c}.`,
};

const STEPS = [
  {
    n: "01",
    title: "Host opens a room",
    body: "Pick a topic and a format. The room gets an 8-character code and a link.",
  },
  {
    n: "10",
    title: "Everyone joins",
    body: "Students type the code or open the link. Guests are welcome: no account, no email.",
  },
  {
    n: "11",
    title: "Same questions, same second",
    body: "The host starts when all are ready. Live scores on every screen, then standings and a progress chart.",
  },
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
    <div className="container flex flex-col gap-10 py-10 md:gap-14 md:py-14">
      <PageHeader
        eyebrow="Multiplayer"
        title={
          <>
            Race the whole <em>class</em>
          </>
        }
        lede="Rooms for up to 10. Everyone gets the same questions at the same moment, and scores update live."
        divider
      />

      {notice && (
        <Alert variant="info" role="status" className="max-w-2xl">
          <Info aria-hidden />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-2">
        <section
          aria-labelledby="mp-host-title"
          className="flex flex-col gap-5 bg-card p-6 sm:p-8"
        >
          <div className="flex flex-col gap-2">
            <p className="eyebrow">Host</p>
            <h2
              id="mp-host-title"
              className="font-serif text-headline font-medium"
            >
              Create a room
            </h2>
            <p className="max-w-sm text-body text-muted-foreground">
              Choose what to practise, share the code, start when everyone is
              ready.
            </p>
          </div>
          <div className="mt-auto">
            <Button asChild size="lg" className="w-full xs:w-auto">
              <Link to="/multiplayer/create">
                <Plus aria-hidden />
                Create a room
              </Link>
            </Button>
          </div>
        </section>

        <section
          aria-labelledby="mp-join-title"
          className="flex flex-col gap-5 bg-card p-6 sm:p-8"
        >
          <div className="flex flex-col gap-2">
            <p className="eyebrow">Player</p>
            <h2
              id="mp-join-title"
              className="font-serif text-headline font-medium"
            >
              Join with a code
            </h2>
          </div>
          <form
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-3"
            aria-describedby={`${codeId}-msg`}
          >
            <label htmlFor={codeId} className="text-label font-medium">
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
                  ? "text-[0.8125rem] text-destructive"
                  : "text-[0.8125rem] text-muted-foreground"
              }
            >
              {fieldError ?? "Paste the code or the whole invite link."}
            </p>
            <div className="flex items-center gap-3">
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
              <span className="hidden text-label text-muted-foreground pointer-fine:inline">
                or press <Kbd size="sm">Enter</Kbd>
              </span>
            </div>
          </form>
        </section>
      </div>

      <section aria-labelledby="mp-how-title" className="flex flex-col gap-6">
        <h2
          id="mp-how-title"
          className="font-serif text-headline font-medium"
        >
          How a class round works
        </h2>
        <ol className="grid border-t md:grid-cols-3 md:divide-x">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex gap-4 border-b py-5 md:flex-col md:gap-3 md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0"
            >
              <span
                aria-hidden
                className="font-mono text-[0.875rem] text-base-bin"
              >
                {s.n}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-title-sm font-semibold">{s.title}</h3>
                <p className="text-body-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
