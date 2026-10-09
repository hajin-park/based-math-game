import { readFileSync } from "node:fs";
import path from "node:path";
import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

const root = process.cwd();

function hostPort(envVar: string, fallbackPort: number) {
  const value = process.env[envVar];
  if (value) {
    const [host, port] = value.split(":");
    return { host, port: Number(port) };
  }
  return { host: "127.0.0.1", port: fallbackPort };
}

export async function firestoreEnv(projectId: string) {
  return initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(path.join(root, "firestore.rules"), "utf8"),
      ...hostPort("FIRESTORE_EMULATOR_HOST", 8080),
    },
  });
}

export async function databaseEnv(projectId: string) {
  return initializeTestEnvironment({
    projectId,
    database: {
      rules: readFileSync(path.join(root, "database.rules.json"), "utf8"),
      ...hostPort("FIREBASE_DATABASE_EMULATOR_HOST", 9000),
    },
  });
}

/** Token claims for a registered (email/password) user. */
export const registered = { firebase: { sign_in_provider: "password" } };
/** Token claims for a guest (anonymous) user. */
export const anonymous = { firebase: { sign_in_provider: "anonymous" } };

export type { RulesTestEnvironment };
