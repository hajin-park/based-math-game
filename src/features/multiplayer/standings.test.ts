import { describe, expect, it } from "vitest";
import { ordinal, rankPlayers, type StandingInput } from "./standings";

const p = (uid: string, extra: Partial<StandingInput> = {}): StandingInput => ({
  uid,
  score: 0,
  correct: 0,
  finished: false,
  ...extra,
});
const order = (s: { player: StandingInput }[]) => s.map((x) => x.player.uid);

describe("speedrun ranking", () => {
  it("never crowns a dropout, and ranks finishers by ms-precise total time", () => {
    const standings = rankPlayers(
      [
        // Dropped after 2 answers: under the old model their "score" of 2
        // looked like a 2 s finish time and won.
        p("dropout", { score: 2, correct: 2, scoreMs: 2_000, disconnected: true }),
        p("slow", { score: 15, correct: 15, finished: true, finishMs: 4_412 }),
        p("fast", { score: 15, correct: 15, finished: true, finishMs: 4_389 }),
      ],
      "speedrun",
    );
    expect(order(standings)).toEqual(["fast", "slow", "dropout"]);
    expect(standings.map((s) => s.rank)).toEqual([1, 2, 3]);
    expect(standings[0].winner).toBe(true);
    expect(standings[2].dropout).toBe(true);
    expect(standings[2].winner).toBe(false);
  });

  it("adds skip penalties to the run time", () => {
    const standings = rankPlayers(
      [
        p("skipper", { finished: true, finishMs: 20_000, penaltyMs: 10_000, correct: 15, score: 15 }),
        p("clean", { finished: true, finishMs: 25_000, correct: 15, score: 15 }),
      ],
      "speedrun",
    );
    expect(order(standings)).toEqual(["clean", "skipper"]);
    expect(standings[1].totalMs).toBe(30_000);
  });

  it("puts unfinished players after finishers, by correct answers", () => {
    const standings = rankPlayers(
      [
        p("b", { score: 9, correct: 9, scoreMs: 9_000 }),
        p("a", { score: 12, correct: 12, scoreMs: 13_000 }),
        p("done", { score: 15, correct: 15, finished: true, finishMs: 40_000 }),
        p("left", { score: 14, correct: 14, disconnected: true }),
      ],
      "speedrun",
    );
    expect(order(standings)).toEqual(["done", "a", "b", "left"]);
  });

  it("has no winner when nobody finished", () => {
    const standings = rankPlayers(
      [p("a", { score: 3, correct: 3 }), p("b", { score: 1, correct: 1 })],
      "speedrun",
    );
    expect(standings.some((s) => s.winner)).toBe(false);
  });

  it("a finished player who then disconnects keeps their time", () => {
    const standings = rankPlayers(
      [
        p("gone", { finished: true, finishMs: 9_000, correct: 15, score: 15, disconnected: true }),
        p("here", { finished: true, finishMs: 9_500, correct: 15, score: 15 }),
      ],
      "speedrun",
    );
    expect(order(standings)).toEqual(["gone", "here"]);
    expect(standings[0].winner).toBe(true);
  });
});

describe("sprint ranking", () => {
  it("ranks by score, then by who reached it first", () => {
    const standings = rankPlayers(
      [
        p("late", { score: 20, correct: 20, scoreMs: 58_000, finished: true }),
        p("early", { score: 20, correct: 20, scoreMs: 51_000, finished: true }),
        p("top", { score: 22, correct: 22, scoreMs: 59_900, finished: true }),
      ],
      "sprint",
    );
    expect(order(standings)).toEqual(["top", "early", "late"]);
    expect(standings.map((s) => s.rank)).toEqual([1, 2, 3]);
  });

  it("exact ties share a rank and both win", () => {
    const standings = rankPlayers(
      [
        p("a", { score: 5, scoreMs: 10_000, finished: true, joinedAt: 1 }),
        p("b", { score: 5, scoreMs: 10_000, finished: true, joinedAt: 2 }),
        p("c", { score: 3, scoreMs: 9_000, finished: true, joinedAt: 3 }),
      ],
      "sprint",
    );
    expect(standings.map((s) => s.rank)).toEqual([1, 1, 3]);
    expect(standings.filter((s) => s.winner).map((s) => s.player.uid)).toEqual(["a", "b"]);
  });

  it("dropouts rank below everyone still in the round", () => {
    const standings = rankPlayers(
      [
        p("dropout", { score: 30, scoreMs: 40_000, disconnected: true }),
        p("stayed", { score: 4, scoreMs: 50_000, finished: true }),
      ],
      "sprint",
    );
    expect(order(standings)).toEqual(["stayed", "dropout"]);
    expect(standings[1].winner).toBe(false);
  });

  it("nobody wins with zero points", () => {
    const standings = rankPlayers([p("a"), p("b")], "sprint");
    expect(standings.map((s) => s.rank)).toEqual([1, 1]);
    expect(standings.some((s) => s.winner)).toBe(false);
  });

  it("survival ranks like sprint (questions cleared)", () => {
    const standings = rankPlayers(
      [p("a", { score: 12, scoreMs: 90_000 }), p("b", { score: 17, scoreMs: 120_000 })],
      "survival",
    );
    expect(order(standings)).toEqual(["b", "a"]);
  });
});

describe("ordinal", () => {
  it("formats English ordinals", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 103].map(ordinal)).toEqual([
      "1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "103rd",
    ]);
  });
});
