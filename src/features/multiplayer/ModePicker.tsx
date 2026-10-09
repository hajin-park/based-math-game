import { useId, type ReactNode } from "react";
import { Segmented } from "@/components/ui/segmented";
import { TIERS, topicsInTier, type Tier } from "@/game";
import { cn } from "@/lib/utils";
import { CustomModeBuilder } from "@/features/play/CustomModeBuilder";
import {
  DEFAULT_ROOM_CUSTOM,
  type ModePickerValue,
  type RoomFormat,
} from "./modeChoice";

const TIER_LABEL: Record<Tier, string> = {
  foundations: "Foundations",
  core: "Core",
  advanced: "Advanced",
  applied: "Applied",
};

const FORMAT_OPTIONS: { value: RoomFormat; label: ReactNode; hint: string }[] =
  [
    {
      value: "sprint",
      label: "Sprint",
      hint: "Most correct answers in 60 seconds wins.",
    },
    {
      value: "speedrun",
      label: "Speedrun",
      hint: "First to 15 correct answers wins. Each skip adds 5 seconds.",
    },
    {
      value: "survival",
      label: "Survival",
      hint: "Three lives and a shrinking clock, ramping from nibbles to bitwise. Most questions cleared wins.",
    },
    {
      value: "custom",
      label: "Custom",
      hint: "Your own conversions and ranges, played as a sprint or a race to a target.",
    },
  ];

type CustomTiming = "sprint" | "speedrun";

/**
 * Compact mode picker for rooms: a format switch and a topic list built from
 * the engine catalog (native radios, so arrow keys and screen readers work).
 * Practice and daily are not room formats.
 */
export function ModePicker({
  value,
  onChange,
  className,
}: {
  value: ModePickerValue;
  onChange: (value: ModePickerValue) => void;
  className?: string;
}) {
  const uid = useId();
  const survival = value.format === "survival";
  const isCustom = value.format === "custom";
  const custom = value.custom ?? DEFAULT_ROOM_CUSTOM;
  const timing: CustomTiming = custom.targetCount ? "speedrun" : "sprint";
  const setTiming = (next: CustomTiming) =>
    onChange({
      ...value,
      custom:
        next === "sprint"
          ? { ...custom, targetCount: undefined, durationMs: 60_000 }
          : { ...custom, durationMs: undefined, targetCount: 15 },
    });
  const hint = FORMAT_OPTIONS.find((o) => o.value === value.format)?.hint;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <span id={`${uid}-format`} className="text-label font-medium">
          Format
        </span>
        <Segmented
          id={`${uid}-seg`}
          aria-label="Format"
          size="lg"
          fullWidth
          // Four formats must fit a 320px screen without scrolling.
          className="max-xs:[&>button]:px-1.5 max-xs:[&>button]:text-label"
          value={value.format}
          onValueChange={(format) => onChange({ ...value, format })}
          options={FORMAT_OPTIONS.map(({ value, label }) => ({ value, label }))}
        />
        <p className="text-body-sm text-muted-foreground">{hint}</p>
      </div>

      {isCustom ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-label font-medium">Timing</span>
            <Segmented
              aria-label="Custom drill timing"
              value={timing}
              onValueChange={setTiming}
              options={[
                { value: "sprint", label: "Sprint · 60 s" },
                { value: "speedrun", label: "Race to 15" },
              ]}
            />
          </div>
          <CustomModeBuilder
            hideFormat
            value={custom}
            onChange={(next) => onChange({ ...value, custom: next })}
          />
        </div>
      ) : (
        <fieldset
          disabled={survival}
          aria-describedby={survival ? `${uid}-survival` : undefined}
          className="flex min-w-0 flex-col gap-3"
        >
          <legend className="mb-2 text-label font-medium">Topic</legend>
          {survival && (
            <p
              id={`${uid}-survival`}
              className="-mt-1 rounded-md border border-dashed px-3 py-2.5 text-body-sm text-muted-foreground"
            >
              Survival plays every topic in order, so there is nothing to pick.
            </p>
          )}
          <div
            className={cn(
              "flex flex-col gap-5",
              survival && "pointer-events-none opacity-45",
            )}
          >
            {TIERS.map((tier) => {
              const topics = topicsInTier(tier).filter(
                (t) => t.id !== "custom",
              );
              if (!topics.length) return null;
              return (
                <div key={tier} className="flex flex-col gap-1.5">
                  <p className="eyebrow" aria-hidden>
                    {TIER_LABEL[tier]}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                    {topics.map((topic) => {
                      const checked = !survival && value.topicId === topic.id;
                      return (
                        <label
                          key={topic.id}
                          className={cn(
                            "group relative flex min-h-12 cursor-pointer items-start gap-3 rounded-md border bg-card px-3 py-2.5",
                            "transition-[border-color,background-color] duration-fast",
                            "hover:border-border-strong has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                            checked &&
                              "border-primary/60 bg-primary/[0.05] hover:border-primary/60",
                          )}
                        >
                          <input
                            type="radio"
                            name={`${uid}-topic`}
                            value={topic.id}
                            checked={checked}
                            onChange={() =>
                              onChange({ ...value, topicId: topic.id })
                            }
                            className="sr-only"
                          />
                          <span
                            aria-hidden
                            className={cn(
                              "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-input",
                              checked && "border-primary",
                            )}
                          >
                            {checked && (
                              <span className="size-2 rounded-full bg-primary" />
                            )}
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                              <span className="text-[0.9375rem] font-medium">
                                {topic.name}
                              </span>
                              <span className="truncate font-mono text-[0.75rem] text-muted-foreground">
                                {topic.example}
                              </span>
                            </span>
                            <span className="text-body-sm text-muted-foreground">
                              {topic.summary}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
