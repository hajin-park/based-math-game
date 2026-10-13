import { useId, type ReactNode } from "react";
import { Segmented } from "@/components/ui/segmented";
import { TIERS, topicsInTier, type Tier } from "@/game";
import { cn } from "@/lib/utils";
import { CustomModeBuilder } from "@/features/play/CustomModeBuilder";
import { TopicExample } from "@/features/play/TopicExample";
import { FIELD_LABEL, FormRow } from "./FormRow";
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
 * Mode picker for rooms, printed as worksheet rows: a format switch, then the
 * drill list from the engine catalog laid out like a contents page (native
 * radios, so arrow keys and screen readers work). Practice and daily are not
 * room formats. `dense` narrows the label column (settings dialog).
 */
export function ModePicker({
  value,
  onChange,
  dense,
}: {
  value: ModePickerValue;
  onChange: (value: ModePickerValue) => void;
  dense?: boolean;
}) {
  const uid = useId();
  const survival = value.format === "survival";
  const isCustom = value.format === "custom";
  const custom = value.custom ?? DEFAULT_ROOM_CUSTOM;
  const timing: CustomTiming = custom.targetCount ? "speedrun" : "sprint";
  const setTiming = (next: CustomTiming) =>
    onChange({
      ...value,
      // roomModeOf() strips the undefined key before it reaches RTDB.
      custom:
        next === "sprint"
          ? { ...custom, targetCount: undefined, durationMs: 60_000 }
          : { ...custom, durationMs: undefined, targetCount: 15 },
    });
  const hint = FORMAT_OPTIONS.find((o) => o.value === value.format)?.hint;

  return (
    <>
      <FormRow
        dense={dense}
        label={
          <span id={`${uid}-format`} className={FIELD_LABEL}>
            Format
          </span>
        }
      >
        <div className="flex flex-col gap-2.5">
          <Segmented
            id={`${uid}-seg`}
            aria-label="Format"
            size="lg"
            fullWidth
            // Four formats must fit a 320px screen without scrolling.
            className="max-xs:[&>button]:px-1.5 max-xs:[&>button]:text-label"
            value={value.format}
            onValueChange={(format) => onChange({ ...value, format })}
            options={FORMAT_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
          <p className="text-body-sm text-muted-foreground">{hint}</p>
        </div>
      </FormRow>

      {isCustom ? (
        <>
          <FormRow
            dense={dense}
            label={<span className={FIELD_LABEL}>Timing</span>}
          >
            <Segmented
              aria-label="Custom drill timing"
              value={timing}
              onValueChange={setTiming}
              options={[
                { value: "sprint", label: "Sprint · 60 s" },
                { value: "speedrun", label: "Race to 15" },
              ]}
            />
          </FormRow>
          <FormRow
            dense={dense}
            label={<span className={FIELD_LABEL}>Drill</span>}
            note="Your own conversions and number ranges."
          >
            <CustomModeBuilder
              hideFormat
              value={custom}
              onChange={(next) => onChange({ ...value, custom: next })}
            />
          </FormRow>
        </>
      ) : (
        <FormRow
          dense={dense}
          label={
            <span aria-hidden className={FIELD_LABEL}>
              Drill
            </span>
          }
        >
          <fieldset
            disabled={survival}
            aria-describedby={survival ? `${uid}-survival` : undefined}
            className="flex min-w-0 flex-col gap-4"
          >
            <legend className="sr-only">Drill</legend>
            {survival && (
              <p
                id={`${uid}-survival`}
                className="bg-tint px-4 py-3 text-body-sm"
              >
                <span className="mr-2 font-serif font-medium tracking-[0.05em] text-primary [font-variant-caps:all-small-caps]">
                  Note
                </span>
                Survival plays every topic in order, so there is nothing to
                pick.
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
                  <div key={tier} className="flex flex-col">
                    <p
                      aria-hidden
                      className="smallcaps border-b border-foreground/25 pb-1"
                    >
                      {TIER_LABEL[tier]}
                    </p>
                    <div className="flex flex-col">
                      {topics.map((topic) => {
                        const checked = !survival && value.topicId === topic.id;
                        return (
                          <label
                            key={topic.id}
                            className={cn(
                              "group relative grid min-h-12 cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1 border-b border-foreground/10 px-2 py-2.5 sm:grid-cols-[1.25rem_minmax(0,1fr)_auto]",
                              "transition-colors duration-fast hover:bg-accent",
                              "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-ring",
                              checked && "bg-tint hover:bg-tint",
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
                            {/* An answer bubble, filled in when chosen. */}
                            <span
                              aria-hidden
                              className={cn(
                                "mt-[0.3rem] flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] border-foreground/55",
                                checked && "border-foreground",
                              )}
                            >
                              {checked && (
                                <span className="size-2 rounded-full bg-foreground" />
                              )}
                            </span>
                            <span className="flex min-w-0 flex-col gap-0.5">
                              <span className="font-serif text-[1.0625rem] font-bold leading-snug">
                                {topic.name}
                              </span>
                              <span className="text-body-sm text-muted-foreground">
                                {topic.summary}
                              </span>
                            </span>
                            <TopicExample
                              topicId={topic.id}
                              className="col-start-2 gap-x-1.5 text-[0.8125rem] max-sm:flex-wrap max-sm:whitespace-normal sm:col-start-3 sm:row-start-1 sm:mt-1 sm:justify-self-end"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </FormRow>
      )}
    </>
  );
}
