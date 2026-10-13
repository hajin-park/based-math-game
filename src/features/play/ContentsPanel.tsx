/**
 * The card laid on the Contents page: a mode's details (?mode=<id>,
 * ?mode=survival, ?mode=custom&c=…) or the game settings (?panel=settings).
 * An index card on desktop (inset from the edge, square corners), a sheet
 * pulled up from the bottom on phones. Start is the one ink action.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Segmented } from "@/components/ui/segmented";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboard, type BestEntry } from "@/data";
import {
  FORMATS,
  SURVIVAL_ENDGAME_FROM,
  SURVIVAL_STAGES,
  getTopic,
  modeId,
  type CustomConfig,
} from "@/game";
import { CustomModeBuilder } from "@/features/play/CustomModeBuilder";
import { GameSettingsPanel } from "@/features/play/GameSettingsPanel";
import { TopicExample } from "@/features/play/TopicExample";
import {
  absoluteUrl,
  customConfigProblem,
  hubLink,
  runPath,
} from "@/features/play/links";
import { useMediaQuery } from "@/features/play/useMediaQuery";
import { cn } from "@/lib/utils";
import {
  CHAPTER,
  TOPIC_FORMATS,
  bestText,
  sectionNumber,
  type ChapterTopicId,
  type TopicFormat,
} from "./ContentsShared";

export type Panel =
  | { kind: "topic"; topicId: ChapterTopicId; format: TopicFormat }
  | { kind: "survival" }
  | { kind: "custom"; config: CustomConfig }
  | { kind: "settings" };

export function ContentsPanel({
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
  // Keep the last panel rendered while the card animates away.
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
          "gap-0 overflow-y-auto overscroll-contain bg-card p-0",
          wide
            ? "inset-y-3 right-3 h-auto w-[min(31rem,calc(100vw-1.5rem))] rounded-sm border border-foreground/25 sm:max-w-none dark:border-border-strong"
            : "max-h-[92dvh] rounded-t-md border-foreground/25",
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
          <TopicCard panel={p} onOpen={onOpen} best={best} />
        )}
        {p?.kind === "survival" && <SurvivalCard best={best("survival")} />}
        {p?.kind === "custom" && <CustomCard initial={p.config} />}
        {p?.kind === "settings" && (
          <>
            <CardHead
              head="Settings"
              title="Game settings"
              description="Apply to every run on this device and, when signed in, to your account."
            />
            <CardBody>
              <GameSettingsPanel />
            </CardBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card parts                                                                */
/* -------------------------------------------------------------------------- */

/** Running head over a rule, the title, one line of what it is, a double rule. */
function CardHead({
  head,
  folio,
  title,
  description,
}: {
  head: ReactNode;
  folio?: ReactNode;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <header className="rule-double flex flex-col gap-2 px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
      <div className="smallcaps mb-2 mr-9 flex items-baseline justify-between gap-4 border-b border-foreground/20 pb-1.5">
        <span className="min-w-0 truncate">{head}</span>
        {folio && (
          <span className="shrink-0 font-mono text-[0.8125rem] [font-variant-caps:normal]">
            {folio}
          </span>
        )}
      </div>
      <SheetTitle className="font-serif text-headline font-bold">
        {title}
      </SheetTitle>
      <SheetDescription className="text-body text-muted-foreground text-pretty">
        {description}
      </SheetDescription>
    </header>
  );
}

function CardBody({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-border px-5 sm:px-7 [&>*]:py-5">
      {children}
    </div>
  );
}

/** A labelled part of the card: small-caps label, then its content. */
function Part({
  label,
  id,
  children,
}: {
  label: ReactNode;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2.5">
      <h3 id={id} className="smallcaps text-foreground/80">
        {label}
      </h3>
      {children}
    </section>
  );
}

/** "Your best ........ 27" */
function LeaderRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-2 text-body-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <span aria-hidden className="leader" />
      <dd className="shrink-0 font-mono tabular-nums text-foreground">
        {children}
      </dd>
    </div>
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
      <Button id="panel-start" size="lg" disabled className="xs:flex-1">
        Start
      </Button>
    );
  return (
    <Button
      id="panel-start"
      asChild
      size="lg"
      className="justify-between xs:flex-1"
    >
      <Link to={to}>
        Start
        <Kbd
          size="sm"
          tone="inverse"
          className="hidden pointer-fine:inline-flex"
          aria-hidden
        >
          Enter ↵
        </Kbd>
      </Link>
    </Button>
  );
}

function CardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 mt-auto flex flex-col-reverse gap-2 border-t border-foreground/20 bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 xs:flex-row sm:px-7 sm:pb-6">
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cards                                                                     */
/* -------------------------------------------------------------------------- */

function TopicCard({
  panel,
  onOpen,
  best,
}: {
  panel: Extract<Panel, { kind: "topic" }>;
  onOpen: (p: Panel) => void;
  best: (id: string) => BestEntry | undefined;
}) {
  const topic = getTopic(panel.topicId);
  const chapter = CHAPTER[topic.tier];
  const id = modeId(topic.id, panel.format);
  const spec = FORMATS[panel.format];
  const b = best(id);
  return (
    <>
      <CardHead
        head={
          <>
            Chapter {chapter.n} · {chapter.name}
          </>
        }
        folio={<span className="text-primary">§ {sectionNumber(topic)}</span>}
        title={topic.name}
        description={topic.summary}
      />
      <CardBody>
        <div className="flex flex-col gap-4">
          <figure className="flex flex-col gap-3 bg-tint px-4 py-4">
            <figcaption className="smallcaps text-primary">Example</figcaption>
            <TopicExample
              topicId={topic.id}
              className="self-center py-1 text-mono-lg"
            />
          </figure>
          <p className="text-body-sm text-muted-foreground text-pretty">
            {topic.why}{" "}
            <Link to={`/learn#${topic.learnAnchor}`} className="link">
              Learn {topic.name.toLowerCase()} first
            </Link>
            .
          </p>
        </div>
        <Part label="Format" id="format-label">
          <Segmented
            aria-label="Format"
            id="topic-format"
            fullWidth
            value={panel.format}
            onValueChange={(f) => onOpen({ ...panel, format: f })}
            options={TOPIC_FORMATS}
          />
          <p className="text-body-sm text-muted-foreground">{spec.summary}</p>
        </Part>
        {spec.ranked && (
          <div className="flex flex-col gap-3">
            <dl className="flex flex-col gap-1.5">
              <LeaderRow label="Your best">
                {b ? bestText(panel.format, b) : "not played yet"}
              </LeaderRow>
              {b && <RankRow modeId={id} />}
            </dl>
            <Link
              to={`/leaderboard?mode=${encodeURIComponent(id)}`}
              className="link self-start text-body-sm"
            >
              Leaderboard for {topic.name} · {spec.name}
            </Link>
          </div>
        )}
      </CardBody>
      <CardFooter>
        <CopyLinkButton path={hubLink(id)} />
        <StartButton to={runPath(id)} />
      </CardFooter>
    </>
  );
}

/** The rank line, printed only for a signed-in player once it has loaded. */
function RankRow({ modeId: id }: { modeId: string }) {
  const { isGuest } = useAuth();
  if (isGuest) return null;
  return <RankRowInner modeId={id} />;
}

function RankRowInner({ modeId: id }: { modeId: string }) {
  const { me, loading } = useLeaderboard(id, { limit: 1 });
  if (loading || !me) return null;
  return (
    <LeaderRow label="Your rank">
      {me.rank === null ? "100+" : `#${me.rank}`}
    </LeaderRow>
  );
}

function SurvivalCard({ best }: { best: BestEntry | undefined }) {
  const stages = SURVIVAL_STAGES.map((s, i) => ({
    name: getTopic(s.topicId).name,
    from: s.from + 1,
    to: SURVIVAL_STAGES[i + 1]?.from ?? SURVIVAL_ENDGAME_FROM,
  }));
  return (
    <>
      <CardHead
        head="Front matter · ranked, endless"
        title="Survival"
        description={FORMATS.survival.summary}
      />
      <CardBody>
        <Part label="The climb" id="climb-label">
          <table className="w-full border-collapse text-body-sm">
            <caption className="sr-only">
              Which topic each stretch of questions draws from
            </caption>
            <thead className="rule-double">
              <tr className="smallcaps">
                <th scope="col" className="w-28 pb-1 text-left font-medium">
                  Questions
                </th>
                <th scope="col" className="pb-1 text-left font-medium">
                  Topic
                </th>
              </tr>
            </thead>
            <tbody>
              {stages.map((s) => (
                <tr key={s.name} className="border-b border-border">
                  <td className="py-1.5 font-mono text-[0.8125rem] tabular-nums text-muted-foreground">
                    {s.from}–{s.to}
                  </td>
                  <td className="py-1.5">{s.name}</td>
                </tr>
              ))}
              <tr>
                <td className="py-1.5 font-mono text-[0.8125rem] tabular-nums text-muted-foreground">
                  {SURVIVAL_ENDGAME_FROM + 1}+
                </td>
                <td className="py-1.5">Everything, mixed</td>
              </tr>
            </tbody>
          </table>
          <p className="text-body-sm text-muted-foreground text-pretty">
            The clock starts at 15 seconds and shrinks with every question;
            longer answers get a little extra time. From question 11, earlier
            topics come back for review.
          </p>
        </Part>
        <dl className="flex flex-col gap-1.5">
          <LeaderRow label="Your best">
            {best ? `${best.score} cleared` : "not played yet"}
          </LeaderRow>
          {best && <RankRow modeId="survival" />}
        </dl>
      </CardBody>
      <CardFooter>
        <CopyLinkButton path={hubLink("survival")} />
        <StartButton to="/play/survival" />
      </CardFooter>
    </>
  );
}

function CustomCard({ initial }: { initial: CustomConfig }) {
  const [config, setConfig] = useState<CustomConfig>(initial);
  const problem = customConfigProblem(config);
  return (
    <>
      <CardHead
        head="Appendix · unranked, shareable"
        title="Custom drill"
        description="Pick what to practise. Copy the link to give a class the exact same drill."
      />
      <div className="px-5 py-5 sm:px-7">
        <CustomModeBuilder value={config} onChange={setConfig} />
      </div>
      <CardFooter>
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
      </CardFooter>
    </>
  );
}
