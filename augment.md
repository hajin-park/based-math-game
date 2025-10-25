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
  - AuthContext.tsx — auth, guest ID, presence
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

## Recent bug fixes (2025-01-24)

### Multiplayer Room Bug Fixes

- **Fixed Guest User Host Transfer** (src/hooks/useRoom.ts):
  - Updated `subscribeToRoom` to detect when guest host is removed (not just disconnected)
  - Changed host transfer logic from checking only `host?.disconnected === true` to also checking `!host`
  - Guest users are completely removed from database on disconnect, while authenticated users are marked as disconnected
  - Host now properly transfers to another player when guest host disconnects
- **Fixed Room Leave Detection** (all multiplayer room pages):
  - Updated cleanup effects to properly detect navigation away from room
  - Changed from using captured `currentPath` to using `window.location.pathname` during cleanup
  - Users now properly leave rooms when navigating to different pages (not just on refresh/disconnect)
  - Removed unused `location` imports from `useLocation()` hook
- **Fixed Firebase Security Rules** (database.rules.json):
  - Changed from invalid `.beginsWith('guest_')` to `.matches(/^guest_/)`
  - Guest user authentication now works correctly

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

## Authentication and presence (AuthContext.tsx, firebase/config.ts)

- Firebase initialized from Vite env vars (see "Environment")
- Guest IDs generated with prefix: guest*{timestamp}*{random}
- Exposed methods include: signInAsGuest, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, updateDisplayName, deleteAccount
- Presence written to RTDB at presence/{uid} with onDisconnect handlers for both guest and authenticated users

## Multiplayer rooms and chat (hooks)

- useRoom.ts
  - createRoom(roomMode, maxPlayers), joinRoom(roomId), leaveRoom
  - Host/game flow: startGame(roomId), finishGame(roomId), resetRoom
  - Player state: setPlayerReady, updatePlayerScore, incrementWins
  - Room management: kickPlayer(host-only), transferHost, updateRoomSettings, updateGameMode
  - Subscriptions: subscribeToRoom with cleanup; room deletes when all players are disconnected or kicked
- useChat.ts
  - sendMessage(roomId, message), sendSystemMessage(roomId, message)
  - subscribeToMessages(roomId, limit?, onMessage)
  - Chat message shape includes senderId, displayName, message, timestamp; code also uses isSystem flag

## Game modes (src/types/gameMode.ts)

- export interface GameMode: { id, name, description, difficulty, duration, questions: QuestionSetting[], isOfficial?, icon?, color? }
- export const OFFICIAL_GAME_MODES: GameMode[] — curated list of official modes
- Helpers present and used elsewhere (e.g., isSpeedrunMode imported in stats/history hooks)

## Persistent stats and leaderboards (useStats.ts, useGameHistory.ts)

- saveGameResult writes into Firestore userStats and user gameHistory (if non-guest)
- Leaderboards stored per mode in flat collections: "leaderboard-{gameModeId}"
  - update logic treats speedrun modes as "lower is better", timed modes as "higher is better"
  - Always syncs latest displayName on write
- useGameHistory provides: fetchHistory(timeRange, limit), getStatsForTimeRange, getScoresByGameMode, getDurationsByGameMode, getLeaderboardPlacements

## Data model and security

- Firestore (firestore.rules)
  - Helpers: isAuthenticated(), isOwner(uid), isNotGuest() where guest UIDs match /^guest\_.\*/
  - /users/{userId}
    - read: owner; create/update: owner && isNotGuest; delete: owner
  - /userStats/{userId}
    - read: owner; create/update: owner && isNotGuest with required numeric fields: gamesPlayed, totalScore, highScore, averageScore, lastPlayed; optional: totalKeystrokes, totalBackspaces, averageAccuracy
    - delete: owner
  - /userStats/{userId}/gameHistory/{gameId}
    - read: owner; create: owner && isNotGuest with required fields: score (number), duration (number), gameModeId (string), timestamp (number); optional: totalKeystrokes, backspaceCount, accuracy
    - delete: owner
  - /leaderboard-{gameModeId}/{userId} (any collection matching /^leaderboard-.\*/)
    - read: public; create/update: owner && isNotGuest with required fields: displayName (string), score (number), timestamp (number), gameModeId (string); optional: accuracy (number); if isGuest present, must be false
    - delete: owner
- Realtime Database (database.rules.json)
  - /users/{uid}
    - read: uid === auth.uid OR uid starts with "guest\_"
    - write: uid === auth.uid OR (guest\_ uid and newData.uid === uid and newData.isGuest === true)
  - /rooms/{roomId}
    - read: public
    - write: allowed for hostUid, guest host, any joined authenticated user, or if new hostUid points to an existing player
    - validate: must have children [hostUid, gameMode, status]
    - players/{playerId}.write: self OR guest self OR host
    - gameState.write: host or guest host
    - chat/{messageId}
      - read: public
      - write: by joined authenticated user OR guest sender who is in players
      - validate: requires senderId, displayName, message (1..500 chars), timestamp
  - /gameModes: read-only
  - /presence/{uid}
    - read: public; write: self OR guest self when newData absent or matches uid

## PWA and service worker

- public/sw.js registered in main.tsx
  - Cache name includes build timestamp (updated by scripts/update-sw-version.js)
  - Network-first for JS/CSS/HTML and assets; cache-first for other static assets
  - Skips caching Firebase/Google API requests
  - Auto-reload on controllerchange
- public/manifest.json present

## Environment

- Firebase config (src/firebase/config.ts) uses Vite env vars:
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_DATABASE_URL
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_STORAGE_BUCKET
  - VITE_FIREBASE_MESSAGING_SENDER_ID
  - VITE_FIREBASE_APP_ID
  - Optional: VITE_USE_FIREBASE_EMULATORS === "true" to connect to local emulators

## Error handling

- Global ErrorBoundary wraps the app; provides default UI and Try Again / Return Home actions; shows stack trace in development

## Notes for agents

- Prefer using the path alias "@" for imports from src/
- Firestore rejects writes from guest\_\* UIDs; guest users operate via RTDB
- Leaderboards are per-mode collections named "leaderboard-{modeId}"
- Multiplayer room permissions and flows are enforced by RTDB rules and validated by hook logic
