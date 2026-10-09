/**
 * /play — the play hub. One-key replay for returning players, a clear
 * recommended start for newcomers, today's daily and survival, then the
 * curriculum by tier. Deep links: /play?mode=<id> opens that mode's panel,
 * /play?mode=custom&c=<config> opens a shared custom drill,
 * /play?panel=settings opens the game settings.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Heart,
  Link2,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";
import { bestsKey, useRunHistory, useUserStats, type BestEntry } from "@/data";
import {
  FORMATS,
  formatMs,
  SURVIVAL_STAGES,
  TIERS,
  getMode,
  getTopic,
  isTopicId,
  modeId,
  topicsInTier,
  utcDateKey,
  type CustomConfig,
  type Format,
  type Tier,
  type Topic,
  type TopicId,
} from "@/game";
import { CustomModeBuilder } from "@/features/play/CustomModeBuilder";
import { DailyRank } from "@/features/play/DailyStatus";
import { useDailyAttempts } from "@/features/play/useDailyAttempts";
import { GameSettingsPanel } from "@/features/play/GameSettingsPanel";
import { TopicExample } from "@/features/play/TopicExample";
import { modeTitle } from "@/features/play/describe";
import {
  DEFAULT_CUSTOM_CONFIG,
  absoluteUrl,
  customConfigProblem,
  decodeCustomConfig,
  hubLink,
  runPath,
} from "@/features/play/links";
import { getLastMode } from "@/features/play/session";
import { useMediaQuery } from "@/features/play/useMediaQuery";
import { cn } from "@/lib/utils";

type TopicFormat = "sprint" | "speedrun" | "practice";
type Panel =
  | { kind: "topic"; topicId: Exclude<TopicId, "custom">; format: TopicFormat }
  | { kind: "survival" }
  | { kind: "custom"; config: CustomConfig }
  | { kind: "settings" };

const TIER_LABEL: Record<Tier, { n: string; name: string; blurb: string }> = {
  foundations: {
    n: "T0",
    name: "Foundations",
    blurb: "Four bits and powers of two: the facts every other topic leans on.",
  },
  core: {
    n: "T1",
    name: "Core",
    blurb: "Whole bytes in binary, hex and octal, separately and shuffled.",
  },
  advanced: {
    n: "T2",
    name: "Advanced",
    blurb: "Sixteen bits, signed numbers, and arithmetic on bits.",
  },
  applied: {
    n: "T3",
    name: "Applied",
    blurb: "Where bytes show up in the wild: colours and text.",
  },
};

const TOPIC_FORMATS: { value: TopicFormat; label: string }[] = [
  { value: "sprint", label: "Sprint 60 s" },
  { value: "speedrun", label: "Speedrun 15" },
  { value: "practice", label: "Practice" },
];

const RECOMMENDED = "nibbles:practice";
const TOPIC_COUNT =
  topicsInTier("foundations").length +
  topicsInTier("core").length +
  topicsInTier("advanced").length +
  topicsInTier("applied").filter((t) => t.id !== "custom").length;

function parsePanel(
  params: URLSearchParams,
): { panel: Panel | null } | { redirect: string } | { invalid: string } {
  if (params.get("panel") === "settings")
    return { panel: { kind: "settings" } };
  const mode = params.get("mode");
  if (!mode) return { panel: null };
  if (mode.startsWith("daily")) return { redirect: "/daily" };
  if (mode === "survival") return { panel: { kind: "survival" } };
  if (mode === "custom") {
    const c = params.get("c");
    if (!c) return { panel: { kind: "custom", config: DEFAULT_CUSTOM_CONFIG } };
    const config = decodeCustomConfig(c);
    return config
      ? { panel: { kind: "custom", config } }
      : {
          invalid:
            "That custom drill link is incomplete or broken. Build one below instead.",
        };
  }
  const [topic, format = "sprint"] = mode.split(":");
  if (
    isTopicId(topic) &&
    topic !== "custom" &&
    (format === "sprint" || format === "speedrun" || format === "practice")
  )
    return { panel: { kind: "topic", topicId: topic, format } };
  return { invalid: "That link points to a mode that doesn't exist." };
}

function bestText(format: Format, best: BestEntry | undefined): string {
  if (!best) return "—";
  return format === "speedrun"
    ? `${(best.score / 1000).toFixed(2)} s`
    : String(best.score);
}

export default function Play() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const parsed = useMemo(() => parsePanel(params), [params]);
  const { stats } = useUserStats();
  const { runs: recent } = useRunHistory({ limit: 1 });
  const [last] = useState(getLastMode);

  // Invalid deep links: explain, then show the plain hub.
  const invalid = "invalid" in parsed ? parsed.invalid : null;
  useEffect(() => {
    if (!invalid) return;
    toast({ title: "Can't open that mode", description: invalid });
    setParams({}, { replace: true });
  }, [invalid, setParams]);

  const panel = "panel" in parsed ? parsed.panel : null;
  const best = useCallback(
    (id: string): BestEntry | undefined => stats.bests[bestsKey(id)],
    [stats.bests],
  );

  // Resume target: this device's last mode, else the newest run in history.
  const resume = useMemo(() => {
    if (
      last &&
      (last.modeId === "custom" ? !!last.custom : !!getMode(last.modeId))
    )
      return { modeId: last.modeId, custom: last.custom };
    const r = recent[0];
    if (r && getMode(r.modeId) && !r.modeId.startsWith("daily:"))
      return { modeId: r.modeId, custom: undefined };
    return null;
  }, [last, recent]);
  const startPath = resume
    ? runPath(resume.modeId, resume.custom)
    : runPath(RECOMMENDED);

  const open = (next: Panel) => {
    const p = new URLSearchParams();
    if (next.kind === "settings") p.set("panel", "settings");
    else if (next.kind === "survival") p.set("mode", "survival");
    else if (next.kind === "custom") p.set("mode", "custom");
    else p.set("mode", modeId(next.topicId, next.format));
    setParams(p, { replace: true });
  };
  const close = () => setParams({}, { replace: true });

  // Enter (outside any control, no panel open) starts the resume target.
  useEffect(() => {
    if (panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented || e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        t !== document.body &&
        t.closest(
          "a,button,input,textarea,select,[role=dialog],[contenteditable=true]",
        )
      )
        return;
      e.preventDefault();
      navigate(startPath);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, navigate, startPath]);

  useEffect(() => {
    document.title = "Play · Based Math Game";
  }, []);

  if ("redirect" in parsed) return <Navigate to={parsed.redirect} replace />;

  return (
    <div className="container flex flex-col gap-12 py-10 md:gap-16 md:py-14">
      <PageHeader
        eyebrow="Play"
        title={
          <>
            Pick a drill. <em>Beat</em> your number.
          </>
        }
        lede={`${TOPIC_COUNT} topics from 4-bit nibbles to two's complement, each as a 60-second sprint, a race to 15 or untimed practice.`}
        actions={
          <Button variant="outline" onClick={() => open({ kind: "settings" })}>
            <SlidersHorizontal aria-hidden />
            Game settings
          </Button>
        }
      />

      <section
        aria-label="Quick start"
        className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)]"
      >
        <ResumeCard
          resume={resume}
          best={resume ? best(resume.modeId) : undefined}
          startPath={startPath}
        />
        <DailyCard />
        <SurvivalCard
          best={best("survival")}
          onRules={() => open({ kind: "survival" })}
        />
      </section>

      {TIERS.map((tier) => (
        <TierSection
          key={tier}
          tier={tier}
          topics={topicsInTier(tier).filter((t) => t.id !== "custom")}
          best={best}
          onOpen={(topicId, format) => open({ kind: "topic", topicId, format })}
        />
      ))}

      <section
        aria-labelledby="custom-title"
        className="flex flex-col gap-4 rounded-xl border border-dashed border-border-strong p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="flex flex-col gap-1.5">
          <h2
            id="custom-title"
            className="flex items-center gap-2 text-title font-semibold"
          >
            <Wrench aria-hidden className="size-4 text-muted-foreground" />
            Custom drill
          </h2>
          <p className="max-w-prose text-body-sm text-muted-foreground">
            Choose exact conversions and value ranges, mix in other question
            types, then share the drill as a link. Built for lessons and
            targeted practice; never ranked.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            open({ kind: "custom", config: DEFAULT_CUSTOM_CONFIG })
          }
          className="shrink-0"
        >
          Build a drill
          <ArrowRight aria-hidden />
        </Button>
      </section>

      <PanelSheet panel={panel} onClose={close} onOpen={open} best={best} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Quick start                                                               */
/* -------------------------------------------------------------------------- */

function QuickCard({
  eyebrow,
  title,
  children,
  action,
  emphasis,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  children: ReactNode;
  action: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex flex-col justify-between gap-5 rounded-lg border bg-card p-5 shadow-xs",
        emphasis && "border-border-strong",
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="text-title font-semibold text-foreground">{title}</h2>
        <div className="text-body-sm text-muted-foreground">{children}</div>
      </div>
      <div className="flex flex-wrap items-center gap-3">{action}</div>
    </article>
  );
}

function ResumeCard({
  resume,
  best,
  startPath,
}: {
  resume: { modeId: string; custom?: CustomConfig } | null;
  best: BestEntry | undefined;
  startPath: string;
}) {
  const mode = resume
    ? resume.modeId === "custom"
      ? null
      : getMode(resume.modeId)
    : null;
  const hint = (
    <span className="hidden items-center gap-1.5 text-[0.75rem] text-muted-foreground pointer-fine:inline-flex">
      or press <Kbd size="sm">Enter</Kbd>
    </span>
  );
  if (!resume)
    return (
      <QuickCard
        emphasis
        eyebrow="New here?"
        title={<>Start with Nibbles · Practice</>}
        action={
          <>
            <Button asChild size="lg">
              <Link to={startPath}>
                Start practising
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            {hint}
          </>
        }
      >
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          Four bits at a time, no clock.
          <TopicExample topicId="nibbles" className="text-mono-md" />
        </p>
        <p className="mt-1">Stuck? Skip and you get the worked solution.</p>
      </QuickCard>
    );
  const name = mode
    ? `${modeTitle(mode)} · ${mode.spec.name}`
    : "Your custom drill";
  return (
    <QuickCard
      emphasis
      eyebrow="Pick up where you left off"
      title={name}
      action={
        <>
          <Button asChild size="lg">
            <Link to={startPath}>
              Play again
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          {hint}
        </>
      }
    >
      {mode && mode.format !== "practice" && best ? (
        <p>
          Your best:{" "}
          <span className="font-mono tabular-nums text-foreground">
            {mode.spec.scoreUnit === "ms"
              ? `${(best.score / 1000).toFixed(2)} s`
              : `${best.score} ${mode.spec.scoreUnit}`}
          </span>
        </p>
      ) : (
        <p>Same mode, fresh questions.</p>
      )}
    </QuickCard>
  );
}

function DailyCard() {
  const date = utcDateKey();
  const dailyId = `daily:${date}`;
  const { first, loading } = useDailyAttempts(dailyId);
  return (
    <QuickCard
      eyebrow={<>Daily · {date}</>}
      title="Today's ten"
      action={
        <Button asChild variant="outline">
          <Link to="/daily">
            {first ? "See today's board" : "Play today's daily"}
            <ChevronRight aria-hidden />
          </Link>
        </Button>
      }
    >
      {loading ? (
        <p>&nbsp;</p>
      ) : first ? (
        <p className="flex flex-wrap items-center gap-x-2">
          <Check aria-hidden className="size-4 text-success" />
          Done in{" "}
          <span className="font-mono tabular-nums text-foreground">
            {formatMs(first.score)}
          </span>
          <DailyRank dailyId={dailyId} />
        </p>
      ) : (
        <p>
          The same questions for everyone, from nibbles to ASCII. One ranked
          attempt.
        </p>
      )}
    </QuickCard>
  );
}

function SurvivalCard({
  best,
  onRules,
}: {
  best: BestEntry | undefined;
  onRules: () => void;
}) {
  return (
    <QuickCard
      eyebrow="Survival"
      title="Three lives, shrinking clock"
      action={
        <>
          <Button asChild variant="outline">
            <Link to="/play/survival">
              <Heart aria-hidden />
              Play survival
            </Link>
          </Button>
          <Button variant="ghost" onClick={onRules}>
            How it works
          </Button>
        </>
      }
    >
      <p>
        {best ? (
          <>
            Your best:{" "}
            <span className="font-mono tabular-nums text-foreground">
              {best.score} cleared
            </span>
          </>
        ) : (
          "Climbs from nibbles to bitwise. How far can you get?"
        )}
      </p>
    </QuickCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Curriculum                                                                */
/* -------------------------------------------------------------------------- */

function TierSection({
  tier,
  topics,
  best,
  onOpen,
}: {
  tier: Tier;
  topics: Topic[];
  best: (id: string) => BestEntry | undefined;
  onOpen: (topicId: Exclude<TopicId, "custom">, format: TopicFormat) => void;
}) {
  const label = TIER_LABEL[tier];
  const id = `tier-${tier}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h2 id={id} className="flex items-baseline gap-3">
          <span className="font-mono text-[0.75rem] text-muted-foreground">
            {label.n}
          </span>
          <span className="font-serif text-headline">{label.name}</span>
        </h2>
        <p className="text-body-sm text-muted-foreground">{label.blurb}</p>
      </div>
      <ul className="flex flex-col">
        {topics.map((t) => (
          <TopicRow
            key={t.id}
            topic={t}
            sprintBest={best(modeId(t.id, "sprint"))}
            speedBest={best(modeId(t.id, "speedrun"))}
            onOpen={(f) => onOpen(t.id as Exclude<TopicId, "custom">, f)}
          />
        ))}
      </ul>
    </section>
  );
}

function TopicRow({
  topic,
  sprintBest,
  speedBest,
  onOpen,
}: {
  topic: Topic;
  sprintBest: BestEntry | undefined;
  speedBest: BestEntry | undefined;
  onOpen: (format: TopicFormat) => void;
}) {
  return (
    <li className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 border-b py-4 transition-colors duration-fast last:border-0 hover:bg-accent/40 md:grid-cols-[minmax(0,1fr)_11rem_9rem_auto] md:px-2 lg:grid-cols-[minmax(0,1fr)_13rem_10rem_auto]">
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-title-sm font-semibold">
          <button
            type="button"
            onClick={() => onOpen("sprint")}
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-ring"
          >
            {topic.name}
          </button>
        </h3>
        <p className="line-clamp-2 text-body-sm text-muted-foreground md:line-clamp-1">
          {topic.summary}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1 md:hidden">
          <TopicExample topicId={topic.id} className="text-mono-md" />
          {(sprintBest || speedBest) && (
            <span className="font-mono text-[0.75rem] tabular-nums text-muted-foreground">
              Best {bestText("sprint", sprintBest)} ·{" "}
              {bestText("speedrun", speedBest)}
            </span>
          )}
        </div>
      </div>
      <TopicExample
        topicId={topic.id}
        className="hidden text-mono-md md:inline-flex"
      />
      <dl className="hidden grid-cols-2 gap-x-3 text-[0.75rem] md:grid">
        <dt className="text-muted-foreground">Sprint</dt>
        <dd className="text-right font-mono tabular-nums text-foreground">
          {bestText("sprint", sprintBest)}
        </dd>
        <dt className="text-muted-foreground">Speedrun</dt>
        <dd className="text-right font-mono tabular-nums text-foreground">
          {bestText("speedrun", speedBest)}
        </dd>
      </dl>
      <div className="relative z-10 hidden items-center gap-1 lg:flex">
        {TOPIC_FORMATS.map((f) => (
          <Button
            key={f.value}
            asChild
            size="sm"
            variant={f.value === "sprint" ? "outline" : "ghost"}
          >
            <Link
              to={runPath(modeId(topic.id, f.value))}
              aria-label={`${topic.name}: ${f.label}`}
            >
              {f.label}
            </Link>
          </Button>
        ))}
      </div>
      <ChevronRight
        aria-hidden
        className="size-4 text-muted-foreground lg:hidden"
      />
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Detail panel                                                              */
/* -------------------------------------------------------------------------- */

function PanelSheet({
  panel,
  onClose,
  onOpen,
  best,
}: {
  panel: Panel | null;
  onClose: () => void;
  onOpen: (p: Panel) => void;
  best: (id: string) => BestEntry | undefined;
}) {
  const wide = useMediaQuery("(min-width: 768px)");
  // Keep the last panel rendered while the sheet animates closed.
  const [shown, setShown] = useState<Panel | null>(panel);
  useEffect(() => {
    if (panel) setShown(panel);
  }, [panel]);
  const p = panel ?? shown;

  return (
    <Sheet open={!!panel} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={wide ? "right" : "bottom"}
        className={cn(
          "overflow-y-auto overscroll-contain",
          wide
            ? "w-[min(32rem,92vw)] sm:max-w-none"
            : "max-h-[90dvh] rounded-t-xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
        )}
        onOpenAutoFocus={(e) => {
          const start = document.getElementById("panel-start");
          if (start) {
            e.preventDefault();
            start.focus();
          }
        }}
      >
        {p?.kind === "topic" && (
          <TopicPanel panel={p} onOpen={onOpen} best={best} />
        )}
        {p?.kind === "survival" && <SurvivalPanel best={best("survival")} />}
        {p?.kind === "custom" && <CustomPanel initial={p.config} />}
        {p?.kind === "settings" && (
          <>
            <SheetHeader className="pr-10">
              <p className="eyebrow">Settings</p>
              <SheetTitle className="font-serif text-headline font-medium">
                Game settings
              </SheetTitle>
              <SheetDescription>
                Apply to every run on this device and, when signed in, to your
                account.
              </SheetDescription>
            </SheetHeader>
            <GameSettingsPanel />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const url = absoluteUrl(path);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy this link", description: url });
    }
  };
  return (
    <Button type="button" variant="outline" size="lg" onClick={copy}>
      {copied ? <Check aria-hidden /> : <Link2 aria-hidden />}
      {copied ? "Link copied" : "Copy link"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </Button>
  );
}

function StartButton({ to, disabled }: { to: string; disabled?: boolean }) {
  if (disabled)
    return (
      <Button id="panel-start" size="lg" disabled className="flex-1">
        Start
      </Button>
    );
  return (
    <Button id="panel-start" asChild size="lg" className="flex-1">
      <Link to={to}>
        Start
        <Kbd
          size="sm"
          tone="inverse"
          className="hidden pointer-fine:inline-flex"
          aria-hidden
        >
          ↵
        </Kbd>
      </Link>
    </Button>
  );
}

function PanelFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky -bottom-6 -mx-6 -mb-6 mt-auto flex flex-col-reverse gap-2 border-t bg-popover px-6 pb-6 pt-4 xs:flex-row max-md:-mx-4 max-md:px-4">
      {children}
    </div>
  );
}

function TopicPanel({
  panel,
  onOpen,
  best,
}: {
  panel: Extract<Panel, { kind: "topic" }>;
  onOpen: (p: Panel) => void;
  best: (id: string) => BestEntry | undefined;
}) {
  const topic = getTopic(panel.topicId);
  const id = modeId(topic.id, panel.format);
  const spec = FORMATS[panel.format];
  const b = best(id);
  return (
    <>
      <SheetHeader className="pr-10">
        <p className="eyebrow">
          {TIER_LABEL[topic.tier].n} · {TIER_LABEL[topic.tier].name}
        </p>
        <SheetTitle className="font-serif text-headline font-medium">
          {topic.name}
        </SheetTitle>
        <SheetDescription className="text-body">
          {topic.summary}
        </SheetDescription>
      </SheetHeader>
      <div className="flex items-center justify-center rounded-lg border bg-sunken/50 px-4 py-6">
        <TopicExample topicId={topic.id} className="text-mono-lg" />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-label font-semibold">Why it matters</h3>
        <p className="text-body-sm text-muted-foreground text-pretty">
          {topic.why}
        </p>
        <Link
          to={`/learn#${topic.learnAnchor}`}
          className="link inline-flex items-center gap-1.5 self-start text-body-sm"
        >
          <BookOpen aria-hidden className="size-4" />
          Learn {topic.name.toLowerCase()} first
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-label font-semibold" id="format-label">
          Format
        </h3>
        <Segmented
          aria-label="Format"
          id="topic-format"
          fullWidth
          value={panel.format}
          onValueChange={(f) => onOpen({ ...panel, format: f })}
          options={TOPIC_FORMATS}
        />
        <p className="text-body-sm text-muted-foreground">{spec.summary}</p>
        {spec.ranked && (
          <p className="flex items-center justify-between gap-3 text-body-sm">
            <span className="text-muted-foreground">Your best</span>
            <span className="font-mono tabular-nums">
              {b ? bestText(panel.format, b) : "Not played yet"}
            </span>
          </p>
        )}
        {spec.ranked && (
          <Link
            to={`/leaderboard?mode=${encodeURIComponent(id)}`}
            className="link self-start text-body-sm"
          >
            Leaderboard for {topic.name} · {spec.name}
          </Link>
        )}
      </div>
      <PanelFooter>
        <CopyLinkButton path={hubLink(id)} />
        <StartButton to={runPath(id)} />
      </PanelFooter>
    </>
  );
}

function SurvivalPanel({ best }: { best: BestEntry | undefined }) {
  const stages = SURVIVAL_STAGES.map((s) => getTopic(s.topicId).name);
  return (
    <>
      <SheetHeader className="pr-10">
        <p className="eyebrow">Ranked · endless</p>
        <SheetTitle className="font-serif text-headline font-medium">
          Survival
        </SheetTitle>
        <SheetDescription className="text-body">
          {FORMATS.survival.summary}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-2">
        <h3 className="text-label font-semibold">The climb</h3>
        <ol className="flex flex-col text-body-sm">
          {stages.map((name, i) => (
            <li
              key={name}
              className="flex items-baseline gap-3 border-b py-2 last:border-0"
            >
              <span className="w-12 font-mono text-[0.75rem] tabular-nums text-muted-foreground">
                {SURVIVAL_STAGES[i].from + 1}+
              </span>
              {name}
            </li>
          ))}
          <li className="flex items-baseline gap-3 py-2">
            <span className="w-12 font-mono text-[0.75rem] tabular-nums text-muted-foreground">
              46+
            </span>
            Everything, mixed
          </li>
        </ol>
        <p className="text-body-sm text-muted-foreground">
          The clock starts at 15 seconds and shrinks with every question; longer
          answers get a little extra time.
        </p>
      </div>
      <p className="flex items-center justify-between text-body-sm">
        <span className="text-muted-foreground">Your best</span>
        <span className="font-mono tabular-nums">
          {best ? `${best.score} cleared` : "Not played yet"}
        </span>
      </p>
      <PanelFooter>
        <CopyLinkButton path={hubLink("survival")} />
        <StartButton to="/play/survival" />
      </PanelFooter>
    </>
  );
}

function CustomPanel({ initial }: { initial: CustomConfig }) {
  const [config, setConfig] = useState<CustomConfig>(initial);
  const problem = customConfigProblem(config);
  return (
    <>
      <SheetHeader className="pr-10">
        <p className="eyebrow">Unranked · shareable</p>
        <SheetTitle className="font-serif text-headline font-medium">
          Custom drill
        </SheetTitle>
        <SheetDescription>
          Pick what to practise. Copy the link to give a class the exact same
          drill.
        </SheetDescription>
      </SheetHeader>
      <CustomModeBuilder value={config} onChange={setConfig} />
      <PanelFooter>
        {problem ? (
          <Button variant="outline" size="lg" disabled>
            <Link2 aria-hidden />
            Copy link
          </Button>
        ) : (
          <CopyLinkButton path={hubLink("custom", config)} />
        )}
        <StartButton
          to={problem ? "" : runPath("custom", config)}
          disabled={!!problem}
        />
      </PanelFooter>
    </>
  );
}
