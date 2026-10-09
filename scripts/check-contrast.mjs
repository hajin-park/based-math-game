// Validates WCAG 2.x contrast of the design tokens declared in src/index.css.
// Run: node scripts/check-contrast.mjs   (exits non-zero if any pair fails)
// Keep these values in sync with :root / .dark in src/index.css.

const hex = (h) =>
  h
    .replace("#", "")
    .match(/../g)
    .map((x) => parseInt(x, 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => {
  const [r, g, b] = hex(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

export const tokens = {
  light: {
    background: "#F3F0E8",
    surface: "#FBFAF6",
    sunken: "#EAE6DB",
    line: "#E2DDD0",
    ink: "#1A1917",
    muted: "#6B675E",
    primary: "#C23B1B",
    primaryFg: "#FFFFFF",
    success: "#2E6B47",
    warning: "#8A5A0B",
    destructive: "#A3261F",
    bin: "#2B54C4",
    oct: "#4C7024",
    dec: "#4A463F",
    hex: "#8A3B87",
  },
  dark: {
    background: "#12110F",
    surface: "#1B1A17",
    sunken: "#0D0C0B",
    line: "#2C2A25",
    ink: "#EDE9DF",
    muted: "#9D988C",
    primary: "#FF6A3D",
    primaryFg: "#140D0A",
    success: "#6FC08C",
    warning: "#E2B154",
    destructive: "#FF8478",
    bin: "#87A6FF",
    oct: "#A5C878",
    dec: "#CFC9BC",
    hex: "#DE9CDB",
  },
};

let fail = 0;
for (const [mode, t] of Object.entries(tokens)) {
  console.log(`\n${mode.toUpperCase()}`);
  const checks = [
    ["ink / background", t.ink, t.background, 7],
    ["ink / surface", t.ink, t.surface, 7],
    ["muted / background", t.muted, t.background, 4.5],
    ["muted / surface", t.muted, t.surface, 4.5],
    ["muted / sunken", t.muted, t.sunken, 4.5],
    ["primary text / background", t.primary, t.background, 4.5],
    ["primary text / surface", t.primary, t.surface, 4.5],
    ["primary-fg on primary (button)", t.primaryFg, t.primary, 4.5],
    ["focus ring (primary) vs background", t.primary, t.background, 3],
    ["success / surface", t.success, t.surface, 4.5],
    ["warning / surface", t.warning, t.surface, 4.5],
    ["destructive / surface", t.destructive, t.surface, 4.5],
    ...["bin", "oct", "dec", "hex"].flatMap((b) => [
      [`${b} / background`, t[b], t.background, 4.5],
      [`${b} / surface`, t[b], t.surface, 4.5],
      [`${b} / sunken`, t[b], t.sunken, 4.5],
    ]),
  ];
  for (const [name, fg, bg, min] of checks) {
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(
      `${ok ? "pass" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${name}  ${fg} on ${bg}`,
    );
  }
}
if (fail) {
  console.error(`\n${fail} contrast check(s) failed`);
  process.exit(1);
}
console.log("\nAll contrast checks pass.");
