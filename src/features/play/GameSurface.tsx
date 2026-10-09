/**
 * GameSurface — the playable part of a run: instruction, prompt, answer
 * field, skip, and the reveal / worked solution after a skip.
 *
 * It renders no top bar, does no routing and writes no data, so both the
 * singleplayer run screen and multiplayer rooms can place it beside their own
 * chrome (timer, scoreboard). Drive it with the engine's `useRun`.
 *
 *   const run = useRun({ mode, seed, onFinish });
 *   <GameSurface run={run} settings={settings} />
 */
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Lightbulb, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { GameSettings } from "@/data";
import {
  explainQuestion,
  getTopic,
  isAcceptableKeystroke,
  useRun,
  type Question,
  type RunReveal,
} from "@/game";
import { cn } from "@/lib/utils";
import { AnswerField, type AnswerFieldHandle } from "./AnswerField";
import { AnswerValue } from "./AnswerValue";
import { ExplanationSteps } from "./ExplanationSteps";
import { PromptView } from "./PromptView";
import { questionLabel, spokenAnswer } from "./describe";
import { useSoundCues } from "./sound";

export { PromptView } from "./PromptView";
export type { PromptViewProps } from "./PromptView";
// Part of the shared contract: multiplayer imports these from here.
// eslint-disable-next-line react-refresh/only-export-components
export { useSoundCues } from "./sound";
export type { SoundCue, SoundCues } from "./sound";

export type RunHandle = ReturnType<typeof useRun>;

export interface GameSurfaceProps {
  run: RunHandle;
  settings: GameSettings;
  /** Apply the grouping / place-value settings (default true). */
  allowVisualAids?: boolean;
  /** Show the Skip button and enable the Tab shortcut (default true). */
  showSkip?: boolean;
  /** Play sound cues (default: settings.soundEffects). */
  sound?: boolean;
  className?: string;
  /** Called after the player skips a question (button or Tab). */
  onSkip?: () => void;
}

const REJECT_HINT: Record<Question["answerFormat"], string> = {
  binary: "Binary uses only 0 and 1",
  octal: "Octal digits are 0 to 7",
  decimal: "Digits 0 to 9 only",
  "signed-decimal": "Digits 0 to 9 and a leading minus only",
  hex: "Hex digits are 0 to 9 and A to F",
  char: "Type a single character",
};

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function trailingStreak(outcomes: RunHandle["outcomes"]): number {
  let n = 0;
  for (let i = outcomes.length - 1; i >= 0; i--) {
    if (outcomes[i].result !== "correct") break;
    n++;
  }
  return n;
}

/** Skip button text with its cost in this format. */
function skipLabel(run: RunHandle): string {
  const { format, spec } = run.mode;
  if (format === "practice") return "Show answer";
  if (format === "survival") return "Skip · −1 life";
  if (spec.skipPenaltyMs) return `Skip · +${spec.skipPenaltyMs / 1000} s`;
  return "Skip";
}

export function GameSurface({
  run,
  settings,
  allowVisualAids = true,
  showSkip = true,
  sound,
  className,
  onSkip,
}: GameSurfaceProps) {
  const questionId = useId();
  const hintId = useId();
  const field = useRef<AnswerFieldHandle>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const cues = useSoundCues(sound ?? settings.soundEffects);
  const [announcement, setAnnouncement] = useState({ text: "", n: 0 });
  const [invalid, setInvalid] = useState(false);
  const [hintFor, setHintFor] = useState<string | null>(null);
  const lastRejectAt = useRef(0);

  const question = run.question;
  const practice = run.mode.format === "practice";
  const practiceReveal: RunReveal | null =
    practice && run.reveal ? run.reveal : null;
  const grouped = allowVisualAids && settings.groupedDigits;
  const placeValues = allowVisualAids && settings.indexValueHints;
  const running = run.status === "running";

  const announce = useCallback((text: string) => {
    setAnnouncement((a) => ({ text, n: a.n + 1 }));
  }, []);

  // React to each new outcome: feedback, sound, announcement.
  const seen = useRef(run.outcomes.length);
  useEffect(() => {
    const n = run.outcomes.length;
    if (n <= seen.current) {
      seen.current = n; // reset or no change
      return;
    }
    seen.current = n;
    const last = run.outcomes[n - 1];
    const next = run.question;
    if (last.result === "correct") {
      field.current?.flash();
      cues.play("correct");
      const el = promptRef.current;
      if (el && !reducedMotion()) {
        el.animate(
          [
            { opacity: 0.25, transform: "translateY(5px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
      }
      announce(next ? `Correct. Next: ${questionLabel(next)}` : "Correct.");
    } else {
      cues.play("miss");
      cues.buzz();
      const what = last.result === "timeout" ? "Time's up" : "Skipped";
      const tail = practice
        ? " The worked solution is below."
        : next
          ? ` Next: ${questionLabel(next)}`
          : "";
      announce(
        `${what}. The answer was ${spokenAnswer(last.question)}.${tail}`,
      );
    }
    // run.question changes in the same render as outcomes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.outcomes]);

  // First question of a run.
  const announcedStart = useRef<number | null>(null);
  useEffect(() => {
    if (
      running &&
      question &&
      run.index === 0 &&
      announcedStart.current !== run.seed
    ) {
      announcedStart.current = run.seed;
      announce(questionLabel(question));
    }
    if (!running) announcedStart.current = null;
  }, [running, question, run.index, run.seed, announce]);

  // Flashed answers (timed formats) clear themselves.
  useEffect(() => {
    if (!run.reveal || practice) return;
    const t = window.setTimeout(run.dismissReveal, 2600);
    return () => window.clearTimeout(t);
  }, [run.reveal, practice, run.dismissReveal]);

  // Keep the field focused: after the practice reveal closes, and when the
  // player starts typing while focus is elsewhere on the page.
  useLayoutEffect(() => {
    if (running && !practiceReveal) field.current?.focus();
  }, [running, practiceReveal]);
  useEffect(() => {
    if (!running || practiceReveal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        t !== document.body &&
        t.closest("input,textarea,select,[role=dialog],[contenteditable=true]")
      )
        return;
      field.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, practiceReveal]);

  const setInput = useCallback(
    (raw: string) => {
      setInvalid(false);
      return run.setInput(raw);
    },
    [run],
  );

  const onReject = useCallback(
    (raw: string) => {
      if (!question) return;
      field.current?.shake();
      const now = Date.now();
      if (now - lastRejectAt.current < 1500) return;
      lastRejectAt.current = now;
      const tooLong = isAcceptableKeystroke(raw, {
        ...question,
        maxLength: 64,
      });
      announce(
        tooLong
          ? "That is already the longest possible answer."
          : `${REJECT_HINT[question.answerFormat]}.`,
      );
    },
    [question, announce],
  );

  const onEnter = useCallback(() => {
    if (!question || run.input.trim() === "") return;
    // A correct answer would already have advanced.
    setInvalid(true);
    field.current?.shake();
    announce(
      showSkip
        ? "Not correct yet. Keep typing, or press Tab to skip."
        : "Not correct yet.",
    );
  }, [question, run.input, announce, showSkip]);

  const skip = useCallback(() => {
    if (!running || !question) return;
    run.skip();
    onSkip?.();
  }, [run, running, question, onSkip]);

  const streak = trailingStreak(run.outcomes);
  const hintOpen = practice && !!question && hintFor === question.id;
  const showHint = () => {
    if (!question) return;
    setHintFor(question.id);
    const [first] = explainQuestion(question);
    if (first) announce(`Hint: ${first.title}. ${first.note ?? ""}`);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-5 sm:gap-7",
        className,
      )}
    >
      {practiceReveal ? (
        <PracticeReveal
          reveal={practiceReveal}
          grouped={grouped}
          placeValues={placeValues}
          onNext={run.dismissReveal}
        />
      ) : (
        <>
          <p className="min-h-5 text-center text-label text-muted-foreground">
            {question?.instruction ?? " "}
          </p>

          <div
            ref={promptRef}
            id={questionId}
            data-testid="question"
            role="img"
            aria-roledescription="question"
            aria-label={
              question
                ? questionLabel(question)
                : "Waiting for the first question"
            }
            {...convertData(question)}
            className="flex min-h-24 w-full items-center justify-center sm:min-h-32"
          >
            {question ? (
              <PromptView
                prompt={question.prompt}
                grouped={grouped}
                placeValues={placeValues}
              />
            ) : (
              <span
                aria-hidden
                className="font-mono text-mono-2xl text-muted-foreground/40"
              >
                · · ·
              </span>
            )}
          </div>

          {question ? (
            <AnswerField
              ref={field}
              question={question}
              value={run.input}
              onValueChange={setInput}
              onReject={onReject}
              onEnter={onEnter}
              onTab={showSkip ? skip : undefined}
              invalid={invalid}
              disabled={!running}
              describedBy={`${questionId} ${hintId}`}
              autoFocus
            />
          ) : (
            <div aria-hidden className="h-[5.5rem] w-full max-w-md sm:h-24" />
          )}

          {practice ? (
            hintOpen && question && <HintPanel question={question} />
          ) : (
            <FlashReveal reveal={run.reveal} />
          )}

          <div className="flex min-h-11 w-full max-w-md items-center justify-between gap-3">
            {practice ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={showHint}
                disabled={!running || !question || hintOpen}
                className="text-muted-foreground hover:text-foreground"
              >
                <Lightbulb aria-hidden />
                Hint
              </Button>
            ) : (
              <Streak count={streak} />
            )}
            {showSkip && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={skip}
                disabled={!running || !question}
                className="text-muted-foreground hover:text-foreground"
                aria-keyshortcuts="Tab"
              >
                <SkipForward aria-hidden />
                {skipLabel(run)}
                <Kbd
                  size="sm"
                  className="ml-0.5 hidden pointer-fine:inline-flex"
                >
                  Tab
                </Kbd>
              </Button>
            )}
          </div>
          <p id={hintId} className="sr-only">
            {showSkip
              ? practice
                ? "Answers advance as soon as they are correct. Press Tab to show the answer with a worked solution."
                : "Answers advance as soon as they are correct. Press Tab to skip."
              : "Answers advance as soon as they are correct."}
          </p>
        </>
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement.text && <p key={announcement.n}>{announcement.text}</p>}
      </div>
    </div>
  );
}

function convertData(q: Question | null) {
  if (!q || q.kind !== "convert" || !q.answerBase) return {};
  const first = q.prompt[0];
  if (first?.type !== "number") return {};
  const names = {
    2: "binary",
    8: "octal",
    10: "decimal",
    16: "hexadecimal",
  } as const;
  return {
    "data-from": names[first.base],
    "data-to": names[q.answerBase],
    "data-value": first.digits,
  };
}

const Streak = memo(function Streak({ count }: { count: number }) {
  if (count < 3) return <span aria-hidden />;
  return (
    <span className="inline-flex items-baseline gap-1.5 text-label text-muted-foreground">
      <span className="eyebrow text-[0.625rem]">Streak</span>
      <span
        key={count}
        className="font-mono tabular-nums text-foreground motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95"
      >
        {count}
      </span>
    </span>
  );
});

function HintPanel({ question }: { question: Question }) {
  const [first] = explainQuestion(question);
  if (!first) return null;
  return (
    <div className="w-full max-w-md rounded-lg border border-dashed border-border-strong bg-card/80 px-4 py-3 motion-safe:animate-in motion-safe:fade-in-0">
      <p className="flex items-center gap-1.5 text-label font-medium text-foreground">
        <Lightbulb aria-hidden className="size-4 text-muted-foreground" />
        {first.title}
      </p>
      {first.note && (
        <p className="mt-1.5 text-body-sm text-muted-foreground">
          {first.note}
        </p>
      )}
    </div>
  );
}

function FlashReveal({ reveal }: { reveal: RunReveal | null }) {
  return (
    <p
      aria-hidden
      className={cn(
        "flex min-h-6 items-center justify-center gap-2 text-label text-muted-foreground transition-opacity duration-base",
        reveal ? "opacity-100" : "opacity-0",
      )}
    >
      {reveal && (
        <>
          <span>
            {reveal.result === "timeout"
              ? "Time's up · it was"
              : "Skipped · it was"}
          </span>
          <AnswerValue question={reveal.question} size="sm" />
        </>
      )}
    </p>
  );
}

function PracticeReveal({
  reveal,
  grouped,
  placeValues,
  onNext,
}: {
  reveal: RunReveal;
  grouped: boolean;
  placeValues: boolean;
  onNext: () => void;
}) {
  const q = reveal.question;
  const topic =
    q.topicId !== "custom" && q.topicId !== "mixed"
      ? getTopic(q.topicId)
      : null;
  const nextRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    nextRef.current?.focus({ preventScroll: true });
  }, [q]);

  return (
    <section
      aria-labelledby="practice-reveal-title"
      className="w-full max-w-xl rounded-xl border bg-card p-5 shadow-xs motion-safe:animate-rise sm:p-6"
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) onNext();
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Worked solution</p>
          <h2 id="practice-reveal-title" className="text-title font-semibold">
            {q.instruction}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border bg-sunken/50 px-4 py-3">
          <PromptView
            prompt={q.prompt}
            grouped={grouped}
            placeValues={placeValues}
            size="sm"
          />
          <ArrowRight aria-hidden className="size-4 text-muted-foreground" />
          <AnswerValue question={q} size="md" />
          <span className="sr-only">
            {questionLabel(q)}. Answer: {spokenAnswer(q)}.
          </span>
        </div>
        <ExplanationSteps question={q} />
        <div className="flex flex-col-reverse items-stretch gap-3 border-t pt-4 xs:flex-row xs:items-center xs:justify-between">
          {topic ? (
            <Link
              to={`/learn#${topic.learnAnchor}`}
              className="link inline-flex items-center gap-1.5 text-label"
            >
              <BookOpen aria-hidden className="size-4" />
              Learn: {topic.name}
            </Link>
          ) : (
            <span />
          )}
          <Button ref={nextRef} type="button" onClick={onNext}>
            Next question
            <Kbd
              size="sm"
              tone="inverse"
              className="hidden pointer-fine:inline-flex"
              aria-hidden
            >
              Enter
            </Kbd>
          </Button>
        </div>
      </div>
    </section>
  );
}
