# Based Math Game - Technical Reference

## Project Overview
A React-based multiplayer quiz game for practicing base conversion (Binary, Octal, Decimal, Hexadecimal) with Firebase backend, real-time multiplayer, stats tracking, and leaderboards.

**Project:** `ts_based_website` | **Firebase:** `based-math-game` | **License:** GPL-3.0
**Repository:** https://github.com/hajin-park/based-math-game

---

## Tech Stack

**Core:** React 19.2.0 + TypeScript 5.9.3 + Vite 7.1.11 + Tailwind CSS 3.4.3
**Backend:** Firebase JS SDK 12.4.0 (Realtime Database + Auth + Hosting)
**UI:** shadcn UI (Radix primitives) + lucide-react icons
**Forms:** React Hook Form 7.51.2 + Zod 3.22.4
**Routing:** React Router DOM 6.22.3
**Timer:** react-timer-hook 3.0.7
**PWA:** Service Worker + Web Manifest

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
│   └── ProfileDropdown.tsx
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
│   ├── useKeyboardShortcuts.ts
│   └── useTabVisibility.ts
├── pages/             # Route pages
│   ├── profile/       # Profile pages (ProfileLayout, ProfileOverview, ProfileSettings)
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
```typescript
/ → Home (hero + game mode cards)
/singleplayer → SingleplayerMode (official modes + inline custom playground)
/settings → Settings (DEPRECATED - redirects to /singleplayer)
/quiz → Quiz (game page)
/results → Results (score display)
/multiplayer → MultiplayerHome (create/join room)
/multiplayer/create → CreateRoom (official modes + inline custom playground)
/multiplayer/join → JoinRoom
/multiplayer/lobby/:roomId → RoomLobby
/multiplayer/game/:roomId → MultiplayerGame
/multiplayer/results/:roomId → MultiplayerResults
/leaderboard → Leaderboard (tabs per game mode)
/stats → Stats (time-based analytics)
/how-to-play → Usage (how to play guide)
/tutorials → Tutorials (base conversion tutorials)
/about → About (project information)
/privacy → Privacy (privacy policy)
/terms → Terms (terms of service)
/profile → ProfileLayout (sidebar layout)
  /profile → ProfileOverview (account info)
  /profile/settings → ProfileSettings (display name, delete account)
/login → Login (email/Google sign-in)
/signup → Signup (guest account linking)
```

### State Management
**Contexts:**
- `AuthContext` - User auth state, sign-in/out, account linking, guest user system, delete account
- `ThemeContext` - Light/Dark mode toggle with localStorage persistence
- `QuizContext` - Quiz settings (questions array, duration, gameModeId)
- `ResultContext` - Quiz results (score, duration, gameModeId)

**QuizContext Settings:**
```typescript
{
  questions: QuestionSetting[],  // Array<[fromBase, toBase, rangeLower, rangeUpper]>
  duration: number,               // seconds
  gameModeId?: string,           // optional game mode ID
  trackStats?: boolean,          // whether to track stats (default: true)
  isMultiplayer?: boolean        // whether this is a multiplayer game
}
```

---

## Firebase Integration

### Configuration (`src/firebase/config.ts`)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// Environment variables from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Emulators in development (controlled by VITE_USE_FIREBASE_EMULATORS env var)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectDatabaseEmulator(database, '127.0.0.1', 9000);
}
```

### Database Schema
```
/users/{userId}
  ├── uid: string (required for guest validation)
  ├── displayName: string
  ├── email: string | null
  ├── photoURL: string | null
  ├── isGuest: boolean (true for guest users, false/undefined for authenticated)
  ├── createdAt: timestamp
  ├── lastSeen: timestamp
  ├── stats
  │   ├── gamesPlayed: number
  │   ├── totalScore: number
  │   ├── highScore: number
  │   ├── averageScore: number
  │   └── lastPlayed: timestamp
  └── gameHistory/{gameId}
      ├── score: number
      ├── duration: number
      ├── gameModeId: string
      └── timestamp: timestamp

/rooms/{roomId}
  ├── hostUid: userId (can be guest or authenticated)
  ├── createdAt: timestamp
  ├── status: "waiting" | "playing" | "finished"
  ├── gameMode: GameMode object
  ├── players/{userId}
  │   ├── uid: string
  │   ├── displayName: string
  │   ├── ready: boolean
  │   ├── score: number
  │   └── finished: boolean
  ├── startedAt: timestamp | null
  └── gameState (optional)
      ├── startedAt: timestamp | null
      ├── currentQuestion: number
      └── timeRemaining: number

/leaderboards/{gameModeId}/{userId}
  ├── displayName: string
  ├── score: number (high score for this mode)
  ├── timestamp: timestamp
  └── isGuest: false (explicitly false, guest entries rejected by rules)

/gameModes/{gameModeId}
  ├── name: string
  ├── description: string
  ├── isOfficial: boolean
  ├── settings
  │   ├── questions: QuestionSetting[]
  │   └── duration: number
  └── createdAt: timestamp

/presence/{userId}
  ├── uid: string (required for guest validation)
  ├── online: boolean
  └── lastSeen: timestamp
```

### Security Rules (`database.rules.json`)
**Key Features:**
- Supports both authenticated users (Firebase Auth) and guest users (localStorage-based)
- Guest users identified by UIDs starting with `guest_`
- Guest users CANNOT write to global leaderboards
- All users can create/join rooms and track stats

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || $uid.beginsWith('guest_')",
        ".write": "$uid === auth.uid || ($uid.beginsWith('guest_') && newData.child('uid').val() === $uid && newData.child('isGuest').val() === true)",
        "stats": {
          ".validate": "newData.hasChildren(['gamesPlayed', 'totalScore'])"
        },
        "gameHistory": {
          ".indexOn": ["timestamp"],
          "$gameId": {
            ".validate": "newData.hasChildren(['score', 'timestamp']) && newData.child('score').isNumber() && newData.child('timestamp').isNumber()"
          }
        }
      }
    },
    "leaderboards": {
      "$gameModeId": {
        ".read": true,
        "$uid": {
          ".write": "($uid === auth.uid && !$uid.beginsWith('guest_')) || ($uid.beginsWith('guest_') && newData.child('isGuest').val() !== true)",
          ".validate": "newData.hasChildren(['displayName', 'score', 'timestamp']) && newData.child('score').isNumber() && (!newData.hasChild('isGuest') || newData.child('isGuest').val() === false)"
        }
      }
    },
    "rooms": {
      ".read": "true",
      "$roomId": {
        ".write": "!data.exists() || data.child('hostUid').val() === auth.uid || data.child('hostUid').val().beginsWith('guest_') || (auth != null && data.child('players').child(auth.uid).exists()) || data.child('players').hasChild(newData.child('hostUid').val())",
        ".validate": "newData.hasChildren(['hostUid', 'gameMode', 'status'])",
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid || ($playerId.beginsWith('guest_') && newData.child('uid').val() === $playerId) || root.child('rooms').child($roomId).child('hostUid').val() === auth.uid || root.child('rooms').child($roomId).child('hostUid').val() === $playerId",
            ".validate": "newData.hasChildren(['displayName', 'ready'])"
          }
        },
        "gameState": {
          ".write": "root.child('rooms').child($roomId).child('hostUid').val() === auth.uid || root.child('rooms').child($roomId).child('hostUid').val().beginsWith('guest_')"
        }
      }
    },
    "gameModes": {
      ".read": true,
      ".write": false
    },
    "presence": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid || ($uid.beginsWith('guest_') && newData.child('uid').val() === $uid)"
      }
    }
  }
}
```

---

## Authentication System

### AuthContext (`src/contexts/AuthContext.tsx`)
**Features:**
- Auto guest user creation on app load (localStorage-based, NO Firebase Anonymous Auth)
- Guest users use Realtime Database presence system with connect/disconnect API
- Full authentication support (email/password, Google)
- Presence system for both guest and authenticated users
- User profile management

### ThemeContext (`src/contexts/ThemeContext.tsx`)
**Features:**
- Light/Dark mode toggle
- Persists theme preference to localStorage
- Respects system preference on first load
- Class-based dark mode (Tailwind)

**Methods:**
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

**Guest User Implementation:**
```typescript
interface GuestUser {
  uid: string;              // Format: guest_{timestamp}_{random}
  displayName: string;
  isGuest: true;
  createdAt: number;
}

type AppUser = User | GuestUser;  // Combined type
```

**Methods:**
```typescript
interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isGuest: boolean;
  signInAsGuest: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}
```

**Presence System:**
- Monitors `.info/connected` for connection state
- Writes to `/users/{uid}` and `/presence/{uid}` with `uid` field for validation
- Uses `onDisconnect()` to set offline status and clean up guest data
- Guest user data automatically removed on disconnect
- All database operations include error handling with `.catch()`

**Flow:**
1. App loads → `onAuthStateChanged` listener activates
2. If no Firebase user → create/retrieve guest user from localStorage
3. If Firebase user → use authenticated user, clear guest from localStorage
4. Presence system tracks online/offline for all users
5. Guest users can upgrade to authenticated accounts (sign up/log in)

---

## Game Modes & Settings

### Official Game Modes (`src/types/gameMode.ts`)
```typescript
export interface GameMode {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Custom';
  duration: number;
  questions: QuestionSetting[];
  isOfficial?: boolean;
  icon?: string;
  color?: string;
}

export const OFFICIAL_GAME_MODES: GameMode[] = [
  {
    id: 'binary-basics',
    name: 'Binary Basics',
    description: 'Master binary to decimal conversions with small numbers',
    difficulty: 'Easy',
    duration: 60,
    questions: [
      ['Binary', 'Decimal', 0, 15],
      ['Decimal', 'Binary', 0, 15],
    ],
    isOfficial: true,
    color: 'bg-blue-500',
  },
  // ... 4 more official modes (hex-hero, octal-odyssey, mixed-master, ultimate-challenge)
];
```

### QuestionSetting Type
```typescript
type QuestionSetting = [
  fromBase: string,    // "Binary" | "Octal" | "Decimal" | "Hexadecimal"
  toBase: string,      // "Binary" | "Octal" | "Decimal" | "Hexadecimal"
  rangeLower: number,  // min value (decimal)
  rangeUpper: number   // max value (decimal)
];
```

---

## Core Game Logic

### Base Conversion Mapping
```typescript
const baseMappings = {
  "binary": 2,
  "octal": 8,
  "decimal": 10,
  "hexadecimal": 16
};
```
**IMPORTANT:** All base names are lowercase in mapping. UI displays capitalized names but functions use `.toLowerCase()`.

### Question Generation (`generator.ts`)
```typescript
generateQuestion(fromBase: string, rangeLower: number, rangeUpper: number, seed?: number): string
```
1. Generate random decimal in range using seeded random if seed provided
2. Seeded random: `Math.sin(seed) * 10000` for deterministic multiplayer questions
3. Convert to fromBase using `Number.toString(radix)`
4. Return string

### Base Conversion (`converter.ts`)
```typescript
convertBase(inputString: string, fromBase: string, toBase: string): string
```
1. Parse input from fromBase to decimal: `parseInt(inputString, fromBaseRadix)`
2. Convert decimal to toBase: `number.toString(toBaseRadix)`

### Answer Validation (`validator.ts`)
```typescript
validateAnswer(expected: string, actual: string, toBase: string): boolean
```
1. Clean both strings (remove 0x prefix, leading zeros, lowercase)
2. Compare for equality

### Scoring Rules
- **+1 per correct answer** (no partial credit)
- **Auto-validation** on keystroke (no submit button)
- **No incorrect attempts tracked** (pure speed metric)
- **No time bonus** (score = correct answers within time limit)
- **No combo system** (removed as it doesn't make sense with auto-validation)

### Custom Playground Architecture
The Custom Playground feature allows users to create custom quiz settings with specific base conversions, number ranges, and durations.

**Key Components:**
- `Playground-Settings.component.tsx` - Reusable form component for custom settings
  - **Improved UI/UX** with step-by-step layout and better visual organization
  - Two-step process: (1) Add question types, (2) Review & configure
  - Numbered steps with clear visual hierarchy
  - Responsive grid layout for base selectors and range inputs
  - Enhanced form validation feedback
  - Mobile-optimized design
  - Accepts `onStartQuiz` callback to handle quiz start
  - Accepts `initialSettings` for pre-populating form
  - Accepts `buttonText` to customize the submit button
  - Accepts `showHeader` to optionally display header text
  - Manages form state for base selection, range inputs, and duration
  - Validates settings and prevents duplicate question configurations
  - Returns `{ questions: QuestionSetting[], duration: number }` on submit

- `Chosen-Settings-Table.component.tsx` - Enhanced settings display
  - Badge-based display for base conversions with arrow indicator
  - Improved delete button with icon-only design
  - Empty state message when no settings added
  - Hover effects for better interactivity
  - Compact and readable layout

**Integration Points:**
1. **Singleplayer Mode** (`Game-Mode-Select.component.tsx`)
   - Inline playground in "Custom Playground" tab
   - Creates custom GameMode object on submit
   - Immediately starts quiz with custom settings

2. **Multiplayer Mode** (`CreateRoom.tsx`)
   - Inline playground in "Custom Playground" tab
   - Creates custom GameMode object on submit
   - Creates room with custom settings shared to all players

**User Flows:**
- **Singleplayer:** Home → Singleplayer → Custom Playground tab → Configure inline → Start Quiz
- **Multiplayer:** Home → Multiplayer → Create Room → Custom Playground tab → Configure inline → Create Room

**Deprecated:**
- `/settings` route now redirects to `/singleplayer` for backward compatibility
- Settings page functionality fully integrated into inline playground

---

## Multiplayer System

### Room Management (`src/hooks/useRoom.ts`)
**Functions:**
```typescript
createRoom(gameMode: GameMode): Promise<string>
joinRoom(roomId: string): Promise<void>
leaveRoom(roomId: string): Promise<void>
setPlayerReady(roomId: string, ready: boolean): Promise<void>
startGame(roomId: string): Promise<void>
updatePlayerScore(roomId: string, score: number): Promise<void>
finishGame(roomId: string): Promise<void>
resetRoom(roomId: string): Promise<void>
subscribeToRoom(roomId: string, callback: (room: Room | null) => void): () => void
```

**Room Structure:**
```typescript
interface Room {
  id: string;
  hostUid: string;           // Can be guest or authenticated user
  gameMode: GameMode;
  players: Record<string, RoomPlayer>;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  startedAt?: number;
}

interface RoomPlayer {
  uid: string;
  displayName: string;
  ready: boolean;            // Host is always ready (set to true on creation)
  score: number;
  finished: boolean;
}
```

**Ready State Logic:**
- **Host:** Automatically marked as ready when creating room (doesn't need ready button)
- **Non-host players:** Must manually mark themselves as ready
- **Start game validation:** Only checks if all non-host players are ready
- **UI display:** Host shows "Hosting" badge instead of ready status
- **Ready count:** Displays "X/Y players ready" where Y excludes the host

**Room Lifecycle:**
1. Host creates room → status: "waiting" (host automatically marked as ready)
2. Players join via room code or invite link → added to players object
3. Non-host players mark themselves as ready
4. Host starts game when all non-host players are ready → status: "playing"
5. Game ends → status: "finished", navigate to results page
6. Host clicks "Return to Lobby" → resets room to "waiting", all players return to lobby
7. Repeat from step 3 for another game (or players leave room)

**Invite Link Feature:**
- **Copy Room Code:** Copies just the room ID to clipboard with toast notification
- **Copy Invite Link:** Copies full URL with pre-filled room code
  - Format: `https://domain.com/multiplayer/join?code=ROOMCODE`
  - When opened, automatically fills the room code in join page
  - Toast notifications confirm successful copy
- Both options available in room lobby with visual feedback

**Guest User Support:**
- Both guest and authenticated users can create rooms
- Both can join rooms
- Security rules validate based on `hostUid` (supports `guest_` prefix)
- Rooms are publicly readable (`.read: "true"`)

### Real-time Synchronization
- Room state synced via Firebase Realtime Database
- Player scores updated in real-time during game
- Timer synchronized across all clients using room `startedAt` timestamp
- **Deterministic question sequence**: All players see the same questions in the same order
  - Questions selected using `score % questions.length` for fairness
  - Initial question (score=0) is always `questions[0]`
  - Questions stored in `useRef` to prevent infinite re-renders
  - **Seeded random generation**: Uses room ID + score as seed for `generateQuestion()`
    - Same seed produces same random number for all players
    - Hash of room ID combined with score ensures deterministic questions
    - Singleplayer uses `Math.random()` (no seed) for variety
- **Host disconnect handling**:
  - Firebase `onDisconnect()` automatically removes player when they disconnect
  - When host leaves:
    - If other players exist: Transfer host to first remaining player
    - If game is in progress: Reset to lobby (status='waiting', reset scores)
    - If no players left: Delete the room
  - Players redirected to lobby when host leaves mid-game
  - Toast notification (not blocking alert) notifies players that host has left
  - Navigation happens immediately with `replace: true` to prevent back navigation
  - `hasNavigatedRef` prevents multiple navigation attempts from repeated Firebase callbacks
  - Graceful cleanup prevents orphaned rooms
- **Room reset after game**:
  - Host can click "Return to Lobby" on results page
  - `resetRoom()` function resets all player scores, finished status, and ready states
  - Room status changes back to "waiting", `startedAt` is removed
  - All players automatically navigate back to lobby when status changes
  - Non-host players see "Waiting for host to return to lobby..." message

---

## Stats & Leaderboards

### Stats Tracking (`src/hooks/useStats.ts`)
**Function:**
```typescript
saveGameResult(result: GameResult): Promise<void>

interface GameResult {
  score: number;
  duration: number;
  gameModeId?: string;
  timestamp?: number;
}
```

**Updates:**
1. User stats: gamesPlayed, totalScore, highScore, averageScore, lastPlayed (all users)
2. Game history: individual game record with timestamp (all users)
3. Leaderboard: ONLY for authenticated users (isGuest check prevents guest entries)

**Guest User Behavior:**
- Stats are tracked in database under `/users/{guestUid}/stats`
- Game history is saved under `/users/{guestUid}/gameHistory/{gameId}`
- **Leaderboard updates are BLOCKED** when `isGuest === true`
- Guest data is cleaned up on disconnect via `onDisconnect().remove()`
- Stats page shows yellow notice encouraging sign up

### Leaderboard (`src/pages/Leaderboard.tsx`)
**Filtering:**
- Fetches all entries from `/leaderboards/{gameModeId}`
- **Filters out guest users** by checking:
  - UID starts with `guest_`
  - Entry has `isGuest: true` field
- Sorts by score descending, displays top 50
- Only authenticated users appear on global leaderboards

### Game History (`src/hooks/useGameHistory.ts`)
**Queries:**
```typescript
getRecentGames(gameModeId, limit): Promise<GameHistoryEntry[]>
getGamesInTimeRange(gameModeId, startTime, endTime): Promise<GameHistoryEntry[]>
getTodayGames(gameModeId): Promise<GameHistoryEntry[]>
getThisWeekGames(gameModeId): Promise<GameHistoryEntry[]>
getThisMonthGames(gameModeId): Promise<GameHistoryEntry[]>
```

**Analytics:**
- Time-based filtering with Firebase `.orderByChild("timestamp")`
- Calculates: total games, total score, average score, best score
- Supports custom date ranges
- Works for both guest and authenticated users

---

## Key Hooks

### useRoom (`src/hooks/useRoom.ts`)
**Multiplayer room management:**
```typescript
interface Room {
  id: string;
  hostUid: string;
  gameMode: GameMode;
  players: Record<string, RoomPlayer>;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  startedAt?: number;
}

interface RoomPlayer {
  uid: string;
  displayName: string;
  ready: boolean;
  score: number;
  finished: boolean;
}
```

**Methods:**
- `createRoom(gameMode)` - Create new room, returns roomId, sets up onDisconnect for host
- `joinRoom(roomId)` - Join existing room, sets up onDisconnect for player
- `leaveRoom(roomId)` - Leave room, transfer host or delete room if host leaves
- `setPlayerReady(roomId, ready)` - Set player ready status
- `startGame(roomId)` - Start game (host only)
- `updatePlayerScore(roomId, score)` - Update player score
- `finishGame(roomId)` - Mark player as finished
- `resetRoom(roomId)` - Reset room to waiting state (host only)
- `subscribeToRoom(roomId, callback)` - Real-time room updates, callback receives Room | null

### useStats (`src/hooks/useStats.ts`)
**User statistics tracking:**
- Reads from `/users/{uid}/stats` and `/users/{uid}/gameHistory`
- Tracks: games played, total score, average score, best score
- Works for both guest and authenticated users
- Guest stats don't count toward global leaderboards

### useGameHistory (`src/hooks/useGameHistory.ts`)
**Game history queries with timestamp indexing:**
- `getRecentGames(gameModeId, limit)` - Get recent games
- `getGamesInTimeRange(gameModeId, startTime, endTime)` - Custom range
- `getTodayGames(gameModeId)` - Today's games
- `getThisWeekGames(gameModeId)` - This week's games
- `getThisMonthGames(gameModeId)` - This month's games
- Uses Firebase `.orderByChild("timestamp")` with `.indexOn` rule

### useKeyboardShortcuts
- Escape key: Navigate to home
- Global keyboard shortcuts for accessibility

### useTabVisibility
- Pauses timer when tab hidden (singleplayer only)
- Prevents cheating in multiplayer
- Uses Page Visibility API

---

## UI Components

### shadcn Components (`src/components/ui/`)
button, card, form, input, label, select, scroll-area, separator, toast, dialog, tabs, badge, table, drawer, dropdown-menu, navigation-menu, avatar, skeleton, switch, alert, alert-dialog, popover, sheet

### Custom Components
**Quiz:**
- `Quiz-Prompt.component.tsx` - Enhanced question display with improved layout
  - Large, centered question display with clear base labels
  - Prominent answer input field with placeholder text
  - Success animations with checkmark and scale effect
  - Responsive layout (vertical on mobile, horizontal on desktop)
  - Arrow indicator between from/to bases
  - Helper text with keyboard shortcuts
  - Auto-focus on input for better UX

- `Quiz-Stats.component.tsx` - Enhanced timer and score display
  - MM:SS formatted countdown timer (not raw seconds)
  - Visual feedback for low time (orange < 10s, red pulsing < 5s)
  - Icon-based display with Clock and Trophy icons
  - Badge-styled score display
  - Tabular numbers for consistent width
  - Border separator from quiz content
  - Accepts optional `timer` prop for multiplayer
  - For singleplayer: creates internal timer and calls `restart()` in useEffect
  - Pauses timer when tab is hidden (Page Visibility API)
  - Real-time updates every second

- `Base-Select.component.tsx` - Base dropdown with form integration
- `Range-Input.component.tsx` - Number range inputs
- `Duration-Select.component.tsx` - Duration dropdown
- `Chosen-Settings-Table.component.tsx` - Settings list with delete
- `Game-Mode-Select.component.tsx` - Tabs for official/custom modes with inline playground
- `Playground-Settings.component.tsx` - Reusable custom playground settings form

**UI:**
- `Navigation-Bar.tsx` - Responsive nav with profile dropdown
  - Navigation links: Home, Play, Multiplayer, Leaderboard, Stats, How to Play, Tutorials
  - Shows "Sign Up" button for guest users
  - Shows profile avatar dropdown for authenticated users
  - Mobile menu with hamburger icon
  - Dark mode support
- `ProfileDropdown.tsx` - Profile menu dropdown
  - View Profile, Settings, Appearance (Light/Dark), Sign Out
  - Avatar with initials fallback
  - User email display
  - Sign Out available in both dropdown and profile sidebar
- `Footer.tsx` - Professional footer with multiple sections
  - About section with project description and GitHub link
  - Learn section (Tutorials, How to Play, About)
  - Play section (Singleplayer, Multiplayer, Leaderboard, Stats)
  - Legal section (Privacy Policy, Terms of Service, License)
  - Bottom section with copyright and zetamac inspiration credit
  - Fully responsive grid layout
  - Dark mode support
- `ErrorBoundary.tsx` - Error boundary with recovery
- `ProtectedRoute.tsx` - Route protection for auth (supports `requireNonGuest` prop)
- `ConnectionStatus.tsx` - Firebase connection indicator

**Pages:**
- `Usage.tsx` - How to Play guide
  - Comprehensive guide covering all game features
  - Game Basics: Explanation of the 4 number bases with visual examples
  - Singleplayer Mode: Official game modes and inline Playground customization
  - Multiplayer Mode: Creating/joining rooms with custom settings and real-time competition
  - During the Quiz: Answer mechanics, scoring system, and on-screen info (MM:SS timer + score with visual feedback)
  - Progress Tracking: Stats page and leaderboards explanation
  - Quick Tips: 6 actionable tips for improvement
  - Call-to-action section with links to Tutorials, Singleplayer, and Multiplayer
  - Minimal design with informative visual elements (color-coded bases, example displays)
  - Guest user notice about stat limitations
  - No combo multiplier display (removed as it doesn't align with auto-validation)
- `Tutorials.tsx` - Base conversion tutorials
- `Settings.tsx` - DEPRECATED redirect page (redirects to /singleplayer for backward compatibility)
  - 4 tabs: Binary (Base 2), Octal (Base 8), Decimal (Base 10), Hexadecimal (Base 16)
  - Each tab has consistent minimal structure:
    - "How It Works" section with brief explanation and one example
    - "Counting in [Base]" section with compact grid showing values
    - "Try It Yourself" interactive converter with real-time conversion
  - Removed verbose content and large tables for cleaner, focused learning
  - Dark mode support with color-coded sections per base
- `About.tsx` - Project information page
  - Mission statement and project description
  - Feature list (tutorials, quizzes, multiplayer, progress tracking, leaderboards, guest mode)
  - Technology stack information
  - Inspiration credit to zetamac
  - Open source license information
- `Privacy.tsx` - Privacy policy page
  - Information collection details (account info, game data, guest users, analytics)
  - Data usage explanation
  - Security measures
  - User rights (access, update, delete)
  - Third-party services (Firebase, Google Sign-In)
  - Children's privacy policy
  - Contact information
- `Terms.tsx` - Terms of service page
  - Agreement to terms
  - Use license and restrictions
  - User account responsibilities
  - Guest user limitations
  - Leaderboard and score policies
  - Intellectual property (GPL-3.0 license)
  - Disclaimers and liability limitations
  - Contact information
- `Stats.tsx` - User statistics with guest user notice
  - Shows yellow warning card for guest users
  - Encourages sign up to save stats permanently
  - Explains stats won't count toward global leaderboard
  - Provides "Sign Up" and "Log In" buttons
- `Leaderboard.tsx` - Global leaderboards (filters out guest users)
- `profile/` - Profile pages (authenticated users only)
  - `ProfileLayout.tsx` - Sidebar layout with navigation and Sign Out button
  - `ProfileOverview.tsx` - Account information and quick stats
  - `ProfileSettings.tsx` - Display name editing and Delete Account option
    - Delete Account with confirmation modal
    - Lists all data that will be lost
    - Deletes Firebase auth user and database records
  - Redirects guest users to signup page

---

## PWA Features

### Service Worker (`public/sw.js`)
- Caches static assets for offline use
- Cache-first strategy for assets
- Network-first for API calls

### Web Manifest (`public/manifest.json`)
```json
{
  "name": "Based Math Game",
  "short_name": "Based Math",
  "description": "Practice base conversion with timed quizzes",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0c0a09",
  "background_color": "#ffffff"
}
```

### Registration (`src/main.tsx`)
- Service worker registered on app load
- Updates checked periodically

### SEO & Discoverability

**Sitemap (`public/sitemap.xml`)**
- XML sitemap for search engine crawlers
- All public pages with priority and change frequency
- Main pages: Home, Singleplayer, Multiplayer, Tutorials, How to Play
- Secondary pages: Leaderboard, Stats, About, Privacy, Terms
- Authentication pages: Login, Signup
- Updated: 2025-10-21

**Robots.txt (`public/robots.txt`)**
- Allows all crawlers on public pages
- Disallows user-specific pages (profile, settings, quiz, results)
- Disallows dynamic multiplayer pages (lobby, game, results with room IDs)
- Disallows authentication pages (login, signup)
- Sitemap reference and crawl delay configuration

**LLMs.txt (`public/llms.txt`)**
- Comprehensive project documentation for AI/LLM crawlers
- Project overview, features, and technology stack
- Complete page listing with descriptions
- Game mechanics and scoring system
- Guest user system explanation
- API and data structure documentation
- Development setup and deployment instructions
- SEO keywords and accessibility information
- Privacy, performance, and browser support details

---

## Analytics (`src/utils/analytics.ts`)

### Tracked Events
```typescript
// Game events
logGameStart(gameModeId, isSingleplayer)
logGameComplete(gameModeId, score, duration, isSingleplayer)
logGameAbandoned(gameModeId, score, duration)

// Room events
logRoomCreated(roomId, hasPassword, maxPlayers)
logRoomJoined(roomId)
logRoomLeft(roomId)

// Error events
logError(error, context)
```

---

## Build & Deployment

### Scripts
```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # TypeScript + Vite build → dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

### Build Output
- **dist/index.html** - 1.05 kB
- **dist/assets/index-*.css** - ~52 kB (~9.5 kB gzipped)
- **dist/assets/index-*.js** - ~1,056 kB (~285 kB gzipped)

### CI/CD (GitHub Actions)
- **Production:** Push to `main` → deploy to Firebase Hosting
- **Preview:** PR → deploy preview URL
- **Build:** `npm ci && npm run build`

## Guest User System

### Overview
- **NO Firebase Anonymous Authentication** - uses localStorage + Realtime Database presence
- Guest users identified by UIDs starting with `guest_`
- Full multiplayer support (create/join rooms)
- Stats tracking (local + database)
- **Cannot** appear on global leaderboards

### Guest User Lifecycle
1. **Creation**: Auto-created on app load if no Firebase user
   - Stored in `localStorage` as JSON
   - UID format: `guest_{timestamp}_{random}`
2. **Presence**: Tracked via `.info/connected` listener
   - Writes to `/users/{guestUid}` and `/presence/{guestUid}`
   - Includes `uid` field for security rules validation
3. **Cleanup**: Automatic on disconnect
   - `onDisconnect().remove()` clears user data
   - Presence set to offline
4. **Upgrade**: Can sign up or log in
   - Guest data cleared from localStorage
   - Becomes authenticated user

### Security Enforcement
- **Database Rules**: Validate `guest_` prefix and `isGuest` field
- **Stats Hook**: Checks `isGuest` before leaderboard writes
- **Leaderboard Page**: Filters out guest entries client-side
- **Triple Protection**: Rules + hook + UI filtering

---

## Important Implementation Details

### Environment Variables (`.env`)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_USE_FIREBASE_EMULATORS=true  # Optional, for development
```

### Path Aliases (`vite.config.ts`)
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@features": path.resolve(__dirname, "./src/features")
  }
}
```

### TypeScript Configuration
- **Strict mode:** Enabled
- **noImplicitAny:** false (allows untyped code where needed)
- **Target:** ES2020
- **Module:** ESNext

### Tailwind Configuration
- **Base color:** Stone
- **Dark mode:** Class-based (`.dark`)
- **CSS variables:** Enabled for theming
- **Radius:** 0.5rem

### Firebase Configuration (`firebase.json`)
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**/*.@(js|mjs)",
        "headers": [{ "key": "Content-Type", "value": "application/javascript; charset=utf-8" }]
      },
      {
        "source": "**/*.css",
        "headers": [{ "key": "Content-Type", "value": "text/css; charset=utf-8" }]
      },
      {
        "source": "**/*.json",
        "headers": [{ "key": "Content-Type", "value": "application/json; charset=utf-8" }]
      }
    ],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "cleanUrls": true
  },
  "database": {
    "rules": "database.rules.json"
  },
  "emulators": {
    "auth": { "port": 9099 },
    "database": { "port": 9000 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Code Quality Standards
- **No `any` types** - Use `unknown` or proper types
- **No `@ts-ignore`** - Use `@ts-expect-error` with explanations
- **Proper error handling** - Catch `unknown`, extract message safely
- **React Hook dependencies** - All dependencies in useEffect arrays
- **Memory cleanup** - Unsubscribe from Firebase listeners
- **Type safety** - Proper type assertions with `as` keyword

### Mobile Optimization
- **Viewport height fix:** `height: 100dvh` for mobile browsers
- **Input optimization:** `inputMode="numeric"` for number inputs
- **Pattern validation:** `pattern="[0-9a-fA-F]*"` for hex inputs
- **Touch targets:** Minimum 44x44px for buttons

### Dark Mode Support
- **Theme system:** Class-based dark mode using Tailwind CSS
- **Card backgrounds:** Use Tailwind's `bg-card` instead of hardcoded `bg-gray-50` for proper dark mode support
- **Quiz and Settings pages:** Removed hardcoded background colors to respect theme settings
- **Automatic theme detection:** Respects system preference on first load

### Accessibility
- **ARIA labels:** All interactive elements
- **Keyboard navigation:** Tab order, focus management
- **Screen reader support:** Semantic HTML, proper labels
- **Keyboard shortcuts:** Escape to home, etc.

### Performance
- **Code splitting:** Dynamic imports for routes (future)
- **Image optimization:** WebP format, lazy loading
- **Bundle size:** ~1,056 kB (~285 kB gzipped)
- **Lighthouse score:** Target 90+ for all metrics

---

## Development Workflow

### Local Development
1. `npm install` - Install dependencies
2. Create `.env` with Firebase config
3. `npm run dev` - Start dev server
4. Open http://localhost:5173

### Firebase Emulators
```bash
firebase emulators:start
```
- Auth: http://localhost:9099
- Database: http://localhost:9000
- UI: http://localhost:4000

### Testing
- Manual testing in browser
- Check console for errors
- Test all game modes
- Test multiplayer with multiple tabs
- Test authentication flow
- Test offline mode

### Deployment
```bash
npm run build
firebase deploy
```

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

## Recent Bug Fixes & Improvements

### Issue 1: Duplicate Statistics Bug (FIXED)
**Problem:** Statistics were being saved multiple times when a game ended, creating duplicate entries in the database.

**Root Cause:** In `Results.tsx`, the `useEffect` hook had `saving` in its dependency array. This created an infinite loop:
1. Effect runs → sets `saving` to `true`
2. Calls `saveGameResult`
3. Sets `saving` to `false`
4. `saving` change triggers effect again → repeat

**Solution:** Removed `saving` from the dependency array and used an empty array to ensure the effect runs only once on mount.

**Files Modified:**
- `src/pages/Results.tsx` - Changed dependency array from `[results.score, results.duration, results.gameModeId, saveGameResult, saving]` to `[]`

---

### Issue 2: Statistics Display After Refresh (FIXED)
**Problem:** User statistics would disappear on the stats page after a browser refresh, even though they appeared correctly on the leaderboard.

**Root Cause:** In `useGameHistory.ts` and `useStats.ts`, the `useCallback` hooks had the entire `user` object in their dependency arrays. When user properties like `displayName` were updated, the `user` object reference changed, causing the callback functions to be recreated unnecessarily. This triggered effects repeatedly and caused stale data issues.

**Solution:** Changed dependencies to use specific properties instead of the entire object:
- `useGameHistory.ts`: Changed from `[user]` to `[user?.uid]`
- `useStats.ts`: Changed from `[user, isGuest]` to `[user?.uid, user?.displayName, isGuest]` for `saveGameResult` and `[user?.uid]` for `getUserStats`

**Files Modified:**
- `src/hooks/useGameHistory.ts` - Updated `fetchHistory` callback dependencies
- `src/hooks/useStats.ts` - Updated `saveGameResult` and `getUserStats` callback dependencies

---

### Issue 3: Leaderboard Separation by Game Mode (ALREADY IMPLEMENTED)
**Status:** This feature was already implemented in the codebase.

**Implementation:**
- Database schema uses `/leaderboards/{gameModeId}/{userId}` structure
- `Leaderboard.tsx` has buttons to switch between different official game modes
- Each game mode maintains its own separate leaderboard

---

### Issue 4: Official/Tracked Game Mode Toggle (IMPLEMENTED)
**Feature:** Added an option during single-player game mode selection to choose whether the game session should be tracked and count toward account statistics.

**Implementation:**
1. **UI Toggle** (`Game-Mode-Select.component.tsx`):
   - Added a Switch component with clear labeling
   - Shows different messages based on tracking state
   - Positioned prominently above game mode selection

2. **Context Integration** (`QuizSettings` interface):
   - Added `trackStats?: boolean` field (defaults to `true` for backward compatibility)
   - Passed through from game mode selection to quiz settings

3. **Conditional Saving** (`Results.tsx`):
   - Modified to check `settings.trackStats` before saving results
   - Only saves to database if `trackStats !== false`
   - Displays "This game was not tracked" message when appropriate

4. **Callback Updates**:
   - `Game-Mode-Select.component.tsx`: Updated `onSelectMode` callback to accept `trackStats` parameter
   - `SingleplayerMode.tsx`: Updated to pass `trackStats` value instead of hardcoding `true`

**Files Modified:**
- `src/features/quiz/quiz-settings/Game-Mode-Select.component.tsx` - Added Switch UI and state management
- `src/pages/SingleplayerMode.tsx` - Updated to accept and pass `trackStats` parameter
- `src/pages/Results.tsx` - Added conditional saving logic and tracking status display
- `src/contexts/GameContexts.tsx` - Already had `trackStats?: boolean` field in `QuizSettings` interface

**User Experience:**
- Users can practice without affecting their stats
- Clear visual feedback about tracking status
- Default behavior (tracking enabled) maintains backward compatibility

---

### Issue 5: Stats Page Tab Switching Layout Issues (FIXED)
**Problem:** Layout would shift and deform when users switched between time range options (Today, This Week, This Month, All Time) on the stats page.

**Root Causes:**
1. Different time ranges had different amounts of data, causing content height changes
2. Loading spinner appeared/disappeared without reserved space
3. No minimum height for content area
4. No smooth transitions between states

**Solution:**
1. **Reserved Space**: Added `min-h-[600px]` to content area to prevent layout shifts
2. **Skeleton Loaders**: Replaced simple spinner with detailed skeleton loaders that match the actual content structure:
   - Stats cards skeleton (4 cards)
   - Performance by game mode skeleton (3 items)
   - Recent games skeleton (5 items)
3. **Smooth Transitions**: Added `animate-in fade-in duration-300` for content appearance
4. **Absolute Positioning**: Made loading state use absolute positioning to overlay the reserved space

**Files Modified:**
- `src/pages/Stats.tsx` - Added Skeleton component import, implemented skeleton loaders, added minimum height and transitions

**User Experience:**
- No layout jumps when switching time ranges
- Smooth fade-in transitions
- Professional loading states that match final content structure
- Consistent page height regardless of data amount

---

### Issue 6: MIME Type Module Loading Error (FIXED)
**Problem:** On some browsers, the site failed to load with the error: "Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/html'."

**Root Cause:** Firebase Hosting was not explicitly setting the correct MIME types for JavaScript modules and CSS files. While Firebase Hosting typically serves static files correctly, some browsers enforce strict MIME type checking for ES modules, and without explicit headers, the server's default MIME type detection could fail.

**Solution:** Added explicit `Content-Type` headers in `firebase.json` for:
- JavaScript modules (`.js`, `.mjs`): `application/javascript; charset=utf-8`
- CSS files (`.css`): `text/css; charset=utf-8`
- JSON files (`.json`): `application/json; charset=utf-8`

Also added `"cleanUrls": true` for better URL handling.

**Files Modified:**
- `firebase.json` - Added `headers` configuration with explicit MIME types

**Technical Details:**
- The rewrite rule `"source": "**"` only applies to requests that don't match existing files
- Static files in `dist/` are served first, before rewrites are applied
- Explicit headers ensure correct MIME types even when browser MIME type detection is strict
- This fix is especially important for ES modules which have strict MIME type requirements per HTML spec

**User Experience:**
- Site now loads correctly across all browsers
- No more module loading errors
- Proper content type headers improve caching and performance

---

### Recent Updates (Latest Session)

#### Task 1: Fixed Duplicate Game Entries in Stats Tracking (FIXED)
**Problem:** After previous fixes, games were being saved twice instead of once due to React Strict Mode double-invoking effects in development.

**Root Cause:** React.StrictMode intentionally double-invokes effects in development to help detect side effects. The `useEffect` in `Results.tsx` was running twice, causing duplicate saves.

**Solution:** Added a `useRef` flag (`hasSavedRef`) to track if results have already been saved, preventing duplicate saves even in Strict Mode.

**Files Modified:**
- `src/pages/Results.tsx` - Added `hasSavedRef` to prevent duplicate saves

**Code Changes:**
```typescript
const hasSavedRef = useRef(false);

useEffect(() => {
  const saveResults = async () => {
    if (hasSavedRef.current) return; // Prevent duplicate saves

    if (results.score !== undefined && results.duration && shouldTrack) {
      hasSavedRef.current = true;
      // ... save logic
    }
  };
  saveResults();
}, []);
```

---

#### Task 2: Added Win Counter Display in Multiplayer Lobbies (IMPLEMENTED)
**Feature:** Track and display room-specific win counts for each player in multiplayer lobbies.

**Implementation:**
1. **Updated RoomPlayer Interface** - Added `wins: number` field
2. **Initialize Wins** - Set `wins: 0` when creating/joining rooms
3. **Increment Wins** - Added `incrementWins()` function to increment winner's count after each game
4. **Display Wins** - Show win count next to player names in lobby (e.g., "PlayerName (3 wins)")
5. **Preserve Wins** - Win counters persist when game settings are changed or room is reset

**Files Modified:**
- `src/hooks/useRoom.ts` - Added `wins` field to `RoomPlayer` interface, added `incrementWins()` function
- `src/pages/MultiplayerResults.tsx` - Increment winner's wins when game finishes
- `src/pages/RoomLobby.tsx` - Display win counts next to player names

**Database Structure:**
```
/rooms/{roomId}/players/{playerId}/wins: number
```

**User Experience:**
- Win counters are room-specific (not global)
- Counters reset when a new room is created
- Counters persist across multiple games in the same room
- Small, unobtrusive display in lobby

---

#### Task 3: Allow Host to Edit Game Settings in Multiplayer Lobby (IMPLEMENTED)
**Feature:** Give room host ability to modify game mode settings while in the lobby, with real-time updates for all players.

**Implementation:**
1. **Added updateGameMode() Function** - Allows host to change game mode in waiting rooms
2. **Host-Only UI** - Collapsible settings panel visible only to host
3. **Real-Time Sync** - All players see updated settings immediately via Firebase listeners
4. **Win Counter Preservation** - Win counters persist when settings are changed
5. **Visual Indicators** - Current game mode is highlighted, disabled button prevents re-selection

**Files Modified:**
- `src/hooks/useRoom.ts` - Added `updateGameMode()` function with host and status validation
- `src/pages/RoomLobby.tsx` - Added collapsible settings UI with game mode selection

**Security:**
- Only host can update game mode (validated in `updateGameMode()`)
- Cannot update while game is in progress (status must be 'waiting')

**User Experience:**
- Compact, collapsible UI to avoid clutter
- Shows all official game modes with difficulty badges
- Toast notifications for successful updates
- Non-host players see settings but cannot edit

---

#### Task 4: Fixed Guest User and Room Cleanup Issues (FIXED)
**Problem:** PERMISSION_DENIED errors when guest users disconnect, causing ghost accounts and empty rooms to accumulate in the database.

**Root Cause:** Firebase security rules only allowed write operations when `newData` exists. The `onDisconnect().remove()` operation tries to delete data (where `newData` is null), which was being denied.

**Solution:**
1. **Updated Security Rules** - Modified rules to allow deletion for guest users:
   ```json
   ".write": "$uid === auth.uid || ($uid.beginsWith('guest_') && (!newData.exists() || ...))"
   ```
2. **Enhanced Cleanup Logic** - Guest users now properly clean up:
   - User data (`/users/{guestUid}`)
   - Presence data (`/presence/{guestUid}`)
   - Room data (entire room deleted when host disconnects)
3. **Separate Handling** - Authenticated users set presence to offline; guest users remove all data

**Files Modified:**
- `database.rules.json` - Updated `/users/$uid` and `/presence/$uid` rules to allow deletion
- `src/contexts/AuthContext.tsx` - Improved disconnect handlers for guest vs authenticated users
- `src/hooks/useRoom.ts` - Simplified room cleanup (delete entire room when host disconnects)

**Edge Cases Handled:**
- Guest user closes browser/tab → Data cleaned up via `onDisconnect`
- Guest user loses internet → Firebase automatically triggers `onDisconnect`
- Host leaves room → Entire room deleted (simpler than host transfer on disconnect)
- All players leave room → Room deleted via `leaveRoom()` logic
- Guest in room when disconnecting → Player removed, room cleaned up if empty

**Technical Details:**
- `onDisconnect()` can only perform simple operations (set, remove, update)
- Cannot run complex logic like "check if room is empty" in `onDisconnect`
- Solution: Delete entire room when host disconnects (host is always required)
- Client-side `leaveRoom()` handles host transfer for intentional leaves

**User Experience:**
- No more ghost accounts in database
- No more empty rooms accumulating
- Clean, automatic cleanup on disconnect
- Proper error handling with console logging

---

### Critical Bug Fixes (Latest Session)

#### Issue 1: Fixed Maximum Update Depth Error in Quiz Games (CRITICAL - FIXED)
**Problem:** Both singleplayer and multiplayer games crashed with "Maximum update depth exceeded" error during active gameplay.

**Root Cause:** The `Quiz-Stats.component.tsx` component had `useEffect` hooks with `timer` object in their dependency arrays. The `timer` object from `react-timer-hook` changes on every render, causing infinite loops:
- Lines 44-48: Cleanup effect with `timer` dependency
- Lines 51-62: Visibility change effect with `timer` dependency
- Line 29: Timer restart effect with `internalTimer` dependency

**Solution:** Used `useRef` to store the timer object and access it via `.current` in effects, with empty dependency arrays:
```typescript
const timerRef = useRef(timer);
timerRef.current = timer;

// Cleanup timer on unmount
useEffect(() => {
  return () => {
    timerRef.current.pause();
  };
}, []); // Only run on mount/unmount

// Pause timer when tab is not visible
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      timerRef.current.pause();
    } else {
      timerRef.current.resume();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []); // Only run on mount/unmount
```

**Files Modified:**
- `src/features/quiz/quiz-questions/Quiz-Stats.component.tsx` - Fixed infinite loop with useRef pattern
- `src/pages/MultiplayerGame.tsx` - Fixed timer and question randomization issues

**Additional Fixes (Multiplayer):**

1. **Timer Not Counting Down:**
   - Root cause: Timer was being restarted in useEffect but `isRunning` was false
   - Solution: Changed approach to calculate `expiryTimestamp` in `useMemo` and pass it to `useTimer` with `autoStart: true`
   - The timer now automatically starts when the expiry timestamp changes

```typescript
// Before (timer didn't run):
const timer = useTimer({
  expiryTimestamp: defaultExpiry,
  autoStart: false,
});

useEffect(() => {
  if (room?.startedAt && room?.gameMode.duration) {
    timer.restart(newExpiry, true); // Didn't work reliably
  }
}, [room?.startedAt, room?.gameMode.duration]);

// After (timer runs correctly):
const expiryTimestamp = useMemo(() => {
  if (room?.startedAt && room?.gameMode.duration) {
    const elapsed = Math.floor((Date.now() - room.startedAt) / 1000);
    const remaining = Math.max(0, room.gameMode.duration - elapsed);
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + remaining);
    return expiry;
  }
  // Default expiry
  const time = new Date();
  time.setSeconds(time.getSeconds() + 60);
  return time;
}, [room?.startedAt, room?.gameMode.duration]);

const timer = useTimer({
  expiryTimestamp,
  onExpire: async () => { await finishGame(roomId); },
  autoStart: true, // ✅ Auto-start when expiry changes
});
```

2. **Same Questions Each Game:**
   - Root cause: Questions were loaded from `room.gameMode.questions` but never shuffled
   - Solution: Implemented seeded Fisher-Yates shuffle using `room.startedAt` as seed
   - Each new game gets a different `startedAt` timestamp, resulting in different question order
   - All players get the same shuffled order (deterministic based on seed)

```typescript
// Shuffle questions based on startedAt
if (updatedRoom.startedAt) {
  const seed = updatedRoom.startedAt;
  const questions = [...updatedRoom.gameMode.questions];

  // Seeded shuffle using Fisher-Yates with LCG random
  const seededRandom = (s: number) => {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    return ((a * s + c) % m) / m;
  };

  let currentSeed = seed;
  for (let i = questions.length - 1; i > 0; i--) {
    currentSeed = Math.floor(seededRandom(currentSeed) * Math.pow(2, 32));
    const j = Math.floor(seededRandom(currentSeed) * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  questionsRef.current = questions;
}
```

**Impact:** Games now work correctly in both singleplayer and multiplayer modes without crashing.

---

## Issue: Multiplayer Permission Errors and Timer Not Running (2025-10-21)

### Problems:
1. **PERMISSION_DENIED errors** when updating player scores in multiplayer games
2. **Timer not counting down** - showed `isRunning: false` even after starting
3. **Null reference error** in `subscribeToRoom` when `room.players` is null/undefined

### Root Causes:

1. **Permission Errors:**
   - Database rules for `rooms/$roomId/players/$playerId` had `.validate` rule requiring specific children
   - This prevented partial updates like updating just the `score` field
   - Rule: `.validate: "newData.hasChildren(['displayName', 'ready'])"`

2. **Timer Not Running:**
   - `useTimer` hook doesn't automatically restart when `expiryTimestamp` prop changes
   - Using `autoStart: true` with changing `expiryTimestamp` doesn't work
   - Need to manually call `timer.restart()` when game starts

3. **Null Reference:**
   - `subscribeToRoom` tried to call `Object.values(room.players)` without checking if `room.players` exists
   - Can happen when all players leave a room

### Solutions:

1. **Fixed Database Rules:**
```json
// Before (blocked partial updates):
"players": {
  "$playerId": {
    ".write": "...",
    ".validate": "newData.hasChildren(['displayName', 'ready'])" // ❌ Blocks score updates
  }
}

// After (allows partial updates):
"players": {
  "$playerId": {
    ".write": "..." // ✅ No validation, allows any field updates
  }
}
```

2. **Fixed Timer with Manual Restart:**
```typescript
// Track last startedAt to prevent duplicate restarts
const lastStartedAtRef = useRef<number | null>(null);

const timer = useTimer({
  expiryTimestamp,
  onExpire: async () => { await finishGame(roomId); },
  autoStart: false, // Don't auto-start
});

// Manually restart when game starts
useEffect(() => {
  if (room?.startedAt && room?.gameMode.duration) {
    if (lastStartedAtRef.current !== room.startedAt) {
      lastStartedAtRef.current = room.startedAt;

      const elapsed = Math.floor((Date.now() - room.startedAt) / 1000);
      const remaining = Math.max(0, room.gameMode.duration - elapsed);
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + remaining);

      timer.restart(newExpiry, true); // ✅ Manually restart with autoStart
    }
  }
}, [room?.startedAt, room?.gameMode.duration]);
```

3. **Fixed Null Check:**
```typescript
const roomData = snapshot.val();
const room: Room = { id: roomId, ...roomData };

// Check if players exist before accessing
if (!room.players) {
  await remove(roomRef);
  callback(null);
  return;
}

const players = Object.values(room.players); // ✅ Safe now
```

**Files Modified:**
- `database.rules.json` - Removed validation rule blocking partial player updates
- `src/hooks/useRoom.ts` - Added null check for `room.players`
- `src/pages/MultiplayerGame.tsx` - Fixed timer restart logic with ref tracking

**Impact:**
- ✅ Players can now update scores without permission errors
- ✅ Timer counts down correctly in multiplayer games
- ✅ No more null reference errors when room becomes empty

---

#### Issue 2: Fixed Win Counters Not Displaying (FIXED)
**Problem:** Win counter feature implemented in previous session was not showing up in multiplayer lobby after the first game.

**Root Cause:** The `hasIncrementedWinsRef` in `MultiplayerResults.tsx` was not being reset when players returned to the lobby. This meant:
- First game: Wins incremented correctly ✓
- Second game: `hasIncrementedWinsRef.current` was still `true`, so wins were NOT incremented ✗

**Solution:** Reset the `hasIncrementedWinsRef` flag when room status changes back to 'waiting':
```typescript
// If room status changed back to waiting, navigate to lobby
if (updatedRoom.status === 'waiting') {
  // Reset the wins increment flag for the next game
  hasIncrementedWinsRef.current = false;
  navigate(`/multiplayer/lobby/${roomId}`);
}
```

**Files Modified:**
- `src/pages/MultiplayerResults.tsx` - Reset wins increment flag on room reset

**Impact:** Win counters now properly increment and display for all games in a room session.

---

#### Issue 3: Fixed Host Disconnect Room Cleanup (FIXED)
**Problem:** When host refreshed the page or left, the room cleanup logic failed:
- Host refreshes → entire room deleted, all players kicked
- No host transfer mechanism
- Orphaned rooms if cleanup failed

**User Requirement:** Host transfer to another player if others are present; room deletion only if room becomes empty.

**Solution:** Implemented intelligent host transfer and cleanup:

1. **Changed onDisconnect Handler:**
   - Old: Delete entire room when host disconnects
   - New: Remove only the host player, let client-side logic handle transfer/cleanup

2. **Enhanced subscribeToRoom Listener:**
   - Detects when host is missing but players remain
   - Automatically transfers host to first remaining player
   - Makes new host ready automatically
   - Deletes room only when no players remain

3. **Added Configurable Player Limit:**
   - Room interface now includes `maxPlayers: number` (2-10)
   - Host selects player limit at room creation
   - Displayed in lobby as "Players (2/4)" format
   - Validated in `joinRoom` to prevent overfilling

**Files Modified:**
- `src/hooks/useRoom.ts`:
  - Updated `Room` interface with `maxPlayers` field
  - Modified `createRoom()` to accept `maxPlayers` parameter (default 4)
  - Changed disconnect handler to remove player instead of entire room
  - Enhanced `subscribeToRoom()` with host transfer logic
  - Updated `joinRoom()` to check against `maxPlayers`
- `src/pages/CreateRoom.tsx`:
  - Added player limit selector (2-10 players)
  - Passes `maxPlayers` to `createRoom()`
- `src/pages/RoomLobby.tsx`:
  - Updated player count display to show "Players (X/Y)"

**Host Transfer Logic:**
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
    // Host disconnected but players remain - transfer host
    const newHost = players[0] as RoomPlayer;
    await update(roomRef, {
      hostUid: newHost.uid,
      [`players/${newHost.uid}/ready`]: true,
    });
    return; // Wait for update to propagate
  } else if (players.length === 0) {
    // No players left - delete the room
    await remove(roomRef);
    callback(null);
    return;
  }

  callback(room);
});
```

**Edge Cases Handled:**
- Host refreshes with other players → Host transferred to first player
- Host closes tab with other players → Host transferred automatically
- Last player leaves → Room deleted
- Host leaves intentionally → `leaveRoom()` handles transfer (existing logic)
- All players disconnect → Room deleted

**User Experience:**
- Seamless host transfer without disruption
- Remaining players see new host badge
- No "Host Disconnected" errors unless room is deleted
- Configurable room size for different group sizes

---

## License & Credits

**License:** GNU General Public License v3.0
**Inspired by:** [zetamac](https://arithmetic.zetamac.com)
**UI Components:** [shadcn/ui](https://ui.shadcn.com)
**Icons:** [Lucide](https://lucide.dev)
**Backend:** [Firebase](https://firebase.google.com)
