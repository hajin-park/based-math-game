/**
 * CustomModeBuilder — build a custom drill: conversion pairs with inclusive
 * decimal ranges, optional extra question kinds, and a format (sprint
 * seconds, speedrun target or untimed). Controlled: `{ value, onChange }`.
 * Shared by the /play hub and multiplayer room setup.
 */
import { useEffect, useId, useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { inputVariants } from "@/components/ui/input";
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
    <div className={cn("flex flex-col gap-7", className)}>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-label font-semibold text-foreground">
          Conversions
          <span className="ml-2 font-normal text-muted-foreground">
            values in decimal, inclusive
          </span>
        </legend>
        <ul className="flex flex-col gap-3">
          {conversions.map((c, i) => (
            <li
              key={i}
              className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:p-4"
            >
              <div className="flex items-end gap-2">
                <BaseSelect
                  id={`${id}-from-${i}`}
                  label="From"
                  value={c.from}
                  onChange={(from) => setConversion(i, { from })}
                />
                <ArrowRight
                  aria-hidden
                  className="mb-2.5 size-4 shrink-0 text-muted-foreground"
                />
                <BaseSelect
                  id={`${id}-to-${i}`}
                  label="To"
                  value={c.to}
                  onChange={(to) => setConversion(i, { to })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground"
                  onClick={() => removeConversion(i)}
                  disabled={conversions.length === 1 && kinds.length === 0}
                  aria-label={`Remove conversion ${i + 1}`}
                >
                  <X aria-hidden />
                </Button>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <NumberField
                  id={`${id}-min-${i}`}
                  label="From value"
                  value={c.min}
                  onCommit={(min) => setConversion(i, { min })}
                />
                <span aria-hidden className="mb-2.5 text-muted-foreground">
                  –
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
                  className="flex flex-wrap gap-1"
                >
                  {RANGE_PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      type="button"
                      size="sm"
                      variant={
                        c.min === 0 && c.max === p.max ? "secondary" : "ghost"
                      }
                      aria-pressed={c.min === 0 && c.max === p.max}
                      className="px-2 font-mono text-[0.75rem]"
                      onClick={() => setConversion(i, { min: 0, max: p.max })}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {conversions.length < CUSTOM_LIMITS.conversions && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addConversion}
            className="self-start"
          >
            <Plus aria-hidden />
            Add conversion
          </Button>
        )}
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-label font-semibold text-foreground">
          Also include
        </legend>
        <div className="flex flex-wrap gap-2">
          {EXTRA_KINDS.map((k) => {
            const on = kinds.includes(k);
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => toggleKind(k)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-label transition-[background-color,border-color,color] duration-fast pointer-coarse:min-h-11",
                  on
                    ? "border-foreground/70 bg-foreground text-background"
                    : "border-input bg-card text-foreground hover:border-border-strong",
                )}
              >
                {KIND_LABEL[k]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {!hideFormat && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-label font-semibold text-foreground">
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
      <label htmlFor={id} className="text-[0.75rem] text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Base)}
        className={cn(
          inputVariants({ variant: "default" }),
          "cursor-pointer pr-2",
        )}
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
    <div className="flex w-[7.5rem] flex-col gap-1">
      <label htmlFor={id} className="text-[0.75rem] text-muted-foreground">
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
        className={cn(
          inputVariants({ variant: "default" }),
          "font-mono tabular-nums",
        )}
      />
    </div>
  );
}
