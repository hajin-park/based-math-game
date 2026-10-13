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
  // The printed workbook.
  light: {
    background: "#F6F1E6",
    surface: "#FCFAF4",
    sunken: "#ECE5D6",
    tint: "#E1E7EE",
    input: "#8C8373",
    ink: "#1B1B1F",
    muted: "#5E5951",
    primary: "#1F4E9C",
    primaryFg: "#FFFFFF",
    pen: "#C02F28",
    success: "#2E6B47",
    warning: "#8A5A0B",
    destructive: "#C02F28",
    bin: "#0D6A73",
    oct: "#4A6A10",
    dec: "#3F3B36",
    hex: "#8B3A83",
    cover: "#1E4790",
    coverInk: "#F6F1E6",
    coverMuted: "#BCCAE6",
  },
  // The chalkboard.
  dark: {
    background: "#1D2824",
    surface: "#24312C",
    sunken: "#17201D",
    tint: "#283A3D",
    input: "#71857B",
    ink: "#E8ECE4",
    muted: "#A5B2AA",
    primary: "#F0CF68",
    primaryFg: "#1D2824",
    pen: "#F28C80",
    success: "#9BD39A",
    warning: "#F2B36B",
    destructive: "#F28C80",
    bin: "#86D0DA",
    oct: "#B9DC8C",
    dec: "#DCE2DA",
    hex: "#E9A9E0",
    cover: "#1D2824",
    coverInk: "#E8ECE4",
    coverMuted: "#A5B2AA",
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
    ["primary-fg on primary (fill)", t.primaryFg, t.primary, 4.5],
    ["paper on ink (primary button, light)", t.background, t.ink, 4.5],
    ["ink / tint", t.ink, t.tint, 7],
    ["muted / tint", t.muted, t.tint, 4.5],
    ["pen / background", t.pen, t.background, 4.5],
    ["pen / surface", t.pen, t.surface, 4.5],
    ["input outline / background (UI, 3:1)", t.input, t.background, 3],
    ["input outline / surface (UI, 3:1)", t.input, t.surface, 3],
    ["cover ink / cover", t.coverInk, t.cover, 4.5],
    ["cover muted / cover", t.coverMuted, t.cover, 4.5],
    ["focus ring (primary) vs background", t.primary, t.background, 3],
    ["success / surface", t.success, t.surface, 4.5],
    ["warning / surface", t.warning, t.surface, 4.5],
    ["destructive / surface", t.destructive, t.surface, 4.5],
    ...["bin", "oct", "dec", "hex"].flatMap((b) => [
      [`${b} / background`, t[b], t.background, 4.5],
      [`${b} / surface`, t[b], t.surface, 4.5],
      [`${b} / sunken`, t[b], t.sunken, 4.5],
      [`${b} / tint`, t[b], t.tint, 4.5],
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
