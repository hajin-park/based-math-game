// Renders scripts/og/og.html to public/og.png (1200x630) for link previews.
// Requires Playwright with a Chromium build: `npx playwright install chromium`.
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(path.join(dir, "og.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(dir, "../../public/og.png") });
await browser.close();
console.log("Wrote public/og.png");
