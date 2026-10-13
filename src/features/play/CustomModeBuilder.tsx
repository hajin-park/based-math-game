/**
 * CustomModeBuilder — build a custom drill: conversion pairs with inclusive
 * decimal ranges, optional extra question kinds, and a format (sprint
 * seconds, speedrun target or untimed). Controlled: `{ value, onChange }`.
 * Shared by the /play hub and multiplayer room setup.
 */
import { useEffect, useId, useState } from "react";
import { ArrowRight, Check, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import {
  CUSTOM_MAX_VALUE,
  type Base,
  type CustomConfig,
  type QuestionKind,
} from "@/game";
import { cn } from "@/lib/utils";
import { CUSTOM_LIMITS, EXTRA_KINDS, customConfigProblem } from "./links";

export interface CustomModeBuilderProps {
  value: CustomConfig;
  onChange: (config: CustomConfig) => void;
  /** Hide the format picker (e.g. when a room sets its own timing). */
  hideFormat?: boolean;
  className?: string;
}

const BASE_OPTIONS: { value: Base; label: string }[] = [
  { value: 2, label: "Binary" },
  { value: 8, label: "Octal" },
  { value: 10, label: "Decimal" },
  { value: 16, label: "Hex" },
];

const KIND_LABEL: Record<Exclude<QuestionKind, "convert">, string> = {
  power: "Powers of two",
  twos: "Two's complement",
  bitwise: "Bitwise ops",
  add: "Binary addition",
  color: "Hex colors",
  ascii: "ASCII",
};

const RANGE_PRESETS = [
  { label: "4-bit", max: 15 },
  { label: "8-bit", max: 255 },
  { label: "12-bit", max: 4095 },
  { label: "16-bit", max: 65535 },
];

const SPRINT_SECONDS = ["30", "60", "120", "300"] as const;
const SPEEDRUN_TARGETS = ["10", "15", "25", "50"] as const;

type FormatChoice = "sprint" | "speedrun" | "untimed";

function formatOf(c: CustomConfig): FormatChoice {
  return c.durationMs ? "sprint" : c.targetCount ? "speedrun" : "untimed";
}

export function CustomModeBuilder({
  value,
  onChange,
  hideFormat,
  className,
}: CustomModeBuilderProps) {
  const id = useId();
  const conversions = value.conversions;
  const kinds = value.kinds ?? [];
  const format = formatOf(value);
  const problem = customConfigProblem(value);

  const setConversion = (
    index: number,
    patch: Partial<CustomConfig["conversions"][number]>,
  ) => {
    const next = conversions.map((c, i) => {
      if (i !== index) return c;
      const merged = { ...c, ...patch };
      // Picking the same base on both sides swaps them instead.
      if (patch.from !== undefined && patch.from === c.to) merged.to = c.from;
      if (patch.to !== undefined && patch.to === c.from) merged.from = c.to;
      return merged;
    });
    onChange({ ...value, conversions: next });
  };

  const addConversion = () => {
    const last = conversions[conversions.length - 1];
    onChange({
      ...value,
      conversions: [
        ...conversions,
        last
          ? { ...last, from: last.to, to: last.from }
          : { from: 16, to: 2, min: 0, max: 255 },
      ],
    });
  };

  const removeConversion = (index: number) =>
    onChange({
      ...value,
      conversions: conversions.filter((_, i) => i !== index),
    });

  const toggleKind = (kind: Exclude<QuestionKind, "convert">) => {
    const next = kinds.includes(kind)
      ? kinds.filter((k) => k !== kind)
      : [...kinds, kind];
    const out: CustomConfig = { ...value };
    if (next.length) out.kinds = next;
    else delete out.kinds;
    onChange(out);
  };

  const setFormat = (f: FormatChoice) => {
    const out: CustomConfig = {
      conversions,
      ...(kinds.length ? { kinds } : {}),
    };
    if (f === "sprint") out.durationMs = value.durationMs ?? 60_000;
    if (f === "speedrun") out.targetCount = value.targetCount ?? 15;
    onChange(out);
  };

  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-border [&>*:first-child]:pt-0 [&>*]:py-5",
        className,
      )}
    >
      <fieldset className="flex flex-col">
        <legend className="float-left mb-1 flex w-full flex-wrap items-baseline justify-between gap-x-3">
          <span className="smallcaps text-foreground/80">Conversions</span>
          <span className="font-sans text-[0.8125rem] text-muted-foreground">
            values in decimal, inclusive
          </span>
        </legend>
        <ol className="flex flex-col">
          {conversions.map((c, i) => (
            <li
              key={i}
              className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-x-2 border-b border-border py-3"
            >
              <span className="pt-6 font-mono text-mono-md text-primary">
                {i + 1}.
              </span>
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-end gap-3">
                  <BaseSelect
                    id={`${id}-from-${i}`}
                    label="From"
                    value={c.from}
                    onChange={(from) => setConversion(i, { from })}
                  />
                  <ArrowRight
                    aria-hidden
                    className="mb-3 size-4 shrink-0 text-muted-foreground"
                  />
                  <BaseSelect
                    id={`${id}-to-${i}`}
                    label="To"
                    value={c.to}
                    onChange={(to) => setConversion(i, { to })}
                  />
                </div>
                <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                  <NumberField
                    id={`${id}-min-${i}`}
                    label="From value"
                    value={c.min}
                    onCommit={(min) => setConversion(i, { min })}
                  />
                  <span
                    aria-hidden
                    className="mb-2.5 font-sans text-label text-muted-foreground"
                  >
                    to
                  </span>
                  <NumberField
                    id={`${id}-max-${i}`}
                    label="To value"
                    value={c.max}
                    onCommit={(max) => setConversion(i, { max })}
                  />
                  <div
                    role="group"
                    aria-label={`Range presets for conversion ${i + 1}`}
                    className="flex w-full flex-wrap gap-1 sm:w-auto"
                  >
                    {RANGE_PRESETS.map((p) => {
                      const on = c.min === 0 && c.max === p.max;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            setConversion(i, { min: 0, max: p.max })
                          }
                          className={cn(
                            "relative inline-flex h-8 items-center rounded-sm px-2 font-mono text-[0.75rem] transition-colors duration-fast pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:-inset-y-1.5 pointer-coarse:after:content-['']",
                            on
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="mt-5 text-muted-foreground"
                onClick={() => removeConversion(i)}
                disabled={conversions.length === 1 && kinds.length === 0}
                aria-label={`Remove conversion ${i + 1}`}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ol>
        {conversions.length < CUSTOM_LIMITS.conversions && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addConversion}
            className="-ml-3 mt-2 self-start"
          >
            <Plus aria-hidden />
            Add conversion
          </Button>
        )}
      </fieldset>

      <fieldset className="flex flex-col">
        <legend className="smallcaps float-left mb-1 w-full text-foreground/80">
          Also include
        </legend>
        <div className="grid grid-cols-1 gap-x-6 xs:grid-cols-2">
          {EXTRA_KINDS.map((k) => {
            const on = kinds.includes(k);
            return (
              <label
                key={k}
                className="flex min-h-10 cursor-pointer items-center gap-3 border-b border-border py-1.5 text-body-sm pointer-coarse:min-h-11"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleKind(k)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="grid size-[1.125rem] shrink-0 place-items-center rounded-[1px] border border-foreground/60 bg-card text-background transition-colors duration-fast peer-checked:border-foreground peer-checked:bg-foreground peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring dark:bg-transparent [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {KIND_LABEL[k]}
              </label>
            );
          })}
        </div>
      </fieldset>

      {!hideFormat && (
        <fieldset className="flex flex-col gap-3">
          <legend className="smallcaps float-left mb-0 w-full text-foreground/80">
            Format
          </legend>
          <Segmented
            aria-label="Format"
            id={`${id}-format`}
            value={format}
            onValueChange={setFormat}
            fullWidth
            options={[
              { value: "sprint", label: "Sprint" },
              { value: "speedrun", label: "Speedrun" },
              { value: "untimed", label: "Untimed" },
            ]}
          />
          {format === "sprint" && (
            <Segmented
              aria-label="Sprint length"
              id={`${id}-secs`}
              fullWidth
              size="sm"
              value={String(Math.round((value.durationMs ?? 60_000) / 1000))}
              onValueChange={(s) =>
                onChange({ ...value, durationMs: Number(s) * 1000 })
              }
              options={withCurrent(
                SPRINT_SECONDS,
                String(Math.round((value.durationMs ?? 60_000) / 1000)),
              ).map((s) => ({
                value: s,
                label: Number(s) >= 120 ? `${Number(s) / 60} min` : `${s} s`,
              }))}
            />
          )}
          {format === "speedrun" && (
            <Segmented
              aria-label="Correct answers to finish"
              id={`${id}-target`}
              fullWidth
              size="sm"
              value={String(value.targetCount ?? 15)}
              onValueChange={(t) =>
                onChange({ ...value, targetCount: Number(t) })
              }
              options={withCurrent(
                SPEEDRUN_TARGETS,
                String(value.targetCount ?? 15),
              ).map((t) => ({
                value: t,
                label: `${t} correct`,
              }))}
            />
          )}
          <p className="text-body-sm text-muted-foreground">
            {format === "sprint"
              ? "As many correct answers as you can before the clock runs out."
              : format === "speedrun"
                ? "Race to the target. Each skip adds 5 seconds."
                : "No clock. Skip to see a worked solution; finish whenever you like."}
          </p>
        </fieldset>
      )}

      {problem && (
        <p role="alert" className="text-body-sm text-destructive">
          {problem}
        </p>
      )}
    </div>
  );
}

/** A field printed on the form: no box, one rule to write on. */
const RULED =
  "h-10 w-full min-w-0 rounded-none border-0 border-b border-foreground/50 bg-transparent px-0.5 text-base text-foreground transition-[border-color,background-color] duration-fast hover:border-foreground focus-visible:border-primary focus-visible:bg-tint/50 focus-visible:outline-none sm:text-[0.9375rem] dark:[color-scheme:dark]";

function withCurrent(options: readonly string[], current: string): string[] {
  return options.includes(current)
    ? [...options]
    : [...options, current].sort((a, b) => Number(a) - Number(b));
}

function BaseSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: Base;
  onChange: (b: Base) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label htmlFor={id} className="smallcaps text-[0.8125rem]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Base)}
        className={cn(RULED, "cursor-pointer font-sans")}
      >
        {BASE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Integer field that keeps a draft while typing and commits on blur/Enter. */
function NumberField({
  id,
  label,
  value,
  onCommit,
}: {
  id: string;
  label: string;
  value: number;
  onCommit: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = Math.floor(Number(draft.replace(/[\s_,]/g, "")));
    if (!Number.isFinite(n) || draft.trim() === "") {
      setDraft(String(value));
      return;
    }
    const clamped = Math.max(0, Math.min(CUSTOM_MAX_VALUE, n));
    setDraft(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };
  return (
    <div className="flex min-w-0 flex-1 basis-20 flex-col gap-1 sm:max-w-[8.5rem]">
      <label htmlFor={id} className="smallcaps text-[0.8125rem]">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        className={cn(RULED, "font-mono tabular-nums")}
      />
    </div>
  );
}
