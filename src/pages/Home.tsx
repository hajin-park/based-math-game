/**
 * "/" — the cover of the workbook. Blue book cloth, a printed label with the
 * title, the player's name and today's sheet number, one big Play, and four
 * numbered picks. The back-cover conversion table runs along the bottom.
 * Play (or Enter) opens the cover and starts a run straight away.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { PenTick } from "@/components/ui/pen-mark";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { syncThemeColor } from "@/contexts/ThemeContext";
import { SiteMenu, ThemeMenu } from "@/features/ui/Navigation-Bar";
import { useDailyAttempts } from "@/features/play/useDailyAttempts";
import { useStartTarget } from "@/features/play/useStartTarget";
import { dailyModeFor, dailyNumber } from "@/game";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

const OPEN_MS = 520;

function longDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function shortDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** One labelled fill-in line on the cover label ("Name ____"). */
function LabelLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-3">
      <span className="smallcaps shrink-0 text-[0.9375rem] text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate border-b border-foreground/35 pb-0.5 font-mono text-[1rem] text-foreground">
        {children}
      </span>
    </div>
  );
}

/** The back-cover table every exercise book carries: 0–15 in four bases. */
const TABLE_ROWS: { tag: string; render: (n: number) => string }[] = [
  { tag: "DEC", render: (n) => String(n) },
  { tag: "HEX", render: (n) => n.toString(16).toUpperCase() },
  { tag: "OCT", render: (n) => n.toString(8) },
  { tag: "BIN", render: (n) => n.toString(2).padStart(4, "0") },
];

function TableBand({
  cols,
  className,
}: {
  cols: number[];
  className?: string;
}) {
  return (
    <table
      className={cn(
        "w-full border-collapse font-mono text-[0.8125rem] text-cover-muted sm:text-[0.875rem]",
        className,
      )}
    >
      <tbody>
        {TABLE_ROWS.map((row) => (
          <tr
            key={row.tag}
            className="border-b border-cover-foreground/15 last:border-b-0"
          >
            <th
              scope="row"
              className="w-10 py-1 pl-1 pr-2 text-left font-sans text-[0.75rem] font-bold tracking-[0.08em] text-cover-foreground/80 sm:w-14"
            >
              {row.tag}
            </th>
            {cols.map((n) => (
              <td key={n} className="px-0.5 py-1 text-center tabular-nums">
                {row.render(n)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ConversionTable() {
  const all = Array.from({ length: 16 }, (_, i) => i);
  return (
    <figure aria-label="The numbers 0 to 15 in decimal, hexadecimal, octal and binary">
      {/* One band of 16 on wide screens; two bands of 8 on phones. */}
      <TableBand cols={all} className="hidden md:table" />
      <div className="flex flex-col gap-2 md:hidden">
        <TableBand cols={all.slice(0, 8)} />
        <TableBand cols={all.slice(8)} />
      </div>
    </figure>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { user, isGuest } = useAuth();
  const start = useStartTarget();
  const [opening, setOpening] = useState(false);
  const openTimer = useRef<number | undefined>(undefined);

  const today = new Date();
  const daily = dailyModeFor(today);
  const sheetNo = dailyNumber(today);
  const { first: dailyDone } = useDailyAttempts(daily.id);

  const play = useCallback(() => {
    if (opening) return;
    if (reduce) {
      navigate(start.path);
      return;
    }
    setOpening(true);
    openTimer.current = window.setTimeout(() => navigate(start.path), OPEN_MS);
  }, [navigate, opening, reduce, start.path]);

  useEffect(() => () => window.clearTimeout(openTimer.current), []);

  // The browser chrome takes the cover's blue while the cover is showing.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.surface = "cover";
    syncThemeColor();
    return () => {
      delete root.dataset.surface;
      syncThemeColor();
    };
  }, []);

  // Keyboard-first: Enter anywhere on the cover (outside a control) plays.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented || e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.closest(
          "a, button, input, textarea, select, [role='menu'], [role='dialog'], [contenteditable='true']",
        ) ||
          t.isContentEditable)
      )
        return;
      e.preventDefault();
      play();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play]);

  const name = !isGuest && user?.displayName ? user.displayName : null;

  const picks = [
    {
      n: 1,
      to: "/daily",
      label: "Daily",
      detail: dailyDone ? `No. ${sheetNo} · done` : `No. ${sheetNo}`,
      done: !!dailyDone,
    },
    { n: 2, to: "/play", label: "Contents", detail: "Every drill" },
    { n: 3, to: "/multiplayer", label: "Rooms", detail: "Play a class" },
    { n: 4, to: "/learn", label: "Learn", detail: "The lessons" },
  ];

  return (
    <div className="overflow-hidden [perspective:2200px]">
      <section
        aria-labelledby="cover-title"
        className={cn(
          "book-cloth relative isolate flex min-h-dvh flex-col overflow-hidden text-cover-foreground",
          "origin-left [backface-visibility:hidden]",
        )}
        style={
          opening
            ? {
                transform: "rotateY(-84deg)",
                opacity: 0.5,
                transition: `transform ${OPEN_MS}ms cubic-bezier(0.55, 0, 0.3, 1), opacity ${OPEN_MS}ms ease-in`,
              }
            : undefined
        }
      >
        {/* Spine */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-cover-deep shadow-[2px_0_6px_rgb(0_0_0/0.25)] sm:w-5 dark:hidden"
        />

        {/* Cover chrome: menu left; theme and account right */}
        <div className="container relative z-10 flex h-[var(--nav-h)] items-center justify-between pl-6 sm:pl-10">
          <SiteMenu
            triggerLabel
            triggerClassName="-ml-2.5 text-cover-foreground hover:bg-cover-foreground/10 hover:text-cover-foreground"
          />
          <div className="flex items-center gap-1">
            <ThemeMenu className="text-cover-foreground/85 hover:bg-cover-foreground/10 hover:text-cover-foreground" />
            {isGuest ? (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-cover-foreground hover:bg-cover-foreground/10 hover:text-cover-foreground"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            ) : (
              <ProfileDropdown />
            )}
          </div>
        </div>

        {/* The label */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-8 pt-2 sm:px-10 sm:pb-10">
          <div className="paper-sheet relative w-full max-w-[46rem] rounded-[3px] p-2 text-foreground sm:p-2.5 dark:bg-card">
            <div className="flex flex-col gap-6 border-[1.5px] border-foreground/75 px-5 pb-6 pt-7 outline outline-1 outline-offset-[3px] outline-foreground/35 sm:gap-7 sm:px-12 sm:pb-8 sm:pt-9">
              <div className="flex flex-col items-center gap-3 text-center">
                <h1
                  id="cover-title"
                  className="text-display-2xl font-bold leading-[0.92] sm:whitespace-nowrap"
                >
                  Based Math
                </h1>
                <p className="font-serif text-body-lg italic text-muted-foreground">
                  Exercises in binary, octal, decimal &amp; hexadecimal, against
                  the clock
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <LabelLine label="Name">
                  {name ?? (
                    <span className="font-serif italic text-muted-foreground">
                      Guest
                    </span>
                  )}
                </LabelLine>
                <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-5">
                  <LabelLine label="Sheet">No. {sheetNo}</LabelLine>
                  <LabelLine label="Date">
                    <span className="sm:hidden">{shortDate(today)}</span>
                    <span className="hidden sm:inline">{longDate(today)}</span>
                  </LabelLine>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  size="xl"
                  onClick={play}
                  className="h-16 w-full justify-between px-6 text-[1.25rem] sm:h-[4.5rem] sm:text-[1.375rem]"
                  aria-describedby="play-what"
                >
                  <span>Play</span>
                  <span className="flex items-center gap-3">
                    <Kbd
                      tone="inverse"
                      className="hidden h-7 px-2 text-[0.8125rem] pointer-fine:inline-flex"
                    >
                      Enter ↵
                    </Kbd>
                    <ArrowRight aria-hidden className="!size-5" />
                  </span>
                </Button>
                <p
                  id="play-what"
                  className="text-center font-sans text-[0.9375rem] text-muted-foreground"
                >
                  {start.resume ? "Continue" : "Start with"}{" "}
                  <span className="font-bold text-foreground">
                    {start.title}
                  </span>{" "}
                  · {start.format}
                </p>
              </div>

              <nav aria-label="More from the cover">
                <ol className="grid grid-cols-2 border-t border-foreground/25 sm:grid-cols-4">
                  {picks.map((p) => (
                    <li
                      key={p.to}
                      className="border-b border-foreground/15 odd:border-r sm:border-b-0 sm:border-r sm:last:border-r-0 sm:odd:border-r"
                    >
                      <Link
                        to={p.to}
                        className="group flex h-full min-h-[4.25rem] flex-col justify-center gap-0.5 px-3 py-3 transition-colors duration-fast hover:bg-accent"
                      >
                        <span className="flex items-baseline gap-2 font-serif text-[1.125rem] font-bold">
                          <span className="font-mono text-[0.8125rem] font-medium text-primary">
                            {p.n}.
                          </span>
                          {p.label}
                          {p.done && (
                            <PenTick
                              animate={false}
                              className="size-4 -translate-y-0.5"
                            />
                          )}
                        </span>
                        <span className="pl-[1.35rem] font-sans text-[0.8125rem] text-muted-foreground">
                          {p.detail}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {/* Back-cover table */}
        <div className="relative z-10 border-t border-cover-foreground/20 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-3 pt-2 sm:pl-5">
          <div className="container">
            <ConversionTable />
          </div>
        </div>
      </section>
    </div>
  );
}
