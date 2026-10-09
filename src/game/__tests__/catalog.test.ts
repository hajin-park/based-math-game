import { describe, expect, it } from "vitest";
import {
  customMode,
  dailyDateOf,
  dailyModeFor,
  FORMATS,
  FORMAT_IDS,
  getMode,
  getTopic,
  isRankedModeId,
  isValidDateKey,
  listModes,
  listRankedModes,
  modeId,
  normalizeCustomConfig,
  parseModeId,
  TIERS,
  TOPICS,
  TOPIC_IDS,
  utcDateKey,
} from "..";

describe("topics", () => {
  it("cover every contract topic id exactly once with complete copy", () => {
    expect(new Set(TOPIC_IDS).size).toBe(TOPICS.length);
    expect([...TOPIC_IDS].sort()).toEqual([
      "applied",
      "binary-add",
      "bitwise",
      "bytes-bin",
      "bytes-hex",
      "custom",
      "mixed",
      "nibbles",
      "octal",
      "powers",
      "twos",
      "words",
    ]);
    for (const t of TOPICS) {
      expect(TIERS).toContain(t.tier);
      for (const field of [
        t.name,
        t.summary,
        t.why,
        t.example,
        t.learnAnchor,
      ]) {
        expect(field.trim().length).toBeGreaterThan(0);
      }
      expect(t.learnAnchor).toMatch(/^[a-z0-9-]+$/);
      expect(getTopic(t.id)).toBe(t);
    }
    expect(getTopic("octal").why).toMatch(/755/);
  });
});

describe("formats", () => {
  it("match the specified rules", () => {
    expect(FORMATS.sprint).toMatchObject({
      durationMs: 60_000,
      ranked: true,
      scoreOrder: "higher-better",
      scoreUnit: "correct",
    });
    expect(FORMATS.speedrun).toMatchObject({
      targetCount: 15,
      ranked: true,
      scoreOrder: "lower-better",
      scoreUnit: "ms",
    });
    expect(FORMATS.survival).toMatchObject({
      lives: 3,
      ranked: true,
      scoreOrder: "higher-better",
      scoreUnit: "cleared",
    });
    expect(FORMATS.daily).toMatchObject({
      targetCount: 10,
      ranked: true,
      scoreOrder: "lower-better",
      scoreUnit: "ms",
      skipPenaltyMs: 10_000,
    });
    expect(FORMATS.practice.ranked).toBe(false);
    for (const f of FORMAT_IDS) expect(FORMATS[f].format).toBe(f);
  });
});

describe("catalog", () => {
  const modes = listModes();

  it("has unique ids and every non-custom topic × {sprint, speedrun, practice} plus survival", () => {
    expect(new Set(modes.map((m) => m.id)).size).toBe(modes.length);
    const topics = TOPIC_IDS.filter((t) => t !== "custom");
    for (const t of topics) {
      for (const f of ["sprint", "speedrun", "practice"] as const) {
        const m = getMode(modeId(t, f));
        expect(m, `${t}:${f}`).toBeDefined();
        expect(m!.topicId).toBe(t);
        expect(m!.format).toBe(f);
        expect(m!.spec).toBe(FORMATS[f]);
        expect(m!.ranked).toBe(f !== "practice");
        expect(m!.name).toContain(getTopic(t).name);
      }
    }
    expect(getMode("survival")).toMatchObject({
      format: "survival",
      ranked: true,
    });
    expect(modes).toHaveLength(topics.length * 3 + 1);
    expect(listRankedModes()).toHaveLength(topics.length * 2 + 1);
    expect(modes.some((m) => m.topicId === "custom")).toBe(false);
  });

  it("parses ids and rejects unknown ones", () => {
    for (const m of modes) {
      const p = parseModeId(m.id)!;
      expect(p.format).toBe(m.format);
      expect(p.topicId).toBe(m.topicId);
    }
    expect(parseModeId("daily:2026-10-09")).toEqual({
      topicId: "mixed",
      format: "daily",
      date: "2026-10-09",
    });
    for (const bad of [
      "",
      "custom",
      "custom:sprint",
      "nibbles:survival",
      "nibbles:daily",
      "foo:sprint",
      "nibbles",
      "daily:2026-02-30",
      "binary-easy-15s",
    ]) {
      expect(parseModeId(bad), bad).toBeNull();
      expect(getMode(bad), bad).toBeUndefined();
      expect(isRankedModeId(bad), bad).toBe(false);
    }
  });

  it("knows which ids are ranked", () => {
    expect(isRankedModeId("bytes-hex:sprint")).toBe(true);
    expect(isRankedModeId("twos:speedrun")).toBe(true);
    expect(isRankedModeId("twos:practice")).toBe(false);
    expect(isRankedModeId("survival")).toBe(true);
    expect(isRankedModeId("daily:2026-10-09")).toBe(true);
  });

  it("builds daily modes from UTC dates", () => {
    const d = dailyModeFor(new Date(Date.UTC(2026, 9, 9, 23, 59)));
    expect(d.id).toBe("daily:2026-10-09");
    expect(getMode("daily:2026-10-09")).toEqual(d);
    expect(dailyDateOf(d.id)).toBe("2026-10-09");
    expect(utcDateKey(new Date(Date.UTC(2027, 0, 1)))).toBe("2027-01-01");
    expect(isValidDateKey("2028-02-29")).toBe(true);
    expect(isValidDateKey("2027-02-29")).toBe(false);
    expect(() => dailyModeFor("yesterday")).toThrow();
  });

  it("custom modes pick their format from the config and are never ranked", () => {
    const conv = [{ from: 2 as const, to: 16 as const, min: 0, max: 255 }];
    expect(customMode({ conversions: conv, durationMs: 30_000 })).toMatchObject(
      {
        id: "custom",
        format: "sprint",
        ranked: false,
        spec: { durationMs: 30_000, ranked: false },
      },
    );
    expect(customMode({ conversions: conv, targetCount: 20 })).toMatchObject({
      format: "speedrun",
      spec: { targetCount: 20 },
    });
    expect(customMode({ conversions: conv })).toMatchObject({
      format: "practice",
    });
    expect(FORMATS.sprint.durationMs).toBe(60_000); // not mutated
  });

  it("normalizes custom configs", () => {
    expect(
      normalizeCustomConfig({
        conversions: [
          { from: 2, to: 2, min: 0, max: 10 },
          { from: 10, to: 16, min: 500, max: -3 },
          { from: 16, to: 10, min: 0, max: 1e12 },
        ],
        kinds: ["twos", "twos", "color"],
      }),
    ).toEqual({
      conversions: [
        { from: 10, to: 16, min: 0, max: 500 },
        { from: 16, to: 10, min: 0, max: 0xffffffff },
      ],
      kinds: ["twos", "color"],
    });
    expect(() => normalizeCustomConfig({ conversions: [] })).toThrow();
    expect(
      normalizeCustomConfig({ conversions: [], kinds: ["ascii"] }).kinds,
    ).toEqual(["ascii"]);
  });
});
