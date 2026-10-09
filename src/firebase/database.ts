import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { app, emulatorHost, useEmulators } from "./app";

/** Realtime Database: multiplayer rooms, chat and presence (ephemeral). */
export const database = getDatabase(app);

if (useEmulators) {
  connectDatabaseEmulator(
    database,
    emulatorHost,
    Number(import.meta.env.VITE_EMULATOR_DATABASE_PORT || 9000),
  );
}
