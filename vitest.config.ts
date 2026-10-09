import path from "path";
import { defineConfig } from "vitest/config";

// Unit tests run in Node without the React SWC plugin; the game engine is pure TS.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@features": path.resolve(__dirname, "./src/features"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
