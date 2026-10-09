import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Stamps dist/sw.js with a unique build version so every deploy installs a
// new service worker (which drops the previous build's cached index.html).
const buildVersion = `${Date.now()}`;
const swPath = join(process.cwd(), "dist", "sw.js");
const swContent = readFileSync(swPath, "utf8");

if (!swContent.includes("__BUILD_TIMESTAMP__")) {
  console.error("dist/sw.js has no __BUILD_TIMESTAMP__ placeholder");
  process.exit(1);
}

writeFileSync(
  swPath,
  swContent.replaceAll("__BUILD_TIMESTAMP__", buildVersion),
  "utf8",
);

console.log(`Service worker version set to ${buildVersion}`);
