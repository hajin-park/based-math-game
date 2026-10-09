import { describe, expect, it } from "vitest";
import { codeHalves, isRoomCode, normalizeRoomCode } from "./roomCode";
import { initials, roomNames } from "./names";
import { diffRoomEvents, type EventRoom } from "./roomEvents";

describe("room codes", () => {
  it("normalises typed and pasted input", () => {
    expect(normalizeRoomCode("k7q2 9xdm")).toBe("K7Q29XDM");
    expect(normalizeRoomCode("K7Q2·9XDM")).toBe("K7Q29XDM");
    expect(normalizeRoomCode("k7q2-9xdm-extra")).toBe("K7Q29XDM");
    expect(normalizeRoomCode("https://x.app/join/k7q29xdm")).toBe("K7Q29XDM");
    expect(normalizeRoomCode("http://x/multiplayer/lobby/K7Q29XDM")).toBe(
      "K7Q29XDM",
    );
    expect(normalizeRoomCode("/multiplayer/join?code=ab12cd34")).toBe(
      "AB12CD34",
    );
    expect(normalizeRoomCode("ab1")).toBe("AB1");
  });
  it("validates and splits", () => {
    expect(isRoomCode("K7Q29XDM")).toBe(true);
    expect(isRoomCode("K7Q29XD")).toBe(false);
    expect(isRoomCode("k7q29xdm")).toBe(false);
    expect(codeHalves("K7Q29XDM")).toEqual(["K7Q2", "9XDM"]);
  });
});

describe("room names", () => {
  it("numbers duplicates by join order", () => {
    const names = roomNames([
      { uid: "b", displayName: "Ada", joinedAt: 2 },
      { uid: "a", displayName: "Ada", joinedAt: 1 },
      { uid: "c", displayName: "ada", joinedAt: 3 },
      { uid: "d", displayName: "Grace", joinedAt: 4 },
    ]);
    expect(names.get("a")).toBe("Ada");
    expect(names.get("b")).toBe("Ada 2");
    expect(names.get("c")).toBe("ada 3");
    expect(names.get("d")).toBe("Grace");
  });
  it("builds initials", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("SwiftFalcon417")).toBe("SF");
    expect(initials("x")).toBe("X");
    expect(initials("  ")).toBe("?");
  });
});

describe("room events", () => {
  const base: EventRoom = {
    hostUid: "h",
    status: "waiting",
    players: {
      h: { uid: "h", displayName: "Host", joinedAt: 1 },
      a: { uid: "a", displayName: "Ada", joinedAt: 2 },
      me: { uid: "me", displayName: "Me", joinedAt: 3 },
    },
  };

  it("reports joins, leaves, removals and host changes", () => {
    const next: EventRoom = {
      hostUid: "me",
      status: "waiting",
      players: {
        me: base.players.me,
        g: { uid: "g", displayName: "Grace", joinedAt: 4 },
      },
      kicked: { a: true },
    };
    const texts = diffRoomEvents(base, next, "me").map((e) => e.text);
    expect(texts).toEqual([
      "Grace joined",
      "Host left",
      "Ada was removed by the host",
      "You are now the host",
    ]);
  });

  it("reports connection changes and renames of others", () => {
    const next: EventRoom = {
      ...base,
      hostUid: "a",
      players: {
        ...base.players,
        h: { ...base.players.h, disconnected: true },
        a: { ...base.players.a, displayName: "Ada L" },
      },
    };
    const texts = diffRoomEvents(base, next, "me").map((e) => e.text);
    expect(texts).toEqual([
      "Host lost connection",
      "Ada is now Ada L",
      "Ada L is now the host",
    ]);
  });

  it("is quiet on the first snapshot", () => {
    expect(diffRoomEvents(null, base, "me")).toEqual([]);
  });
});
