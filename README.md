# Based Math Game

Timed drills for converting numbers between binary, octal, decimal and hexadecimal, and the topics built on them: powers of two, two's complement, bitwise operations, binary addition, hex colors and ASCII. Play solo, or open a live room for up to 10 players. Inspired by [zetamac](https://arithmetic.zetamac.com).

Live: https://based-math-game.web.app

## What's in it

- **11 topics in four tiers** (Foundations → Core → Advanced → Applied) plus custom drills built from any conversion pairs and ranges.
- **Five formats:** Sprint (60 s, most correct), Speedrun (first to 15, fastest time), Survival (three lives, shrinking clock, ramps through every topic), Daily (the same 10 questions for everyone each UTC day) and Practice (untimed, hints and worked solutions).
- **Learn:** a short interactive course, one lesson per topic, linked from every mode.
- **Multiplayer rooms:** join by 8-character code or link, same questions for everyone, live standings, chat, host controls.
- **Accounts are optional.** Guests are anonymous Firebase users who can play everything; a free account adds leaderboards and synced history, and keeps the guest's runs.
- Shareable links for teachers: `/play?mode=bytes-hex:sprint`, custom drills via `/play?mode=custom&c=…`, rooms via `/join/<code>`.

## Stack

React 19, TypeScript, Vite, Tailwind CSS with Radix UI primitives, Framer Motion, and Firebase (Authentication, Realtime Database for rooms, Firestore for profiles, history and leaderboards, Hosting). Fonts (Newsreader, Schibsted Grotesk, Martian Mono) are self-hosted.

## Project layout

```
src/
  game/            Pure TypeScript game engine: question kinds, topics, formats,
                   seeded question streams, answer checking, worked explanations,
                   scoring, and the useRun hook. Fully unit tested.
  data/            Firestore data layer: runs, stats, leaderboards, settings
                   (guests fall back to localStorage). Score limits mirror the rules.
  features/        play/ (hub, run screen, results), multiplayer/, learn/, ui/ (nav, footer)
  pages/           Route components (lazy-loaded except Home)
  components/ui/   Design-system primitives (see DESIGN.md)
  contexts/        Auth (anonymous guests + account upgrade) and theme
  firebase/        app.ts (app + Auth), database.ts, firestore.ts
  hooks/           Room and chat hooks for multiplayer
tests/rules/       Security-rules tests for Firestore and the Realtime Database
scripts/           Rules generator, icon and OG-image generators, contrast check
```

`DESIGN.md` documents the design system. `RUNBOOK.md` lists the operational steps for the Firebase project. `augment.md` is a reference for agents and contributors.

## Develop

Requires Node 22. Java 21 is needed only for the Firebase emulators.

```bash
npm ci
npm run dev            # http://localhost:5173 (uses the project in .env)
```

To develop against local emulators instead of production, set `VITE_USE_FIREBASE_EMULATORS=true` in `.env.local` and run `npx firebase-tools emulators:start --only auth,database,firestore`.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm test                       # engine, data layer, links, learn content
npm run rules:db               # regenerate database.rules.json from scripts/build-database-rules.mjs
npx firebase-tools emulators:exec --only auth,database,firestore --project demo-based-math "npm run test:rules"
npm run build
```

CI (`.github/workflows/ci.yml`) runs all of these on every pull request and on `main`.

## Deploy

Merging to `main` builds and deploys Hosting through GitHub Actions; pull requests get a preview channel. Security rules and indexes are deployed separately:

```bash
npx firebase-tools deploy --only database,firestore --project based-math-game
```

See `RUNBOOK.md` for the full release checklist and console settings.

## Contributing

Issues and pull requests are welcome at https://github.com/hajin-park/based-math-game/issues.

## License

GPL-3.0. See `LICENSE`.
