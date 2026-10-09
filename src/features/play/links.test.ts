import { describe, expect, it } from "vitest";

import {
  createQuestionStream,
  customMode,
  explainQuestion,
  type CustomConfig,
  type Question,
} from "@/game";
import {
  decodeCustomConfig,
  encodeCustomConfig,
  hubLink,
  runPath,
} from "./links";
import { displayAnswer, questionLabel } from "./describe";

const toParam = (obj: unknown) =>
  btoa(JSON.stringify(obj))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

describe("custom drill links", () => {
  const config: CustomConfig = {
    conversions: [
      { from: 16, to: 2, min: 0, max: 4095 },
      { from: 10, to: 8, min: 8, max: 511 },
    ],
    kinds: ["twos", "ascii"],
    durationMs: 90_000,
  };

  it("round-trips a config", () => {
    expect(decodeCustomConfig(encodeCustomConfig(config))).toEqual(config);
  });

  it("encodes speedrun and untimed drills", () => {
    const speed = { conversions: config.conversions, targetCount: 25 };
    expect(decodeCustomConfig(encodeCustomConfig(speed))).toEqual(speed);
    const untimed = { conversions: config.conversions };
    expect(decodeCustomConfig(encodeCustomConfig(untimed))).toEqual(untimed);
  });

  it("is URL safe", () => {
    expect(encodeCustomConfig(config)).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(runPath("custom", config)).toMatch(/^\/play\/custom\?c=/);
    expect(hubLink("custom", config)).toMatch(/^\/play\?mode=custom&c=/);
    expect(hubLink("bytes-hex:sprint")).toBe("/play?mode=bytes-hex%3Asprint");
  });

  it.each([
    ["empty", ""],
    ["not base64", "%%%"],
    ["not json", toParam("x").slice(0, 3)],
    ["array", toParam([1, 2])],
    ["unknown base", toParam({ v: [[3, 10, 0, 9]] })],
    ["same base", toParam({ v: [[2, 2, 0, 9]] })],
    ["reversed range", toParam({ v: [[2, 10, 9, 1]] })],
    ["negative", toParam({ v: [[2, 10, -1, 9]] })],
    ["float", toParam({ v: [[2, 10, 0, 9.5]] })],
    ["too big", toParam({ v: [[2, 10, 0, 2 ** 33]] })],
    ["unknown kind", toParam({ v: [], k: ["rm -rf"] })],
    ["nothing playable", toParam({ v: [] })],
    ["silly duration", toParam({ v: [[2, 10, 0, 9]], d: 1 })],
    ["silly target", toParam({ v: [[2, 10, 0, 9]], t: 10_000 })],
    ["too many", toParam({ v: Array(9).fill([2, 10, 0, 9]) })],
  ])("rejects %s", (_name, param) => {
    expect(decodeCustomConfig(param)).toBeNull();
  });

  it("builds a playable mode from a decoded link", () => {
    const decoded = decodeCustomConfig(encodeCustomConfig(config))!;
    const mode = customMode(decoded);
    expect(mode.format).toBe("sprint");
    expect(mode.spec.durationMs).toBe(90_000);
    const q = createQuestionStream(mode, 7).at(0);
    expect(q.topicId).toBe("custom");
  });
});

describe("question descriptions", () => {
  it("labels conversions in the QA-readable shape", () => {
    const q: Question = {
      id: "convert:2>10:1011",
      kind: "convert",
      topicId: "nibbles",
      instruction: "Binary → Decimal",
      prompt: [{ type: "number", digits: "1011", base: 2, bits: 4 }],
      answerBase: 10,
      answerFormat: "decimal",
      answer: "11",
      maxLength: 2,
      difficulty: 1,
    };
    expect(questionLabel(q)).toBe("Convert 1011 from binary to decimal");
    expect(displayAnswer(q)).toBe("11");
  });

  it("describes every kind the engine generates", () => {
    const stream = createQuestionStream(
      customMode({
        conversions: [{ from: 10, to: 16, min: 0, max: 255 }],
        kinds: ["power", "twos", "bitwise", "add", "color", "ascii"],
      }),
      42,
    );
    for (let i = 0; i < 60; i++) {
      const q = stream.at(i);
      const label = questionLabel(q);
      expect(label.length).toBeGreaterThan(10);
      expect(label).not.toMatch(/undefined|\[object/);
      expect(displayAnswer(q).length).toBeGreaterThan(0);
      expect(explainQuestion(q).length).toBeGreaterThan(0);
    }
  });
});
