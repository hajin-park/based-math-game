import { describe, expect, it } from "vitest";
import {
  BASES,
  checkAnswer,
  createRng,
  deriveSeed,
  explainQuestion,
  generateFromRecipe,
  topicRecipes,
  TOPIC_IDS,
  type KindRecipe,
  type Question,
  type TopicId,
} from "..";

/**
 * Independent oracle: recompute the expected answer value from the prompt
 * alone, using only built-ins (no engine helpers).
 */
function oracle(q: Question): string {
  const nums = q.prompt.filter((p) => p.type === "number") as Array<{
    digits: string;
    base: 2 | 8 | 10 | 16;
  }>;
  const ops = q.prompt
    .filter((p) => p.type === "op")
    .map((p) => (p as { text: string }).text);
  switch (q.kind) {
    case "convert": {
      const v = parseInt(nums[0].digits, nums[0].base);
      return v.toString(q.answerBase!);
    }
    case "power": {
      const variant = q.id.split(":")[1];
      const n = Number(nums[0].digits);
      if (variant === "value") return String(Math.pow(2, n));
      if (variant === "exponent") return String(Math.log2(n));
      return String(Math.pow(2, n) - 1);
    }
    case "twos": {
      const bits = Number(q.id.split(":")[1]);
      if (nums[0].base === 2) {
        const u = parseInt(nums[0].digits, 2);
        return String(nums[0].digits[0] === "1" ? u - Math.pow(2, bits) : u);
      }
      const v = Number(nums[0].digits);
      return (v < 0 ? v + Math.pow(2, bits) : v)
        .toString(2)
        .padStart(bits, "0");
    }
    case "bitwise": {
      const bits = q.answerBits!;
      const base = nums[0].base;
      const a = parseInt(nums[0].digits, base);
      const op = ops[0];
      let r: number;
      if (op === "<<" || op === ">>") {
        const n = Number(nums[1].digits);
        r = op === "<<" ? (a << n) & (Math.pow(2, bits) - 1) : a >>> n;
      } else {
        const b = parseInt(nums[1].digits, base);
        r = op === "AND" ? a & b : op === "OR" ? a | b : a ^ b;
      }
      const width = base === 2 ? bits : bits / 4;
      return r.toString(base).padStart(width, "0");
    }
    case "add": {
      const a = parseInt(nums[0].digits, 2);
      const b = parseInt(nums[1].digits, 2);
      return (a + b).toString(2).padStart(q.answerBits!, "0");
    }
    case "color": {
      const sw = q.prompt.find((p) => p.type === "swatch") as { hex: string };
      const text = (
        q.prompt.find((p) => p.type === "text") as { text: string }
      ).text.toLowerCase();
      const idx = text.startsWith("red") ? 0 : text.startsWith("green") ? 1 : 2;
      return String(parseInt(sw.hex.slice(1 + idx * 2, 3 + idx * 2), 16));
    }
    case "ascii": {
      const ch = q.prompt.find((p) => p.type === "char") as
        | { char: string }
        | undefined;
      if (ch) return ch.char.charCodeAt(0).toString(16).padStart(2, "0");
      return String.fromCharCode(parseInt(nums[0].digits, 16));
    }
  }
}

const ALL_RECIPES: Array<{ topicId: TopicId; recipe: KindRecipe }> =
  TOPIC_IDS.filter((t) => t !== "custom").flatMap((t) =>
    topicRecipes(t).map((r) => ({ topicId: r.topicId, recipe: r.recipe })),
  );

const EXTRA_RECIPES: KindRecipe[] = [
  { kind: "convert", params: { from: 16, to: 8, min: 0, max: 4095 } },
  { kind: "convert", params: { from: 8, to: 16, min: 0, max: 4095 } },
  { kind: "convert", params: { from: 10, to: 2, min: 1000, max: 70000 } },
  { kind: "convert", params: { from: 2, to: 10, min: 0, max: 2 ** 32 - 1 } },
  { kind: "convert", params: { from: 10, to: 16, min: 0, max: 2 ** 32 - 1 } },
  { kind: "twos", params: { bits: 4 } },
  { kind: "twos", params: { bits: 16 } },
  { kind: "bitwise", params: { bits: 16, base: 16 } },
  { kind: "bitwise", params: { bits: 4 } },
  { kind: "add", params: { bits: 4 } },
  { kind: "add", params: { bits: 16 } },
  { kind: "power", params: { minExp: 0, maxExp: 31 } },
];

function* questions(perRecipe: number): Generator<Question> {
  const recipes = [
    ...ALL_RECIPES,
    ...EXTRA_RECIPES.map((recipe) => ({
      topicId: "custom" as TopicId,
      recipe,
    })),
  ];
  for (let r = 0; r < recipes.length; r++) {
    for (let i = 0; i < perRecipe; i++) {
      const rng = createRng(deriveSeed(0xc0ffee + r, i));
      yield generateFromRecipe(rng, recipes[r].recipe, {
        topicId: recipes[r].topicId,
        index: i % 12,
      });
    }
  }
}

describe("every kind: generated answers are correct", () => {
  it("matches an independent oracle across thousands of seeded generations", () => {
    let count = 0;
    for (const q of questions(400)) {
      count++;
      const expected = oracle(q);
      if (q.answerFormat === "char") {
        expect(q.answer).toBe(expected);
      } else {
        // Compare by value; canonical form is checked below.
        const base = q.answerBase!;
        expect(parseInt(q.answer, base), q.id).toBe(parseInt(expected, base));
      }
      expect(checkAnswer(q, q.answer), q.id).toBe(true);
      expect(checkAnswer(q, expected), q.id).toBe(true);
    }
    expect(count).toBeGreaterThan(10_000);
  });

  it("produces well-formed questions", () => {
    for (const q of questions(150)) {
      expect(q.id.startsWith(`${q.kind}:`)).toBe(true);
      expect(q.instruction.length).toBeGreaterThan(0);
      expect(q.prompt.length).toBeGreaterThan(0);
      expect([1, 2, 3, 4, 5]).toContain(q.difficulty);
      expect(q.answer.length).toBeLessThanOrEqual(q.maxLength);
      for (const part of q.prompt) {
        if (part.type === "number") {
          const digits = part.digits.replace(/^-/, "");
          expect(
            BASES[part.base].numberRegex.test(digits),
            `${q.id} prompt ${part.digits}`,
          ).toBe(true);
          if (part.base === 16)
            expect(part.digits).toBe(part.digits.toUpperCase());
        }
        if (part.type === "swatch") expect(part.hex).toMatch(/^#[0-9A-F]{6}$/);
        if (part.type === "char") expect(part.char).toMatch(/^[\x21-\x7e]$/);
      }
      if (q.answerFormat === "char") {
        expect(q.answer).toMatch(/^[\x21-\x7e]$/);
        continue;
      }
      // Canonical: lowercase, no prefix, no leading zeros unless fixed width.
      expect(q.answer).toBe(q.answer.toLowerCase());
      if (q.answerBits) {
        const width =
          q.answerBase === 2
            ? q.answerBits
            : q.answerBase === 16
              ? q.answerBits / 4
              : null;
        if (width) expect(q.answer.length).toBe(width);
      } else if (q.answerFormat !== "signed-decimal") {
        expect(q.answer === "0" || !q.answer.startsWith("0"), q.id).toBe(true);
      }
    }
  });

  it("rejects near-miss answers", () => {
    for (const q of questions(60)) {
      if (q.answerFormat === "char") {
        const other = String.fromCharCode(
          q.answer.charCodeAt(0) === 0x7e ? 0x7d : q.answer.charCodeAt(0) + 1,
        );
        expect(checkAnswer(q, other)).toBe(false);
        continue;
      }
      const base = q.answerBase!;
      const v = parseInt(q.answer, base);
      const off = (v + 1).toString(base);
      if (off.length <= q.maxLength)
        expect(checkAnswer(q, off), `${q.id} ${off}`).toBe(false);
      expect(checkAnswer(q, "")).toBe(false);
    }
  });
});

describe("explanations", () => {
  it("are non-empty and end with an Answer step showing the answer", () => {
    for (const q of questions(80)) {
      const steps = explainQuestion(q);
      expect(steps.length, q.id).toBeGreaterThanOrEqual(2);
      for (const s of steps) {
        expect(s.title.length).toBeGreaterThan(0);
        expect(
          (s.work?.length ?? 0) > 0 || (s.note?.length ?? 0) > 0,
          `${q.id}: ${s.title}`,
        ).toBe(true);
        for (const line of s.work ?? [])
          expect(line).not.toMatch(/NaN|undefined|Infinity/);
        expect(s.note ?? "").not.toMatch(/NaN|undefined|Infinity/);
      }
      const last = steps[steps.length - 1];
      expect(last.title).toBe("Answer");
      const shown = (last.work ?? []).join(" ");
      if (q.answerFormat === "char") expect(shown).toContain(q.answer);
      else expect(shown.replace(/\s/g, "").toLowerCase()).toContain(q.answer);
    }
  });

  it("show the decisive intermediate result", () => {
    for (const q of questions(40)) {
      const text = explainQuestion(q)
        .slice(0, -1)
        .flatMap((s) => [s.title, ...(s.work ?? []), s.note ?? ""])
        .join("\n")
        .replace(/[\s]/g, "")
        .toLowerCase();
      if (q.kind === "convert" && q.answerBase === 10)
        expect(text, q.id).toContain(`=${q.answer}`);
      if (q.kind === "add")
        expect(text, q.id).toContain(String(parseInt(q.answer, 2)));
      if (q.kind === "color") expect(text, q.id).toContain(`=${q.answer}`);
      if (q.kind === "twos" && q.answerFormat === "signed-decimal") {
        expect(text, q.id).toContain(q.answer.replace("-", "−"));
      }
    }
  });
});

describe("degenerate-question avoidance", () => {
  it("skips 0 and 1 after warm-up for byte conversions", () => {
    const recipe = topicRecipes("bytes-bin")[0].recipe;
    for (let i = 0; i < 2000; i++) {
      const q = generateFromRecipe(createRng(i), recipe, {
        topicId: "bytes-bin",
        index: 10,
      });
      const value = parseInt(q.answer, 10);
      // Binary prompts after warm-up have at least 5 significant bits.
      expect(value).toBeGreaterThanOrEqual(16);
    }
  });

  it("allows small values during warm-up", () => {
    const recipe = topicRecipes("nibbles")[2].recipe; // bin -> dec 0..15
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      seen.add(
        generateFromRecipe(createRng(i), recipe, {
          topicId: "nibbles",
          index: 0,
        }).answer,
      );
    }
    expect(seen.has("0")).toBe(true);
    expect(seen.size).toBe(16);
  });

  it("bitwise questions never have equal operands or trivial results after warm-up", () => {
    for (const r of topicRecipes("bitwise")) {
      for (let i = 0; i < 1000; i++) {
        const q = generateFromRecipe(createRng(i), r.recipe, {
          topicId: "bitwise",
          index: 5,
        });
        const nums = q.prompt.filter((p) => p.type === "number") as Array<{
          digits: string;
        }>;
        if (
          q.prompt.some(
            (p) =>
              p.type === "op" &&
              (p.text === "AND" || p.text === "OR" || p.text === "XOR"),
          )
        ) {
          expect(nums[0].digits).not.toBe(nums[1].digits);
        }
        expect(/^0+$/.test(q.answer)).toBe(false);
      }
    }
  });

  it("binary additions exercise carries and fit in 8 bits", () => {
    const recipe = topicRecipes("binary-add")[0].recipe;
    for (let i = 0; i < 2000; i++) {
      const q = generateFromRecipe(createRng(i), recipe, {
        topicId: "binary-add",
        index: 5,
      });
      expect(q.answer).toHaveLength(8);
      expect(parseInt(q.answer, 2)).toBeLessThanOrEqual(255);
    }
  });

  it("two's complement covers both signs and the -128 edge", () => {
    const recipe = topicRecipes("twos")[0].recipe;
    const values = new Set<number>();
    let negatives = 0;
    for (let i = 0; i < 4000; i++) {
      const q = generateFromRecipe(createRng(i), recipe, {
        topicId: "twos",
        index: 5,
      });
      const v =
        q.answerFormat === "signed-decimal"
          ? Number(q.answer)
          : Number(q.id.split(":")[3]);
      values.add(v);
      if (v < 0) negatives++;
      expect(v).toBeGreaterThanOrEqual(-128);
      expect(v).toBeLessThanOrEqual(127);
    }
    expect(values.has(-128)).toBe(true);
    expect(negatives / 4000).toBeGreaterThan(0.6);
  });

  it("ascii never uses space or non-printables", () => {
    for (const r of topicRecipes("applied").filter(
      (x) => x.recipe.kind === "ascii",
    )) {
      for (let i = 0; i < 2000; i++) {
        const q = generateFromRecipe(createRng(i), r.recipe, {
          topicId: "applied",
          index: i,
        });
        const code = parseInt(q.id.split(":")[2], 16);
        expect(code).toBeGreaterThanOrEqual(0x21);
        expect(code).toBeLessThanOrEqual(0x7e);
      }
    }
  });
});
