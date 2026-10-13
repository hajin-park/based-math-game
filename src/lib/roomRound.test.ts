import { describe, expect, it } from "vitest";
import {
  DISCONNECT_GRACE_MS,
  hostVacant,
  needsReset,
  roundComplete,
  type RoundRoom,
} from "./roomRound";

const START = 1_000_000;
const NOW = START + 60_000;

function room(players: RoundRoom["players"], extra: Partial<RoundRoom> = {}) {
  return {
    hostUid: "a",
    status: "playing",
    startedAt: START,
    players,
    ...extra,
  } satisfies RoundRoom;
}
const done = (uid: string) => ({ uid, finished: true, round: START });
const playing = (uid: string) => ({ uid, finished: false, round: START });

describe("roundComplete", () => {
  it("is complete once every connected player finished this round", () => {
    expect(roundComplete(room({ a: done("a"), b: done("b") }), NOW)).toEqual({
      complete: true,
    });
    expect(
      roundComplete(room({ a: done("a"), b: playing("b") }), NOW),
    ).toEqual({ complete: false });
  });

  it("an old round's finish does not count", () => {
    const stale = { uid: "b", finished: true, round: START - 5000 };
    expect(roundComplete(room({ a: done("a"), b: stale }), NOW).complete).toBe(
      false,
    );
  });

  it("waits for a player who dropped moments ago (reload, blip)", () => {
    const dropped = {
      ...playing("b"),
      disconnected: true,
      disconnectedAt: NOW - 2000,
    };
    const r = roundComplete(room({ a: done("a"), b: dropped }), NOW);
    expect(r.complete).toBe(false);
    expect(r.retryInMs).toBe(DISCONNECT_GRACE_MS - 2000 + 250);
    // After the grace period the round may end without them.
    expect(
      roundComplete(
        room({ a: done("a"), b: dropped }),
        NOW + DISCONNECT_GRACE_MS,
      ).complete,
    ).toBe(true);
  });

  it("ignores long-gone and kicked players, and needs someone connected", () => {
    const gone = { ...playing("b"), disconnected: true, disconnectedAt: 0 };
    expect(roundComplete(room({ a: done("a"), b: gone }), NOW).complete).toBe(
      true,
    );
    expect(
      roundComplete(
        room({ a: done("a"), b: playing("b") }, { kicked: { b: true } }),
        NOW,
      ).complete,
    ).toBe(true);
    expect(roundComplete(room({ b: gone }), NOW).complete).toBe(false);
    expect(
      roundComplete(room({ a: done("a") }, { status: "finished" }), NOW)
        .complete,
    ).toBe(false);
  });
});

describe("hostVacant", () => {
  it("is vacant when the host left or stayed away past the grace period", () => {
    expect(hostVacant(room({ b: playing("b") }), NOW)).toEqual({
      vacant: true,
    });
    expect(hostVacant(room({ a: playing("a") }), NOW)).toEqual({
      vacant: false,
    });
    const away = {
      ...playing("a"),
      disconnected: true,
      disconnectedAt: NOW - 1000,
    };
    expect(hostVacant(room({ a: away }), NOW)).toEqual({
      vacant: false,
      retryInMs: DISCONNECT_GRACE_MS - 1000 + 250,
    });
    expect(hostVacant(room({ a: away }), NOW + DISCONNECT_GRACE_MS)).toEqual({
      vacant: true,
    });
  });
});

describe("needsReset", () => {
  it("flags lobby players still carrying a round", () => {
    expect(needsReset({ status: "waiting" }, playing("b"))).toBe(true);
    expect(needsReset({ status: "waiting" }, { uid: "b" })).toBe(false);
    expect(needsReset({ status: "waiting" }, { uid: "b", round: null })).toBe(
      false,
    );
    expect(needsReset({ status: "playing" }, playing("b"))).toBe(false);
  });
});
