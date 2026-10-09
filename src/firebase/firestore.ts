import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { app, emulatorHost, useEmulators } from "./app";

/** Firestore: profiles, settings, run history, stats and leaderboards. */
export const firestore = getFirestore(app);

if (useEmulators) {
  connectFirestoreEmulator(
    firestore,
    emulatorHost,
    Number(import.meta.env.VITE_EMULATOR_FIRESTORE_PORT || 8080),
  );
}
