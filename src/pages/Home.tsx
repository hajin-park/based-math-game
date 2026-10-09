import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Link2, UserRoundX, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { BaseOdometer } from "@/components/ui/base-odometer";
import { BaseTag } from "@/components/ui/base-tag";
import { Digits } from "@/components/ui/digits";
import { GridPaper } from "@/components/ui/grid-paper";
import { Meter } from "@/components/ui/meter";
import { OFFICIAL_GAME_MODES } from "@/types/gameMode";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    n: "01",
    title: "Pick a drill",
    body: "Choose the bases, a number range and a 15, 30 or 60-second clock — or start from one of the official modes.",
  },
  {
    n: "10",
    title: "Type, don’t click",
    body: "A correct answer advances the moment you type its last digit. No submit button, no mouse, no friction.",
  },
  {
    n: "11",
    title: "Beat your number",
    body: "Scores, accuracy and per-base speed are kept, so you can see exactly which conversions slow you down.",
  },
];

type Track = {
  label: string;
  level: string;
  topics: string[];
  sample: ReactNode;
};

const TRACKS: Track[] = [
  {
    label: "Foundations",
    level: "T0",
    topics: ["Nibbles", "Powers of two", "Place value"],
    sample: <Digits base="bin" value="1010" size="sm" placeValues />,
  },
  {
    label: "Core",
    level: "T1",
    topics: ["Bytes", "Hex bytes", "Octal"],
    sample: <Digits base="hex" value="FF" size="sm" prefix />,
  },
  {
    label: "Advanced",
    level: "T2",
    topics: ["16-bit words", "Two’s complement", "Bitwise operations"],
    sample: (
      <span className="inline-flex items-baseline gap-2">
        <Digits base="bin" value="11111110" size="sm" group condensed />
        <span className="font-mono text-[0.75rem] text-muted-foreground">
          = −2
        </span>
      </span>
    ),
  },
  {
    label: "Applied",
    level: "T3",
    topics: ["Binary addition", "Colors in hex", "ASCII"],
    sample: (
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden
          className="size-3.5 rounded-[3px] bg-[#C23B1B] ring-1 ring-inset ring-black/10"
        />
        <Digits base="hex" value="C23B1B" size="sm" group={false} />
      </span>
    ),
  },
];

const CLASSROOM_POINTS = [
  {
    icon: Link2,
    title: "Share a mode as a link",
    body: "Every drill has its own URL. Drop it into your LMS or slides and the whole class lands in the same exercise.",
  },
  {
    icon: Users,
    title: "Live rooms for up to 10",
    body: "Open a room, share the code, start when everyone is in. Scores update live on every screen.",
  },
  {
    icon: UserRoundX,
    title: "No sign-up needed to play",
    body: "Students join as guests in one tap. Accounts are optional — only for keeping long-term stats.",
  },
];

const ROOM_PLAYERS = [
  { name: "Ada", score: 31, you: false },
  { name: "Grace", score: 27, you: true },
  { name: "Linus", score: 24, you: false },
  { name: "Margaret", score: 19, you: false },
];

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  id: string;
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <p className="eyebrow">{eyebrow}</p>
      <h2
        id={id}
        className="text-display-lg font-serif font-normal [font-variation-settings:'opsz'_60] [&_em]:italic [&_em]:text-primary"
      >
        {title}
      </h2>
      {lede && (
        <p className="max-w-lede text-body text-muted-foreground">{lede}</p>
      )}
    </div>
  );
}

function RoomPreview() {
  return (
    <figure
      aria-label="Example multiplayer room"
      className="relative overflow-hidden rounded-xl border bg-card shadow-md"
    >
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="eyebrow">Room code</span>
          <span className="font-mono text-[1.125rem] font-medium tracking-[0.18em] text-foreground">
            K7Q2·9XDM
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <BaseTag base="bin" size="sm" />
          <span className="text-[0.75rem] text-muted-foreground">↔</span>
          <BaseTag base="dec" size="sm" />
        </div>
      </div>
      <div className="px-5 pt-4">
        <Meter
          variant="timer"
          value={38}
          max={60}
          label="Time left"
          valueText="38 seconds"
          showLabel
          display="0:38"
          size="sm"
        />
      </div>
      <ol className="px-2 pb-2 pt-3">
        {ROOM_PLAYERS.map((p, i) => (
          <li
            key={p.name}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5",
              p.you && "bg-primary/[0.06]",
            )}
          >
            <span className="w-5 font-mono text-[0.75rem] text-muted-foreground">
              {i + 1}
            </span>
            <span className="flex-1 truncate text-[0.9375rem]">
              {p.name}
              {p.you && (
                <span className="ml-2 text-[0.75rem] text-primary">you</span>
              )}
            </span>
            <span className="font-mono text-[0.9375rem] tabular-nums text-foreground">
              {p.score}
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="border-t px-5 py-3 text-[0.75rem] text-muted-foreground">
        4 of 10 seats · Binary ↔ Decimal, 0–255 · 60 s
      </figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const navigate = useNavigate();
  const modeCount = OFFICIAL_GAME_MODES.length;

  // Keyboard-first: Enter anywhere on the page (outside a control) starts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented || e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        t !== document.body &&
        t.closest(
          "a,button,input,textarea,select,[role=button],[role=dialog],[contenteditable=true]",
        )
      ) {
        return;
      }
      e.preventDefault();
      navigate("/play");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div className="overflow-x-clip">
      {/* ------------------------------------------------------------ Hero */}
      <section
        aria-labelledby="hero-title"
        className="relative isolate border-b"
      >
        <GridPaper fade className="opacity-90" />
        <div className="container grid items-center gap-12 pb-14 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16 lg:pb-20 lg:pt-16">
          <div className="flex flex-col items-start gap-7 animate-rise">
            <p className="eyebrow inline-flex items-center gap-2">
              <span aria-hidden className="h-px w-6 bg-primary" />
              Base conversion, as a sport
            </p>
            <h1
              id="hero-title"
              className="max-w-[13ch] text-display-2xl font-serif font-normal text-foreground [font-variation-settings:'opsz'_72]"
            >
              Count in binary. <em className="italic text-primary">Think</em> in
              hex.
            </h1>
            <p className="max-w-lede text-body-lg text-muted-foreground">
              Sixty-second drills that turn base conversion into reflex. Pick a
              mode, type the answer, beat your last score — alone or with your
              whole class.
            </p>

            <div className="flex w-full flex-col gap-3 xs:w-auto xs:flex-row">
              <Button asChild size="xl" className="group">
                <Link to="/play">
                  Start a sprint
                  <Kbd
                    size="sm"
                    tone="inverse"
                    className="ml-1 hidden pointer-fine:inline-flex"
                    aria-hidden
                  >
                    ↵
                  </Kbd>
                  <ArrowRight aria-hidden className="pointer-fine:hidden" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link to="/multiplayer">Play with friends</Link>
              </Button>
            </div>

            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] text-muted-foreground">
              <span className="hidden items-center gap-1.5 pointer-fine:inline-flex">
                Press <Kbd size="sm">Enter</Kbd> to start
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check aria-hidden className="size-3.5 text-success" />
                No sign-up needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check aria-hidden className="size-3.5 text-success" />
                Free &amp; open source
              </span>
            </p>
          </div>

          <div className="relative w-full max-w-xl justify-self-center lg:justify-self-end animate-rise [animation-delay:80ms]">
            <BaseOdometer
              size="lg"
              autoPlay
              interactive
              placeValues
              caption="One number · four bases"
              hint={
                <>
                  <span>Click any bit to flip it</span>
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.06em]">
                    8-bit unsigned
                  </span>
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Proof strip */}
      <section aria-label="At a glance" className="border-b bg-card/60">
        <dl className="container grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
          {[
            { k: "Official modes", v: String(modeCount) },
            { k: "Bases drilled", v: "4" },
            { k: "Players per room", v: "10" },
            { k: "Sign-ups required", v: "0" },
          ].map((s, i) => (
            <div
              key={s.k}
              className={cn(
                "flex flex-col gap-1.5 py-6 md:px-6 md:first:pl-0",
                i < 2 && "border-b md:border-b-0",
                i % 2 === 1 && "pl-4 md:pl-6",
              )}
            >
              <dt className="order-2 text-[0.8125rem] text-muted-foreground">
                {s.k}
              </dt>
              <dd className="order-1 font-mono text-[1.75rem] font-medium leading-none tabular-nums tracking-[-0.02em]">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------------------------------------------- How it works */}
      <section aria-labelledby="how-title" className="container py-section">
        <SectionHeading
          id="how-title"
          eyebrow="How it works"
          title={
            <>
              Three steps, counted <em>in binary</em>.
            </>
          }
        />
        <ol className="mt-12 grid border-t md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.n}
              className={cn(
                "flex flex-col gap-4 border-b py-8 md:border-b-0 md:py-10",
                i > 0 && "md:border-l md:pl-8",
                i < STEPS.length - 1 && "md:pr-8",
              )}
            >
              <span
                aria-hidden
                className="font-mono text-[2.5rem] font-light leading-none tracking-[-0.04em] text-base-bin"
              >
                {step.n}
              </span>
              <h3 className="text-title font-semibold">{step.title}</h3>
              <p className="max-w-sm text-body text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------ Curriculum */}
      <section
        aria-labelledby="curriculum-title"
        className="border-y bg-card/60"
      >
        <div className="container py-section">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="curriculum-title"
              eyebrow="Curriculum"
              title={
                <>
                  From nibbles to <em>two’s complement</em>.
                </>
              }
              lede="Four tracks that build on each other, each with a short lesson and drills you can assign."
            />
            <Button asChild variant="outline" className="w-fit shrink-0">
              <Link to="/learn">
                Browse lessons
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>

          <ol className="relative mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {TRACKS.map((track, i) => (
              <li
                key={track.label}
                className="group flex flex-col gap-5 bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.75rem] text-muted-foreground">
                    {track.level}
                  </span>
                  {i < TRACKS.length - 1 && (
                    <ArrowRight
                      aria-hidden
                      className="hidden size-4 text-border-strong lg:block"
                    />
                  )}
                </div>
                <h3 className="font-serif text-[1.625rem] font-medium leading-none tracking-[-0.015em]">
                  {track.label}
                </h3>
                <ul className="flex flex-col gap-2 text-body-sm text-muted-foreground">
                  {track.topics.map((t) => (
                    <li key={t} className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className="h-px w-3 shrink-0 bg-border-strong"
                      />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex min-h-[3.25rem] items-end border-t border-dashed pt-4">
                  {track.sample}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------ Classrooms */}
      <section
        aria-labelledby="classroom-title"
        className="container py-section"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
          <div className="flex flex-col gap-10">
            <SectionHeading
              id="classroom-title"
              eyebrow="For classrooms"
              title={
                <>
                  Made for the <em>lecture hall</em>, not just the homework.
                </>
              }
              lede="Run a five-minute warm-up at the start of class, or set a drill as homework. Nothing to install, nothing to administer."
            />
            <ul className="grid gap-px border-t">
              {CLASSROOM_POINTS.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="grid grid-cols-[2rem_1fr] gap-x-4 border-b py-5"
                >
                  <Icon
                    aria-hidden
                    className="mt-0.5 size-5 text-muted-foreground"
                  />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-title-sm font-semibold">{title}</h3>
                    <p className="text-body-sm text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/multiplayer/create">Create a room</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/multiplayer/join">Join with a code</Link>
              </Button>
            </div>
          </div>
          <div className="relative isolate mx-auto w-full max-w-md lg:max-w-none">
            <GridPaper fade className="-inset-8 rounded-2xl" />
            <RoomPreview />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Closing */}
      <section
        aria-labelledby="cta-title"
        className="relative isolate overflow-hidden border-t"
      >
        <GridPaper fade />
        <div className="container flex flex-col items-center gap-7 py-section text-center">
          <Digits
            base="bin"
            value={60}
            pad={8}
            group
            size="sm"
            className="opacity-80"
          />
          <h2
            id="cta-title"
            className="text-display-xl font-serif font-normal [font-variation-settings:'opsz'_72]"
          >
            Sixty seconds. <em className="italic text-primary">Go.</em>
          </h2>
          <p className="max-w-md text-body-lg text-muted-foreground">
            Your first sprint takes a minute and needs no account.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button asChild size="xl">
              <Link to="/play">
                Start a sprint
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <span className="hidden items-center gap-1.5 text-[0.8125rem] text-muted-foreground pointer-fine:inline-flex">
              or press <Kbd size="sm">Enter</Kbd>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
