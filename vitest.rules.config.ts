import { defineConfig } from "vitest/config";

// Security-rules tests. They need the Firestore and Realtime Database
// emulators running, e.g.:
//   npx firebase-tools emulators:exec --only auth,database,firestore \
//     --project demo-based-math "npm run test:rules"
// Hosts default to 127.0.0.1:8080 (Firestore) and 127.0.0.1:9000 (RTDB) and
// follow FIRESTORE_EMULATOR_HOST / FIREBASE_DATABASE_EMULATOR_HOST when set.
export default defineConfig({
  test: {
    include: ["tests/rules/**/*.test.ts"],
    environment: "node",
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // Each file uses its own project/namespace, but keep runs predictable.
    fileParallelism: false,
  },
});
