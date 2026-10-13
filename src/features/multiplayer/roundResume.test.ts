import { describe, expect, it } from "vitest";
import { progressSnapshot, type RunSnapshot } from "@/game";
import {
  loadRoundRun,
  planResume,
  pruneRoundRuns,
  ROUND_RUN_TTL_MS,
  saveRoundRun,
  snapshotMarks,
} from "./roundResume";

function memoryStore() {
  const data = new Map<string, string>();
  return {
    data,
    get length() {
      return data.size;
    },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

const run = (outcomes: RunSnapshot["outcomes"], end?: RunSnapshot["end"]) =>
  ({
    v: 1,
    outcomes,
    shownAt: 0,
    input: "",
    keystrokes: 0,
    deletions: 0,
    ...(end ? { end } : {}),
  }) satisfies RunSnapshot;

describe("stored round runs", () => {
  it("round-trips the run of the same round", () => {
    const store = memoryStore();
    const snap = run([
      ["c", 900, 2, 0],
      ["s", 300, 1, 1],
    ]);
    saveRoundRun(store, "ABCD1234", 111, snap);
    expect(loadRoundRun(store, "ABCD1234", 111)).toEqual(snap);
    expect(loadRoundRun(store, "WXYZ5678", 111)).toBeNull();
  });

  it("ignores the run of an earlier round (Play again)", () => {
    const store = memoryStore();
    saveRoundRun(store, "ABCD1234", 111, run([["c", 900, 2, 0]]));
    expect(loadRoundRun(store, "ABCD1234", 222)).toBeNull();
    expect(loadRoundRun(store, "ABCD1234", undefined)).toBeNull();
  });

  it("ignores damaged data and missing storage", () => {
    const store = memoryStore();
    store.setItem("bmg:mp:run:ABCD1234", "{not json");
    expect(loadRoundRun(store, "ABCD1234", 1)).toBeNull();
    store.setItem(
      "bmg:mp:run:ABCD1234",
      JSON.stringify({ round: 1, savedAt: 0, run: { v: 1 } }),
    );
    expect(loadRoundRun(store, "ABCD1234", 1)).toBeNull();
    expect(loadRoundRun(null, "ABCD1234", 1)).toBeNull();
    expect(() => saveRoundRun(null, "ABCD1234", 1, run([]))).not.toThrow();
  });

  it("prunes old rooms and leaves other keys alone", () => {
    const store = memoryStore();
    const now = 10 * ROUND_RUN_TTL_MS;
    saveRoundRun(store, "OLDROOM1", 1, run([]), now - ROUND_RUN_TTL_MS - 1);
    saveRoundRun(store, "NEWROOM1", 1, run([]), now - 1000);
    store.setItem("bmg:theme", "dark");
    pruneRoundRuns(store, now);
    expect([...store.data.keys()].sort()).toEqual([
      "bmg:mp:run:NEWROOM1",
      "bmg:theme",
    ]);
  });
});

describe("planResume", () => {
  const recorded = (
    correct: number,
    finished = false,
    progress: number[] = [],
  ) => ({
    correct,
    finished,
    progress,
  });

  it("a fresh round (or the countdown) plays from question 1", () => {
    expect(planResume(null, recorded(0))).toEqual({
      kind: "play",
      snapshot: null,
      source: "none",
    });
    expect(planResume(null, undefined)).toMatchObject({ source: "none" });
  });

  it("uses this device's run when it is at least as far as the room's record", () => {
    const snap = run([
      ["c", 1, 0, 0],
      ["s", 1, 0, 0],
      ["c", 1, 0, 0],
    ]);
    expect(planResume(snap, recorded(2))).toEqual({
      kind: "play",
      snapshot: snap,
      source: "device",
    });
    expect(planResume(snap, recorded(1))).toMatchObject({ source: "device" });
  });

  it("never rewinds: a record ahead of the device wins", () => {
    const snap = run([["c", 1, 0, 0]]);
    expect(planResume(snap, recorded(3, false, [500, 900, 1500]))).toEqual({
      kind: "play",
      snapshot: progressSnapshot(3, [500, 900, 1500]),
      source: "room",
    });
  });

  it("without a device run, continues from the room's record", () => {
    expect(planResume(null, recorded(4, false, [1, 2, 3, 4]))).toMatchObject({
      kind: "play",
      source: "room",
    });
  });

  it("a recorded finish stands; a finished device run is shown in full", () => {
    expect(planResume(null, recorded(5, true))).toEqual({ kind: "finished" });
    const unfinished = run([["c", 1, 0, 0]]);
    expect(planResume(unfinished, recorded(1, true))).toEqual({
      kind: "finished",
    });
    const done = run([["c", 1, 0, 0]], [60_000, 1, true]);
    expect(planResume(done, recorded(1, true))).toMatchObject({
      kind: "play",
      source: "device",
    });
    // Finished here, but the finish had not reached the room yet.
    expect(planResume(done, recorded(1))).toMatchObject({ source: "device" });
  });

  it("marks of a snapshot are the times each point was reached", () => {
    expect(
      snapshotMarks(
        run([
          ["c", 1000, 0, 0],
          ["s", 500, 0, 0],
          ["c", 700, 0, 0],
        ]),
      ),
    ).toEqual([1000, 2200]);
    expect(snapshotMarks(null)).toEqual([]);
  });
});
