import { describe, expect, it } from "vitest";

import {
  TOPICS,
  checkAnswer,
  explainQuestion,
  formatAnswer,
  isAcceptableKeystroke,
  parseModeId,
} from "@/game";
import { applyBitwise } from "@/game/kinds/bitwise";
import { decodeTwos, encodeTwos } from "@/game/kinds/twos";
import {
  LESSONS,
  WORD_LANDMARKS,
  addColumns,
  applyOp,
  asciiCode,
  casePartner,
  exampleQuestion,
  fromSigned,
  invert,
  negate,
  parseLoose,
  permString,
  playHref,
  rgbHex,
  toSigned,
  type BitOp,
} from "../lessons";
import { ANSWER_EXAMPLES, DAILY_RAMP, FACTS, SURVIVAL_RAMP } from "../howto";

const bin = (s: string) => parseInt(s.replace(/\s/g, ""), 2);

describe("course outline", () => {
  it("has a lesson for every topic's learnAnchor", () => {
    const ids = new Set(LESSONS.map((l) => l.id));
    for (const t of TOPICS) expect(ids.has(t.learnAnchor)).toBe(true);
    expect(ids.size).toBe(LESSONS.length);
  });

  it("links every lesson to valid practice and sprint modes", () => {
    for (const l of LESSONS) {
      if (!l.topicId || l.topicId === "custom") continue;
      for (const format of ["practice", "sprint"] as const) {
        const href = playHref(l.topicId, format);
        const id = decodeURIComponent(href.split("mode=")[1]);
        expect(parseModeId(id)).toEqual({ topicId: l.topicId, format });
      }
    }
  });
});

describe("bit helpers agree with the engine", () => {
  it("two's complement", () => {
    for (let u = 0; u < 256; u++) {
      const pattern = u.toString(2).padStart(8, "0");
      expect(toSigned(u, 8)).toBe(decodeTwos(pattern));
      expect(fromSigned(toSigned(u, 8), 8)).toBe(u);
      expect(encodeTwos(toSigned(negate(u, 8), 8), 8)).toBe(
        encodeTwos(-toSigned(u, 8), 8),
      );
      expect(invert(u, 8)).toBe(255 - u);
    }
    expect(negate(0x80, 8)).toBe(0x80); // −128 has no positive partner
  });

  it("bitwise ops", () => {
    const ops: BitOp[] = ["and", "or", "xor"];
    for (let a = 0; a < 256; a += 7)
      for (let b = 0; b < 256; b += 11)
        for (const op of ops)
          expect(applyOp(op, a, b, 8)).toBe(applyBitwise(op, a, b, 8));
    for (let a = 0; a < 256; a += 3)
      for (let k = 1; k <= 3; k++) {
        expect(applyOp("shl", a, k, 8)).toBe(applyBitwise("shl", a, k, 8));
        expect(applyOp("shr", a, k, 8)).toBe(applyBitwise("shr", a, k, 8));
      }
  });

  it("addition columns", () => {
    for (let a = 0; a < 256; a += 5)
      for (let b = 0; b < 256; b += 9) {
        const c = addColumns(a, b, 8);
        expect(c.result).toBe((a + b) % 256);
        expect(c.carryOut).toBe(a + b > 255 ? 1 : 0);
        const fromBits = c.sum.reduce<number>(
          (acc, bit, i) => acc + bit * 2 ** i,
          0,
        );
        expect(fromBits).toBe(c.result);
      }
  });

  it("chmod, ASCII, colours, loose parsing", () => {
    expect(permString("755")).toBe("rwxr-xr-x");
    expect(permString("644")).toBe("rw-r--r--");
    expect(permString("600")).toBe("rw-------");
    expect(casePartner(0x41)).toBe(0x61);
    expect(casePartner(0x7a)).toBe(0x5a);
    expect(casePartner(0x30)).toBeNull();
    expect(asciiCode("K")).toBe(0x4b);
    expect(asciiCode("é")).toBeNull();
    expect(rgbHex(0x3f, 0xa0, 0xc2)).toBe("#3FA0C2");
    expect(parseLoose("0xC8", 16, 0xffff)).toBe(200);
    expect(parseLoose("1100_1000", 2, 0xffff)).toBe(200);
    expect(parseLoose("0o310", 8, 0xffff)).toBe(200);
    expect(parseLoose("12a", 10, 0xffff)).toBeNull();
    expect(parseLoose("10000", 16, 0xffff)).toBeNull();
  });
});

describe("every number quoted in the lessons", () => {
  it("place value and nibbles", () => {
    expect(2 * 100 + 3 * 10 + 7).toBe(237);
    expect(bin("1011")).toBe(11);
    expect(0x2f).toBe(2 * 16 + 15);
    expect(0x2f).toBe(47);
    expect(bin("1101")).toBe(13);
    expect((13).toString(16).toUpperCase()).toBe("D");
    expect((11).toString(16).toUpperCase()).toBe("B");
    expect(bin("1011")).toBe(bin("0011") + 8);
  });

  it("powers of two", () => {
    expect(2 ** 16).toBe(2 ** 6 * 1024);
    expect(2 ** 16).toBe(65536);
    expect(4096).toBe(4 * 1024);
    expect(Math.log2(4096)).toBe(12);
    expect(2 ** 12 - 1).toBe(4095);
    expect(2 ** 32).toBe(4 * 2 ** 30);
  });

  it("binary bytes and hex", () => {
    expect(bin("1100 0000")).toBe(192);
    expect(8 * 3 + 2).toBe(26); // 255.255.255.192 = /26
    expect(bin("1100 1000")).toBe(200);
    expect(200 - 128 - 64 - 8).toBe(0);
    expect((13).toString(2)).toBe("1101");
    expect(0xc8).toBe(12 * 16 + 8);
    expect(0xc8).toBe(200);
    expect((0x3f).toString(2).padStart(8, "0")).toBe("00111111");
  });

  it("octal", () => {
    expect(parseInt("755", 8)).toBe(493);
    expect(7 * 64 + 5 * 8 + 5).toBe(493);
    expect((493).toString(2)).toBe("111101101");
    expect(parseInt("033", 8)).toBe(27);
    expect((0xff).toString(8)).toBe("377");
  });

  it("16-bit words", () => {
    expect(0x1f90).toBe(8080);
    expect(0x1f * 256 + 0x90).toBe(8080);
    expect(0x1f).toBe(31);
    expect(0x90).toBe(144);
    expect(1 * 4096 + 15 * 256 + 9 * 16).toBe(8080);
    expect((0x1f90).toString(2).padStart(16, "0")).toBe("0001111110010000");
    for (const w of WORD_LANDMARKS) expect(parseInt(w.hex, 16)).toBe(w.dec);
  });

  it("two's complement", () => {
    expect(toSigned(bin("1111 1110"), 8)).toBe(-2);
    expect(-128 + 64 + 32 + 16 + 8 + 4 + 2).toBe(-2);
    expect(toSigned(bin("1011 0110"), 8)).toBe(-74);
    expect(-128 + 32 + 16 + 4 + 2).toBe(-74);
    expect(bin("0100 1010")).toBe(74);
    expect(invert(74, 8)).toBe(bin("1011 0101"));
    expect(negate(74, 8)).toBe(bin("1011 0110"));
    expect(invert(bin("1011 0110"), 8)).toBe(bin("0100 1001"));
    expect(toSigned(0xff, 8)).toBe(-1);
    expect(toSigned(0x80, 8)).toBe(-128);
    expect(fromSigned(-3, 8)).toBe(bin("1111 1101"));
    expect(5 + fromSigned(-3, 8)).toBe(bin("1 0000 0010"));
    expect(toSigned(127 + 1, 8)).toBe(-128);
    expect(fromSigned(-2, 16)).toBe(bin("1111 1111 1111 1110"));
  });

  it("bitwise", () => {
    expect(0xca & 0x0f).toBe(0x0a);
    expect(bin("1100 1010")).toBe(0xca);
    expect(0x41 ^ 0x20).toBe(0x61);
    expect(applyOp("shl", bin("0001 0110"), 2, 8)).toBe(bin("0101 1000"));
    expect(bin("0001 0110")).toBe(22);
    expect(bin("0101 1000")).toBe(88);
    expect(applyOp("shr", bin("1011 0101"), 3, 8)).toBe(bin("0001 0110"));
    expect(bin("1011 0101")).toBe(181);
    expect(Math.floor(181 / 8)).toBe(22);
    expect(130 & 192).toBe(128);
    expect(bin("1000 0010")).toBe(130);
    expect(0x2a | 0x80).toBe(0xaa);
    expect(0xa8 & 0xc0).toBe(0x80);
  });

  it("binary addition", () => {
    const a = bin("0101 1011");
    const b = bin("0011 0110");
    expect(a).toBe(91);
    expect(b).toBe(54);
    const c = addColumns(a, b, 8);
    expect(c.result).toBe(bin("1001 0001"));
    expect(c.result).toBe(145);
    // carry row "1111 11  " over bits 7..0
    expect(c.carryIn.slice().reverse().join("")).toBe("11111100");
    expect(c.carryOut).toBe(0);
  });

  it("colours and ASCII", () => {
    expect([0x3f, 0xa0, 0xc2]).toEqual([63, 160, 194]);
    expect("0".charCodeAt(0)).toBe(0x30);
    expect("7".charCodeAt(0)).toBe(0x37);
    expect("A".charCodeAt(0)).toBe(0x41);
    expect("Z".charCodeAt(0)).toBe(0x5a);
    expect("K".charCodeAt(0)).toBe(0x41 + 10);
    expect("a".charCodeAt(0)).toBe(0x61);
    expect("z".charCodeAt(0)).toBe(0x7a);
    expect(" ".charCodeAt(0)).toBe(0x20);
    expect("\n".charCodeAt(0)).toBe(0x0a);
  });
});

describe("generated examples", () => {
  it("are answerable and explained for every topic", () => {
    for (const t of TOPICS) {
      if (t.id === "custom") continue;
      for (let n = 0; n < 40; n++) {
        const q = exampleQuestion(t.id, n);
        expect(checkAnswer(q, q.answer)).toBe(true);
        expect(isAcceptableKeystroke(q.answer, q)).toBe(true);
        const steps = explainQuestion(q);
        expect(steps.length).toBeGreaterThan(0);
        expect(steps[steps.length - 1].work).toEqual([formatAnswer(q)]);
      }
    }
  });
});

describe("how to play", () => {
  it("answer examples match the real checker", () => {
    for (const ex of ANSWER_EXAMPLES) {
      for (const input of ex.accepted)
        expect(checkAnswer(ex.question, input)).toBe(true);
      if (ex.rejected)
        expect(checkAnswer(ex.question, ex.rejected.input)).toBe(false);
    }
  });

  it("facts come from the engine", () => {
    expect(FACTS.sprintSeconds).toBe(60);
    expect(FACTS.speedrunTarget).toBe(15);
    expect(FACTS.speedrunSkipSeconds).toBe(5);
    expect(FACTS.survivalLives).toBe(3);
    expect(FACTS.survivalStartSeconds).toBe(15);
    expect(FACTS.survivalFloorSeconds).toBe(5);
    expect(FACTS.survivalReviewOneIn).toBe(4);
    expect(FACTS.dailyCount).toBe(10);
    expect(FACTS.dailySkipSeconds).toBe(10);
    expect(FACTS.rankedModes).toBe(FACTS.topics * 2 + 1);
    expect(SURVIVAL_RAMP[0]).toBe("Nibbles");
    expect(DAILY_RAMP).toHaveLength(FACTS.dailyCount);
  });
});
