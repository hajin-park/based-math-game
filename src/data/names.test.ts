import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { generateGuestName } from "@/lib/guestName";
import {
  hasInvisibleChars,
  validateDisplayName,
} from "@/utils/displayNameValidator";
import { clampDisplayName } from "./names";

const INVISIBLE = [
  "\u0000",
  "\u0007",
  "\u001F",
  "\u007F",
  "​",
  "‌",
  "‍",
  "‎",
  "‏",
  "‪",
  "‫",
  "‬",
  "‭",
  "‮",
  "⁦",
  "⁧",
  "⁨",
  "⁩",
];

describe("display names: control, zero-width and bidi characters", () => {
  it("the validator rejects every one of them", () => {
    for (const c of INVISIBLE) {
      expect(hasInvisibleChars(`ad${c}min`), JSON.stringify(c)).toBe(true);
      expect(validateDisplayName(`ad${c}min`).isValid, JSON.stringify(c)).toBe(
        false,
      );
    }
    expect(validateDisplayName("Zoë 李 Ñandú").isValid).toBe(true);
  });

  it("clampDisplayName strips them so writes pass the rules", () => {
    expect(clampDisplayName("‮nimda​")).toBe("nimda");
    expect(clampDisplayName("​​")).toBe("Player");
    expect(clampDisplayName(` A\u0000da ${"x".repeat(40)}`)).toHaveLength(24);
    for (const c of INVISIBLE) {
      expect(hasInvisibleChars(clampDisplayName(`a${c}b`))).toBe(false);
    }
    // Never ends on half a surrogate pair.
    const emoji = "a".repeat(23) + "\u{1F600}";
    const out = clampDisplayName(emoji);
    expect(out).toBe("a".repeat(23));
  });

  it("the security rules reject the same set", () => {
    const root = process.cwd();
    const fsRules = readFileSync(path.join(root, "firestore.rules"), "utf8");
    expect(fsRules).toContain(
      "\\\\x{0000}-\\\\x{001F}\\\\x{007F}\\\\x{200B}-\\\\x{200F}\\\\x{202A}-\\\\x{202E}\\\\x{2066}-\\\\x{2069}",
    );
    const db = JSON.parse(
      readFileSync(path.join(root, "database.rules.json"), "utf8"),
    );
    const nameRule: string =
      db.rules.rooms.$roomId.players.$uid.displayName[".validate"];
    for (const c of INVISIBLE.filter((ch) => ch.charCodeAt(0) >= 0x7f)) {
      expect(nameRule).toContain(`contains('${c}')`);
    }
    expect(nameRule).toContain("matches(/[\u0000-\u001F]/)");
  });
});

describe("guest names", () => {
  it("every adjective/noun/number combination is a valid display name", () => {
    // Drive the generator through all combinations (24 x 24, plus the
    // longest number) by feeding it chosen "random" values.
    const seen = new Set<string>();
    for (let a = 0; a < 64; a++) {
      for (let n = 0; n < 64; n++) {
        const values = [a, n, 999];
        const spy = vi
          .spyOn(globalThis.crypto, "getRandomValues")
          .mockImplementation((buf: ArrayBufferView) => {
            (buf as Uint32Array)[0] = values.shift() ?? 0;
            return buf;
          });
        const name = generateGuestName();
        spy.mockRestore();
        seen.add(name);
        expect(validateDisplayName(name).isValid, name).toBe(true);
        expect(clampDisplayName(name)).toBe(name);
      }
    }
    expect(seen.size).toBeGreaterThanOrEqual(24 * 24);
  });
});
