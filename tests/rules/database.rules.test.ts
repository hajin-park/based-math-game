import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { anonymous, databaseEnv } from "./env";

const NOW = { ".sv": "timestamp" };
const ROOM = "ABCD1234";
const R = `rooms/${ROOM}`;
const HOUR = 60 * 60 * 1000;

let env: RulesTestEnvironment;

// Everyone in multiplayer is at least an anonymous Firebase user.
const db = (uid: string) => env.authenticatedContext(uid, anonymous).database();
const nobody = () => env.unauthenticatedContext().database();

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
    mode: { id: "bytes-hex:sprint" },
    maxPlayers: 4,
    allowVisualAids: true,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
    slots: { "0": "alice", "1": "bob" },
    players: {
      alice: player("alice", "0", { ready: true }),
      bob: player("bob", "1"),
    },
    ...extra,
  };
}

async function seed(path: string, value: unknown) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.database().ref(path).set(value);
  });
}

async function read(path: string) {
  let value: unknown;
  await env.withSecurityRulesDisabled(async (ctx) => {
    value = (await ctx.database().ref(path).get()).val();
  });
  return value;
}

/** Seeds a room where alice (host) started a round `agoMs` ago. */
async function seedPlaying(
  agoMs = 20_000,
  extra: Record<string, unknown> = {},
) {
  const startedAt = Date.now() - agoMs;
  await seed(R, room({ status: "playing", startedAt, seed: 42, ...extra }));
  return startedAt;
}

beforeAll(async () => {
  env = await databaseEnv("demo-rules-database");
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearDatabase();
});

describe("reading", () => {
  it("rooms are readable by signed-in users only and cannot be listed", async () => {
    await seed(R, room());
    await assertSucceeds(db("stranger").ref(R).get());
    await assertFails(nobody().ref(R).get());
    await assertFails(db("alice").ref("rooms").get());
    await assertFails(db("alice").ref("/").get());
  });
});

describe("creating rooms", () => {
  const fresh = (host = "alice", extra: Record<string, unknown> = {}) => ({
    hostUid: host,
    status: "waiting",
    mode: { id: "bytes-hex:sprint" },
    maxPlayers: 4,
    allowVisualAids: true,
    createdAt: NOW,
    lastActivityAt: NOW,
    slots: { "0": host },
    players: {
      [host]: { ...player(host, "0", { ready: true }), joinedAt: NOW },
    },
    ...extra,
  });

  it("lets a user create a room as its host", async () => {
    await assertSucceeds(db("alice").ref(R).set(fresh()));
  });

  it("supports custom modes with validated config", async () => {
    const custom = {
      id: "custom",
      custom: {
        conversions: [{ from: 2, to: 16, min: 0, max: 255 }],
        kinds: ["twos"],
        durationMs: 60_000,
      },
    };
    await assertSucceeds(
      db("alice")
        .ref(R)
        .set(fresh("alice", { mode: custom })),
    );
    await env.clearDatabase();
    const bad = {
      id: "custom",
      custom: { conversions: [{ from: 3, to: 16, min: 0, max: 1 }] },
    };
    await assertFails(
      db("alice")
        .ref(R)
        .set(fresh("alice", { mode: bad })),
    );
  });

  it("rejects bad creations", async () => {
    await assertFails(nobody().ref(R).set(fresh()));
    await assertFails(db("mallory").ref(R).set(fresh("alice"))); // not as yourself
    await assertFails(db("alice").ref("rooms/lowercase").set(fresh()));
    await assertFails(
      db("alice")
        .ref(R)
        .set(fresh("alice", { status: "playing" })),
    );
    await assertFails(
      db("alice")
        .ref(R)
        .set(fresh("alice", { maxPlayers: 50 })),
    );
    await assertFails(
      db("alice")
        .ref(R)
        .set(fresh("alice", { createdAt: 5 })),
    );
    await assertFails(
      db("alice")
        .ref(R)
        .set(fresh("alice", { gameMode: { name: "legacy" } })),
    );
    // Cannot add other people as players.
    await assertFails(
      db("alice")
        .ref(R)
        .set(
          fresh("alice", {
            slots: { "0": "alice", "1": "bob" },
            players: {
              alice: { ...player("alice", "0"), joinedAt: NOW },
              bob: { ...player("bob", "1"), joinedAt: NOW },
            },
          }),
        ),
    );
  });

  it("cannot overwrite an existing room", async () => {
    await seed(R, room());
    await assertFails(db("mallory").ref(R).set(fresh("mallory")));
  });
});

describe("joining", () => {
  const join = (uid: string, slot: string) => ({
    [`slots/${slot}`]: uid,
    [`players/${uid}`]: { ...player(uid, slot), joinedAt: NOW },
    lastActivityAt: NOW,
  });

  it("lets a player take a free seat while waiting", async () => {
    await seed(R, room());
    await assertSucceeds(db("carol").ref(R).update(join("carol", "2")));
  });

  it("enforces seats, maxPlayers, status and kicks", async () => {
    await seed(R, room({ maxPlayers: 2 }));
    await assertFails(db("carol").ref(R).update(join("carol", "2"))); // full
    await assertFails(db("carol").ref(R).update(join("carol", "1"))); // taken
    await seed(R, room());
    await assertFails(
      db("carol")
        .ref(`${R}/players/carol`)
        .set({ ...player("carol", "2"), joinedAt: NOW }),
    ); // no seat
    await assertFails(db("carol").ref(R).update(join("dave", "2"))); // as someone else
    await seed(R, room({ status: "playing", startedAt: Date.now() }));
    await assertFails(db("carol").ref(R).update(join("carol", "2"))); // started
    await seed(R, room({ kicked: { carol: true } }));
    await assertFails(db("carol").ref(R).update(join("carol", "2"))); // kicked
  });

  it("a player holds at most one seat", async () => {
    await seed(R, room());
    await assertFails(db("bob").ref(`${R}/slots/3`).set("bob"));
  });
});

describe("player nodes", () => {
  it("players write only their own node", async () => {
    await seed(R, room());
    await assertSucceeds(db("bob").ref(`${R}/players/bob/ready`).set(true));
    await assertFails(db("bob").ref(`${R}/players/alice/ready`).set(false));
    await assertFails(db("alice").ref(`${R}/players/bob/ready`).set(true)); // even the host
    await assertFails(db("bob").ref(`${R}/players/bob/ready`).set("yes"));
    await assertFails(db("bob").ref(`${R}/players/bob/isHost`).set(true));
    await assertFails(db("bob").ref(`${R}/players/bob/uid`).set("alice"));
    await assertFails(db("bob").ref(`${R}/players/bob/slot`).set("3"));
  });

  it("no scores while waiting", async () => {
    await seed(R, room());
    await assertFails(db("bob").ref(`${R}/players/bob/score`).set(5));
    await assertFails(db("bob").ref(`${R}/players/bob/finished`).set(true));
  });

  it("scores are round-scoped, plausible and monotonic", async () => {
    const startedAt = await seedPlaying(20_000);
    const me = db("bob").ref(`${R}/players/bob`);
    await assertSucceeds(
      me.update({
        round: startedAt,
        score: 10,
        correct: 10,
        "scoreHistory/0": 0,
        "scoreHistory/1": 10,
      }),
    );
    await assertSucceeds(me.update({ score: 11, correct: 11 }));
    await assertFails(me.update({ score: 5, correct: 5 })); // decrease
    await assertFails(me.update({ score: 500, correct: 500 })); // > 3/s
    await assertFails(me.update({ round: startedAt - 1 })); // wrong round
    await assertFails(me.update({ score: -1 }));
  });

  it("a new round accepts a fresh (lower) score", async () => {
    const startedAt = await seedPlaying(20_000);
    await seed(`${R}/players/bob/round`, startedAt - 100_000);
    await seed(`${R}/players/bob/score`, 40);
    await seed(`${R}/players/bob/correct`, 40);
    await assertSucceeds(
      db("bob")
        .ref(`${R}/players/bob`)
        .update({ round: startedAt, score: 1, correct: 1 }),
    );
  });

  it("finish times must be plausible", async () => {
    const startedAt = await seedPlaying(20_000);
    const me = db("bob").ref(`${R}/players/bob`);
    await assertSucceeds(
      me.update({ round: startedAt, score: 15, correct: 15 }),
    );
    await assertFails(me.update({ finished: true, finishMs: 1_000 })); // < 250 ms each
    await assertFails(me.update({ finished: true, finishMs: 60_000 })); // in the future
    await assertSucceeds(me.update({ finished: true, finishMs: 12_000 }));
  });

  it("wins: +1 once per finished round, only by the player", async () => {
    const startedAt = await seedPlaying(60_000, { status: "finished" });
    const me = db("bob").ref(`${R}/players/bob`);
    await assertFails(me.update({ wins: 5, lastWinRound: startedAt }));
    await assertSucceeds(me.update({ wins: 1, lastWinRound: startedAt }));
    await assertFails(me.update({ wins: 2, lastWinRound: startedAt }));
    await assertFails(db("alice").ref(`${R}/players/bob/wins`).set(2));
  });

  it("presence of a disconnected flag via onDisconnect-style update", async () => {
    await seed(R, room());
    await assertSucceeds(
      db("bob")
        .ref(`${R}/players/bob`)
        .update({ disconnected: true, disconnectedAt: NOW }),
    );
  });

  it("a removed player cannot resurrect a partial node", async () => {
    await seed(R, room());
    await seed(`${R}/players/bob`, null);
    await seed(`${R}/slots/1`, null);
    await assertFails(
      db("bob")
        .ref(`${R}/players/bob`)
        .update({ disconnected: true, disconnectedAt: NOW }),
    );
  });
});

describe("host controls", () => {
  it("only the host starts a round, with a server timestamp", async () => {
    await seed(R, room());
    const start = {
      status: "playing",
      startedAt: NOW,
      seed: 123,
      lastActivityAt: NOW,
    };
    await assertFails(db("bob").ref(R).update(start));
    await assertFails(
      db("alice")
        .ref(R)
        .update({ ...start, startedAt: Date.now() - 50_000 }),
    );
    await assertFails(db("alice").ref(R).update({ status: "playing" })); // no startedAt
    await assertSucceeds(db("alice").ref(R).update(start));
  });

  it("only the host changes settings and mode while waiting", async () => {
    await seed(R, room());
    await assertFails(db("bob").ref(`${R}/allowVisualAids`).set(false));
    await assertFails(db("bob").ref(`${R}/mode`).set({ id: "nibbles:sprint" }));
    await assertFails(db("bob").ref(`${R}/maxPlayers`).set(10));
    await assertSucceeds(db("alice").ref(`${R}/allowVisualAids`).set(false));
    await assertSucceeds(
      db("alice").ref(`${R}/mode`).set({ id: "nibbles:sprint" }),
    );
    await assertFails(
      db("alice")
        .ref(`${R}/mode`)
        .set({ id: "x", questions: ["q"] }),
    );
    await seedPlaying();
    await assertFails(
      db("alice").ref(`${R}/mode`).set({ id: "nibbles:sprint" }),
    );
  });

  it("kick: host only; removes node and seat; kicked user stays out", async () => {
    await seed(R, room());
    const kick = {
      "kicked/bob": true,
      "players/bob": null,
      "slots/1": null,
      lastActivityAt: NOW,
    };
    await assertFails(
      db("bob")
        .ref(R)
        .update({
          "kicked/alice": true,
          "players/alice": null,
          "slots/0": null,
        }),
    );
    await assertFails(
      db("alice").ref(R).update({ "players/bob": null, "slots/1": null }),
    ); // no kicked flag
    await assertSucceeds(db("alice").ref(R).update(kick));
    await assertFails(
      db("bob")
        .ref(R)
        .update({
          "slots/1": "bob",
          "players/bob": { ...player("bob", "1"), joinedAt: NOW },
        }),
    );
  });

  it("host transfer: host may hand over to an existing player", async () => {
    await seed(R, room());
    await assertFails(db("alice").ref(`${R}/hostUid`).set("stranger"));
    await assertFails(db("bob").ref(`${R}/hostUid`).set("bob")); // host still here
    await assertSucceeds(db("alice").ref(`${R}/hostUid`).set("bob"));
  });

  it("a player may claim host when the host disconnected or left", async () => {
    await seed(R, room());
    await seed(`${R}/players/alice/disconnected`, true);
    await assertFails(db("stranger").ref(`${R}/hostUid`).set("stranger"));
    await assertSucceeds(db("bob").ref(`${R}/hostUid`).set("bob"));

    await seed(R, room());
    await seed(`${R}/players/alice`, null);
    await seed(`${R}/slots/0`, null);
    await assertSucceeds(db("bob").ref(`${R}/hostUid`).set("bob"));
  });

  it("host leaving hands over and frees the seat atomically", async () => {
    await seedPlaying();
    await assertSucceeds(
      db("alice").ref(R).update({
        hostUid: "bob",
        status: "waiting",
        "players/alice": null,
        "slots/0": null,
        lastActivityAt: NOW,
      }),
    );
  });

  it("round end: host, or a member who finished; lobby return by any member", async () => {
    const startedAt = await seedPlaying();
    await assertFails(db("bob").ref(`${R}/status`).set("finished"));
    await seed(`${R}/players/bob/round`, startedAt);
    await seed(`${R}/players/bob/finished`, true);
    await assertSucceeds(db("bob").ref(`${R}/status`).set("finished"));
    await assertSucceeds(db("bob").ref(`${R}/status`).set("waiting"));
    await assertFails(db("bob").ref(`${R}/status`).set("playing"));
    await assertFails(db("stranger").ref(`${R}/status`).set("finished"));
  });
});

describe("leaving and cleanup", () => {
  it("a player leaves by removing their node and seat together", async () => {
    await seed(R, room());
    await assertFails(db("bob").ref(`${R}/players/bob`).remove()); // seat still held
    await assertFails(db("bob").ref(`${R}/slots/1`).remove()); // node still there
    await assertSucceeds(
      db("bob")
        .ref(R)
        .update({ "players/bob": null, "slots/1": null, lastActivityAt: NOW }),
    );
  });

  it("the last player may delete the room; others may not", async () => {
    await seed(R, room());
    await assertFails(db("bob").ref(R).remove());
    await assertFails(db("stranger").ref(R).remove());
    await seed(`${R}/players/alice/disconnected`, true);
    await assertSucceeds(db("bob").ref(R).remove());
  });

  it("anyone signed in may delete a stale room (no world-writable lock)", async () => {
    await seed(R, room({ lastActivityAt: Date.now() - 7 * HOUR }));
    await assertFails(nobody().ref(R).remove());
    await assertSucceeds(db("stranger").ref(R).remove());
    await seed(R, room({ lastActivityAt: Date.now() - 5 * HOUR }));
    await assertFails(db("stranger").ref(R).remove());
  });

  it("there is no cleanup lock or legacy guest data any more", async () => {
    await assertFails(nobody().ref("cleanup/lock").set({ timestamp: 1 }));
    await assertFails(db("x").ref("cleanup/lock").set({ timestamp: 1 }));
    await assertFails(
      nobody()
        .ref("users/guest_123")
        .set({ uid: "guest_123", displayName: "g", isGuest: true }),
    );
    await assertFails(
      db("x").ref("rooms/ABCD1234/players/guest_1").set(player("guest_1", "2")),
    );
  });
});

describe("chat", () => {
  const msg = (uid: string, extra: Record<string, unknown> = {}) => ({
    senderId: uid,
    displayName: uid,
    message: "hello",
    timestamp: NOW,
    isSystem: false,
    ...extra,
  });
  const send = (
    uid: string,
    key: string,
    extra: Record<string, unknown> = {},
  ) =>
    db(uid)
      .ref(R)
      .update({
        [`chat/${key}`]: msg(uid, extra),
        [`lastChatAt/${uid}`]: NOW,
        lastActivityAt: NOW,
      });

  it("members can chat as themselves", async () => {
    await seed(R, room());
    await assertSucceeds(send("bob", "m1"));
    await assertSucceeds(db("stranger").ref(`${R}/chat`).get()); // readable with the code
  });

  it("validates sender, membership, length and timestamp", async () => {
    await seed(R, room());
    await assertFails(send("stranger", "m1"));
    await assertFails(
      db("bob")
        .ref(R)
        .update({ "chat/m1": msg("alice"), "lastChatAt/bob": NOW }),
    );
    await assertFails(send("bob", "m2", { message: "" }));
    await assertFails(send("bob", "m3", { message: "x".repeat(301) }));
    await assertFails(send("bob", "m4", { timestamp: Date.now() - 60_000 }));
    await assertFails(send("bob", "m5", { isSystem: true })); // only the host
    await assertFails(db("bob").ref(`${R}/chat/m6`).set(msg("bob"))); // no rate-limit stamp
    await assertSucceeds(send("alice", "m7", { isSystem: true }));
  });

  it("rate-limits each sender to one message per second", async () => {
    await seed(R, room());
    await assertSucceeds(send("bob", "m1"));
    await assertFails(send("bob", "m2"));
    await seed(`${R}/lastChatAt/bob`, Date.now() - 1_500);
    await assertSucceeds(send("bob", "m3"));
  });

  it("messages cannot be edited and kicked players cannot chat", async () => {
    await seed(R, room());
    await assertSucceeds(send("bob", "m1"));
    await assertFails(db("bob").ref(`${R}/chat/m1/message`).set("edited"));
    await seed(`${R}/players/bob`, null);
    await seed(`${R}/kicked/bob`, true);
    await seed(`${R}/lastChatAt/bob`, Date.now() - 5_000);
    await assertFails(send("bob", "m2"));
  });
});

describe("presence", () => {
  it("is self-only", async () => {
    const p = { online: true, lastSeen: NOW, roomId: ROOM };
    await assertSucceeds(db("alice").ref("presence/alice").set(p));
    await assertSucceeds(db("alice").ref("presence/alice").get());
    await assertFails(db("bob").ref("presence/alice").set(p));
    await assertFails(db("bob").ref("presence/alice").get());
    await assertFails(nobody().ref("presence/alice").get());
    await assertFails(
      db("alice").ref("presence/alice").set({ online: "yes", lastSeen: NOW }),
    );
  });

  it("sanity: seeded data is readable by the test helper", async () => {
    await seed("presence/alice", { online: false, lastSeen: 1 });
    if ((await read("presence/alice")) === null) throw new Error("seed failed");
  });
});
