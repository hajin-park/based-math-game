# Based Math Game - Technical Reference

## Project Overview
React-based multiplayer quiz game for practicing base conversion (Binary, Octal, Decimal, Hexadecimal) with Firebase backend, real-time multiplayer, stats tracking, and leaderboards.

**Project:** `ts_based_website` | **Firebase:** `based-math-game` | **License:** GPL-3.0
**Repository:** https://github.com/hajin-park/based-math-game

---

## Tech Stack

**Core:** React 19.2.0 + TypeScript 5.9.3 + Vite 7.1.11 + Tailwind CSS 3.4.3
**Backend:** Firebase JS SDK 12.4.0 (Firestore + Realtime Database + Auth + Hosting)
**UI:** shadcn/ui (Radix primitives) + lucide-react icons + Framer Motion 12.23.11
**Forms:** React Hook Form 7.51.2 + Zod 3.22.4
**Routing:** React Router DOM 6.22.3
**Timer:** react-timer-hook 3.0.7
**PWA:** Service Worker + Web Manifest

---

## Design System

### Overview
Modern design system built on shadcn/ui components with Tailwind CSS and Slate primary color theme using OKLCH color space.

**Features:**
- Glassmorphism with backdrop blur effects
- Clean minimalist layouts with functional-first design
- Smooth animations (fade-in, slide-in) - only when purposeful
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Full light/dark theme support

### Color Palette (OKLCH)

#### Primary Colors - Slate Theme
```css
/* Light Mode */
--primary: oklch(0.208 0.042 265.755);           /* Slate 900 */
--primary-foreground: oklch(0.984 0.003 247.858); /* Slate 50 */
--background: oklch(1 0 0);                      /* Pure white */
--foreground: oklch(0.129 0.042 264.695);        /* Slate 950 */

/* Dark Mode */
--primary: oklch(0.929 0.013 255.508);           /* Slate 200 */
--primary-foreground: oklch(0.208 0.042 265.755); /* Slate 900 */
--background: oklch(0.129 0.042 264.695);        /* Slate 950 */
--foreground: oklch(0.984 0.003 247.858);        /* Slate 50 */
```

#### Semantic Colors (OKLCH)
```css
--success: oklch(0.6 0.118 184.704);             /* Green */
--success-foreground: oklch(0.984 0.003 247.858);
--warning: oklch(0.828 0.189 84.429);            /* Amber */
--warning-foreground: oklch(0.129 0.042 264.695);
--info: oklch(0.488 0.243 264.376);              /* Blue */
--info-foreground: oklch(0.984 0.003 247.858);
--destructive: oklch(0.577 0.245 27.325);        /* Red */
--destructive-foreground: oklch(0.984 0.003 247.858);
```

#### Neutral Colors (OKLCH)
```css
--muted: oklch(0.968 0.007 247.896);             /* Slate 100 (light) */
--muted-foreground: oklch(0.554 0.046 257.417);  /* Slate 500 (light) */
--border: oklch(0.929 0.013 255.508);            /* Slate 200 (light) */
--card: oklch(1 0 0);                            /* White (light) */
```

### Typography

**Font Family:** System font stack (primary), Monospace (code/numbers)
**Font Sizes:** text-xs (12px) to text-8xl (96px)
**Font Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
**Tracking:** tracking-tight for headings

### Spacing & Layout

**Container Widths:** max-w-4xl (896px) to max-w-6xl (1152px)
**Page Padding:** px-4 py-8 (16px horizontal, 32px vertical) to py-20 (80px vertical)
**Border Radius:** --radius: 0.625rem (10px)

### Custom Utility Classes

```css
/* Glassmorphism */
.glass { @apply bg-background/80 backdrop-blur-md border border-border/50; }
.glass-card { @apply bg-card/80 backdrop-blur-md border border-border/50; }
.glass-nav { @apply bg-background/60 backdrop-blur-lg border-b border-border/50; }

/* Gradients */
.gradient-text { @apply bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent; }
.gradient-subtle { @apply bg-gradient-to-b from-background to-muted/30; }

/* Animations - Only use when purposeful */
.animate-in { animation: animate-in 0.3s ease-out; }
.animate-in-slow { animation: animate-in 0.6s ease-out; }
.fade-in-up { animation: fade-in-up 0.6s ease-out; }

/* Transitions - Only use when functionally necessary */
.transition-smooth { @apply transition-all duration-300 ease-in-out; }
```

### Component Patterns

**Page Headers:** Icon + gradient text + description
**Cards:** Clean borders with subtle shadows, no purposeless hover effects
**Interactive Cards:** hover:shadow-lg hover:border-primary/50 transition-all duration-200 (functional feedback only)
**Buttons:** Primary (default), Secondary (outline), Ghost, Destructive variants
**Separators:** Used between major sections for visual hierarchy

### Icons

**Library:** Lucide React
**Common:** Trophy, Users, Gamepad2, TrendingUp, Shield, Settings, Info, AlertTriangle, Play, BookOpen, Filter, Target, Binary, Hash, Zap, Clock, BarChart3, Code

### Responsive Design

**Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
**Approach:** Mobile-first with responsive grids (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
**Container Padding:** Responsive padding (1rem default, 2rem sm, 4rem lg, 5rem xl, 6rem 2xl)

### Accessibility

**Focus States:** focus:ring-2 focus:ring-primary focus:ring-offset-2
**Color Contrast:** WCAG 2.1 AA compliance with OKLCH color space
**Semantic HTML:** Proper heading hierarchy, ARIA labels, keyboard navigation
**Motion Preferences:** Respects prefers-reduced-motion
**Dark Mode:** Full support with automatic theme switching
**Touch Targets:** Minimum 44x44px for mobile interactions

### Animation Library (Framer Motion)

**Location:** `src/lib/animations.ts`

**Philosophy:** Minimal, purposeful motion only - no decorative animations

**Available Variants:**
- `fadeIn` - Simple opacity fade (0 → 1)
- `fadeInUp` - Fade with subtle upward motion (y: 20 → 0)
- `staggerContainer` - Container for staggered children animations
- `staggerItem` - Individual item in staggered list

**Transitions:**
- `transitions.fast` - Spring (stiffness: 400, damping: 30) - Quick interactions
- `transitions.smooth` - Spring (stiffness: 300, damping: 25) - Standard transitions

**Usage Example:**
```tsx
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, staggerItem } from '@/lib/animations';

<motion.div variants={fadeIn} initial="hidden" animate="visible">
  Content
</motion.div>

<motion.ul variants={staggerContainer} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={staggerItem}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

**Guidelines:**
- Only use animations when they serve a functional purpose (feedback, hierarchy, transitions)
- Avoid decorative animations that distract from the educational quiz game mission
- All animations automatically respect `prefers-reduced-motion`
- Keep animations subtle and fast (< 0.3s for most interactions)

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
│   ├── avatarGenerator.ts   # Pixel art avatar generation
│   └── animations.ts        # Framer Motion animation variants
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
- `groupedDigits` (default: false) - Groups digits with spaces/commas for readability
- `indexValueHints` (default: false) - Shows positional values under digits with proper spacing
- `countdownStart` (default: true) - 3-2-1 countdown before game starts

**Visual Formatting:**
- Index hints use proper spacing with `result.join('').trim()` to avoid double spacing
- Responsive text sizing for mobile devices (text-2xl sm:text-3xl md:text-4xl)
- Horizontal scrolling for long numbers with `overflow-x-auto`

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

**Game Selection Features:**
- Filtering by base type (All, Binary, Octal, Hexadecimal, All Bases Mixed)
- Filtering by difficulty (All, Easy, Medium, Hard, Expert)
- Filtering by game type (All, Timed, Speed Run)
- Collapsible details showing question types with value ranges and speed run info
- Maximum player selection (2-10 players)

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

**Game:**
- ExitButton - Exit button with confirmation dialog
- KickedModal - Modal shown when kicked from room
- Countdown - 3-2-1 countdown with semantic colors (destructive→warning→success), no background card
- Quiz-Prompt - Question display with keystroke tracking
- Quiz-Stats - Timer display (MM:SS format, supports unlimited mode with ∞ symbol)
- Base-Select, Range-Input, Duration-Select - Form controls for game settings
- Chosen-Settings-Table - Display table for selected question types
- Game-Mode-Select - Game mode selection with filtering (base type, difficulty, game type) and collapsible details
- Playground-Settings - Custom game configuration

**UI:** Navigation-Bar, ProfileDropdown, Footer, ErrorBoundary, ProtectedRoute, ConnectionStatus
**Lib:** avatarGenerator (8x8 pixel art avatars)

### Pages

All pages use Slate theme with consistent patterns, functional-first design, and optimized layouts.

**Game:** Home, Quiz, Results, SingleplayerMode (with game filtering), MultiplayerGame
**Multiplayer:** MultiplayerHome, CreateRoom (with filtering and collapsible details), JoinRoom, RoomLobby (viewport-optimized), MultiplayerResults
**Stats:** Stats (separated speed run/timed modes), Leaderboard
**Profile:** ProfileLayout, ProfileOverview, ProfileSettings, ProfileGameSettings
**Content:** Usage, Tutorials, About, Privacy, Terms
**Auth:** Login (viewport-optimized), Signup



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
Base color Slate (OKLCH), class-based dark mode, CSS variables, radius 0.625rem

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

### Common Issues

**Build fails with TypeScript errors:**
- Check all `any` types are replaced with proper types
- Verify all imports are correct
- Check React Hook dependency arrays

**Firebase connection fails:**
- Verify `.env` file exists with correct values
- Check Firebase project settings
- Verify emulators are running (dev mode)

**Timer doesn't work:**
- Check `react-timer-hook` is installed
- Verify expiry timestamp calculation with `useMemo` to prevent recreation
- Check useEffect cleanup
- Timer displays in MM:SS format calculated from `timer.seconds + timer.minutes * 60 + timer.hours * 3600`
- Visual feedback: orange text when < 10s, red pulsing when < 5s
- **Singleplayer**:
  - `Quiz.tsx` creates `expiryTimestamp` with `useMemo` and passes to `QuizStats`
  - `QuizStats` creates internal timer with `autoStart: false`
  - `useEffect` calls `internalTimer.restart(expiryTimestamp, true)` to start countdown
- **Multiplayer**:
  - `MultiplayerGame.tsx` creates timer with `autoStart: false`
  - `useEffect` calls `timer.restart()` when `room.startedAt` changes
  - Calculates remaining time from `room.startedAt` timestamp for sync across clients

**Multiplayer sync issues:**
- Verify Firebase Realtime Database rules
- Check presence system is working
- Verify room status updates

**PWA not working:**
- Check service worker registration
- Verify manifest.json is served
- Check HTTPS (required for PWA)

---

## Future Enhancements

### Potential Features
- Sound effects for correct/incorrect answers
- Difficulty levels (easy/medium/hard)
- Custom themes and color schemes
- Social features (friends, challenges)
- Achievements and badges
- Practice mode (no timer)
- Tutorial system
- Mobile app (React Native)

### Performance Optimizations
- Code splitting with React.lazy()
- Image optimization with next-gen formats
- Bundle size reduction
- Server-side rendering (SSR)
- Edge caching with CDN

### Analytics Enhancements
- Detailed performance metrics
- User behavior tracking
- A/B testing framework
- Conversion funnel analysis

---

## Development Best Practices

### React Hook Dependencies
- Use specific properties in dependency arrays instead of entire objects
- Example: Use `[user?.uid]` instead of `[user]` to prevent unnecessary re-renders
- In `useGameHistory.ts`: Dependencies use `[user?.uid]`
- In `useStats.ts`: `saveGameResult` uses `[user?.uid, user?.displayName, isGuest]`, `getUserStats` uses `[user?.uid]`

### Preventing Duplicate Operations
- Use `useRef` flags to track one-time operations in effects
- Example in `Results.tsx`: `hasSavedRef` prevents duplicate stat saves in React.StrictMode
- Pattern:
  ```typescript
  const hasSavedRef = useRef(false);
  useEffect(() => {
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;
    // Perform operation
  }, []);
  ```

### Stats Tracking Implementation
- `Results.tsx` checks `settings.trackStats` before saving results
- Only saves to database if `trackStats !== false`
- Displays "This game was not tracked" message when appropriate
- `Game-Mode-Select.component.tsx` includes Switch UI for tracking toggle
- Default behavior: tracking enabled (`trackStats: true`)

### Layout Stability
- Use minimum heights (`min-h-[600px]`) to prevent layout shifts
- Implement skeleton loaders that match final content structure
- Add smooth transitions (`animate-in fade-in duration-300`)
- Use absolute positioning for loading states to overlay reserved space
- Example in `Stats.tsx`: Skeleton loaders for stats cards, performance data, and recent games

### Multiplayer Features

#### Win Counter System
- **RoomPlayer Interface**: Includes `wins: number` field
- **Initialization**: Set to `0` when creating/joining rooms
- **Increment**: `incrementWins()` function updates winner's count after each game
- **Display**: Win count shown next to player names in lobby (e.g., "PlayerName (3 wins)")
- **Persistence**: Win counters persist when game settings are changed or room is reset
- **Scope**: Room-specific (not global), reset when new room is created

**Database Structure:**
```
/rooms/{roomId}/players/{playerId}/wins: number
```

#### Host Game Settings Management
- **updateGameMode() Function**: Allows host to change game mode in waiting rooms
- **Host-Only UI**: Collapsible settings panel visible only to host
- **Real-Time Sync**: All players see updated settings immediately via Firebase listeners
- **Win Counter Preservation**: Win counters persist when settings are changed
- **Visual Indicators**: Current game mode is highlighted, disabled button prevents re-selection
- **Security**: Only host can update game mode (validated in `updateGameMode()`), cannot update while game is in progress (status must be 'waiting')

#### Guest User and Room Cleanup
- **Security Rules**: Allow deletion for guest users with `!newData.exists()` check
- **Cleanup Logic**: Guest users clean up user data, presence data, and room data on disconnect
- **Separate Handling**: Authenticated users set presence to offline; guest users remove all data
- **Edge Cases**:
  - Guest user closes browser/tab → Data cleaned up via `onDisconnect`
  - Guest user loses internet → Firebase automatically triggers `onDisconnect`
  - Host leaves room → Entire room deleted (simpler than host transfer on disconnect)
  - All players leave room → Room deleted via `leaveRoom()` logic
  - Guest in room when disconnecting → Player removed, room cleaned up if empty
- **Technical Details**:
  - `onDisconnect()` can only perform simple operations (set, remove, update)
  - Cannot run complex logic like "check if room is empty" in `onDisconnect`
  - Solution: Delete entire room when host disconnects (host is always required)
  - Client-side `leaveRoom()` handles host transfer for intentional leaves

### Timer Implementation Patterns

#### Multiplayer Timer
- **Manual Restart Pattern**: Use `autoStart: false` and manually call `timer.restart()` when game starts
- **Ref Tracking**: Track `lastStartedAtRef` to prevent duplicate restarts
- **Expiry Calculation**: Calculate remaining time from `room.startedAt` timestamp for sync across clients
```typescript
const lastStartedAtRef = useRef<number | null>(null);

const timer = useTimer({
  expiryTimestamp,
  onExpire: async () => { await finishGame(roomId); },
  autoStart: false,
});

useEffect(() => {
  if (room?.startedAt && room?.gameMode.duration) {
    if (lastStartedAtRef.current !== room.startedAt) {
      lastStartedAtRef.current = room.startedAt;
      const elapsed = Math.floor((Date.now() - room.startedAt) / 1000);
      const remaining = Math.max(0, room.gameMode.duration - elapsed);
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + remaining);
      timer.restart(newExpiry, true);
    }
  }
}, [room?.startedAt, room?.gameMode.duration]);
```

#### Timer Object in Effects
- **Problem**: Timer object from `react-timer-hook` changes on every render, causing infinite loops
- **Solution**: Use `useRef` to store timer object and access via `.current` in effects
```typescript
const timerRef = useRef(timer);
timerRef.current = timer;

useEffect(() => {
  return () => {
    timerRef.current.pause();
  };
}, []); // Empty dependency array
```

### Room Management Patterns

#### Host Transfer Logic
- **onDisconnect Handler**: Remove only the player, not the entire room
- **subscribeToRoom Listener**: Detects missing host and transfers to first remaining player
- **Automatic Ready**: New host is automatically marked as ready
- **Room Deletion**: Only when no players remain
```typescript
const listener = onValue(roomRef, async (snapshot) => {
  if (!snapshot.exists()) {
    callback(null);
    return;
  }

  const room: Room = { id: roomId, ...snapshot.val() };
  const players = Object.values(room.players);
  const hostExists = players.some((p: any) => p.uid === room.hostUid);

  if (!hostExists && players.length > 0) {
    const newHost = players[0] as RoomPlayer;
    await update(roomRef, {
      hostUid: newHost.uid,
      [`players/${newHost.uid}/ready`]: true,
    });
    return;
  } else if (players.length === 0) {
    await remove(roomRef);
    callback(null);
    return;
  }

  callback(room);
});
```

#### Player Limit Configuration
- **Room Interface**: Includes `maxPlayers: number` (2-10)
- **Creation**: Host selects player limit at room creation
- **Display**: Shown in lobby as "Players (X/Y)" format
- **Validation**: Checked in `joinRoom()` to prevent overfilling

#### Null Safety
- Always check if `room.players` exists before accessing
```typescript
if (!room.players) {
  await remove(roomRef);
  callback(null);
  return;
}
const players = Object.values(room.players);
```

### Question Randomization

**Seeded Fisher-Yates:** Uses `room.startedAt` as seed, LCG for deterministic randomness, ensures all players see same questions

### Database Rules

**Partial Updates:** Avoid strict validation, allow partial updates for `score`, `ready`, `finished`

---

## Recent Updates (2025-10-22)

### Mobile Text Formatting
- **Fixed:** Custom game text display on mobile devices
- **Changes:**
  - Added responsive text sizing: `text-2xl sm:text-3xl md:text-4xl`
  - Added responsive padding: `px-4 sm:px-6`
  - Added `break-all` class for better text wrapping
  - Added `overflow-x-auto` and `max-w-full` to index hints for horizontal scrolling
- **Files Modified:** `src/features/quiz/quiz-questions/Quiz-Prompt.component.tsx`

### Statistics Tracking UI Reorganization
- **Changed:** Statistics tracking option now only appears for official game modes
- **Implementation:**
  - Moved "Track Statistics" toggle inside the "official" tab in Game-Mode-Select
  - Custom/playground games always have `trackStats=false`
  - Added informational notice in custom tab explaining non-tracked games
- **Files Modified:** `src/features/quiz/quiz-settings/Game-Mode-Select.component.tsx`

### Unlimited Time Setting for Playground
- **Added:** Unlimited time option (duration = 0) for playground/custom games
- **Features:**
  - Available in playground settings via DURATION_OPTIONS array
  - Blocked for multiplayer games with validation in CreateRoom and RoomLobby
  - Timer displays "∞" symbol for unlimited mode
  - Unlimited time internally uses 24-hour duration (86400s)
- **Files Modified:**
  - `src/features/quiz/quiz-settings/Duration-Select.component.tsx` - Added `allowUnlimited` and `isMultiplayer` props
  - `src/features/quiz/quiz-settings/Playground-Settings.component.tsx` - Added unlimited option to DURATION_OPTIONS
  - `src/features/quiz/quiz-questions/Quiz-Stats.component.tsx` - Added `isUnlimited` prop and infinity display
  - `src/pages/Quiz.tsx` - Handle unlimited time with 24-hour fallback
  - `src/pages/CreateRoom.tsx` - Validate against unlimited time in multiplayer
  - `src/pages/RoomLobby.tsx` - Validate against unlimited time in multiplayer

### Statistics Page Display Improvements
- **Redesigned:** Stats page now clearly separates speed run and timed game modes
- **Features:**
  - Speed Run Performance card: Shows best/average completion times for modes with `targetQuestions`
  - Timed Mode Performance card: Shows average/best scores for time-limited modes
  - Each card displays relevant metrics (time for speed runs, score for timed)
  - Added difficulty badges and target/duration information
- **Files Modified:**
  - `src/pages/Stats.tsx` - Separated display logic for speed run vs timed modes
  - `src/hooks/useGameHistory.ts` - Added `getDurationsByGameMode()` function

### Results Page Cleanup
- **Removed:** Keystroke analysis section from results page
- **Changes:**
  - Removed "Keystroke Analysis" card showing total keystrokes and backspaces
  - Removed unused `Keyboard` icon import
  - Accuracy calculation still maintained internally for stats tracking
- **Files Modified:** `src/pages/Results.tsx`

### How to Play Documentation Update
- **Updated:** Usage page to reflect current 48 official game modes
- **Changes:**
  - Updated from "6 pre-configured challenges" to "48 official game modes"
  - Added clear distinction between Timed Challenges (24 modes) and Speed Runs (24 modes)
  - Listed all 6 supported conversion types
  - Added difficulty level information (Easy, Medium, Hard, Expert)
- **Files Modified:** `src/pages/Usage.tsx`

### Login Page Layout Enhancement
- **Improved:** Login page now fits within viewport without scrolling
- **Changes:**
  - Reduced spacing throughout (space-y-6 → space-y-4, space-y-4 → space-y-3)
  - Reduced header text size (text-3xl → text-2xl, text-2xl → text-xl)
  - Reduced padding (py-8 → py-6, pb-6 → pb-4, pt-6 → pt-4)
  - Reduced input heights (default → h-9)
  - Reduced button heights (default → h-9/h-8)
  - Reduced font sizes for labels and descriptions (default → text-sm/text-xs)
  - Reduced icon sizes (h-6 w-6 → h-5 w-5, h-5 w-5 → h-4 w-4, h-4 w-4 → h-3.5 w-3.5)
- **Files Modified:** `src/pages/Login.tsx`

---

## License & Credits

**License:** GNU General Public License v3.0
**Inspired by:** [zetamac](https://arithmetic.zetamac.com)
**UI Components:** [shadcn/ui](https://ui.shadcn.com)
**Icons:** [Lucide](https://lucide.dev)
**Backend:** [Firebase](https://firebase.google.com)
