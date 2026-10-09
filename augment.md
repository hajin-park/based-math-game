# augment.md — Repository Reference (Current State)

This document provides a concise, fact-based overview of the codebase to help AI agents understand the repository as it exists now. It describes structure, components, data models, and runtime behavior directly verifiable from source.

## Project overview

- Name: Based Math Game
- Purpose: Practice converting between number bases and related representations
- SPA built with React and Vite; uses Firebase for auth and data; Tailwind + shadcn/ui for UI

## Technology stack (from package.json)

- Runtime: React 19.2.0, React DOM 19.2.0
- Build: Vite 7.1.7 with @vitejs/plugin-react-swc
- Language: TypeScript 5.2.2
- UI: Tailwind CSS 3.4.3, tailwindcss-animate; shadcn/ui (Radix primitives), lucide-react
- State/forms: react-hook-form 7.51.2, @hookform/resolvers 3.3.4, zod 3.22.4
- Animations: framer-motion 12.23.24
- Charts: recharts 3.3.0
- Router: react-router-dom 6.22.3
- Firebase SDK: 12.4.0 (Auth, Firestore, Realtime Database)
- Other: clsx, tailwind-merge, react-icons, vaul

## Repository structure (top-level)

- src/ — application source
- public/ — static assets (manifest, icon, service worker)
- scripts/ — build utilities (e.g., update-sw-version.js)
- firebase.json — Firebase hosting/config
- firestore.rules — Firestore security rules
- database.rules.json — Realtime Database security rules
- index.html — SPA entry
- tailwind.config.js, postcss.config.js — styling config
- vite.config.ts — build/alias config
- tsconfig.json, tsconfig.node.json — TypeScript config
- README.md — minimal project overview
- robots.txt, sitemap.xml — SEO artifacts
- dist/ — build output

## src layout (selected)

- src/main.tsx — router + app providers + SW registration
- src/index.css — Tailwind base and CSS variables
- src/components/
  - Common components (ErrorBoundary, Countdown, ProfileDropdown, etc.)
  - ui/academic.ts (re-exports enhanced UI components)
- src/contexts/
  - AuthContext.tsx — Firebase auth (anonymous guests), account upgrade/deletion
  - ThemeContext.tsx — theme persistence
  - GameContexts.tsx — game-related contexts (types used by game modes)
- src/features/ — feature modules (quiz, tutorials, ui)
- src/firebase/config.ts — Firebase init + emulator support
- src/hooks/ — core hooks (multiplayer room, chat, stats, history, etc.)
- src/lib/ — utilities (animations, avatarGenerator, utils)
- src/pages/ — routed pages (Home, Singleplayer, Multiplayer, etc.)
- src/types/gameMode.ts — GameMode type and official modes list
- src/utils/ — Layout, ScrollToTop, analytics, displayName validation

## Path aliases and build config

- Vite aliases (vite.config.ts)
  - "@" → ./src
  - "@features" → ./src/features
- tsconfig paths mirror the above
- Scripts (package.json)
  - dev: vite
  - build: tsc && vite build && node scripts/update-sw-version.js
  - preview: vite preview
  - lint/format available

## Design system and UI components

- Tailwind (tailwind.config.js)
  - darkMode: "class"
  - Colors map to CSS variables: background, foreground, primary, secondary, destructive, muted, accent, popover, card, sidebar, chart, trophy, critical, base-\* (binary/octal/decimal/hex)
  - Typography families: Inter (sans), Crimson Pro (serif), JetBrains Mono (mono)
  - Minimal border radius (via --radius) and compact letter-spacing presets
  - Animations via tailwindcss-animate and custom keyframes
  - **Fluid Typography**: clamp()-based font sizes (fluid-xs through fluid-5xl) for responsive text scaling
  - **Fluid Spacing**: clamp()-based spacing utilities (fluid-xs through fluid-3xl) for responsive padding/margins
- shadcn/ui is configured in components.json (style: "new-york", css: src/index.css)
- Academic-themed UI components (src/components/ui/academic.ts)
  - PaperCard, StickyNote, NotebookInput, SectionHeader, RuledSeparator (re-exports)

## Responsive design patterns (src/index.css)

- **Fluid utilities** (custom CSS classes):
  - `.fluid-container` — responsive container with clamp()-based padding
  - `.responsive-grid` — auto-fit grid with minmax() for flexible columns
  - `.safe-vh-full` / `.safe-vh-screen` — viewport height using dvh (dynamic viewport height) for mobile browsers
  - `.flex-gap-fluid`, `.p-fluid`, `.px-fluid`, `.py-fluid` — fluid spacing utilities
  - `.no-overflow` — prevents layout overflow
- **Layout approach**:
  - Multiplayer pages use `safe-vh-screen` with flex-col for full-height layouts
  - Desktop: 3-column grid `lg:grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)]`
  - Mobile: Switches to flex-col with stacked content
  - All pages use `px-fluid` and `py-fluid` for responsive padding
  - ChatBox component uses `flex-1 min-h-[200px] max-h-[400px]` for fluid height
  - CreateRoom uses `flex-1 min-h-0` for ScrollArea to prevent overflow
- **Breakpoints** (Tailwind defaults):
  - Mobile: <640px (sm)
  - Tablet: 640px-1024px (md-lg)
  - Laptop: 1024px-1440px (lg-xl)
  - Desktop: >1440px (2xl)

## Security & data-layer migration (2026-10)

The client-side guest ids (`guest_*`), cookie guest accounts, the `/cleanup/lock`
distributed lock and `src/services/cleanupService.ts` were removed. Guests are
Firebase anonymous users; rooms/stats/leaderboards were redesigned (sections below).

## Multiplayer room design standards (Updated 2025-01-24)

- **Font sizes**: Increased from text-xs (12px) to text-sm/base (14-16px) for better readability
  - Headers: text-base sm:text-lg md:text-xl lg:text-2xl (responsive scaling)
  - Body text: text-sm sm:text-base
  - Icons: h-4 w-4 sm:h-5 sm:w-5 (responsive sizing)
- **Padding and spacing**: Doubled from cramped values for comfortable layouts
  - Section padding: p-3 sm:p-4 (was p-1.5)
  - Middle column: p-3 sm:p-4 lg:p-6 (was p-1.5)
  - Item padding: p-2.5 to p-3 (was p-1 to p-1.5)
  - Gaps: gap-2 to gap-3 (was gap-0.5 to gap-1)
- **Component sizing**:
  - Badges: h-6 px-2 text-sm (was h-4 px-1 text-xs)
  - Buttons: size="default" with responsive text (was size="sm")
  - Button icons: h-4 w-4 sm:h-5 sm:w-5 (was h-3 w-3)
- **Layout constraints**:
  - Game mode selection: max-h-[50vh] (was calc(100vh-400px)) to prevent overflow
  - Bottom action buttons always visible without scrolling on all screen sizes
  - Header shadow: shadow-sm for subtle depth

## Routing (src/main.tsx)

- Providers: ErrorBoundary > ThemeProvider > AuthProvider > RouterProvider
- Route tree under Layout:
  - "/" → Home
  - "/singleplayer" → SingleplayerMode
  - "/quiz" → Quiz
  - "/results" → Results
  - "/leaderboard" → Leaderboard
  - "/stats" → Stats
  - "/profile" → ProfileLayout
    - "" → ProfileOverview
    - "settings" → ProfileSettings
    - "game-settings" → ProfileGameSettings
  - "/login" → Login; "/signup" → Signup
  - "/how-to-play" → Usage
  - "/tutorials" → Tutorials
  - "/about" → About; "/privacy" → Privacy; "/terms" → Terms
  - "/multiplayer" → MultiplayerHome
  - "/multiplayer/create" → CreateRoom
  - "/multiplayer/join" → JoinRoom
  - "/multiplayer/lobby/:roomId" → RoomLobby
  - "/multiplayer/game/:roomId" → MultiplayerGame
  - "/multiplayer/results/:roomId" → MultiplayerResults

## Authentication and presence (AuthContext.tsx, lib/ensureUser.ts, firebase/config.ts)

- Every visitor has a real Firebase uid. Guests are anonymous users
  (`signInAnonymously`, started eagerly in the background once auth reports no
  user; crawlers are skipped). Rendering never waits on auth.
- `useAuth()`: `user` (Firebase User | null), `isGuest` (anonymous or no user),
  `loading`, `ensureUser()`, `signInAsGuest`, `signInWithEmail`, `signUpWithEmail`,
  `signInWithGoogle`, `signOut`, `updateDisplayName`, `deleteAccount({password?})`.
- Upgrading a guest links the credential (`linkWithCredential` / `linkWithPopup`)
  so the uid is kept; local guest runs are imported. If the credential already
  belongs to an account, the user is signed into it and guest progress is dropped.
- Guests get a generated display name (`src/lib/guestName.ts`).
- Optional App Check (reCAPTCHA Enterprise) when `VITE_APPCHECK_SITE_KEY` is set.
- Presence: `presence/{uid}` (self-only), written while in a room (`src/lib/presence.ts`).

## Multiplayer rooms and chat (hooks/useRoom.ts, hooks/useChat.ts)

- RTDB `rooms/{CODE}`: `hostUid`, `status`, `mode {id, custom?}`, `maxPlayers`,
  `allowVisualAids`, `createdAt`, `lastActivityAt`, `startedAt` + `seed` (host, at
  start), `slots/{0..9}` (seats), `kicked/{uid}`, `players/{uid}`, `chat`, `lastChatAt/{uid}`.
- Player nodes are written only by their owner; scores are scoped to a round
  (`round == startedAt`), monotonic and rate-bounded by the rules.
- `roomApi` (plain functions) / `useRoom()` (same + `loading`): createRoom, joinRoom,
  leaveRoom, setPlayerReady, startGame, updatePlayerScore(roomId, score, correct?),
  finishGame(roomId, {finishMs?}), resetRoom, incrementWins, updateGameMode,
  kickPlayer, updateRoomSettings, transferHost, subscribeToRoom.
- `Room.gameMode` is the legacy GameMode resolved from `mode` (src/lib/roomMode.ts);
  `Room.startedAt` is the local-clock time play begins (server start + 3 s countdown).
- Host claim: when the host's node is gone or disconnected, the earliest-joined
  connected player claims host. Rooms idle > 6 h may be deleted by anyone signed in.
- Chat: `postMessage`, `subscribeToChat` / `useChat()`; 1–300 chars, 1 msg/s per user.

## Game modes (src/types/gameMode.ts)

- export interface GameMode: { id, name, description, difficulty, duration, questions: QuestionSetting[], isOfficial?, icon?, color? }
- export const OFFICIAL_GAME_MODES: GameMode[] — curated list of official modes
- Helpers present and used elsewhere (e.g., isSpeedrunMode imported in stats/history hooks)

## Persistent data (src/data)

- `saveRun(summary)`: registered users write `users/{uid}/runs/{id}` + `userStats/{uid}`
  in a transaction, then upsert `leaderboards/{modeId}/entries/{uid}` if ranked,
  completed and improved. Guests keep the last 50 runs in localStorage.
- Hooks: `useRunHistory({limit, modeId, since})`, `useUserStats()`,
  `usePersonalBest(modeId)`, `useLeaderboard(modeId, {limit})`, `useGameSettings()`.
- `src/data/limits.ts` re-exports the engine's `SCORE_LIMITS`/`isRankedModeId`; the
  numbers are mirrored in the security rules (a unit test checks they agree).
- Legacy `useStats` / `useGameHistory` are thin wrappers over the data layer.

## Data model and security

- `firestore.rules`: owner-only profiles/runs/stats (registered accounts write),
  public leaderboards writable by registered owners for ranked modes only, only
  when the score improves, with per-format plausibility checks; daily is create-only.
- `database.rules.json` is generated by `scripts/build-database-rules.mjs`
  (`npm run rules:db`). Rules tests: `npm run test:rules` (needs emulators).

## PWA and service worker

- public/sw.js: network-first navigations (offline fallback to the last good
  index.html), cache-first for hashed /assets/** only, no Firebase/Google traffic.
- Registered by `registerServiceWorker()` from src/lib/serviceWorker.ts.
- Security headers + caching live in firebase.json (CSP, HSTS, COOP, ...).

## Environment

- Firebase config (src/firebase/config.ts) uses Vite env vars:
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_DATABASE_URL
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_STORAGE_BUCKET
  - VITE_FIREBASE_MESSAGING_SENDER_ID
  - VITE_FIREBASE_APP_ID
  - Optional: VITE_USE_FIREBASE_EMULATORS === "true" to connect to local emulators (ports via VITE_EMULATOR_*)
  - Optional: VITE_APPCHECK_SITE_KEY enables App Check (reCAPTCHA Enterprise)

## Error handling

- Global ErrorBoundary wraps the app; provides default UI and Try Again / Return Home actions; shows stack trace in development

## Notes for agents

- Prefer using the path alias "@" for imports from src/
- Guests are anonymous Firebase users; check `isGuest` from `useAuth()`, never uid prefixes
- Leaderboards live at `leaderboards/{modeId}/entries/{uid}`
- Multiplayer room permissions and flows are enforced by RTDB rules and validated by hook logic
