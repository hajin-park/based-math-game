---
name: Based Math Game
description: Timed number-base drills set as a bound school workbook by day and a classroom chalkboard by night.
colors:
  # The printed workbook (light, :root)
  primary: "#1F4E9C"
  primary-hover: "#183F80"
  red-pen: "#C02F28"
  book-paper: "#F6F1E6"
  black-ink: "#1B1B1F"
  fresh-sheet: "#FCFAF4"
  index-slip: "#FDFBF6"
  sunken-well: "#ECE5D6"
  blue-screen-tint: "#E1E7EE"
  hover-wash: "#EAE3D3"
  hairline-rule: "#DDD4C2"
  strong-rule: "#BFB4A0"
  control-outline: "#8C8373"
  pencil: "#5E5951"
  green-ink: "#2E6B47"
  ochre: "#8A5A0B"
  highlighter: "#F4D35E"
  cover-cloth: "#1E4790"
  cover-cloth-deep: "#16356E"
  cover-label-muted: "#BCCAE6"
  ink-bin-teal: "#0D6A73"
  ink-oct-moss: "#4A6A10"
  ink-dec-graphite: "#3F3B36"
  ink-hex-plum: "#8B3A83"
  # The chalkboard (dark, .dark)
  yellow-chalk: "#F0CF68"
  yellow-chalk-bright: "#F6DC8C"
  red-chalk: "#F28C80"
  chalkboard: "#1D2824"
  white-chalk: "#E8ECE4"
  board-panel: "#24312C"
  board-slip: "#2A3832"
  board-sunken: "#17201D"
  board-tint: "#283A3D"
  board-hover: "#2C3B35"
  board-rule: "#34433D"
  board-rule-strong: "#4A5C55"
  board-control-outline: "#71857B"
  faded-chalk: "#A5B2AA"
  green-chalk: "#9BD39A"
  orange-chalk: "#F2B36B"
  chalk-bin-blue: "#86D0DA"
  chalk-oct-green: "#B9DC8C"
  chalk-dec-white: "#DCE2DA"
  chalk-hex-pink: "#E9A9E0"
typography:
  display:
    fontFamily: '"BM Serif", Georgia, Cambria, serif'
    fontSize: "clamp(3.25rem, 1.9rem + 5.2vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.012em"
  page-title:
    fontFamily: '"BM Serif", Georgia, Cambria, serif'
    fontSize: "clamp(2rem, 1.55rem + 1.9vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.008em"
  headline:
    fontFamily: '"BM Serif", Georgia, Cambria, serif'
    fontSize: "clamp(1.5rem, 1.28rem + 0.9vw, 2.0625rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.005em"
  title:
    fontFamily: '"BM Serif", Georgia, Cambria, serif'
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.003em"
  body-lg:
    fontFamily: '"BM Concrete", "BM Serif", Georgia, Cambria, serif'
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: '"BM Concrete", "BM Serif", Georgia, Cambria, serif'
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.62
    fontFeature: '"kern" 1, "liga" 1'
  body-sm:
    fontFamily: '"BM Concrete", "BM Serif", Georgia, Cambria, serif'
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: '"BM Sans", ui-sans-serif, system-ui, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.01em"
  running-head:
    fontFamily: '"BM Serif", Georgia, Cambria, serif'
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
    fontFeature: "all-small-caps"
  numeral:
    fontFamily: '"BM Typewriter", ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: "1.3125rem"
    fontWeight: 500
    lineHeight: 1.3
    fontFeature: '"tnum" 1'
  numeral-answer:
    fontFamily: '"BM Typewriter", ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: "clamp(1.625rem, 1.25rem + 1.4vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "0.04em"
    fontFeature: '"tnum" 1'
  numeral-prompt:
    fontFamily: '"BM Typewriter", ui-monospace, SFMono-Regular, Menlo, monospace'
    fontSize: "clamp(2.25rem, 1.5rem + 3vw, 4rem)"
    fontWeight: 500
    lineHeight: 1.04
    fontFeature: '"tnum" 1'
rounded:
  none: "0"
  hair: "1px"
  sm: "2px"
  label: "3px"
  xl: "4px"
spacing:
  gutter: "16px"
  gutter-sm: "24px"
  gutter-lg: "32px"
  section-sm: "clamp(2.5rem, 1.75rem + 3vw, 4.5rem)"
  section: "clamp(4rem, 2.75rem + 4.5vw, 6.5rem)"
  nav-height: "3.5rem"
  measure: "65ch"
  page: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.black-ink}"
    textColor: "{colors.book-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "rgb(27 27 31 / 0.85)"
    textColor: "{colors.book-paper}"
  button-primary-night:
    backgroundColor: "{colors.yellow-chalk}"
    textColor: "{colors.chalkboard}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 16px"
  button-primary-night-hover:
    backgroundColor: "{colors.yellow-chalk-bright}"
  button-play-cover:
    backgroundColor: "{colors.black-ink}"
    textColor: "{colors.book-paper}"
    rounded: "{rounded.sm}"
    height: "64px"
    width: "100%"
    padding: "0 24px"
  button-secondary:
    backgroundColor: "{colors.blue-screen-tint}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 16px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 16px"
  button-outline-hover:
    backgroundColor: "{colors.hover-wash}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 16px"
  button-destructive:
    backgroundColor: "{colors.red-pen}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 16px"
  input:
    backgroundColor: "{colors.fresh-sheet}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 12px"
  input-answer:
    backgroundColor: "transparent"
    textColor: "{colors.black-ink}"
    typography: "{typography.numeral-answer}"
    rounded: "{rounded.none}"
    height: "56px"
    padding: "0 8px 4px"
  badge:
    backgroundColor: "{colors.blue-screen-tint}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    height: "24px"
    padding: "0 8px"
  base-tag-hex:
    backgroundColor: "rgb(139 58 131 / 0.1)"
    textColor: "{colors.ink-hex-plum}"
    rounded: "{rounded.sm}"
    height: "24px"
    padding: "0 8px"
  kbd:
    backgroundColor: "{colors.fresh-sheet}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.sm}"
    height: "24px"
    padding: "0 6px"
  card:
    backgroundColor: "{colors.fresh-sheet}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.sm}"
    padding: "20px"
  example-box:
    backgroundColor: "{colors.blue-screen-tint}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.sm}"
    padding: "14px 20px"
  room-code-board:
    backgroundColor: "{colors.chalkboard}"
    textColor: "{colors.white-chalk}"
    rounded: "{rounded.sm}"
    padding: "20px 32px 24px"
---

# Design System: Based Math Game

Where things live, so a new surface starts from the system and not from a one-off:

- Tokens: `src/index.css` (`:root` workbook, `.dark` chalkboard; RGB channel triplets consumed by `tailwind.config.js` as `rgb(var(--token) / <alpha-value>)`).
- Fonts: `src/styles/fonts.css`, preloaded by the `preload-fonts` plugin in `vite.config.ts` (keep the file names in sync). Rebuild the subsets with `scripts/fonts/subset.py` (the dotted typewriter zero is cut by `scripts/fonts/dotzero.py`).
- Primitives: `src/components/ui/`. Base metadata (tags, prefixes, grouping, colour classes): `src/lib/bases.ts`.
- Contrast: `node scripts/check-contrast.mjs` (exits non-zero on any failing pair; keep its token table in sync with `src/index.css`).
- Icons: `node scripts/generate-icons.mjs` renders `public/icon.svg` and the PNGs. Social card: `scripts/og/` (`og.html` rendered by `render.mjs` to `public/og.png`).

## Overview

**Creative North Star: "The Exercise Workbook"**

The site is a bound school workbook you play in. The home page is the cover, blue book cloth with a printed paper label and one Play bar. `/play` is the table of contents, set with dot leaders and folios. Each run is an exercise page: a spot-blue exercise number, the problem in typewriter numerals, and an answer blank on a rule. Results come back marked: the score is circled in red pen and each answer is ticked or crossed. Stats are a report card, the leaderboard is an honour roll, lessons are chapters with worked examples. At night the same book becomes the classroom chalkboard: slate ground, white chalk, yellow chalk for the action, red chalk for marks.

The system is a two-colour printing job plus a teacher's pen. Black ink carries the text, one schoolbook blue carries structure (section numbers, rules, links, focus, selection), and red appears only where a marker would put it. Depth is paper on paper: a fresh sheet laid on the page casts a short, warm contact shadow; nothing floats or glows. Corners are square to the hair. Computer Modern, the face of every LaTeX problem set, sets everything, in four cuts with fixed jobs.

Density follows the book. Reading pages keep a 65ch measure and generous leading; the run page clears everything except the prompt and the blank; tables (contents, honour roll, report card) are tight, ruled, tabular. The system refuses the SaaS landing page: no hero-plus-feature-cards, no stats band, no glass, no gradient type, and no sticky-note or doodle clip art pretending to be "school".

**Key Characteristics:**

- Printed workbook by day, chalkboard by night; both are one world, not two skins.
- Ink for text, spot blue for structure, red pen for marks only.
- Computer Modern throughout: Serif headings, Concrete body, Sans controls, Typewriter numerals with a dotted zero.
- Square hairline corners (2px), paper-on-paper shadows, hairline and double rules instead of boxes.
- Book devices do the work: running heads with folio data, double rules, dot leaders, ruled answer blanks, tint example boxes, pen marks, a highlighter for "you".
- Four base inks (BIN, OCT, DEC, HEX) used only on digits and their tags, always labelled.

## Colors

A two-colour workbook (black ink plus one schoolbook blue) on warm book paper, with a red pen kept for marks; at night, chalk on slate.

### Primary

- **Schoolbook Blue** (`primary`): the spot colour. Section and exercise numbers, the active nav item and its 2px underline, link underlines, the focus ring, the caret, the printed rules of graph and ruled paper, the label of a Hint or Note. Never a fill for the main button. Hover deepens to `primary-hover`.
- **Yellow Chalk** (`yellow-chalk`): the chalkboard's primary. It takes over every Schoolbook Blue job at night and also fills the main action button, because white chalk on slate is the body text and the action needs to stand apart. Hover brightens to `yellow-chalk-bright`.

### Secondary

- **Red Pen** (`red-pen`, chalk equivalent `red-chalk`): the teacher's marks. Ticks, crosses, the circled score, the underline under a personal best, the wrong answer shown on a reviewed exercise, invalid fields, and the destructive button for irreversible actions. Status `destructive` is the same value.

### Tertiary

- **Base inks** (`ink-bin-teal`, `ink-oct-moss`, `ink-dec-graphite`, `ink-hex-plum`; chalk `chalk-bin-blue`, `chalk-oct-green`, `chalk-dec-white`, `chalk-hex-pink`): a deliberate functional identity system, committed in PRODUCT.md ("each number base keeps a stable identity colour and is always labelled"). They colour digits rendered by `Digits` and the `BaseTag` pill, through the classes in `src/lib/bases.ts`, and nothing else. Every pair passes AA on paper, sheet, well and tint in both themes.
- **Highlighter** (`highlighter`): a yellow swipe at 40 to 60 percent behind inline text (at about 25 percent on the chalkboard). It marks "you" in standings and the honour roll, and it is the text selection colour.
- **Cover Cloth** (`cover-cloth`, `cover-cloth-deep`, `cover-label-muted`): the blue linen of the cover and its spine, the logomark fill. At night the cover is the chalkboard itself.

### Neutral

- **Book Paper** (`book-paper`): the page. Body background in light.
- **Black Ink** (`black-ink`): all text, headings, the primary button fill, the double rule (at 70 percent).
- **Fresh Sheet** (`fresh-sheet`) and **Index Slip** (`index-slip`): a sheet laid on the page (cards, the results paper, the cover label, inputs) and slips above it (menus, dialogs, toasts).
- **Sunken Well** (`sunken-well`): table heads, wells, secondary fills.
- **Blue Screen Tint** (`blue-screen-tint`): a 12 percent screen of the spot blue. Example, Hint and Note boxes, the secondary button, the soft badge, the selected item in a list.
- **Hover Wash** (`hover-wash`): hover fill on ghost and outline controls and list rows.
- **Hairline Rule** (`hairline-rule`), **Strong Rule** (`strong-rule`), **Control Outline** (`control-outline`, at least 3:1 on paper): dividers, card edges, input boxes.
- **Pencil** (`pencil`): secondary text, running heads, captions, inactive nav.
- **Green Ink** (`green-ink`) and **Ochre** (`ochre`): success and warning text, the correct-answer flash, the timer's warning stage. Each has a chalk equivalent (`green-chalk`, `orange-chalk`).
- Chalkboard neutrals mirror the paper set one for one: `chalkboard`, `white-chalk`, `board-panel`, `board-slip`, `board-sunken`, `board-tint`, `board-hover`, `board-rule`, `board-rule-strong`, `board-control-outline`, `faded-chalk`.

### Named Rules

**The Red Pen Rule.** Red is a mark, never a decoration. It appears only where a teacher would write: a tick, a cross, a circle round the score, a correction, an invalid field, an irreversible action. Red on a heading, an icon, a link or a border is wrong.

**The Spot Colour Rule.** Schoolbook Blue prints structure (numbers, rules, links, focus, selection). It never fills the main button; the main action is solid ink. A headline's emphasis is italic, never blue.

**The Base Ink Rule.** The four base inks colour digits and their tags only, and a coloured number always carries its BIN/OCT/DEC/HEX tag or a row label. They are an identity system, not a palette for charts, borders or backgrounds.

**The Chalkboard Panel Rule.** A surface that must read as written on the board in either theme (the room code, readable from the back of a classroom on a projector) puts the `dark` class on its own subtree, so the chalkboard tokens apply locally. Use it for that kind of panel, not as a decorative dark band.

## Typography

**Display Font:** BM Serif (Computer Modern Serif, bold extended for headings; with Georgia, Cambria)
**Body Font:** BM Concrete (Computer Modern Concrete; with BM Serif, Georgia)
**Label/Mono Font:** BM Sans (Computer Modern Sans) for controls and labels; BM Typewriter (Computer Modern Typewriter, zero with a centre dot) for every number, code and keycap.

**Character:** One family in four cuts, each with a single job: the bold serif of a textbook heading, Concrete's soft schoolbook body, a plain sans for anything you press, and a typewriter for every figure. Self-hosted subsets of the Computer Modern Unicode fonts (OFL), renamed "BM".

### Hierarchy

- **Display** (BM Serif 700, clamp 52px to 96px, line-height 0.95): the cover title "Based Math", on one line from `sm` up.
- **Page title** (BM Serif 700, clamp 32px to 48px, 1.06): the h1 of an inside page through `PageHeader` (Contents, Daily sheet No. n, Honour roll, Report card, Rooms). An `<em>` word goes italic.
- **Headline** (BM Serif 700, clamp 24px to 33px, 1.15): chapter and section heads, compact page titles.
- **Title** (BM Serif 700, 20px, 1.3; `title-sm` 18px): panel and list titles, the exercise prompt text.
- **Body** (BM Concrete 400, 17px, 1.62; `body-lg` 19px for ledes, `body-sm` 15px for notes and captions): running text, held to a 65ch measure (`max-w-content`, `max-w-prose` 68ch).
- **Label** (BM Sans 700 on buttons, 500 elsewhere; 14px, 0.01em): buttons, tabs, segmented controls, field labels, badges.
- **Running head** (BM Serif 500, 14px, 0.06em, all small caps, pencil colour): the line across the top of a page or panel, table heads, small-caps field labels such as the answer blank's label.
- **Numerals** (BM Typewriter 500, tabular): `mono-sm` 13px to `mono-lg` 21px in tables and steps; `numeral-answer` (clamp 26px to 40px) in the answer blank; `numeral-prompt` (clamp 36px to 64px) for the number being converted; up to `mono-3xl` 96px for the circled score.

### Named Rules

**The Typewriter Figure Rule.** Every figure that can change (scores, times, counts, digits in a base, room codes, dates in folios) is set in BM Typewriter with tabular numerals. The dotted zero is what keeps 0 from reading as O; never swap the face for a system mono.

**The Italic Emphasis Rule.** Emphasis inside a headline or a lede is serif italic. Never colour, never weight alone.

## Layout

The page is a book page: a centred container up to 1240px (`max-w-page`) with gutters of 16px, 24px from `sm`, 32px from `lg`. Inside pages narrow to a reading block (Contents and Daily at 60rem, Results at 64rem, prose at 65ch to 68ch, ledes at 38rem). Breakpoints: `xs` 400, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1440. Every layout works at 320px.

- **Cover.** Full-bleed book cloth, `min-h-dvh`, a darker spine down the left edge (light theme), cover chrome in the top band (menu left, theme and sign-in right), and the paper label centred at up to 46rem. A 0 to 15 table in DEC/HEX/OCT/BIN runs across the bottom like a back-cover reference. The cover prints its own chrome, so the site nav is hidden there.
- **Inside pages.** A sticky running head 56px tall (`--nav-h`): wordmark left, five sections in small caps, theme and account right; on mobile a Play button and a menu sheet that lists the contents with numbers. The colophon footer sits under a double rule.
- **The run.** Immersive: nav and footer are gone. A compact header (Pause, drill title, figures in a ruled box) over a 1px rule or the timer meter, graph paper behind, and the exercise grid: a 36px number column (60px from `sm`) and the problem column, answer blank at most 28rem wide. Under 560px of height the vertical padding collapses.
- **Rhythm.** Section spacing uses `section` (clamp 64px to 104px) and `section-sm` (clamp 40px to 72px); page stacks use gaps of 40px to 56px; ruled lists divide with hairlines rather than gaps. Body leading is the unit for ruled paper (2rem lines in exercises, 1.75rem in room chat).
- **Margins teach.** On `xl`, lesson notes float into a 13rem margin column beside the text (Tufte style); below that they fall back into the flow as tint boxes.

## Elevation & Depth

Paper on paper. Surfaces are flat sheets distinguished by fill (paper, fresh sheet, slip, well) and hairline edges; elevation exists only where one sheet is genuinely laid on another, and its shadow is a short contact line plus a soft warm fall-off tinted with the paper's own brown (`--shadow` 60 45 20). On the chalkboard, shadows go black and a sheet gets a 1px strong-rule outline instead, because shadows barely read on slate. Overlays dim the desk (`rgb(var(--shadow) / 0.42)`, black at 60 percent at night) and never blur it.

### Shadow Vocabulary

- **Contact** (`box-shadow: 0 1px 1px 0 rgb(var(--shadow) / 0.08)`): cards at rest (`shadow-sm`).
- **Laid sheet** (`.paper-sheet`: `0 1px 1px rgb(var(--shadow) / 0.08), 0 10px 30px -14px rgb(var(--shadow) / 0.35)`; at night `0 0 0 1px rgb(var(--border-strong)), 0 18px 40px -18px rgb(0 0 0 / 0.6)`): the cover label, the results paper, auth and profile sheets, the pause card, chart tooltips, connection toasts.
- **Lifted** (`shadow-md`: `0 1px 1px 0 rgb(var(--shadow) / 0.08), 0 6px 16px -6px rgb(var(--shadow) / 0.22)`): the room-code board.
- **Dialog** (`shadow-2xl`: `0 2px 4px 0 rgb(var(--shadow) / 0.1), 0 32px 64px -22px rgb(var(--shadow) / 0.45)`): modal dialogs.
- **Primary press line** (`0 1px 0 rgb(var(--shadow) / 0.25)`): the ink button's bottom edge.
- **Running head** (`0 1px 0 rgb(var(--foreground) / 0.12)`, deepening to `0 1px 0 rgb(var(--foreground) / 0.18), 0 6px 14px -12px rgb(var(--shadow) / 0.5)` once scrolled): the sticky nav's bottom rule.

### Named Rules

**The Laid Sheet Rule.** A shadow means a separate sheet of paper sits on the page. If the thing is not a sheet you could pick up (a dialog, the results paper, the cover label), it is flat and divided by rules.

## Shapes

Printed matter has square corners. The radius scale is a hair: 2px for nearly everything (buttons, inputs, cards, badges, tags, tint boxes, kbd), 1px for segment indicators and meter bars, 3px for the cover label and profile sheet, 4px for dialogs. Circles appear only where the object is round: radio dots, avatars, and the hand-drawn pen circle.

Form is made from rules more than boxes. The book's **double rule** (3px double ink at 70 percent) closes a chapter opening, heads every table and separates the results header from its review. **Hairline rules** (1px ink at 15 to 30 percent, or `hairline-rule`) divide lists and frame running heads. **Dot leaders** run from a contents entry to its folio. The cover label is a double frame: a 1.5px ink border with a 1px outline offset 3px outside it. Answer blanks are a single 2px rule with no box. Pen marks are hand-set SVG strokes with round caps, drawn once with `stroke-dashoffset`.

## Components

Printed and pressed: every control looks like something set on the page, square and quiet, with ink weight carrying emphasis.

### Buttons

- **Shape:** square with a hair radius (2px). BM Sans bold, 0.01em. Sizes: `sm` 32px, default 40px, `lg` 48px, `xl` 56px; the cover's Play bar is 64px to 72px and full width. Compact sizes get an invisible 44px hit area on coarse pointers.
- **Primary:** solid black ink with book-paper text and a 1px press line underneath; yellow chalk with chalkboard text at night. One per view: the main action (Play, Play again, Start, Create room).
- **Hover / Focus:** ink lightens to 85 percent (yellow chalk brightens); a 1px press-down on `:active`; the global focus ring (2px spot blue or yellow chalk, 2px offset). Transitions run at 120ms on `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- **Secondary:** a blue-screen tint fill, ink text; hover deepens to spot blue at 15 percent.
- **Outline:** a ruled box (ink at 55 percent, 45 at night), transparent; hover firms the rule to full ink over the hover wash. The usual companion to a primary.
- **Ghost:** no chrome until hover. Nav, toolbars, icon buttons, the cover chrome.
- **Link:** spot-blue text with a 40 percent underline that firms on hover.
- **Destructive:** red pen fill, white text. Irreversible actions only, always behind a confirm.
- **Keycaps:** a primary button may carry its shortcut as an inverse `Kbd` (Enter), shown only on fine pointers.

### Chips (Badges and Base Tags)

- **Badge:** a 24px printed label in a hairline box, BM Sans 13px. Default and info are spot blue on the tint screen; `solid` is ink; success, warning and destructive use their ink at 10 percent fill and 35 percent edge.
- **Base Tag:** the identity pill of a number base, BM Typewriter uppercase at 0.06em, sizes `xs` 18px to `lg` 28px. Soft (base ink at 10 percent fill, 30 percent edge), solid or outline; optional subscript radix (BIN₂). Carries a `title` with the full name.

### Cards / Containers

- **Corner Style:** 2px.
- **Background:** fresh sheet on book paper (board panel at night).
- **Shadow Strategy:** contact shadow at rest; the laid-sheet shadow only for sheets (see Elevation & Depth).
- **Border:** 1px strong rule at 70 percent.
- **Internal Padding:** 20px. Use a Card only for a discrete object (a room, a result, a form). Never nest cards.
- **Tint boxes:** Example, Hint and Note boxes are the blue screen tint at 2px radius, 14px by 20px padding, with a small-caps spot-blue label ("Example 1.2", "Hint", "Note"). They sit directly on the page, one level deep.
- **Worked solutions:** set on the page under a hairline rule, never in a box: numbered steps with spot-blue typewriter numbers, a bold serif step title, the working in typewriter lines, a plain note.

### Inputs / Fields

- **Style:** a form field printed on the page: fresh-sheet fill, a hairline box in the control outline at 70 percent, and a heavier bottom rule to write on (an inset 1px line in the full outline). 40px tall (32px `sm`), BM Sans, 16px text on touch so iOS does not zoom, 15px from `sm`.
- **Focus:** the box turns spot blue, the bottom rule turns spot blue, and a 3px ring at 16 percent spot blue surrounds it.
- **Error / Disabled:** `aria-invalid` turns the box and the rule red pen. Disabled drops to 50 percent and shows a not-allowed cursor.
- **Answer blank** (`Input variant="answer"`): no box, one 2px ink rule at 70 percent, BM Typewriter at answer size, centred, 48px tall (56px from `sm`). A small-caps label and the answer's BaseTag sit above it; the base prefix (0b, 0o, 0x) is printed in pencil at the start of the line. Focus turns the rule spot blue; a correct answer flashes a 2px green-ink line that fades in 260ms; a rejected keystroke shakes the blank 5px for 200ms (skipped under reduced motion).

### Navigation

- **Running head (desktop):** sticky, 56px, book-paper ground with a 1px ink rule at 12 percent. Wordmark left; sections in BM Serif all small caps at 17px with 0.05em tracking; inactive in pencil, hover in ink, active in spot blue with a 2px spot-blue underline. Theme menu and Sign in (ghost) on the right.
- **Mobile:** an outline Play button and a menu icon open a right-hand sheet: the wordmark, "Contents" in small caps, the five sections as a numbered list in 22px serif bold (typewriter numbers in pencil, active in spot blue), secondary links, a theme segmented control, and the account action at the foot. Rows are at least 44px.
- **Segmented control:** a ruled 1px ink-at-40-percent box with 3px inset; the selected segment is a solid ink slab with paper text that slides between options (spring 520/40, instant under reduced motion). Arrow keys, Home and End move; one tab stop.

### Running Head and Page Header

`PageHeader` is a chapter opening: an optional running head (a small-caps line over a hairline rule, left text and a typewriter folio on the right), the page title with an optional spot-blue section number before it, a lede in `body-lg` pencil, actions right-aligned on desktop, and an optional double rule underneath. The running head carries folio data only (a date, a count, "Top 50", "2–10 seats", "Sheet No. n"), never a restatement of the nav item or the title.

### Pen Marks (signature)

`PenTick`, `PenCross`, `PenCircle`, `PenUnderline`: hand-set red-pen (red-chalk) SVG strokes drawn once on `cubic-bezier(0.65, 0, 0.35, 1)` (tick 260ms, cross two strokes of 180ms, circle 560ms, underline 300ms). Marks are permanent and never animate away. They are `aria-hidden`; the same fact is always present as text.

### Contents Entry and Dot Leader

Contents rows, report-card rows and the honour roll set a label, a dotted leader (`.leader`, 0.75px dots on a 0.4em pitch in ink at 45 percent) and a right-hand folio in typewriter, aligned on the last baseline.

### Meter

Timer, progress and lives. A 4px to 10px bar with a 1px radius on an ink-at-10-percent track; fills by `scaleX` only. The timer drains in neutral ink, turns ochre at 25 percent and red at 10 percent; lives are discrete pips. Always has an accessible name and spoken value.

### Room Code Board

The room code written on the board: a `dark` subtree so it is chalkboard in both themes, a 6px slate frame with a strong-rule ring and the lifted shadow, the code in BM Typewriter chalk at clamp 44px to 100px with 0.1em tracking, the join link and copy actions under a faint rule.

## Do's and Don'ts

### Do:

- **Do** make the main action solid black ink (yellow chalk at night), and keep it to one per view; supporting actions are outline, secondary or ghost.
- **Do** set every number in BM Typewriter with tabular figures, and colour a number in a base only through `Digits` or `BaseTag` with its BIN/OCT/DEC/HEX label present.
- **Do** keep running heads to folio data: a date, a sheet number, a count, a seat range. Leave the running head out when all it would say is the page's name.
- **Do** divide with rules: hairlines between rows, the double rule under a chapter opening and over table heads, dot leaders to a folio.
- **Do** set worked solutions as ruled lines on the page (numbered steps under a hairline), and keep Example, Hint and Note tint boxes one level deep, directly on the page.
- **Do** mark "you" in standings with the highlighter swipe, and mark results with pen ticks, crosses and a circled score.
- **Do** put the `dark` class on a subtree when a panel must read as the chalkboard in both themes (the room code).
- **Do** keep corners at 2px (1px for indicators, 3px for the cover label, 4px for dialogs) and reserve shadows for sheets laid on the page.
- **Do** run `node scripts/check-contrast.mjs` after any token change and add the new pair to its table.

### Don't:

- **Don't** stack a small-caps label over a heading when it only repeats the nav item or the title; running heads carry folio data only.
- **Don't** nest boxes: no card inside a card, no box inside a tint box, no boxed worked solution. Worked solutions are ruled lines on the page.
- **Don't** use red for anything but marks (ticks, crosses, circled scores, corrections, invalid fields, irreversible actions); never for headings, icons, links, borders or emphasis.
- **Don't** fill the main button with spot blue or colour a headline word; emphasis is italic.
- **Don't** use the base inks outside digits and their tags, or let a base colour stand without its label.
- **Don't** use glass or `backdrop-blur`, gradient text, or a coloured side stripe on a card, alert or list item.
- **Don't** decorate with sticky notes, coffee rings, tape, paper clips or doodles; the school world is carried by type, rules and pen marks, not clip art.
- **Don't** add pill shapes or large radii to boxes; circles are only for things that are round (radio dots, avatars, the pen circle).
- **Don't** let anything compete with the prompt and the answer blank on the run page: no nav, no footer, no promotions, no layout shift.

### Accessibility

- Every text pair meets WCAG 2.2 AA in both themes, and controls meet 3:1; `node scripts/check-contrast.mjs` verifies it and exits non-zero on any failing pair (it is a manual check, not wired into the build).
- Touch targets are at least 44px (compact buttons extend an invisible hit area on coarse pointers; menu rows and segments are 44px or more). Inputs are 16px on touch.
- `prefers-reduced-motion` reduces every CSS animation and transition to 0.01ms, and framer-motion components branch on `useReducedMotion()`: pen marks simply appear, the cover does not swing open, the answer blank does not shake.
- Colour is never the only signal: bases carry their tag, pen marks carry text for screen readers, timer warnings carry the remaining time, the highlighted name also carries a "You" tag or label.
- Focus is one rule everywhere: a 2px spot-blue (yellow-chalk) outline at a 2px offset (1px on fields).
