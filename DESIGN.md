# Based Math Game — Design System

**Concept: the engineer's notebook.** A typeset lab notebook: warm paper,
hairline rules, a teacher's red pen, graph paper where numbers live, and
instrument-grade numerals. Numbers are the hero; everything else steps back.

This document is the contract for every page. If something you need is not
here, add it here first (tokens → primitive → page), never inline a one-off.

- Tokens: [`src/index.css`](src/index.css) (CSS variables) + [`tailwind.config.js`](tailwind.config.js)
- Fonts: [`src/styles/fonts.css`](src/styles/fonts.css), preloaded by the `preload-fonts` plugin in [`vite.config.ts`](vite.config.ts)
- Primitives: [`src/components/ui/`](src/components/ui)
- Base metadata: [`src/lib/bases.ts`](src/lib/bases.ts)
- Contrast check: `node scripts/check-contrast.mjs`
- Icons: `node scripts/generate-icons.mjs` (renders `public/icon.svg` + PNGs)

---

## 1. Principles

1. **Numbers first.** A number in a base is always set in Martian Mono, tabular,
   in its base colour, and labelled (BaseTag or row label). Never colour alone.
2. **One red pen per view.** Vermilion (`primary`) marks the single main action,
   the active nav item, focus and the italic accent in a headline. If two things
   on screen are red, one of them is wrong.
3. **Hairlines over boxes.** Divide with 1px rules and whitespace. Reach for a
   Card only when content is a discrete object (a room, a mode, a result).
4. **Keyboard is the fast path.** Every primary flow works without a mouse;
   show the shortcut where the action is (`<Kbd>`), hide hints on touch.
5. **Quiet motion.** 120–240ms, transform/opacity only, springs for things you
   touch. Nothing moves under `prefers-reduced-motion`.
6. **Say the specific thing.** "48 official modes", "rooms for up to 10".
   No "amazing", no "unlock your potential", no emoji.

### Research takeaways (what we borrowed, concretely)

| Source                                              | Takeaway → how it shows up here                                                                                                                                                                                                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linear (2024 UI redesign, LCH theme generator)      | Themes generated in a perceptual space with an explicit contrast lever; fewer, quieter nav elements with higher density → our tokens are hand-tuned per mode and checked by script; nav is 4 links + 1 CTA.                                                                              |
| Linear                                              | Increase contrast of default themes; reduce visual noise in sidebar/headers → hairline-only nav, no shadows on chrome.                                                                                                                                                                   |
| Superhuman (command palette post)                   | Show the shortcut every time the action is offered so muscle memory forms → `Kbd` next to CTAs ("Start a sprint ↵", "Press Enter to start").                                                                                                                                             |
| Superhuman                                          | Speed is the product; optimistic UI → no submit buttons in drills, answers advance on the last correct digit.                                                                                                                                                                            |
| Vercel Web Interface Guidelines                     | `:focus-visible` rings everywhere, hit targets ≥24px (≥44px touch), inputs ≥16px on mobile, `theme-color` + `color-scheme` match the page, never `transition: all`, tabular numbers for comparisons, skip link, ellipsis `…` for loading, layered shadows + crisp borders, nested radii. |
| Vercel WIG                                          | Loading states: delay ~150–300ms before showing, so fast loads never flash → `RouteFallback` waits 200ms.                                                                                                                                                                                |
| Stripe (accessible colour systems; site typography) | Pick colours in a perceptual model, verify every pair programmatically, ship only two/three font requests, `tnum` on figures → `check-contrast.mjs`, 3 families, `.num`/`tabular-nums`.                                                                                                  |
| Raycast                                             | Monospace keycaps quote the keyboard-first ethos; brand colour is used almost only on the signature element → `Kbd` in Martian Mono; vermilion reserved.                                                                                                                                 |
| Awwwards typography winners (editorial sites)       | Large serif display with an italic accent word; mono overlines; generous whitespace → `display-*` scale, `.eyebrow`, `<em>` accent.                                                                                                                                                      |
| Mobbin-style education onboarding                   | Value before sign-up; a single first action → "No sign-up needed", one CTA per fold.                                                                                                                                                                                                     |

---

## 2. Tokens

Colours are declared as **RGB channel triplets** so every Tailwind opacity
modifier works (`bg-primary/10`, `border-base-bin/30`). In raw CSS / inline
styles use `rgb(var(--primary))` or `rgb(var(--primary) / 0.2)` — **not**
`hsl(var(--…))` and **not** bare `var(--primary)`.

### 2.1 Colour

| Token (class)                    | Light                                   | Dark                              | Use                                    |
| -------------------------------- | --------------------------------------- | --------------------------------- | -------------------------------------- |
| `background`                     | `#F3F0E8` paper                         | `#12110F` graphite                | page                                   |
| `card` / `surface`               | `#FBFAF6`                               | `#1B1A17`                         | raised sheets, cards, inputs           |
| `popover`                        | `#FCFBF8`                               | `#201F1B`                         | menus, dialogs, toasts                 |
| `sunken`                         | `#EAE6DB`                               | `#0D0C0B`                         | wells, table headers, code             |
| `border`                         | `#E2DDD0`                               | `#2C2A25`                         | hairlines (default for `border`)       |
| `border-strong`                  | `#CFC8B8`                               | `#403D36`                         | dividers that must read, hover borders |
| `input`                          | `#C9C2B1`                               | `#423F37`                         | control outlines                       |
| `foreground`                     | `#1A1917` ink                           | `#EDE9DF`                         | text                                   |
| `muted-foreground`               | `#6B675E`                               | `#9D988C`                         | secondary text                         |
| `primary`                        | `#C23B1B` red pen                       | `#FF6A3D`                         | the one action, focus, accent          |
| `primary-hover`                  | `#A93216`                               | `#FF845C`                         | hover of primary fill                  |
| `primary-foreground`             | `#FFFFFF`                               | `#140D0A`                         | text on primary                        |
| `secondary` / `muted` / `accent` | `#EAE6DB` / `#EAE6DB` / `#ECE8DE`       | `#26241F` / `#23221E` / `#26241F` | quiet fills, hover washes              |
| `success`                        | `#2E6B47`                               | `#6FC08C`                         | correct, positive delta                |
| `warning`                        | `#8A5A0B`                               | `#E2B154`                         | low time, caution                      |
| `destructive`                    | `#A3261F`                               | `#F27C86`                         | wrong, irreversible                    |
| `info`                           | = `base-bin`                            | = `base-bin`                      | neutral notices                        |
| `highlight`                      | `#F0CD60`                               | `#E2B154`                         | marker highlight, use at /30–/45 only  |
| `chart-1…5`                      | primary, bin, oct, hex, ochre `#B07A1E` | brightened equivalents            | categorical series, in order           |

### 2.2 Base identity colours

| Base     | Class           | Light     | Dark      | Name     |
| -------- | --------------- | --------- | --------- | -------- |
| BIN (2)  | `text-base-bin` | `#2B54C4` | `#87A6FF` | cobalt   |
| OCT (8)  | `text-base-oct` | `#4C7024` | `#A5C878` | moss     |
| DEC (10) | `text-base-dec` | `#4A463F` | `#CFC9BC` | graphite |
| HEX (16) | `text-base-hex` | `#8A3B87` | `#DE9CDB` | plum     |

Rules:

- Use them **only** for numbers in that base, their tags, and charts split by
  base. Never for buttons, links, or decoration.
- Tints: `bg-base-hex/10 border-base-hex/30` (that is what `BaseTag` does).
  Solid fills use `bg-base-x text-base-x-foreground`.
- Get classes from `BASES[key]` in `src/lib/bases.ts` (`text`, `softBg`,
  `border`, `bg`) — do not build class names with template strings.
- Legacy aliases `base-binary/octal/decimal` still resolve; don't use them.

### 2.3 Measured contrast (WCAG 2.x, `node scripts/check-contrast.mjs`)

| Pair                                    | Light       | Dark          |
| --------------------------------------- | ----------- | ------------- |
| ink / paper                             | 15.43       | 15.57         |
| ink / surface                           | 16.82       | 14.35         |
| muted / paper                           | 4.95        | 6.56          |
| muted / surface                         | 5.40        | 6.05          |
| muted / sunken                          | 4.52        | 6.80          |
| primary text / paper                    | 4.69        | 6.63          |
| primary text / surface                  | 5.11        | 6.12          |
| primary-foreground on primary (buttons) | 5.34        | 6.76          |
| success / surface                       | 6.07        | 7.95          |
| warning / surface                       | 5.67        | 8.83          |
| destructive / surface                   | 7.04        | 6.63          |
| BIN / paper · surface                   | 5.82 · 6.35 | 8.02 · 7.40   |
| OCT / paper · surface                   | 5.05 · 5.51 | 10.00 · 9.23  |
| DEC / paper · surface                   | 8.24 · 8.98 | 11.44 · 10.55 |
| HEX / paper · surface                   | 6.03 · 6.58 | 8.88 · 8.19   |

All text pairs ≥ 4.5:1 (AA); ink ≥ 7:1 (AAA). If you change a token, update
the script and rerun it — CI-able (exits non-zero on failure).

### 2.4 Typography

| Family                                       | Class                         | Package (OFL-1.1)                        | Role                              |
| -------------------------------------------- | ----------------------------- | ---------------------------------------- | --------------------------------- |
| Newsreader (opsz 6–72, wght 200–800, italic) | `font-serif` / `font-display` | `@fontsource-variable/newsreader`        | h1/h2, display, the italic accent |
| Schibsted Grotesk (wght 400–900)             | `font-sans` (default)         | `@fontsource-variable/schibsted-grotesk` | all UI and body                   |
| Martian Mono (wght 100–800, wdth 75–112.5)   | `font-mono`                   | `@fontsource-variable/martian-mono`      | numbers, codes, eyebrows, keycaps |

Only `latin` + `latin-ext` subsets ship (`unicode-range` lazy-loads latin-ext).
Schibsted latin + Newsreader latin (roman) are preloaded.
Martian Mono has no `zero` feature; its default zero is already distinguished.
Use `mono-condensed` (`font-stretch: 82%`) or `condensed` on `<Digits>` for
16-bit binary strings.

**Scale** (semantic classes; line-height and tracking are baked in):

| Class                       | Size                   | LH   | Tracking | Family              | Use                                                       |
| --------------------------- | ---------------------- | ---- | -------- | ------------------- | --------------------------------------------------------- |
| `text-display-2xl`          | 44 → 84px fluid        | 0.98 | −0.028em | serif               | home hero only                                            |
| `text-display-xl`           | 36 → 60px              | 1.02 | −0.024em | serif               | page hero, 404, closing CTA                               |
| `text-display-lg`           | 30 → 44px              | 1.08 | −0.018em | serif               | section headings on marketing pages, `PageHeader` default |
| `text-headline`             | 24 → 32px              | 1.15 | −0.012em | serif               | app page titles, dialog-sized headings                    |
| `text-title`                | 19px                   | 1.35 | −0.01em  | sans 600            | card / panel titles                                       |
| `text-title-sm`             | 17px                   | 1.4  | −0.006em | sans 600            | list item titles                                          |
| `text-body-lg`              | 18px                   | 1.6  | —        | sans                | ledes                                                     |
| `text-body`                 | 16px                   | 1.6  | —        | sans                | default body                                              |
| `text-body-sm`              | 14px                   | 1.55 | —        | sans                | secondary copy, descriptions                              |
| `text-label`                | 13px                   | 1.3  | +0.005em | sans 500            | controls, tabs, table headers                             |
| `text-eyebrow` / `.eyebrow` | 11px                   | 1.2  | +0.08em  | mono 500, uppercase | overlines                                                 |
| `text-mono-sm/md/lg/xl/2xl` | 12/14/20/24→36/32→56px | —    | —        | mono                | `<Digits>` sizes                                          |

Headlines: wrap one word in `<em>` for the italic red-pen accent
(`[&_em]:italic [&_em]:text-primary` is built into `PageHeader`). Set
`[font-variation-settings:'opsz'_72]` on display sizes for Newsreader's
display cut. Use `text-balance` on headings, `text-pretty` on paragraphs.

### 2.5 Space, radius, elevation, focus

- **Spacing:** Tailwind 4px scale. Section rhythm: `py-section` (64→104px) for
  marketing sections, `py-section-sm` for app sections. Inside cards: `p-5`
  (20px). Gaps: 8 / 12 / 16 / 24 / 40 / 48.
- **Container:** `.container` = centred, max 1240px, gutters 16 / 24 (`sm`) /
  32px (`lg`). Never put content flush to the viewport edge.
- **Radii:** `rounded-sm` 4px (tags, kbd), `rounded-md` 6px (buttons, inputs,
  menu items), `rounded-lg` 8px (cards), `rounded-xl` 10px (dialogs, feature
  panels), `rounded-2xl` 12px (rare). Nested radius ≤ parent radius.
- **Elevation:** border + `shadow-xs` for cards; `shadow-md` for floating
  panels in content (odometer, room preview); `shadow-lg` menus/popovers;
  `shadow-xl/2xl` toasts/dialogs. Shadows are tinted ink and very soft — no
  heavy drop shadows, no glass.
- **Focus:** global `:focus-visible { outline: 2px solid ring; offset 2px }`
  (1px for inputs). Do **not** add `focus:ring-*` classes; do not remove
  outlines. Inputs additionally show a 3px `ring/16` halo.
- **Selection:** `primary/18` wash with ink text.
- **Scrollbars:** thin, `border-strong` thumb, transparent track.

### 2.6 Motion

| Token           | Value                             | Use                                      |
| --------------- | --------------------------------- | ---------------------------------------- |
| `duration-fast` | 120ms                             | hover/press colour changes               |
| `duration-base` | 180ms                             | menus, toggles, tab indicator            |
| `duration-slow` | 240ms                             | odometer digits, page-level enters       |
| `ease-out`      | `cubic-bezier(.2,.8,.2,1)`        | default                                  |
| `ease-spring`   | `cubic-bezier(.34,1.4,.64,1)`     | tactile overshoot (switch thumb, digits) |
| framer spring   | `{ stiffness: 500, damping: 40 }` | sliding indicators (`layoutId`)          |
| `animate-rise`  | 6px rise + fade, 240ms            | above-the-fold entrance, once            |

Rules: animate `transform`/`opacity` only; list properties explicitly
(`transition-[background-color,border-color]`), never `transition-all`.
`prefers-reduced-motion: reduce` kills CSS durations globally; JS motion must
branch on `useReducedMotion()` (see `Segmented`, `BaseOdometer`, nav). Any
auto-playing motion > 5s needs a pause control (the odometer has one).

---

## 3. Components

All in `src/components/ui/`. Import from the file, e.g.
`import { Button } from "@/components/ui/button"`.

### Restyled shadcn primitives

| Component                                                                                                                | Notes                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`                                                                                                                 | `variant`: `default`/`primary` (red fill — one per view), `secondary`, `outline`, `ghost`, `link`, `destructive`. `size`: `sm` 32, `default` 40, `lg` 48, `xl` 56 (hero), `icon`/`icon-sm`/`icon-lg`. Compact sizes get an invisible 44px hit area on touch. |
| `Input`                                                                                                                  | `variant`: `default` (40px), `sm`, `answer` (64–72px mono, centred — game answer field). 16px text on mobile. `aria-invalid` turns it red.                                                                                                                   |
| `Select`, `DropdownMenu`, `Popover`, `HoverCard`, `Tooltip`                                                              | Share `floatingSurface` (exported from `dropdown-menu.tsx`). Menu items 36px (44px touch). `DropdownMenuShortcut` renders mono. Tooltip: ink on paper inverse, 400ms delay, 300ms skip.                                                                      |
| `Tabs`                                                                                                                   | Sunken track, raised active tab. Use for switching views of the same data. For a choice of value use `Segmented`.                                                                                                                                            |
| `Dialog` (new), `AlertDialog`, `Sheet`, `Drawer`                                                                         | Serif title, dimmed desk overlay, `rounded-xl`. Footer actions right-aligned; primary last.                                                                                                                                                                  |
| `Toast`                                                                                                                  | `variant`: `default`, `success`, `destructive` (inset colour rule, neutral surface). Bottom-right, safe-area aware.                                                                                                                                          |
| `Badge`                                                                                                                  | Tinted wash: `default` (red), `secondary`, `outline`, `success`, `warning`, `destructive`, `info`, `solid`.                                                                                                                                                  |
| `Card`                                                                                                                   | Hairline sheet, `p-5`. `CardTitle` is sans `text-title`.                                                                                                                                                                                                     |
| `Table`                                                                                                                  | `tabular-nums`, 48px rows, 12px muted header labels, `border-strong` under header. Right-align numeric columns (`text-right`).                                                                                                                               |
| `Switch`, `Progress`, `Skeleton`, `Spinner`, `Avatar`, `Alert`, `Separator`, `Label`, `Form`, `Breadcrumb`, `ScrollArea` | Token-aligned; APIs unchanged.                                                                                                                                                                                                                               |

### New primitives

```tsx
// Digits — a number in a base. Copy-paste yields bare digits.
<Digits base="bin" value={42} pad={8} group />          // 0010 1010 (leading zeros dimmed)
<Digits base="hex" value="FF" prefix size="lg" />        // 0xFF
<Digits base={2} value="1011" placeValues />             // weights 8 4 2 1 under digits
// props: value (string|number), base ("bin"|"oct"|"dec"|"hex"|2|8|10|16|"Binary"…),
// group (true=base default | number | false), prefix, placeValues, colored=true,
// pad, condensed, dimLeadingZeros, size xs|sm|md|lg|xl|inherit

// BaseTag — identity pill. Always next to a number in a base.
<BaseTag base="hex" />                 // HEX
<BaseTag base={2} showRadix size="sm" variant="solid" />   // BIN₂
// props: base, variant soft|solid|outline, size xs|sm|md|lg, showRadix, label

// Kbd / KbdCombo — keycaps. Hide on touch with `hidden pointer-fine:inline-flex`.
<Kbd>Enter</Kbd>   <KbdCombo keys={["⌘", "K"]} />   <Kbd tone="inverse">↵</Kbd> {/* on a primary button */}

// Stat — label + big tabular value + delta.
<Stat label="Best score" value={42} delta={6} deltaLabel="vs last week" />
<Stat label="Avg. answer time" value="2.4" unit="s" delta={-0.3} lowerIsBetter size="lg" />
// props: label, value, unit, delta, formatDelta, deltaLabel, lowerIsBetter, hint, adornment, size sm|md|lg

// Segmented — single choice, radiogroup, arrow keys + Home/End, one tab stop.
<Segmented aria-label="Duration" value={d} onValueChange={setD}
  options={[{ value: "15", label: "15s" }, { value: "30", label: "30s" }, { value: "60", label: "60s" }]} />
// props: options[{value,label,icon?,ariaLabel?,disabled?}], value, onValueChange, aria-label (required),
// size sm|md|lg, fullWidth, id (when several share a page)

// Meter — timer / progress / lives. Transform-only fill.
<Meter variant="timer" value={secondsLeft} max={60} label="Time left" valueText={`${secondsLeft} seconds`} />
<Meter variant="lives" value={2} max={3} label="Lives" size="lg" />
<Meter value={7} max={10} label="Lesson progress" showLabel />
// timer auto-tones: ≤25% warning, ≤10% destructive. props: value, max, variant, tone, size sm|md|lg,
// label (required), valueText, showLabel, display

// PageHeader — top of every page (renders the h1).
<PageHeader eyebrow="Leaderboard" title={<>Fastest <em>hands</em></>}
  lede="Top scores for each official mode, updated live."
  actions={<Button variant="outline">Filter</Button>} divider />
// props: eyebrow, title, lede, actions, align left|center, size sm|md|lg, divider, as h1|h2, children (meta row)

// EmptyState — every list/table/history needs one.
<EmptyState icon={<History />} title="No games yet"
  description="Finish a sprint and your scores appear here."
  action={<Button asChild><Link to="/play">Start a sprint</Link></Button>}
  hint={<>Press <Kbd size="sm">Enter</Kbd> on the home page to start</>} />

// GridPaper — graph-paper texture. Hero and game surfaces ONLY. Parent must be `relative isolate`.
<section className="relative isolate"><GridPaper fade />…</section>
// props: cell (px, default 8; majors every 5), fade

// BaseOdometer — the signature element.
<BaseOdometer size="lg" autoPlay interactive placeValues caption="One number · four bases" />
<BaseOdometer value={404} bits={12} size="md" />                         // 404 page
<BaseOdometer size="sm" bases={["bin","hex"]} autoPlay={650} header={false} />  // loader
// props: value/defaultValue/onValueChange, bits (8), bases, autoPlay (bool|ms), sequence,
// interactive (bits become toggle buttons), placeValues, size sm|md|lg, header, caption, names, hint

// Logo
<Logomark className="size-7" />   <Wordmark />
```

Also: `RouteFallback` (`src/components/RouteFallback.tsx`) — Suspense/auth
fallback with a 200ms show-delay.

### Utility classes (`src/index.css`)

`.eyebrow` · `.link` (inline text link) · `.grid-paper` · `.num` (tabular) ·
`.mono-condensed` · `.optical-display` · `.hairline-t/-b` · `.mask-fade-edges` ·
`.skip-link` · layout helpers `.fluid-container`, `.safe-vh-full`,
`.safe-vh-screen`, `.px-fluid`, `.py-fluid` (kept for multiplayer pages).

Variants (tailwind plugin): `pointer-coarse:`, `pointer-fine:`, `motion-ok:`.
Breakpoint `xs` = 400px was added.

---

## 4. Layout grid & breakpoints

| Name   | Min width | Notes                                                                 |
| ------ | --------- | --------------------------------------------------------------------- |
| (base) | 0         | single column, 16px gutters; test at **320px** — no horizontal scroll |
| `xs`   | 400       | buttons may sit side by side                                          |
| `sm`   | 640       | 24px gutters                                                          |
| `md`   | 768       | 2–3 column grids start                                                |
| `lg`   | 1024      | full nav, hero splits 1.05fr / 1fr, sidebars appear                   |
| `xl`   | 1280      | —                                                                     |
| `2xl`  | 1440      | container caps at 1240px                                              |

- 12-column thinking, but write grids explicitly:
  `grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]` (content + aside),
  `md:grid-cols-3` (steps/stat rows). Always `minmax(0, …)` to avoid overflow.
- Reading width: prose ≤ 68ch (`max-w-prose`), ledes ≤ 34rem (`max-w-lede`).
- Nav height is `--nav-h` (56px); sticky headers inside pages offset by it.

---

## 5. Accessibility rules

- Contrast: all text ≥ 4.5:1, large text/UI ≥ 3:1 — run the script.
- Focus: visible on everything (global outline). Never `outline-none` without
  a replacement. Menus/dialogs trap & return focus (Radix does this).
- Hit targets ≥ 44px on touch. Use Button sizes; for custom controls add
  `pointer-coarse:min-h-11` or an `after:-inset-*` hit area.
- Every page has one `h1` (use `PageHeader`); headings don't skip levels.
- `#main` is the skip-link target (in `Layout`). Immersive routes (quiz, rooms)
  still render `<main id="main">`.
- Colour is never the only signal: pair base colours with tags, success/error
  with icons + text, deltas with arrows + sr-only "better/worse".
- Live regions: `aria-live="polite"` for score/timer changes that matter; do
  not announce every tick.
- Inputs ≥ 16px on mobile; `inputMode`/`autoComplete` set; labels always.
- Reduced motion: no transforms, no auto-play; the odometer starts paused.

---

## 6. Page templates

**Marketing page** (Home, About, For classrooms)

```
<section className="relative isolate border-b"><GridPaper fade />   ← hero only
  <div className="container py-…"> eyebrow · display-2xl/xl h1 with <em> · lede · 1 primary + 1 outline CTA · Kbd hint
<section className="container py-section"> eyebrow · display-lg h2 · content separated by hairlines
<section className="border-y bg-card/60"> alternate band for rhythm (max one per two sections)
closing CTA section · Footer
```

**App page** (Leaderboard, Stats, Profile, Multiplayer home)

```
<div className="container py-10 md:py-14 flex flex-col gap-10">
  <PageHeader eyebrow="…" title="…" lede="…" actions={…} divider size="sm|md" />
  filters row: Segmented / Select (left) · secondary actions (right)
  content: Table or hairline list; Cards only for discrete objects; EmptyState when empty
```

**Game surface** (Quiz, Multiplayer game)

```
immersive (no nav/footer) · relative isolate · <GridPaper /> behind the play area
top bar: ExitButton (ghost) · mode name (label) · <Meter variant="timer"> full width
centre: prompt = <BaseTag> + <Digits size="xl"> · answer = <Input variant="answer" autoFocus>
bottom: score <Stat size="lg"> · Kbd hints (Esc to quit)
correct → success flash on the input border (180ms); wrong → no penalty animation, keep typing
```

**Form page** (Login, Signup, Create/Join room, Settings)

```
<div className="container max-w-md py-12 md:py-20">
  PageHeader size="sm" (no actions) · <form className="flex flex-col gap-5">
  Label above field, help text text-[0.8125rem] muted, error text destructive below field
  primary submit full width (size="lg"); secondary action as ghost/link below
```

---

## 7. Don't

- Gradient text, glassmorphism, neon glows, heavy drop shadows.
- Emoji in UI copy. Lucide icons only, `size-4`/`size-5`, `text-muted-foreground` unless signalling.
- Three-up "icon + title + text" feature grids. Use numbered steps, hairline lists, or a real example.
- Stock illustrations. Draw with the system (Digits, BaseTag, odometer, grid paper).
- More than one filled primary button in a view; red for anything but action/focus/accent.
- Base colours on non-number UI. Raw Tailwind palette colours (`text-green-500`, `bg-yellow-500/10`, `text-white`).
- `transition-all`, layout-animating properties, motion without a reduced-motion path.
- Fixed pixel widths that break at 320px; text in all caps outside `.eyebrow`/tags.
- `hsl(var(--x))` (tokens are RGB channels) or hex values inline.
- Sticky-note, folded corner, coffee stain, page curl, scribble highlights (all deprecated).

---

## 8. Migration (deprecated → replacement)

The legacy notebook components and utilities still render — re-skinned on the
new tokens so nothing breaks — but **page engineers should migrate off them**:

| Deprecated                                                                                                                   | Replace with                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `PaperCard*` (`ui/paper-card.tsx`, all `variant="folded*"`, `interactive`, `bookmark`)                                       | `Card*`; interactive → `<Link className="… rounded-lg border bg-card hover:border-border-strong">`      |
| `StickyNote*` (`ui/sticky-note.tsx`)                                                                                         | `Alert` (`info`/`success`/`warning`) or a hairline aside                                                |
| `NotebookInput`                                                                                                              | `Input` / `<textarea className={inputVariants()}>`                                                      |
| `SectionHeader`                                                                                                              | `PageHeader` (page top) or `<h2 className="text-headline font-serif">`                                  |
| `RuledSeparator`                                                                                                             | `Separator`                                                                                             |
| `ui/academic.ts` barrel                                                                                                      | import each primitive from its own file                                                                 |
| `.paper-texture`, `.folded-corner*`, `.coffee-stain*`, `.torn-edge-top`, `.page-curl`, `.sketch-border`, `.bookmark-ribbon*` | delete (now no-ops / hairlines)                                                                         |
| `.highlight-scribble*`, `.ink-underline*`, `.annotation`, `.margin-note`                                                     | delete; use `<em>` accent or `text-muted-foreground`                                                    |
| `.ruled-lines*`                                                                                                              | only inside long-form textareas, if at all                                                              |
| `text-fluid-*`, `p-fluid-*`, `tracking-academic`                                                                             | semantic scale (`text-headline`, `text-body`…) and Tailwind spacing                                     |
| `bg-chart-1 text-white` etc. on buttons                                                                                      | `Button` variants                                                                                       |
| `text-yellow-600`, `bg-yellow-500/10`, `text-orange-600`, `text-red-*`, `text-gray-*`, `text-white`                          | `text-warning`, `bg-warning/10`, `text-destructive`, `text-muted-foreground`, `text-primary-foreground` |
| `hsl(var(--background))` (MultiplayerResults charts)                                                                         | `rgb(var(--background))`                                                                                |
| `navigate()` on `onClick` of cards for navigation                                                                            | `<Link>` (middle-click, a11y)                                                                           |
| Game-mode `color: "bg-blue-500"` fields                                                                                      | `BASES[toBaseKey(name)].bg`                                                                             |

Pages still using the deprecated set (as of this commit): Usage, Tutorials,
About, Privacy, Terms, Leaderboard, Stats, Results, SingleplayerMode (+ quiz
settings feature), Login, Signup, MultiplayerHome, CreateRoom, JoinRoom,
RoomLobby, MultiplayerGame, MultiplayerResults, Profile\*.
