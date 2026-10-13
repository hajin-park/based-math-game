/**
 * /play — the workbook's Contents. Front matter first (continue, today's
 * sheet, survival), then four chapters of topics with dot leaders to your
 * bests, then the appendix for custom drills. Enter starts what Play starts
 * on the cover. Deep links: /play?mode=<id> opens that mode's card,
 * /play?mode=custom&c=<config> opens a shared custom drill,
 * /play?panel=settings opens the game settings, /play?mode=daily… goes to
 * /daily.
 */
import { useCallback, useEffect, useMemo } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "@/components/ui/use-toast";
import { bestsKey, useUserStats, type BestEntry } from "@/data";
import { TIERS, isTopicId, modeId, topicsInTier } from "@/game";
import {
  Appendix,
  Chapter,
  FrontMatter,
} from "@/features/play/ContentsEntries";
import { ContentsPanel, type Panel } from "@/features/play/ContentsPanel";
import { type ChapterTopicId } from "@/features/play/ContentsShared";
import {
  DEFAULT_CUSTOM_CONFIG,
  decodeCustomConfig,
} from "@/features/play/links";
import { useStartTarget } from "@/features/play/useStartTarget";

const TOPIC_COUNT = TIERS.reduce(
  (n, tier) => n + topicsInTier(tier).filter((t) => t.id !== "custom").length,
  0,
);

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

export default function Play() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const parsed = useMemo(() => parsePanel(params), [params]);
  const { stats } = useUserStats();
  const start = useStartTarget();

  // Invalid deep links: explain, then show the plain contents.
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

  const open = (next: Panel) => {
    const p = new URLSearchParams();
    if (next.kind === "settings") p.set("panel", "settings");
    else if (next.kind === "survival") p.set("mode", "survival");
    else if (next.kind === "custom") p.set("mode", "custom");
    else p.set("mode", modeId(next.topicId, next.format));
    setParams(p, { replace: true });
  };
  const close = () => setParams({}, { replace: true });

  // Enter (outside any control, no card open) starts what Play starts.
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
      navigate(start.path);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, navigate, start.path]);

  useEffect(() => {
    document.title = "Contents · Based Math Game";
  }, []);

  if ("redirect" in parsed) return <Navigate to={parsed.redirect} replace />;

  return (
    <div className="container flex max-w-[60rem] flex-col gap-12 py-10 md:gap-14 md:py-14">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Contents"
          lede={`${TOPIC_COUNT} topics in ${TIERS.length} chapters. Each plays as a 60-second sprint, a race to 15 correct, or untimed practice.`}
          actions={
            <Button
              variant="outline"
              onClick={() => open({ kind: "settings" })}
            >
              <SlidersHorizontal aria-hidden />
              Game settings
            </Button>
          }
          divider
          className="pb-6"
        />
        <FrontMatter
          start={start}
          startBest={best(start.modeId)}
          survivalBest={best("survival")}
          onSurvival={() => open({ kind: "survival" })}
        />
      </div>

      {TIERS.map((tier) => (
        <Chapter
          key={tier}
          tier={tier}
          topics={topicsInTier(tier).filter((t) => t.id !== "custom")}
          best={best}
          onOpen={(topic, format) =>
            open({
              kind: "topic",
              topicId: topic.id as ChapterTopicId,
              format,
            })
          }
        />
      ))}

      <Appendix
        onBuild={() => open({ kind: "custom", config: DEFAULT_CUSTOM_CONFIG })}
      />

      <ContentsPanel panel={panel} onClose={close} onOpen={open} best={best} />
    </div>
  );
}
