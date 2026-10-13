---
version: 1
slug: "src-pages-home-tsx"
primary_target: "src/pages/Home.tsx"
related_targets: ["src/pages/Play.tsx","src/pages/PlayRun.tsx","src/pages/Results.tsx"]
---

# Surface brief: the whole site (cover, contents, run, results, rooms, lessons)

Scope: every route of Based Math Game. Mode per surface: cover = Persuade (one action), hub/run/results/rooms = Operate, Learn/How to play/About = Read.

Audience and job: learners (CS/ECE students, self-learners) who want base conversion to be reflex; teachers running a room as a warm-up. Success = answering a question within seconds of landing, and coming back for the daily sheet.

Constraints: the game is the product, not a service. No SaaS landing furniture. Keyboard-first (Enter starts, Tab skips, Esc pauses). AA contrast in both themes, 320px minimum, reduced motion respected. Deterministic question streams untouched.

## Direction contract

THESIS: The site is a bound school workbook you play in. The cover is the title page with Play, /play is the table of contents, every run is an exercise page, results come back marked in red pen, stats are a report card. It refuses the SaaS landing: hero + feature cards + stats band + CTA band + four-column footer.

OWN-WORLD: Book paper #F6F1E6, black ink, one schoolbook-blue spot colour #1F4E9C for structure (section numbers, rules, links, focus), the red pen #C02F28 only for marks (ticks, crosses, circled scores, wrong). Blue book-cloth cover with a ruled paper label. Computer Modern throughout: Serif bold extended for headings, Concrete for body, Sans for controls, Typewriter (dotted zero) for every number. Square corners, double rules, dot leaders, running heads in small caps, answer blanks on a rule. At night: chalkboard slate, white chalk, yellow chalk for the action, red chalk for marks.

STORY: The visitor knows in one second it is a number-base game, presses Play or Enter and is answering a question in under three seconds. Returning players continue their last drill with one key, open the numbered daily sheet, or browse the contents. Lessons sit in the margin, never in front of play.

FIRST VIEWPORT: Full-bleed blue cloth with a spine on the left. Centred paper label (max 46rem): small-caps "Exercises in Number Bases" in blue, "Based Math" at display size on one line, an italic subtitle, Name / Sheet No. / Date fill-in lines, then a full-width ink Play bar (Enter keycap, arrow) with one line saying what it starts, then four numbered picks (Daily, Contents, Rooms, Learn). The back-cover 0–15 table in DEC/HEX/OCT/BIN runs across the bottom. Menu top-left, theme and sign-in top-right. Signature interaction: Play swings the cover open (rotateY about the spine) into the run; each correct answer gets a red-pen tick; the results score is circled in red.

FORM: Exercise Workbook, first on the ordered grounded list (taken as IMPECCABLE'S PICK over the rolled Ditto Worksheet); seed key 4fa75923.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions
- Cover colour per daily sheet (one flat ground per issue) — not adopted; the cover stays blue for recognition.
