# Based Math Game - Technical Reference

## Project Overview
React-based multiplayer quiz game for practicing base conversion (Binary, Octal, Decimal, Hexadecimal) with Firebase backend, real-time multiplayer, stats tracking, and leaderboards.

**Project:** `ts_based_website` | **Firebase:** `based-math-game` | **License:** GPL-3.0
**Repository:** https://github.com/hajin-park/based-math-game

---

## Tech Stack

**Core:** React 19.2.0 + TypeScript 5.9.3 + Vite 7.1.11 + Tailwind CSS 3.4.3
**Backend:** Firebase JS SDK 12.4.0 (Firestore + Realtime Database + Auth + Hosting)
**UI:** shadcn/ui (Radix primitives) + lucide-react icons
**Forms:** React Hook Form 7.51.2 + Zod 3.22.4
**Routing:** React Router DOM 6.22.3
**Timer:** react-timer-hook 3.0.7
**PWA:** Service Worker + Web Manifest

---

## Design System

### Overview
Modern design system built on shadcn/ui components with Tailwind CSS and Cyan primary color theme (HSL 189 94% 43%).

**Features:**
- Glassmorphism with backdrop blur effects
- Clean minimalist layouts
- Smooth animations (fade-in, slide-in, pulse-glow)
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Full light/dark theme support

### Color Palette

#### Primary Colors
```css
--primary: 189 94% 43%;           /* Cyan - Main brand color */
--primary-foreground: 0 0% 100%;  /* White text on primary */
--accent: 189 94% 53%;            /* Lighter cyan for accents */
--accent-foreground: 0 0% 100%;   /* White text on accent */
```

#### Semantic Colors
```css
--success: 142 76% 36%;           /* Green for success states */
--success-foreground: 0 0% 100%;
--warning: 38 92% 50%;            /* Orange/Yellow for warnings */
--warning-foreground: 0 0% 100%;
--info: 217 91% 60%;              /* Blue for informational messages */
--info-foreground: 0 0% 100%;
--destructive: 0 84% 60%;         /* Red for destructive actions */
--destructive-foreground: 0 0% 100%;
```

#### Neutral Colors
```css
--background: 0 0% 100%;          /* Page background (light mode) */
--foreground: 222 47% 11%;        /* Main text color */
--card: 0 0% 100%;                /* Card background */
--card-foreground: 222 47% 11%;   /* Card text */
--muted: 210 40% 96%;             /* Muted backgrounds */
--muted-foreground: 215 16% 47%;  /* Muted text */
--border: 214 32% 91%;            /* Border color */
```

### Typography

**Font Family:** System font stack (primary), Monospace (code/numbers)
**Font Sizes:** text-xs (12px) to text-5xl (48px)
**Font Weights:** 400 (normal) to 900 (black)

### Spacing & Layout

**Container Widths:** max-w-4xl (896px) to max-w-5xl (1024px)
**Page Padding:** px-4 py-8 (16px horizontal, 32px vertical)
**Border Radius:** --radius: 0.75rem (12px)

### Shadows
```css
--shadow-glow: 0 0 20px rgb(6 182 212 / 0.3);      /* Cyan glow */
--shadow-glow-lg: 0 0 40px rgb(6 182 212 / 0.4);   /* Larger glow */
```

### Custom Utility Classes

```css
.gradient-text { @apply bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent; }
.hover-lift { @apply transition-transform duration-200 hover:-translate-y-1; }
.glass { @apply bg-white/80 dark:bg-gray-900/80 backdrop-blur-md; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
```

### Component Patterns

**Page Headers:** Icon + gradient text + description
**Cards:** border-2 shadow-lg with CardHeader/CardContent
**Interactive Cards:** hover:shadow-md hover:border-primary/50 transition-all hover-lift
**Buttons:** Primary (default), Secondary (outline), Destructive variants

### Icons

**Library:** Lucide React
**Common:** Sparkles, Trophy, Users, Gamepad2, TrendingUp, Shield, Settings, Info, AlertTriangle

### Responsive Design

**Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
**Approach:** Mobile-first with responsive grids

### Accessibility

**Focus States:** focus:ring-2 focus:ring-primary focus:ring-offset-2
**Color Contrast:** WCAG 2.1 AA compliance
**Semantic HTML:** Proper heading hierarchy, ARIA labels, keyboard navigation
**Motion Preferences:** Respects prefers-reduced-motion
**Dark Mode:** Full support with automatic theme switching

---

## Architecture

### Directory Structure
```
src/
├── components/          # Shared components
│   ├── ui/             # shadcn UI components (button, card, form, input, alert-dialog, etc.)
│   ├── ErrorBoundary.tsx
│   ├── ProtectedRoute.tsx
│   ├── ConnectionStatus.tsx
│   ├── ProfileDropdown.tsx
│   ├── Countdown.tsx
│   ├── ExitButton.tsx       # Exit button with confirmation dialog for games
│   └── KickedModal.tsx      # Modal shown when user is kicked from room
├── contexts/           # React contexts
│   ├── AuthContext.tsx      # Authentication & guest user system
│   ├── GameContexts.tsx     # Quiz & Result contexts
│   └── ThemeContext.tsx     # Light/Dark mode
├── features/           # Feature modules
│   ├── quiz/          # Quiz settings, questions, results components
│   ├── tutorials/     # Tutorial components
│   └── ui/            # Navigation-Bar, Footer
├── firebase/          # Firebase config
├── hooks/             # Custom hooks
│   ├── useRoom.ts
│   ├── useStats.ts
│   ├── useGameHistory.ts
│   ├── useGameSettings.ts
│   ├── useKeyboardShortcuts.ts
│   └── useTabVisibility.ts
├── lib/               # Utility libraries
│   └── avatarGenerator.ts   # Pixel art avatar generation
├── pages/             # Route pages
│   ├── profile/       # Profile pages (ProfileLayout, ProfileOverview, ProfileSettings, ProfileGameSettings)
│   ├── Home.tsx, Quiz.tsx, Results.tsx, Leaderboard.tsx, Stats.tsx
│   ├── Login.tsx, Signup.tsx
│   ├── MultiplayerHome.tsx, CreateRoom.tsx, JoinRoom.tsx, RoomLobby.tsx
│   ├── MultiplayerGame.tsx, MultiplayerResults.tsx
│   ├── Settings.tsx, Usage.tsx, Tutorials.tsx
│   ├── About.tsx, Privacy.tsx, Terms.tsx
│   └── Error.tsx
├── types/             # TypeScript types (gameMode.ts)
├── utils/             # Utilities (Layout, analytics, ScrollToTop)
└── main.tsx           # App entry + router config
```

### Routing

**Game:** / (Home), /singleplayer, /quiz, /results
**Multiplayer:** /multiplayer, /multiplayer/create, /multiplayer/join, /multiplayer/lobby/:roomId, /multiplayer/game/:roomId, /multiplayer/results/:roomId
**Stats:** /leaderboard, /stats
**Content:** /how-to-play, /tutorials, /about, /privacy, /terms
**Profile:** /profile, /profile/settings, /profile/game-settings
**Auth:** /login, /signup

### State Management

**Contexts:**
- `AuthContext` - User auth, sign-in/out, guest system
- `ThemeContext` - Light/Dark mode with localStorage
- `QuizContext` - Quiz settings (questions, duration, gameModeId)
- `ResultContext` - Quiz results (score, duration, accuracy)

---

## Firebase Integration

### Dual-Database Architecture

**Firestore (Persistent):** User profiles, stats, game history, leaderboards
**Realtime Database (Ephemeral):** Guest sessions, multiplayer rooms, presence

### Configuration

**File:** `src/firebase/config.ts`
**Exports:** auth, database (RTDB), firestore
**Emulators:** Auth (9099), Database (9000), Firestore (8080) - controlled by `VITE_USE_FIREBASE_EMULATORS`

### Database Schema

#### Firestore (Persistent)
- `/users/{userId}` - User profiles (uid, displayName, email, photoURL, gameSettings)
- `/userStats/{userId}` - User stats (gamesPlayed, totalScore, highScore, averageScore, accuracy)
- `/userStats/{userId}/gameHistory/{gameId}` - Game history (score, duration, gameModeId, accuracy)
- `/leaderboard-{gameModeId}/{userId}` - Leaderboards (displayName, score, timestamp)

#### Realtime Database (Ephemeral)
- `/rooms/{roomId}` - Multiplayer rooms (hostUid, gameMode, players, status, maxPlayers, allowVisualAids, enableCountdown)
- `/users/{guestId}` - Guest users (uid starts with "guest_", displayName, isGuest: true)
- `/presence/{userId}` - Presence tracking (uid, online, lastSeen)

### Security Rules

**Files:** `database.rules.json` (RTDB), `firestore.rules` (Firestore)
**Key Features:**
- Supports authenticated users and guest users (UIDs starting with `guest_`)
- Guest users CANNOT write to global leaderboards
- All users can create/join rooms

---

## Authentication System

### AuthContext

**Guest Users:** localStorage-based (NO Firebase Anonymous Auth), UIDs format: `guest_{timestamp}_{random}`
**Authentication:** Email/password, Google OAuth
**Presence:** Monitors `.info/connected`, uses `onDisconnect()` for cleanup
**Methods:** signInAsGuest, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, updateDisplayName, deleteAccount

### ThemeContext

**Features:** Light/Dark mode toggle, localStorage persistence, system preference detection
**Methods:** theme, toggleTheme, setTheme

---

## Game Modes

### Official Game Modes

**File:** `src/types/gameMode.ts`
**Total:** 48 official modes
**Categories:**
- Timed (24 modes): 15s and 60s variants
- Speed Run (24 modes): 10q and 30q variants
- Base Types: Binary, Octal, Hex, All Bases
- Difficulty: Easy (0-15), Medium (0-255), Hard (0-4095)

**Interface:**
```typescript
interface GameMode {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Custom';
  duration: number;
  questions: QuestionSetting[];  // [fromBase, toBase, rangeLower, rangeUpper][]
  isOfficial?: boolean;
  targetQuestions?: number;  // For speed run modes
}
```

---

## Game Settings

### User Settings

**Storage:** Firestore `/users/{userId}/gameSettings`
**Settings:**
- `groupedDigits` (default: false) - Groups digits with spaces/commas
- `indexValueHints` (default: false) - Shows positional values under digits
- `countdownStart` (default: true) - 3-2-1 countdown before game

**Multiplayer Host Controls:**
- `allowVisualAids` - Enable/disable visual aids for all players
- `enableCountdown` - Enable/disable countdown

---

## Core Game Logic

### Base Conversion

**Mappings:** binary (2), octal (8), decimal (10), hexadecimal (16)
**Question Generation:** `generateQuestion(fromBase, rangeLower, rangeUpper, seed?)` - Uses seeded random for multiplayer
**Conversion:** `convertBase(inputString, fromBase, toBase)` - parseInt → toString
**Validation:** `validateAnswer(expected, actual, toBase)` - Cleans and compares strings

### Scoring

**Rules:** +1 per correct answer, auto-validation on keystroke, no time bonus

### Custom Playground

**Components:**
- `Playground-Settings.component.tsx` - Form for custom settings (base selection, ranges, duration)
- `Chosen-Settings-Table.component.tsx` - Settings display with badges

**Integration:** Inline in Singleplayer and Multiplayer Create Room pages

---

## Multiplayer System

### Room Management

**Hook:** `useRoom.ts`
**Functions:** createRoom, joinRoom, leaveRoom, setPlayerReady, startGame, updatePlayerScore, finishGame, resetRoom, subscribeToRoom
**Room Code:** 8-character alphanumeric (A-Z, 0-9), case-insensitive
**Status:** waiting → playing → finished
**Host:** Auto-ready, can start game, transfer on disconnect
**Invite Link:** `https://domain.com/multiplayer/join?code=ROOMCODE`

### Real-time Sync

**Features:**
- Room state synced via RTDB
- Deterministic questions (seeded random using roomId + score)
- Timer sync using `startedAt` timestamp
- Host disconnect handling (transfer or delete room)
- Room reset after game

---

## Stats & Leaderboards

### Stats Tracking

**Hook:** `useStats.ts`
**Function:** `saveGameResult(result: GameResult)`
**Updates:** User stats, game history (all users), leaderboards (authenticated only)
**Guest Behavior:** Stats tracked, leaderboard updates blocked, data cleaned on disconnect

### Leaderboard

**Filtering:** Filters out guest users (UID starts with `guest_` or `isGuest: true`), top 50 by score

### Game History

**Hook:** `useGameHistory.ts`
**Queries:** getRecentGames, getGamesInTimeRange, getTodayGames, getThisWeekGames, getThisMonthGames
**Analytics:** Time-based filtering, calculates totals and averages

---

## Key Hooks

**useRoom:** Room management (createRoom, joinRoom, leaveRoom, setPlayerReady, startGame, updatePlayerScore, finishGame, resetRoom, subscribeToRoom)
**useStats:** User statistics tracking (gamesPlayed, totalScore, averageScore, highScore)
**useGameHistory:** Time-based game history queries (getRecentGames, getTodayGames, getThisWeekGames, getThisMonthGames)
**useGameSettings:** User game settings (groupedDigits, indexValueHints, countdownStart) with Firestore sync
**useKeyboardShortcuts:** Global keyboard shortcuts (Escape to home)
**useTabVisibility:** Pauses timer when tab hidden (singleplayer only)

---

## UI Components

### shadcn Components
button, card, form, input, label, select, scroll-area, separator, toast, dialog, tabs, badge, table, drawer, dropdown-menu, navigation-menu, avatar, skeleton, switch, alert, alert-dialog, popover, sheet

### Custom Components

**Game:** ExitButton, KickedModal, Quiz-Prompt (keystroke tracking), Quiz-Stats (MM:SS timer), Base-Select, Range-Input, Duration-Select, Chosen-Settings-Table, Game-Mode-Select, Playground-Settings
**UI:** Navigation-Bar, ProfileDropdown, Footer, ErrorBoundary, ProtectedRoute, ConnectionStatus
**Lib:** avatarGenerator (8x8 pixel art avatars)

### Pages

All pages redesigned with Cyan theme, consistent patterns, and enhanced UX.

**Game:** Home, Quiz, Results, SingleplayerMode, MultiplayerGame
**Multiplayer:** MultiplayerHome, CreateRoom, JoinRoom, RoomLobby, MultiplayerResults
**Stats:** Stats, Leaderboard
**Profile:** ProfileLayout, ProfileOverview, ProfileSettings, ProfileGameSettings
**Content:** Usage, Tutorials, About, Privacy, Terms
**Auth:** Login, Signup



---

## PWA & SEO

**Service Worker:** Cache-first for assets, network-first for API
**Manifest:** Standalone app, theme color #0c0a09
**SEO Files:** sitemap.xml, robots.txt, llms.txt

---

## Analytics

**File:** `src/utils/analytics.ts`
**Events:** logGameStart, logGameComplete, logGameAbandoned, logRoomCreated, logRoomJoined, logRoomLeft, logError

---

## Build & Deployment

**Scripts:** `npm run dev` (port 5173), `npm run build`, `npm run preview`, `npm run lint`
**Build Output:** ~1,056 kB JS (~285 kB gzipped), ~52 kB CSS (~9.5 kB gzipped)
**CI/CD:** GitHub Actions → Firebase Hosting (main branch), preview URLs (PRs)

## Guest User System

**Implementation:** localStorage + RTDB presence (NO Firebase Anonymous Auth)
**UID Format:** `guest_{timestamp}_{random}`
**Features:** Full multiplayer, stats tracking, cannot appear on leaderboards
**Lifecycle:** Auto-created → presence tracked → cleanup on disconnect → can upgrade to authenticated
**Security:** Triple protection (database rules + stats hook + UI filtering)

---

## Configuration

### Environment Variables
Firebase config in `.env`: API_KEY, AUTH_DOMAIN, DATABASE_URL, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID, USE_FIREBASE_EMULATORS

### Path Aliases
`@` → `./src`, `@features` → `./src/features`

### TypeScript
Strict mode, target ES2020, module ESNext

### Tailwind
Base color Stone, class-based dark mode, CSS variables, radius 0.5rem

### Firebase Hosting
SPA rewrites, clean URLs, content-type headers, emulators (Auth 9099, Database 9000, UI 4000)

### Code Quality
No `any` types, proper error handling, React Hook dependencies, memory cleanup

### Mobile
`height: 100dvh`, `inputMode="numeric"`, `pattern="[0-9a-fA-F]*"`, 44x44px touch targets

### Accessibility
ARIA labels, keyboard navigation, semantic HTML, WCAG 2.1 AA

### Performance
Bundle ~285 kB gzipped, target Lighthouse 90+

---

## Development

**Setup:** `npm install`, create `.env`, `npm run dev` (port 5173)
**Emulators:** `firebase emulators:start` (Auth 9099, Database 9000, UI 4000)
**Testing:** Manual browser testing, multiple tabs for multiplayer
**Deployment:** `npm run build && firebase deploy --only hosting`
**CRITICAL:** Increment cache version in `public/sw.js` before deployment to prevent blank screen

---

## Common Patterns

### Firebase Realtime Database Queries
```typescript
// Read once
const snapshot = await get(ref(database, `users/${userId}`));
const data = snapshot.val();

// Listen to changes
const unsubscribe = onValue(ref(database, `rooms/${roomId}`), (snapshot) => {
  const data = snapshot.val();
  // Update state
});
// Cleanup
return () => unsubscribe();

// Write data
await set(ref(database, `users/${userId}/stats`), statsData);

// Update specific fields (use relative paths from ref)
await update(ref(database, `rooms/${roomId}`), {
  status: "playing",
  'players/uid123/score': 10  // Relative path from roomId
});

// Delete data
await remove(ref(database, `rooms/${roomId}`));

// Set up disconnect handler
const playerRef = ref(database, `rooms/${roomId}/players/${userId}`);
onDisconnect(playerRef).remove();
```

### Authentication Patterns
```typescript
// Get current user (can be Firebase User or GuestUser)
const { user, isGuest } = useAuth();

// Check if user is a guest
function isGuestUser(user: AppUser | null): user is GuestUser {
  return user !== null && 'isGuest' in user && user.isGuest === true;
}

// Sign in with email
await signInWithEmail(email, password);

// Sign up with email
await signUpWithEmail(email, password, displayName);

// Sign in with Google
await signInWithGoogle();

// Sign out (creates new guest user)
await signOut();

// Update display name (works for both guest and authenticated)
await updateDisplayName(newName);

// Delete account (authenticated users only)
await deleteAccount();
```

### Context Usage
```typescript
// Access context
const { settings, setSettings } = useContext(QuizContext);
const { user, loading } = useContext(AuthContext);

// Update context
setSettings({ questions: [...], duration: 60 });
```

### Error Handling
```typescript
try {
  // Firebase operation
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  // Show toast or alert
}
```

---

## Troubleshooting

**Build fails:** Check types, imports, Hook dependencies
**Firebase fails:** Verify `.env`, project settings, emulators
**Timer issues:** Check `react-timer-hook`, expiry calculation, useEffect cleanup
**Multiplayer sync:** Verify RTDB rules, presence system, room status
**PWA issues:** Check service worker, manifest.json, HTTPS

---



---

## Best Practices

**Hook Dependencies:** Use specific properties (`[user?.uid]`) instead of entire objects
**Duplicate Prevention:** Use `useRef` flags for one-time operations
**Stats Tracking:** Check `trackStats` before saving
**Layout Stability:** Minimum heights, skeleton loaders, smooth transitions

### Multiplayer

**Win Counter:** Room-specific, persists on reset, stored at `/rooms/{roomId}/players/{playerId}/wins`
**Host Settings:** updateGameMode() for waiting rooms, real-time sync, security validated
**Cleanup:** Guest users remove all data on disconnect, authenticated users set offline, host disconnect deletes room

### Timer

**Multiplayer:** `autoStart: false`, manual restart with `lastStartedAtRef` tracking, sync via `room.startedAt`
**Effects:** Use `useRef` to store timer object, prevent infinite loops

### Room Management

**Host Transfer:** subscribeToRoom detects missing host, transfers to first player, auto-ready
**Player Limit:** 2-10 players, validated in joinRoom()
**Null Safety:** Always check `room.players` exists

### Question Randomization

**Seeded Fisher-Yates:** Uses `room.startedAt` as seed, LCG for deterministic randomness, ensures all players see same questions

### Database Rules

**Partial Updates:** Avoid strict validation, allow partial updates for `score`, `ready`, `finished`

---

## License & Credits

**License:** GNU General Public License v3.0
**Inspired by:** [zetamac](https://arithmetic.zetamac.com)
**UI Components:** [shadcn/ui](https://ui.shadcn.com)
**Icons:** [Lucide](https://lucide.dev)
**Backend:** [Firebase](https://firebase.google.com)
