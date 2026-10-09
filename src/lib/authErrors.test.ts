import { describe, expect, it } from "vitest";
import { safeNextPath } from "./authErrors";

describe("safeNextPath open-redirect regressions", () => {
  it("rejects targets that normalize into a protocol-relative URL", () => {
    for (const raw of [
      "/.//evil.example",
      "/..//evil.example/x",
      "/%2e//evil.example",
      "/%2E%2E//evil.example",
      "/a/..//evil.example",
      "/./%2F/evil.example",
      encodeURIComponent("/.//evil.example"),
    ]) {
      const out = safeNextPath(raw, "/home");
      expect(out, raw).toBe("/home");
    }
  });

  it("rejects backslashes, schemes and absolute URLs", () => {
    for (const raw of [
      "\\\\evil",
      "/\\evil",
      "/%5Cevil",
      "javascript:alert(1)",
      "javascript:alert(1)//x",
      "data:text/html,hi",
      "https://evil.example/x",
      "http:evil.example",
      "//evil.example",
      "///evil.example",
      " //evil.example",
    ]) {
      expect(safeNextPath(raw, "/home"), raw).toBe("/home");
    }
  });

  it("never returns anything but a single-slash app path", () => {
    const tricky = [
      "/.//evil.example",
      "/a/b/../..//evil.example",
      "/%2e%2e/%2e%2e//evil.example",
      "/play/../leaderboard",
      "/stats?x=//y",
    ];
    for (const raw of tricky) {
      const out = safeNextPath(raw, "/home");
      expect(out.startsWith("/"), raw).toBe(true);
      expect(out.startsWith("//"), raw).toBe(false);
      expect(out.startsWith("/\\"), raw).toBe(false);
    }
  });

  it("keeps legitimate paths, normalized", () => {
    expect(safeNextPath("/play/../leaderboard")).toBe("/leaderboard");
    expect(safeNextPath("/stats?x=//y")).toBe("/stats?x=//y");
    expect(safeNextPath("/daily")).toBe("/daily");
  });
});
