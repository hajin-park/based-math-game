/**
 * Regression tests for exploits found in the pre-launch security review.
 * Each attack must now be denied; each has a legitimate counterpart that must
 * keep working (multiplayer and the daily challenge must not break).
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { anonymous, databaseEnv, firestoreEnv, registered } from "./env";

const NOW = { ".sv": "timestamp" };
const ROOM = "SECR1234";
const R = `rooms/${ROOM}`;
const DAY = 24 * 60 * 60 * 1000;
/** Play begins this long after startedAt (ROOM_COUNTDOWN_MS). */
const COUNTDOWN = 3000;

let rtdb: RulesTestEnvironment;
let fsEnv: RulesTestEnvironment;

const db = (uid: string) =>
  rtdb.authenticatedContext(uid, anonymous).database();

function player(
  uid: string,
  slot: string,
  extra: Record<string, unknown> = {},
) {
  return {
    uid,
    displayName: uid,
    slot,
    joinedAt: Date.now(),
    ready: false,
    score: 0,
    correct: 0,
    finished: false,
    wins: 0,
    disconnected: false,
    ...extra,
  };
}

function room(extra: Record<string, unknown> = {}) {
  return {
    hostUid: "alice",
    status: "waiting",
    mode: { id: "bytes-hex:speedrun" },
    maxPlayers: 4,
    allowVisualAids: true,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
    slots: { "0": "alice", "1": "bob", "2": "mallory" },
    players: {
      alice: player("alice", "0", { ready: true }),
      bob: player("bob", "1"),
      mallory: player("mallory", "2"),
    },
    ...extra,
  };
}

async function seed(path: string, value: unknown) {
  await rtdb.withSecurityRulesDisabled(async (ctx) => {
    await ctx.database().ref(path).set(value);
  });
}

async function read(path: string) {
  let value: unknown;
  await rtdb.withSecurityRulesDisabled(async (ctx) => {
    value = (await ctx.database().ref(path).get()).val();
  });
  return value;
}

const msg = (uid: string) => ({
  senderId: uid,
  displayName: uid,
  message: "x".repeat(300),
  timestamp: NOW,
  isSystem: false,
});

beforeAll(async () => {
  rtdb = await databaseEnv("demo-security-regressions");
  fsEnv = await firestoreEnv("demo-security-regressions");
});

afterAll(async () => {
  await rtdb?.cleanup();
  await fsEnv?.cleanup();
});

beforeEach(async () => {
  await rtdb.clearDatabase();
  await fsEnv.clearFirestore();
});

describe("H1 chat flood", () => {
  it("many messages in one write are denied", async () => {
    await seed(R, room());
    const updates: Record<string, unknown> = { "lastChatAt/mallory": NOW };
    for (let i = 0; i < 2000; i++) updates[`chat/m${i}`] = msg("mallory");
    await assertFails(db("mallory").ref(R).update(updates));
    // Even with one valid key, extra messages ride along: denied.
    await assertFails(
      db("mallory")
        .ref(R)
        .update({
          "lastChatAt/mallory": NOW,
          "chat/mallory_0": msg("mallory"),
          "chat/mallory_1": msg("mallory"),
        }),
    );
    expect(await read(`${R}/chat`)).toBeNull();
  });

  it("the key is bound to the previous lastChatAt, which must move with it", async () => {
    await seed(R, room());
    await assertFails(
      db("mallory")
        .ref(R)
        .update({ "lastChatAt/mallory": NOW, "chat/anykey": msg("mallory") }),
    );
    // lastChatAt cannot move on its own (it would desync the next key).
    await assertFails(db("mallory").ref(`${R}/lastChatAt/mallory`).set(NOW));
    await assertSucceeds(
      db("mallory")
        .ref(R)
        .update({ "lastChatAt/mallory": NOW, "chat/mallory_0": msg("mallory") }),
    );
    const last = (await read(`${R}/lastChatAt/mallory`)) as number;
    expect(typeof last).toBe("number");
    // Next message: key from the real (server) timestamp, after 1 s.
    await seed(`${R}/lastChatAt/mallory`, last - 1500);
    await assertFails(
      db("mallory")
        .ref(R)
        .update({ "lastChatAt/mallory": NOW, "chat/mallory_0b": msg("mallory") }),
    );
    await assertSucceeds(
      db("mallory")
        .ref(R)
        .update({
          "lastChatAt/mallory": NOW,
          [`chat/mallory_${last - 1500}`]: msg("mallory"),
        }),
    );
  });
});

describe("M2 multiplayer results", () => {
  it("speedrun: no finish without reaching the target, no early round end", async () => {
    const startedAt = Date.now() - COUNTDOWN - 100; // 0.1 s into play
    await seed(R, room({ status: "playing", startedAt, seed: 1 }));
    await assertFails(
      db("mallory")
        .ref(R)
        .update({
          "players/mallory/round": startedAt,
          "players/mallory/score": 0,
          "players/mallory/correct": 0,
          "players/mallory/finished": true,
          "players/mallory/finishMs": 0,
        }),
    );
    // Giving up (finished, no time) is fine, but cannot end the round
    // while others still play.
    await assertSucceeds(
      db("mallory")
        .ref(R)
        .update({
          "players/mallory/round": startedAt,
          "players/mallory/finished": true,
        }),
    );
    await assertFails(db("mallory").ref(`${R}/status`).set("finished"));
    expect(await read(`${R}/status`)).toBe("playing");
  });

  it("speedrun: 15 correct 1 s into play is denied (countdown is not play time)", async () => {
    const startedAt = Date.now() - COUNTDOWN - 1100;
    await seed(R, room({ status: "playing", startedAt, seed: 1 }));
    await assertFails(
      db("mallory")
        .ref(R)
        .update({
          "players/mallory/round": startedAt,
          "players/mallory/score": 15,
          "players/mallory/correct": 15,
        }),
    );
    await assertFails(
      db("mallory")
        .ref(R)
        .update({
          "players/mallory/round": startedAt,
          "players/mallory/finished": true,
          "players/mallory/finishMs": 3750,
        }),
    );
  });

  it("speedrun: a real finish works, and the last finisher may close the round", async () => {
    const startedAt = Date.now() - COUNTDOWN - 30_000;
    await seed(
      R,
      room({
        status: "playing",
        startedAt,
        seed: 1,
        players: {
          alice: player("alice", "0", { round: startedAt, finished: true }),
          bob: player("bob", "1", { disconnected: true }),
          mallory: player("mallory", "2"),
        },
      }),
    );
    await assertSucceeds(
      db("mallory")
        .ref(R)
        .update({
          "players/mallory/round": startedAt,
          "players/mallory/score": 15,
          "players/mallory/correct": 15,
        }),
    );
    await assertFails(
      db("mallory").ref(R).update({ "players/mallory/finishMs": 35_000 }), // longer than play
    );
    await assertSucceeds(
      db("mallory")
        .ref(R)
        .update({
          "players/mallory/finished": true,
          "players/mallory/finishMs": 20_000,
          "players/mallory/penaltyMs": 5_000,
        }),
    );
    await assertSucceeds(db("mallory").ref(`${R}/status`).set("finished"));
  });

  it("custom speedrun targets are enforced", async () => {
    const startedAt = Date.now() - COUNTDOWN - 30_000;
    await seed(
      R,
      room({
        status: "playing",
        startedAt,
        seed: 1,
        mode: {
          id: "custom",
          custom: {
            conversions: { 0: { from: 2, to: 10, min: 0, max: 15 } },
            targetCount: 20,
          },
        },
      }),
    );
    const me = db("mallory").ref(`${R}/players/mallory`);
    await assertSucceeds(me.update({ round: startedAt, score: 15, correct: 15 }));
    await assertFails(me.update({ finished: true, finishMs: 20_000 }));
    await assertSucceeds(me.update({ score: 20, correct: 20 }));
    await assertSucceeds(me.update({ finished: true, finishMs: 20_000 }));
  });

  it("scores freeze once the round is over", async () => {
    const startedAt = Date.now() - 10 * 60_000;
    await seed(
      R,
      room({
        mode: { id: "bytes-hex:sprint" },
        status: "finished",
        startedAt,
        seed: 1,
        players: {
          alice: player("alice", "0", { round: startedAt, score: 40, correct: 40, finished: true }),
          bob: player("bob", "1", { round: startedAt, score: 30, correct: 30, finished: true }),
          mallory: player("mallory", "2", { round: startedAt, score: 5, correct: 5, finished: true }),
        },
      }),
    );
    const me = db("mallory").ref(`${R}/players/mallory`);
    await assertFails(me.update({ score: 9000, correct: 1800, scoreMs: 1 }));
    await assertFails(me.update({ score: 6, correct: 6 }));
    await assertFails(me.update({ scoreMs: 1 }));
    await assertFails(me.update({ finishMs: 20_000 }));
    // Writing the same values back is harmless.
    await assertSucceeds(me.update({ score: 5, correct: 5, finished: true }));
  });

  it("score must equal correct answers", async () => {
    const startedAt = Date.now() - COUNTDOWN - 10_000;
    await seed(
      R,
      room({ mode: { id: "bytes-hex:sprint" }, status: "playing", startedAt, seed: 1 }),
    );
    const me = db("mallory").ref(`${R}/players/mallory`);
    await assertFails(me.update({ round: startedAt, score: 200, correct: 0 }));
    await assertFails(me.update({ round: startedAt, score: 25, correct: 20 }));
    await assertSucceeds(me.update({ round: startedAt, score: 20, correct: 20 }));
  });
});

describe("L1/L2/L3 rooms", () => {
  it("L2: a player cannot credit themselves a win the host did not record", async () => {
    const startedAt = Date.now() - 100_000;
    await seed(R, room({ status: "finished", startedAt, seed: 1 }));
    await assertFails(
      db("mallory")
        .ref(R)
        .update({
          "players/mallory/wins": 1,
          "players/mallory/lastWinRound": startedAt,
        }),
    );
    await assertFails(
      db("mallory")
        .ref(R)
        .update({
          "winners/round": startedAt,
          "winners/uids/mallory": true,
          "players/mallory/wins": 1,
          "players/mallory/lastWinRound": startedAt,
        }),
    );
    // Host records bob; bob counts it.
    await assertSucceeds(
      db("alice").ref(`${R}/winners`).set({ round: startedAt, uids: { bob: true } }),
    );
    await assertFails(
      db("mallory")
        .ref(R)
        .update({
          "players/mallory/wins": 1,
          "players/mallory/lastWinRound": startedAt,
        }),
    );
    await assertSucceeds(
      db("bob")
        .ref(R)
        .update({ "players/bob/wins": 1, "players/bob/lastWinRound": startedAt }),
    );
  });

  it("L1: a kicked player cannot read the room or its chat", async () => {
    await seed(
      R,
      room({
        kicked: { mallory: true },
        chat: {
          a: { senderId: "alice", displayName: "alice", message: "secret plan", timestamp: Date.now() },
        },
        slots: { "0": "alice", "1": "bob" },
        players: { alice: player("alice", "0"), bob: player("bob", "1") },
      }),
    );
    await assertFails(db("mallory").ref(`${R}/chat`).get());
    await assertFails(db("mallory").ref(R).get());
    await assertSucceeds(db("bob").ref(`${R}/chat`).get());
  });

  it("L3: room and chat names reject control, zero-width and bidi characters", async () => {
    await seed(R, room());
    const name = db("mallory").ref(`${R}/players/mallory/displayName`);
    for (const bad of [
      "‮ecila",
      "al​ice",
      "a\u0000",
      "a\u0007b",
      "a\u007Fb",
      "x⁦y",
      "x‏y",
      "x‪y",
    ]) {
      await assertFails(name.set(bad));
    }
    await assertSucceeds(name.set("Zoë 李"));
    await assertFails(
      db("mallory")
        .ref(R)
        .update({
          "lastChatAt/mallory": NOW,
          "chat/mallory_0": { ...msg("mallory"), displayName: "‮admin" },
        }),
    );
  });
});

describe("M1 daily leaderboard (Firestore)", () => {
  const TODAY = new Date().toISOString().slice(0, 10);
  const fs = () => fsEnv.authenticatedContext("mallory", registered).firestore();
  const entry = (extra: Record<string, unknown> = {}) => ({
    uid: "mallory",
    displayName: "mallory",
    score: 20_000,
    correct: 10,
    skipped: 0,
    durationMs: 20_000,
    accuracy: 1,
    completed: true,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    ...extra,
  });
  const lockData = (date: string) => ({
    expireAt: firebase.firestore.Timestamp.fromMillis(
      Date.parse(`${date}T00:00:00Z`) + DAY + 10 * 60_000,
    ),
  });
  const submit = (date: string, extra: Record<string, unknown> = {}) => {
    const db = fs();
    const batch = db.batch();
    batch.set(db.doc(`users/mallory/dailyLocks/daily:${date}`), lockData(date));
    batch.set(db.doc(`leaderboards/daily:${date}/entries/mallory`), entry(extra));
    return batch.commit();
  };

  it("F1: delete your entry and re-create a better one", async () => {
    const ref = fs().doc(`leaderboards/daily:${TODAY}/entries/mallory`);
    await assertSucceeds(submit(TODAY));
    await assertFails(ref.set(entry({ durationMs: 15_000, score: 15_000 })));
    await assertSucceeds(ref.delete());
    await assertFails(ref.set(entry({ durationMs: 15_000, score: 15_000 })));
    await assertFails(submit(TODAY, { durationMs: 15_000, score: 15_000 }));
    await assertFails(
      fs().doc(`users/mallory/dailyLocks/daily:${TODAY}`).delete(),
    );
  });

  it("F2: an entry with zero questions answered", async () => {
    await assertFails(
      fs()
        .doc(`leaderboards/daily:${TODAY}/entries/mallory`)
        .set(entry({ correct: 0, skipped: 0, durationMs: 2500, score: 2500 })),
    );
    await assertFails(
      submit(TODAY, { correct: 0, skipped: 0, durationMs: 2500, score: 2500 }),
    );
    // The same batch with all ten questions answered goes through.
    await assertSucceeds(submit(TODAY));
  });

  it("F3: entries for other dates", async () => {
    for (const d of ["2020-01-01", "2099-12-31", "0000-99-99"]) {
      await assertFails(submit(d));
      await assertFails(
        fs().doc(`leaderboards/daily:${d}/entries/mallory`).set(entry()),
      );
    }
  });

  it("F4: bidi/zero-width display names on the leaderboard", async () => {
    await assertFails(
      fs()
        .doc("leaderboards/survival/entries/mallory")
        .set(entry({ displayName: "‮admin​", correct: 5, score: 5, durationMs: 5000 })),
    );
    await assertSucceeds(
      fs()
        .doc("leaderboards/survival/entries/mallory")
        .set(entry({ displayName: "mallory", correct: 5, score: 5, durationMs: 5000 })),
    );
  });
});
