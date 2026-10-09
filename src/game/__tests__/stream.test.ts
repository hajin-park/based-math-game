import { describe, expect, it } from "vitest";
import {
  createQuestionStream,
  customMode,
  DAILY_LADDER,
  dailyModeFor,
  dailySeed,
  getMode,
  listModes,
  RECENT_WINDOW,
  SURVIVAL_ENDGAME,
  SURVIVAL_ENDGAME_FROM,
  SURVIVAL_STAGES,
  type GameMode,
} from "..";

const ids = (mode: GameMode, seed: number, n: number) => {
  const s = createQuestionStream(mode, seed);
  return Array.from({ length: n }, (_, i) => s.at(i).id);
};

describe("question streams", () => {
  it("are pinned for a known seed (changing this breaks parity between app versions)", () => {
    expect(ids(getMode("bytes-hex:sprint")!, 777, 5)).toEqual([
      "convert:2>16:10101",
      "convert:16>2:1",
      "convert:2>16:1010011",
      "convert:16>10:94",
      "convert:16>10:22",
    ]);
  });

  it("are deterministic per (mode, seed, index) for every mode", () => {
    const modes = [...listModes(), dailyModeFor("2026-10-09")];
    for (const mode of modes) {
      const a = createQuestionStream(mode, 31337);
      const b = createQuestionStream(mode, 31337);
      for (let i = 0; i < 40; i++) expect(b.at(i)).toEqual(a.at(i));
    }
  });

  it("random access matches sequential access (late joiners in multiplayer)", () => {
    const mode = getMode("mixed:sprint")!;
    const sequential = createQuestionStream(mode, 5);
    const seq = Array.from({ length: 60 }, (_, i) => sequential.at(i));
    const jumpy = createQuestionStream(mode, 5);
    expect(jumpy.at(59)).toEqual(seq[59]);
    expect(jumpy.at(3)).toEqual(seq[3]);
    expect(jumpy.at(30)).toEqual(seq[30]);
  });

  it("differs across seeds", () => {
    const mode = getMode("words:sprint")!;
    expect(ids(mode, 1, 20)).not.toEqual(ids(mode, 2, 20));
  });

  it("never repeats a question within the recent window when the topic has room", () => {
    for (const mode of listModes().filter((m) => m.format === "sprint")) {
      for (const seed of [1, 2, 3]) {
        const list = ids(mode, seed, 200);
        for (let i = 0; i < list.length; i++) {
          const window = list.slice(Math.max(0, i - RECENT_WINDOW), i);
          expect(window, `${mode.id} #${i}`).not.toContain(list[i]);
        }
      }
    }
  });

  it("daily ignores the passed seed and follows the ladder", () => {
    const mode = dailyModeFor("2026-10-09");
    expect(ids(mode, 1, 10)).toEqual(ids(mode, 999, 10));
    expect(createQuestionStream(mode, 1).seed).toBe(dailySeed("2026-10-09"));
    const s = createQuestionStream(mode, 0);
    DAILY_LADDER.forEach((topic, i) => expect(s.at(i).topicId).toBe(topic));
    expect(ids(dailyModeFor("2026-10-10"), 0, 10)).not.toEqual(
      ids(mode, 0, 10),
    );
  });

  it("survival ramps through the stage topics, with some review", () => {
    const mode = getMode("survival")!;
    let review = 0;
    let total = 0;
    for (let seed = 0; seed < 20; seed++) {
      const s = createQuestionStream(mode, seed);
      for (let i = 0; i < 70; i++) {
        const topic = s.at(i).topicId;
        if (i >= SURVIVAL_ENDGAME_FROM) {
          expect(SURVIVAL_ENDGAME).toContain(topic);
          continue;
        }
        const stage = SURVIVAL_STAGES.filter((st) => i >= st.from).length - 1;
        const allowed = SURVIVAL_STAGES.slice(0, stage + 1).map(
          (st) => st.topicId,
        );
        expect(allowed).toContain(topic);
        if (i < 10) expect(topic).toBe(SURVIVAL_STAGES[stage].topicId);
        else {
          total++;
          if (topic !== SURVIVAL_STAGES[stage].topicId) review++;
        }
      }
    }
    expect(review / total).toBeGreaterThan(0.15);
    expect(review / total).toBeLessThan(0.35);
  });

  it("survival difficulty rises over the run", () => {
    const mode = getMode("survival")!;
    let early = 0;
    let late = 0;
    for (let seed = 0; seed < 20; seed++) {
      const s = createQuestionStream(mode, seed);
      for (let i = 0; i < 10; i++) early += s.at(i).difficulty;
      for (let i = 35; i < 45; i++) late += s.at(i).difficulty;
    }
    expect(late).toBeGreaterThan(early * 1.8);
  });

  it("custom modes respect the configured ranges and kinds", () => {
    const mode = customMode({
      conversions: [{ from: 16, to: 2, min: 100, max: 200 }],
      kinds: ["twos"],
      durationMs: 30_000,
    });
    const s = createQuestionStream(mode, 3);
    const kinds = new Set<string>();
    for (let i = 0; i < 300; i++) {
      const q = s.at(i);
      kinds.add(q.kind);
      expect(q.topicId).toBe("custom");
      if (q.kind === "convert") {
        const v = parseInt(q.answer, 2);
        expect(v).toBeGreaterThanOrEqual(100);
        expect(v).toBeLessThanOrEqual(200);
      }
    }
    expect([...kinds].sort()).toEqual(["convert", "twos"]);
  });

  it("rejects invalid indices", () => {
    const s = createQuestionStream(getMode("nibbles:sprint")!, 1);
    expect(() => s.at(-1)).toThrow();
    expect(() => s.at(1.5)).toThrow();
  });
});
