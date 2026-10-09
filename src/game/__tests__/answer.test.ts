import { describe, expect, it } from "vitest";
import {
  answerPrefix,
  checkAnswer,
  formatAnswer,
  inputModeFor,
  isAcceptableKeystroke,
  normalizeInput,
  parseAnswer,
  type Question,
} from "..";

function q(partial: Partial<Question>): Question {
  return {
    id: "convert:test",
    kind: "convert",
    topicId: "bytes-hex",
    instruction: "",
    prompt: [{ type: "number", digits: "1", base: 10 }],
    answerFormat: "hex",
    answerBase: 16,
    answer: "2d",
    maxLength: 2,
    difficulty: 2,
    ...partial,
  };
}

const hex = q({});
const bin = q({
  answerFormat: "binary",
  answerBase: 2,
  answer: "101101",
  maxLength: 8,
});
const oct = q({
  answerFormat: "octal",
  answerBase: 8,
  answer: "755",
  maxLength: 3,
});
const dec = q({
  answerFormat: "decimal",
  answerBase: 10,
  answer: "45",
  maxLength: 3,
});
const zero = q({
  answerFormat: "decimal",
  answerBase: 10,
  answer: "0",
  maxLength: 3,
});
const signed = q({
  answerFormat: "signed-decimal",
  answerBase: 10,
  answer: "-74",
  maxLength: 4,
});
const signedZero = q({
  answerFormat: "signed-decimal",
  answerBase: 10,
  answer: "0",
  maxLength: 4,
});
const fixedBin = q({
  kind: "twos",
  answerFormat: "binary",
  answerBase: 2,
  answerBits: 8,
  answer: "00000101",
  maxLength: 8,
});
const fixedHex = q({
  kind: "bitwise",
  answerFormat: "hex",
  answerBase: 16,
  answerBits: 8,
  answer: "0f",
  maxLength: 2,
});
const char = q({
  kind: "ascii",
  answerFormat: "char",
  answerBase: undefined,
  answer: "a",
  maxLength: 1,
});

describe("normalizeInput", () => {
  it("trims, lowercases and strips the format's own prefix", () => {
    expect(normalizeInput("  0X2D ", "hex")).toBe("2d");
    expect(normalizeInput("0b1011", "binary")).toBe("1011");
    expect(normalizeInput("0o755", "octal")).toBe("755");
  });
  it("does not strip another base's prefix (0b1 is valid hex)", () => {
    expect(normalizeInput("0b1", "hex")).toBe("0b1");
    expect(normalizeInput("0x1", "binary")).toBe("0x1");
  });
  it("removes spaces and underscores used as separators", () => {
    expect(normalizeInput("1011 0110", "binary")).toBe("10110110");
    expect(normalizeInput("1011_0110", "binary")).toBe("10110110");
    expect(normalizeInput("0x_ff_ff", "hex")).toBe("ffff");
  });
  it("keeps the sign for signed decimal", () => {
    expect(normalizeInput(" -74 ", "signed-decimal")).toBe("-74");
  });
  it("leaves char input untouched", () => {
    expect(normalizeInput(" A", "char")).toBe(" A");
  });
});

describe("checkAnswer", () => {
  it("accepts prefixes, case and separators for hex", () => {
    for (const s of ["2d", "2D", "0x2d", "0X2D", " 2d ", "0x2D"])
      expect(checkAnswer(hex, s), s).toBe(true);
    expect(checkAnswer(hex, "2e")).toBe(false);
    expect(checkAnswer(hex, "0x")).toBe(false);
  });
  it("accepts leading zeros on plain conversions", () => {
    expect(checkAnswer(bin, "00101101")).toBe(true);
    expect(checkAnswer(bin, "0b0010_1101")).toBe(true);
    expect(checkAnswer(bin, "0010 1101")).toBe(true);
    expect(checkAnswer(dec, "045")).toBe(true);
    expect(checkAnswer(hex, "02d")).toBe(false); // longer than maxLength
  });
  it("rejects digits invalid for the base", () => {
    expect(checkAnswer(bin, "101102")).toBe(false);
    expect(checkAnswer(oct, "758")).toBe(false);
    expect(checkAnswer(dec, "4f")).toBe(false);
    expect(checkAnswer(dec, "45.0")).toBe(false);
  });
  it("accepts octal with prefix", () => {
    expect(checkAnswer(oct, "0o755")).toBe(true);
    expect(checkAnswer(oct, "755")).toBe(true);
  });
  it("handles zero", () => {
    expect(checkAnswer(zero, "0")).toBe(true);
    expect(checkAnswer(zero, "000")).toBe(true);
    expect(checkAnswer(zero, "")).toBe(false);
  });
  it("handles signed decimal and negative zero", () => {
    expect(checkAnswer(signed, "-74")).toBe(true);
    expect(checkAnswer(signed, "74")).toBe(false);
    expect(checkAnswer(signed, "-")).toBe(false);
    expect(checkAnswer(signed, "--74")).toBe(false);
    expect(checkAnswer(signedZero, "0")).toBe(true);
    expect(checkAnswer(signedZero, "-0")).toBe(true);
    expect(checkAnswer(signed, "-074")).toBe(true);
  });
  it("fixed-width answers: with or without leading zeros, never wider than the width", () => {
    expect(checkAnswer(fixedBin, "00000101")).toBe(true);
    expect(checkAnswer(fixedBin, "101")).toBe(true);
    expect(checkAnswer(fixedBin, "0101")).toBe(true);
    expect(checkAnswer(fixedBin, "000000101")).toBe(false);
    expect(checkAnswer(fixedHex, "f")).toBe(true);
    expect(checkAnswer(fixedHex, "0F")).toBe(true);
    expect(checkAnswer(fixedHex, "0x0f")).toBe(true);
    expect(checkAnswer(fixedHex, "00f")).toBe(false);
  });
  it("char answers are exact and case-sensitive", () => {
    expect(checkAnswer(char, "a")).toBe(true);
    expect(checkAnswer(char, "A")).toBe(false);
    expect(checkAnswer(char, " a")).toBe(false);
    expect(checkAnswer(char, "")).toBe(false);
  });
  it("never matches a prefix of the answer early (auto-submit safety)", () => {
    // Typing "101101" one character at a time only matches at the end.
    const typed = "0b0010 1101";
    const hits = [...typed].map((_, i) =>
      checkAnswer(bin, typed.slice(0, i + 1)),
    );
    expect(hits.indexOf(true)).toBe(typed.length - 1);
  });
});

describe("parseAnswer", () => {
  it("parses by format", () => {
    expect(parseAnswer("0xff", "hex")).toBe(255);
    expect(parseAnswer("-128", "signed-decimal")).toBe(-128);
    expect(parseAnswer("-0", "signed-decimal")).toBe(0);
    expect(parseAnswer("-5", "decimal")).toBeNull();
    expect(parseAnswer("", "binary")).toBeNull();
  });
});

describe("isAcceptableKeystroke", () => {
  it("allows partial prefixes and valid digits", () => {
    for (const s of ["", "0", "0x", "0x2", "2", "2d", "2D"])
      expect(isAcceptableKeystroke(s, hex), s).toBe(true);
    for (const s of ["0", "0b", "0b1", "1011 0", "1011_0110"])
      expect(isAcceptableKeystroke(s, bin), s).toBe(true);
    for (const s of ["-", "-7", "-74", "12"])
      expect(isAcceptableKeystroke(s, signed), s).toBe(true);
  });
  it("rejects characters invalid for the format", () => {
    expect(isAcceptableKeystroke("2g", hex)).toBe(false);
    expect(isAcceptableKeystroke("102", bin)).toBe(false);
    expect(isAcceptableKeystroke("78", oct)).toBe(false);
    expect(isAcceptableKeystroke("4a", dec)).toBe(false);
    expect(isAcceptableKeystroke("-4", dec)).toBe(false);
    expect(isAcceptableKeystroke("7-", signed)).toBe(false);
    expect(
      isAcceptableKeystroke("0b1", q({ answer: "b1", maxLength: 3 })),
    ).toBe(true); // hex digits
    expect(isAcceptableKeystroke("0x1", bin)).toBe(false);
  });
  it("enforces maxLength on significant characters only", () => {
    expect(isAcceptableKeystroke("0x2d", hex)).toBe(true);
    expect(isAcceptableKeystroke("2d0", hex)).toBe(false);
    expect(isAcceptableKeystroke("0b1011 0110", bin)).toBe(true);
    expect(isAcceptableKeystroke("101101101", bin)).toBe(false);
    expect(isAcceptableKeystroke("-128", signed)).toBe(true);
    expect(isAcceptableKeystroke("-1280", signed)).toBe(false);
  });
  it("char answers take one printable character", () => {
    expect(isAcceptableKeystroke("a", char)).toBe(true);
    expect(isAcceptableKeystroke("~", char)).toBe(true);
    expect(isAcceptableKeystroke("ab", char)).toBe(false);
    expect(isAcceptableKeystroke(" ", char)).toBe(false);
    expect(isAcceptableKeystroke("é", char)).toBe(false);
  });
});

describe("display helpers", () => {
  it("formats answers for display", () => {
    expect(formatAnswer(hex)).toBe("2D");
    expect(formatAnswer(hex, { prefix: true })).toBe("0x2D");
    expect(formatAnswer(fixedBin)).toBe("0000 0101");
    expect(formatAnswer(signed)).toBe("-74");
    expect(formatAnswer(char)).toBe("a");
  });
  it("prefix and input mode", () => {
    expect(answerPrefix(hex)).toBe("0x");
    expect(answerPrefix(dec)).toBe("");
    expect(answerPrefix(char)).toBe("");
    expect(inputModeFor("binary")).toBe("numeric");
    expect(inputModeFor("signed-decimal")).toBe("text");
    expect(inputModeFor("hex")).toBe("text");
  });
});
