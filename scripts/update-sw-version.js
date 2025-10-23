import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Get the build timestamp
const buildTimestamp = Date.now();

// Read the service worker file from dist
const swPath = join(process.cwd(), "dist", "sw.js");
let swContent = readFileSync(swPath, "utf8");

// Replace the placeholder with the actual build timestamp
swContent = swContent.replace("__BUILD_TIMESTAMP__", buildTimestamp);

// Write the updated content back
writeFileSync(swPath, swContent, "utf8");

console.log(`✅ Service Worker cache version updated to: ${buildTimestamp}`);
