// Renders the logomark into favicon / PWA icons.
// Run: node scripts/generate-icons.mjs
//
// The mark is "10₂" — ten, read in base two — set in hand-drawn geometric
// strokes (slashed zero, engineer's style) on a red-pen square.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const RED = "#C23B1B";
const PAPER = "#FBFAF6";

/** Glyphs on a 64-unit grid, optically centred. */
const glyphs = (color) => `
  <g fill="none" stroke="${color}" stroke-linecap="square" stroke-linejoin="miter" transform="translate(-5.75 -0.5)">
    <path d="M16.5 22 L23 17.5 V46.5" stroke-width="5"/>
    <rect x="31.5" y="17.5" width="13" height="29" rx="6.5" stroke-width="5"/>
    <path d="M35.9 37.4 L40.1 26.6" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M51.6 40.4 C51.6 37.9 53.3 36.6 55.3 36.6 C57.4 36.6 59 37.9 59 40 C59 41.9 57.9 43.2 56.3 44.7 L52 48.9 H59.6" stroke-width="3.2" stroke-linecap="butt"/>
  </g>`;

/** Favicon / "any" icon: rounded square, transparent corners. */
export const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="${RED}"/>${glyphs(PAPER)}
</svg>
`;

/** Maskable: full bleed, glyphs inside the 80% safe zone. */
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="${RED}"/>
  <g transform="translate(32 32) scale(0.72) translate(-32 -32)">${glyphs(PAPER)}</g>
</svg>
`;

/** Apple touch icon: opaque square (iOS applies its own mask). */
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="${RED}"/>
  <g transform="translate(32 32) scale(0.86) translate(-32 -32)">${glyphs(PAPER)}</g>
</svg>
`;

const root = process.cwd();
const pub = join(root, "public");
mkdirSync(join(pub, "icons"), { recursive: true });

writeFileSync(join(pub, "icon.svg"), markSvg);
writeFileSync(join(root, "scripts", "icons", "maskable.svg"), maskableSvg);
writeFileSync(join(root, "scripts", "icons", "apple-touch.svg"), appleSvg);

const render = (svg, size, out) => {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: size } })
    .render()
    .asPng();
  writeFileSync(join(pub, out), png);
  console.log(`wrote public/${out} (${size}×${size}, ${png.length} B)`);
};

render(markSvg, 192, "icons/icon-192.png");
render(markSvg, 512, "icons/icon-512.png");
render(maskableSvg, 192, "icons/maskable-192.png");
render(maskableSvg, 512, "icons/maskable-512.png");
render(appleSvg, 180, "icons/apple-touch-icon.png");
render(markSvg, 32, "icons/favicon-32.png");
