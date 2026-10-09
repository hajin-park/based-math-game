import { describe, expect, it } from "vitest";
import { upgradeLegacyProfile } from "./legacyProfile";
import { DEFAULT_GAME_SETTINGS } from "./types";

describe("upgradeLegacyProfile", () => {
  it("leaves current profiles alone", () => {
    expect(
      upgradeLegacyProfile(
        { displayName: "Ada", createdAt: 1, settings: DEFAULT_GAME_SETTINGS },
        "Ada",
      ),
    ).toBeNull();
    expect(upgradeLegacyProfile({ displayName: "Ada" }, null)).toBeNull();
  });

  it("drops pre-rebuild fields and carries gameSettings over", () => {
    const legacy = {
      uid: "u1",
      displayName: "Hajin Park",
      email: "someone@example.com",
      photoURL: null,
      createdAt: 1776414596093,
      lastSeen: 1776414596093,
      gameSettings: {
        groupedDigits: true,
        indexValueHints: true,
        countdownStart: true,
      },
    };
    expect(upgradeLegacyProfile(legacy, "Auth Name")).toEqual({
      displayName: "Hajin Park",
      createdAt: 1776414596093,
      settings: {
        groupedDigits: true,
        indexValueHints: true,
        countdownStart: true,
        soundEffects: false,
      },
    });
  });

  it("prefers settings over gameSettings and ignores junk values", () => {
    const out = upgradeLegacyProfile(
      {
        lastSeen: 1,
        gameSettings: { groupedDigits: true, countdownStart: false },
        settings: { groupedDigits: false, soundEffects: "yes", extra: true },
      },
      "Ada",
    );
    expect(out?.settings).toEqual({
      ...DEFAULT_GAME_SETTINGS,
      groupedDigits: false,
      countdownStart: false,
    });
  });

  it("keeps createdAt only when it was stored", () => {
    const out = upgradeLegacyProfile({ uid: "u1", displayName: "Ada" }, null);
    expect(out).not.toHaveProperty("createdAt");
  });

  it("repairs names the rules would reject", () => {
    expect(
      upgradeLegacyProfile({ displayName: "x".repeat(30) }, null)?.displayName,
    ).toBe("x".repeat(24));
    expect(
      upgradeLegacyProfile({ displayName: null, uid: "u1" }, "Grace")
        ?.displayName,
    ).toBe("Grace");
    expect(upgradeLegacyProfile({ displayName: "" }, null)?.displayName).toBe(
      "Player",
    );
  });
});
