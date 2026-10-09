import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import {
  collection,
  getCountFromServer,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import { anonymous, firestoreEnv, registered } from "./env";

const ts = () => firebase.firestore.FieldValue.serverTimestamp();

let env: RulesTestEnvironment;

const alice = () => env.authenticatedContext("alice", registered).firestore();
const bob = () => env.authenticatedContext("bob", registered).firestore();
const guest = () => env.authenticatedContext("guest1", anonymous).firestore();
const nobody = () => env.unauthenticatedContext().firestore();

function sprintEntry(uid: string, overrides: Record<string, unknown> = {}) {
  return {
    uid,
    displayName: "Alice",
    score: 40,
    correct: 40,
    skipped: 2,
    durationMs: 60_000,
    accuracy: 0.9,
    completed: true,
    updatedAt: ts(),
    ...overrides,
  };
}

function speedrunEntry(uid: string, overrides: Record<string, unknown> = {}) {
  return {
    uid,
    displayName: "Alice",
    score: 30_000 + 5_000, // durationMs + 1 skip × 5000
    correct: 15,
    skipped: 1,
    durationMs: 30_000,
    accuracy: 0.93,
    completed: true,
    updatedAt: ts(),
    ...overrides,
  };
}

function dailyEntry(uid: string, overrides: Record<string, unknown> = {}) {
  return {
    uid,
    displayName: "Alice",
    score: 20_000,
    correct: 10,
    skipped: 0,
    durationMs: 20_000,
    accuracy: 1,
    completed: true,
    updatedAt: ts(),
    ...overrides,
  };
}

function run(overrides: Record<string, unknown> = {}) {
  return {
    modeId: "bytes-hex:sprint",
    topicId: "bytes-hex",
    format: "sprint",
    score: 30,
    correct: 30,
    skipped: 1,
    durationMs: 60_000,
    accuracy: 0.96,
    typingAccuracy: 0.9,
    endedAt: Date.now(),
    completed: true,
    ...overrides,
  };
}

const lb = (db: firebase.firestore.Firestore, modeId: string, uid: string) =>
  db.doc(`leaderboards/${modeId}/entries/${uid}`);

const DAY = 24 * 60 * 60 * 1000;
/** UTC date key `days` from today (the daily challenge is per UTC day). */
const dayKey = (days = 0) =>
  new Date(Date.now() + days * DAY).toISOString().slice(0, 10);
const TODAY = dayKey();
const lockRef = (db: firebase.firestore.Firestore, uid: string, date: string) =>
  db.doc(`users/${uid}/dailyLocks/daily:${date}`);
/** The lock document src/data/leaderboard.ts writes (TTL when the day closes: +1 day +10 min). */
const lockData = (date: string) => ({
  expireAt: firebase.firestore.Timestamp.fromMillis(
    Date.parse(`${date}T00:00:00Z`) + DAY + 10 * 60_000,
  ),
});
/** Claims the day's ranked attempt: lock + entry in one batch. */
function claimDaily(
  db: firebase.firestore.Firestore,
  uid: string,
  date: string,
  entry: Record<string, unknown>,
) {
  const batch = db.batch();
  batch.set(lockRef(db, uid, date), lockData(date));
  batch.set(lb(db, `daily:${date}`, uid), entry);
  return batch.commit();
}

async function seed(path: string, data: Record<string, unknown>) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().doc(path).set(data);
  });
}

beforeAll(async () => {
  env = await firestoreEnv("demo-rules-firestore");
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe("users/{uid}", () => {
  it("lets a registered owner create and read their profile", async () => {
    await assertSucceeds(
      alice()
        .doc("users/alice")
        .set({ displayName: "Alice", createdAt: ts(), settings: {} }),
    );
    await assertSucceeds(alice().doc("users/alice").get());
  });

  it("rejects guests, strangers and unknown fields", async () => {
    await assertFails(
      guest().doc("users/guest1").set({ displayName: "G", createdAt: ts() }),
    );
    await assertFails(
      bob().doc("users/alice").set({ displayName: "B", createdAt: ts() }),
    );
    await assertFails(
      alice()
        .doc("users/alice")
        .set({ displayName: "Alice", createdAt: ts(), isAdmin: true }),
    );
    await assertFails(
      alice()
        .doc("users/alice")
        .set({ displayName: "x".repeat(25), createdAt: ts() }),
    );
    await seed("users/alice", { displayName: "Alice", createdAt: new Date() });
    await assertFails(bob().doc("users/alice").get());
    await assertFails(nobody().doc("users/alice").get());
  });

  it("allows settings/name updates but not changing createdAt", async () => {
    await seed("users/alice", { displayName: "Alice", createdAt: new Date(0) });
    await assertSucceeds(
      alice()
        .doc("users/alice")
        .set({ settings: { groupedDigits: true } }, { merge: true }),
    );
    await assertFails(
      alice()
        .doc("users/alice")
        .set({ createdAt: new Date() }, { merge: true }),
    );
  });

  it("pre-rebuild profiles: merges fail, the upgrade rewrite succeeds", async () => {
    await seed("users/alice", {
      uid: "alice",
      displayName: "Alice",
      email: "alice@example.com",
      photoURL: null,
      createdAt: 1776414596093,
      lastSeen: 1776414596093,
      gameSettings: { groupedDigits: true },
    });
    await assertFails(
      alice()
        .doc("users/alice")
        .set({ settings: { groupedDigits: true } }, { merge: true }),
    );
    // What ensureUserProfile writes (upgradeLegacyProfile).
    await assertSucceeds(
      alice()
        .doc("users/alice")
        .set({
          displayName: "Alice",
          createdAt: 1776414596093,
          settings: { groupedDigits: true },
        }),
    );
    await assertSucceeds(
      alice()
        .doc("users/alice")
        .set({ settings: { groupedDigits: false } }, { merge: true }),
    );
  });
});

describe("users/{uid}/runs", () => {
  it("lets a registered owner create and read runs", async () => {
    await assertSucceeds(alice().collection("users/alice/runs").add(run()));
    await assertSucceeds(alice().collection("users/alice/runs").get());
  });

  it("rejects guests, strangers, updates and implausible runs", async () => {
    await assertFails(guest().collection("users/guest1/runs").add(run()));
    await assertFails(bob().collection("users/alice/runs").add(run()));
    await assertFails(
      alice()
        .collection("users/alice/runs")
        .add(run({ correct: 500, score: 500 })),
    );
    await assertFails(
      alice()
        .collection("users/alice/runs")
        .add(run({ accuracy: 2 })),
    );
    await assertFails(
      alice()
        .collection("users/alice/runs")
        .add(run({ extra: 1 })),
    );
    await seed("users/alice/runs/r1", run());
    await assertFails(alice().doc("users/alice/runs/r1").update({ score: 99 }));
    await assertFails(bob().doc("users/alice/runs/r1").get());
    await assertSucceeds(alice().doc("users/alice/runs/r1").delete());
  });
});

describe("userStats/{uid}", () => {
  const stats = (gamesPlayed: number) => ({
    gamesPlayed,
    totalCorrect: 10,
    totalDurationMs: 60_000,
    lastPlayedAt: Date.now(),
    bests: { "bytes-hex__sprint": { score: 10 } },
  });

  it("owner-only, registered-only, monotonic gamesPlayed", async () => {
    await assertSucceeds(alice().doc("userStats/alice").set(stats(2)));
    await assertSucceeds(alice().doc("userStats/alice").set(stats(3)));
    await assertFails(alice().doc("userStats/alice").set(stats(1)));
    await assertFails(guest().doc("userStats/guest1").set(stats(1)));
    await assertFails(bob().doc("userStats/alice").get());
    await assertSucceeds(alice().doc("userStats/alice").get());
  });
});

describe("leaderboards/{modeId}/entries/{uid}", () => {
  it("is publicly readable in pages of at most 100", async () => {
    await seed("leaderboards/bytes-hex:sprint/entries/alice", {
      ...sprintEntry("alice"),
      updatedAt: new Date(),
    });
    await assertSucceeds(
      nobody().doc("leaderboards/bytes-hex:sprint/entries/alice").get(),
    );
    await assertSucceeds(
      nobody()
        .collection("leaderboards/bytes-hex:sprint/entries")
        .orderBy("score", "desc")
        .limit(50)
        .get(),
    );
    await assertFails(
      nobody()
        .collection("leaderboards/bytes-hex:sprint/entries")
        .orderBy("score", "desc")
        .limit(500)
        .get(),
    );
    await assertFails(
      nobody().collection("leaderboards/bytes-hex:sprint/entries").get(),
    );
  });

  it("allows the bounded rank query but not unbounded counts", async () => {
    await seed("leaderboards/bytes-hex:sprint/entries/alice", {
      ...sprintEntry("alice"),
      updatedAt: new Date(),
    });
    const ahead = await assertSucceeds(
      nobody()
        .collection("leaderboards/bytes-hex:sprint/entries")
        .where("score", ">", 10)
        .orderBy("score", "desc")
        .limit(100)
        .get(),
    );
    expect(ahead.size).toBe(1);
    const db = (nobody() as unknown as { _delegate: Firestore })._delegate;
    const c = collection(db, "leaderboards/bytes-hex:sprint/entries");
    await assertFails(getCountFromServer(query(c, where("score", ">", 10))));
  });

  it("accepts a plausible sprint entry from the registered owner", async () => {
    await assertSucceeds(
      lb(alice(), "bytes-hex:sprint", "alice").set(sprintEntry("alice")),
    );
  });

  it("rejects guests, strangers and unranked modes", async () => {
    await assertFails(
      lb(guest(), "bytes-hex:sprint", "guest1").set(sprintEntry("guest1")),
    );
    await assertFails(
      lb(bob(), "bytes-hex:sprint", "alice").set(sprintEntry("alice")),
    );
    await assertFails(
      lb(bob(), "bytes-hex:sprint", "bob").set(sprintEntry("alice")),
    );
    await assertFails(lb(alice(), "custom", "alice").set(sprintEntry("alice")));
    await assertFails(
      lb(alice(), "bytes-hex:practice", "alice").set(sprintEntry("alice")),
    );
    await assertFails(
      lb(alice(), "made-up:sprint", "alice").set(sprintEntry("alice")),
    );
    await assertFails(
      lb(nobody(), "bytes-hex:sprint", "alice").set(sprintEntry("alice")),
    );
  });

  it("rejects implausible sprint entries", async () => {
    const bad = [
      { durationMs: 30_000 }, // not a 60 s sprint
      { score: 41 }, // score must equal correct
      { score: 200, correct: 200 }, // > 3/s and > 180
      { completed: false },
      { updatedAt: new Date() }, // must be the server time
      { displayName: "" },
      { displayName: "x".repeat(25) },
      { accuracy: 1.5 },
      { isAdmin: true },
    ];
    for (const overrides of bad) {
      await assertFails(
        lb(alice(), "bytes-hex:sprint", "alice").set(
          sprintEntry("alice", overrides),
        ),
      );
    }
  });

  it("only accepts improvements (higher is better for sprint)", async () => {
    await seed("leaderboards/bytes-hex:sprint/entries/alice", {
      ...sprintEntry("alice"),
      updatedAt: new Date(),
    });
    await assertFails(
      lb(alice(), "bytes-hex:sprint", "alice").set(
        sprintEntry("alice", { score: 40, correct: 40 }),
      ),
    );
    await assertFails(
      lb(alice(), "bytes-hex:sprint", "alice").set(
        sprintEntry("alice", { score: 39, correct: 39 }),
      ),
    );
    await assertSucceeds(
      lb(alice(), "bytes-hex:sprint", "alice").set(
        sprintEntry("alice", { score: 41, correct: 41 }),
      ),
    );
  });

  it("speedrun: lower is better, 15 correct, score = time + skip penalty", async () => {
    await assertSucceeds(
      lb(alice(), "nibbles:speedrun", "alice").set(speedrunEntry("alice")),
    );
    await assertFails(
      lb(alice(), "nibbles:speedrun", "alice").set(
        speedrunEntry("alice", { score: 36_000, durationMs: 31_000 }),
      ),
    );
    await assertSucceeds(
      lb(alice(), "nibbles:speedrun", "alice").set(
        speedrunEntry("alice", { score: 34_000, durationMs: 29_000 }),
      ),
    );
    const bad = [
      { correct: 14 }, // target not reached
      { score: 30_000 }, // missing skip penalty
      { durationMs: 3_000, score: 8_000 }, // < 250 ms per correct
      { durationMs: 2_000, score: 2_000, skipped: 0 }, // too fast
    ];
    await env.clearFirestore();
    for (const overrides of bad) {
      await assertFails(
        lb(alice(), "nibbles:speedrun", "alice").set(
          speedrunEntry("alice", overrides),
        ),
      );
    }
  });

  it("survival: higher is better, score = cleared", async () => {
    const entry = (score: number, durationMs = 120_000) =>
      sprintEntry("alice", { score, correct: score, durationMs });
    await assertSucceeds(lb(alice(), "survival", "alice").set(entry(50)));
    await assertFails(lb(alice(), "survival", "alice").set(entry(49)));
    await assertSucceeds(lb(alice(), "survival", "alice").set(entry(51)));
    await assertFails(
      lb(alice(), "survival", "alice").set(entry(400, 100_000)),
    );
  });

  it("daily: one ranked attempt (entry + lock in one batch), name can be updated", async () => {
    const ref = () => lb(alice(), `daily:${TODAY}`, "alice");
    // Without claiming the day's lock in the same batch: denied.
    await assertFails(ref().set(dailyEntry("alice")));
    await assertSucceeds(claimDaily(alice(), "alice", TODAY, dailyEntry("alice")));
    await assertFails(
      ref().set(dailyEntry("alice", { score: 15_000, durationMs: 15_000 })),
    );
    await assertSucceeds(ref().update({ displayName: "Alicia" }));
    await assertFails(ref().update({ displayName: "Alicia", score: 1 }));
    // Deleting the entry does not give a second attempt.
    await assertSucceeds(ref().delete());
    const better = dailyEntry("alice", { score: 15_000, durationMs: 15_000 });
    await assertFails(ref().set(better));
    await assertFails(claimDaily(alice(), "alice", TODAY, better));
    await assertFails(lockRef(alice(), "alice", TODAY).delete());
  });

  it("daily: all ten questions, today's challenge only", async () => {
    const submit = (date: string, overrides: Record<string, unknown>) =>
      claimDaily(alice(), "alice", date, dailyEntry("alice", overrides));
    await assertFails(submit(TODAY, { skipped: 1, score: 20_000 })); // missing penalty
    await assertFails(submit(TODAY, { correct: 10, skipped: 1, score: 30_000 })); // 11 questions
    await assertFails(submit(TODAY, { correct: 9, skipped: 0, score: 20_000 })); // 9 answered
    await assertFails(
      submit(TODAY, { correct: 0, skipped: 0, durationMs: 2_500, score: 2_500 }),
    ); // none answered
    await assertFails(submit(dayKey(-2), {})); // a past day
    await assertFails(submit(dayKey(1), {})); // tomorrow
    await assertFails(
      lb(alice(), "daily:today", "alice").set(dailyEntry("alice")),
    );
    await assertSucceeds(
      submit(TODAY, { correct: 8, skipped: 2, score: 40_000 }), // 20 s + 2 × 10 s
    );
  });

  it("daily locks: owner-only, exact shape, deletable once the day is over", async () => {
    await assertFails(lockRef(bob(), "alice", TODAY).set(lockData(TODAY)));
    await assertFails(lockRef(guest(), "guest1", TODAY).set(lockData(TODAY)));
    await assertFails(
      lockRef(alice(), "alice", TODAY).set({ ...lockData(TODAY), extra: 1 }),
    );
    await assertFails(
      lockRef(alice(), "alice", TODAY).set({
        expireAt: firebase.firestore.Timestamp.fromMillis(Date.now()),
      }),
    );
    await assertFails(lockRef(alice(), "alice", dayKey(-2)).set(lockData(dayKey(-2))));
    await assertSucceeds(lockRef(alice(), "alice", TODAY).set(lockData(TODAY)));
    await assertSucceeds(lockRef(alice(), "alice", TODAY).get());
    await assertFails(lockRef(bob(), "alice", TODAY).get());
    await assertFails(lockRef(alice(), "alice", TODAY).set(lockData(TODAY))); // no updates
    await assertFails(lockRef(alice(), "alice", TODAY).delete());
    // A finished day's lock can go (account deletion).
    await seed(`users/alice/dailyLocks/daily:${dayKey(-3)}`, lockData(dayKey(-3)));
    await assertFails(lockRef(bob(), "alice", dayKey(-3)).delete());
    await assertSucceeds(lockRef(alice(), "alice", dayKey(-3)).delete());
  });

  it("leaderboard names reject control, zero-width and bidi characters", async () => {
    const survival = (displayName: string) =>
      lb(alice(), "survival", "alice").set(
        sprintEntry("alice", { displayName, score: 5, correct: 5, durationMs: 5_000 }),
      );
    for (const bad of ["\u202Eadmin", "ad\u200Bmin", "a\u0000", "a\nb", "x\u2066y", "x\u007Fy"]) {
      await assertFails(survival(bad));
    }
    await assertSucceeds(survival("Zoë 李 Ñandú"));
    await assertFails(
      alice().doc("users/alice").set({ displayName: "\u202Eadmin", createdAt: ts() }),
    );
  });

  it("owner may delete their own entry only", async () => {
    await seed("leaderboards/bytes-hex:sprint/entries/alice", {
      ...sprintEntry("alice"),
      updatedAt: new Date(),
    });
    await assertFails(lb(bob(), "bytes-hex:sprint", "alice").delete());
    await assertSucceeds(lb(alice(), "bytes-hex:sprint", "alice").delete());
  });
});
