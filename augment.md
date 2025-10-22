# Based Math Game - Technical Reference

## Project Overview
A React-based multiplayer quiz game for practicing base conversion (Binary, Octal, Decimal, Hexadecimal) with Firebase backend, real-time multiplayer, stats tracking, and leaderboards.

**Project:** `ts_based_website` | **Firebase:** `based-math-game` | **License:** GPL-3.0
**Repository:** https://github.com/hajin-park/based-math-game

---

## Recent Features

### User Experience Improvements
- **Exit Button**: Visible exit button in top-left corner for both single-player and multiplayer games with confirmation dialog
- **Kicked User Modal**: Proper modal dialog when user is kicked from a room (replaces toast notifications)
- **Pixel Art Avatars**: Automatic deterministic pixel art avatar generation for users without profile pictures
- **Leaderboard Rank Display**: Shows user's current rank and highlights their position on leaderboards

### Multiplayer Enhancements
- **8-Character Room Codes**: Updated from 6-digit to 8-character alphanumeric codes (A-Z, 0-9) with collision detection
- **Playground Mode in Rooms**: Added "Custom Playground" option in room game settings for fully customizable quiz configurations
- **Improved Disconnection Handling**:
  - Guest users: Completely removed from rooms on disconnect
  - Authenticated users: Marked as disconnected with reconnection capability

### Statistics & Analytics
- **Accuracy Tracking**: New metric tracking keystroke accuracy
  - Formula: `(total keystrokes - backspaces) / total keystrokes * 100`
  - Displayed in results page and stats dashboard
  - Stored in user stats and game history

### Technical Improvements
- **PWA Manifest**: Fixed manifest icon references with generated SVG icon
- **Security Rules**: Updated Firestore rules to support new accuracy fields
- **Database Cleanup**: Polished cleanup logic for empty rooms and ghost players

---

## Tech Stack

**Core:** React 19.2.0 + TypeScript 5.9.3 + Vite 7.1.11 + Tailwind CSS 3.4.3
**Backend:** Firebase JS SDK 12.4.0 (Firestore + Realtime Database + Auth + Hosting)
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
  /profile/game-settings → ProfileGameSettings (gameplay preferences)
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

**QuizResults:**
```typescript
{
  score: number,
  duration?: number,
  gameModeId?: string,
  totalKeystrokes?: number,      // total keystrokes entered
  backspaceCount?: number,       // number of backspaces
  accuracy?: number              // (totalKeystrokes - backspaceCount) / totalKeystrokes * 100
}
```

---

## Firebase Integration

### Dual-Database Architecture
The app uses **two Firebase databases** for different purposes:

1. **Firestore** - Persistent data for authenticated users:
   - User profiles (`/users/{userId}`)
   - User statistics (`/userStats/{userId}`)
   - Game history (`/userStats/{userId}/gameHistory/{gameId}`)
   - Global leaderboards (`/leaderboard-{gameModeId}/{userId}`)
   - Game settings (`/users/{userId}/gameSettings`)

2. **Realtime Database** - Ephemeral/real-time data:
   - Guest user sessions (`/users/{guestId}`)
   - Multiplayer rooms (`/rooms/{roomId}`)
   - Presence tracking (`/presence/{userId}`)

**Why two databases?**
- Firestore: Better for structured queries, permanent storage, and complex data models
- Realtime Database: Better for real-time sync, presence detection, and temporary data

### Configuration (`src/firebase/config.ts`)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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
export const database = getDatabase(app);  // Realtime Database
export const firestore = getFirestore(app); // Firestore

// Emulators in development (controlled by VITE_USE_FIREBASE_EMULATORS env var)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectDatabaseEmulator(database, '127.0.0.1', 9000);
  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
}
```

### Database Schema

#### Firestore (Persistent Data)
```
/users/{userId}  # Authenticated users only
  ├── uid: string
  ├── displayName: string
  ├── email: string | null
  ├── photoURL: string | null
  ├── createdAt: timestamp
  ├── lastSeen: timestamp
  └── gameSettings  # User game preferences
      ├── groupedDigits: boolean (default: false)
      ├── indexValueHints: boolean (default: false)
      └── countdownStart: boolean (default: true)

/userStats/{userId}  # Authenticated users only
  ├── gamesPlayed: number
  ├── totalScore: number
  ├── highScore: number
  ├── averageScore: number
  ├── lastPlayed: timestamp
  ├── totalKeystrokes: number (optional)
  ├── totalBackspaces: number (optional)
  └── averageAccuracy: number (optional, percentage)

/userStats/{userId}/gameHistory/{gameId}  # Authenticated users only
  ├── score: number
  ├── duration: number
  ├── gameModeId: string
  ├── timestamp: timestamp
  ├── totalKeystrokes: number (optional)
  ├── backspaceCount: number (optional)
  └── accuracy: number (optional, percentage)

/leaderboard-{gameModeId}/{userId}  # Authenticated users only
  ├── displayName: string
  ├── score: number (high score for this mode)
  ├── timestamp: timestamp
  ├── gameModeId: string
  └── isGuest: false (explicitly false, guest entries rejected by rules)
```

#### Realtime Database (Ephemeral/Real-time Data)
```
/rooms/{roomId}  # Multiplayer rooms (guests + authenticated)
  ├── hostUid: userId (can be guest or authenticated)
  ├── createdAt: timestamp
  ├── status: "waiting" | "playing" | "finished"
  ├── gameMode: GameMode object
  ├── maxPlayers: number (2-10)
  ├── allowVisualAids: boolean (default: true)  # Host control
  ├── enableCountdown: boolean (default: true)  # Host control
  ├── players/{userId}
  │   ├── uid: string
  │   ├── displayName: string
  │   ├── ready: boolean
  │   ├── score: number
  │   ├── finished: boolean
  │   ├── disconnected: boolean
  │   ├── kicked: boolean
  │   └── wins: number
  ├── startedAt: timestamp | null
  └── gameState (optional)
      ├── startedAt: timestamp | null
      ├── currentQuestion: number
      └── timeRemaining: number

/users/{guestId}  # Guest users only (temporary)
  ├── uid: string (starts with "guest_")
  ├── displayName: string
  ├── isGuest: true
  ├── createdAt: timestamp
  └── lastSeen: timestamp

/presence/{userId}  # Presence tracking (guests + authenticated)
  ├── uid: string
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
        ".write": "$uid === auth.uid || ($uid.beginsWith('guest_') && newData.child('uid').val() === $uid && newData.child('isGuest').val() === true)"
      }
    },
    "rooms": {
      ".read": "true",
      "$roomId": {
        ".write": "!data.exists() || data.child('hostUid').val() === auth.uid || data.child('hostUid').val().beginsWith('guest_') || (auth != null && data.child('players').child(auth.uid).exists()) || data.child('players').hasChild(newData.child('hostUid').val())",
        ".validate": "newData.hasChildren(['hostUid', 'gameMode', 'status'])",
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid || ($playerId.beginsWith('guest_') && newData.child('uid').val() === $playerId) || root.child('rooms').child($roomId).child('hostUid').val() === auth.uid || root.child('rooms').child($roomId).child('hostUid').val() === $playerId"
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
        ".write": "$uid === auth.uid || ($uid.beginsWith('guest_') && (!newData.exists() || newData.child('uid').val() === $uid))"
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

## Game Settings & Visual Aids

### User Game Settings
Authenticated users can customize their gameplay experience through the Profile > Game Settings page. Settings are stored in Firestore at `/users/{userId}/gameSettings`.

**Available Settings:**
1. **Grouped Digits** (default: false)
   - Binary/Hex: Groups of 4 digits with spaces (e.g., `1010 1100`)
   - Octal: Groups of 3 digits with spaces (e.g., `123 456`)
   - Decimal: Comma-separated thousands (e.g., `1,234`)
   - Automatically pads with leading zeros to complete groups

2. **Index Value Hints** (default: false)
   - Shows the positional value (power of base) under each digit
   - Not shown when converting FROM decimal
   - Example for binary `1010`: shows `8 4 2 1` underneath

3. **Countdown Start** (default: true)
   - Shows 3-2-1 countdown before game starts
   - Applies to both singleplayer and multiplayer

**Implementation:**
- `useGameSettings` hook - Loads settings from Firestore for authenticated users
- `ProfileGameSettings.tsx` - Settings UI with toggle switches
- `formatters.ts` - Utility functions for number formatting and index hints
- Guest users see default settings with a prompt to sign up

### Visual Aids in Quiz
Visual aids are applied in the `Quiz-Prompt` component based on user settings and multiplayer host controls.

**Formatting Functions (`formatters.ts`):**
```typescript
formatWithGrouping(value: string, base: string): string
// Groups digits based on base type with appropriate separators
// Binary/Hex: groups of 4, Octal: groups of 3, Decimal: commas

getIndexHints(value: string, base: string, grouped: boolean): string
// Returns formatted string of positional values aligned with each digit
// When grouped=true, adds spaces to match the grouped number format
```

**Multiplayer Host Controls:**
In multiplayer lobbies, the host can control visual aids for all players:
- `allowVisualAids` - Toggle to enable/disable visual aids for all players
- `enableCountdown` - Toggle to enable/disable countdown before game starts
- These settings override individual player preferences

### Countdown Component
A reusable countdown component (`Countdown.tsx`) that displays a 3-2-1 countdown before the game starts.

**Features:**
- Fast countdown: 0.6 seconds per number (1.8 seconds total)
- Minimal animations with color transitions (red → yellow → green)
- Backdrop blur overlay
- Calls `onComplete` callback when countdown finishes
- Configurable duration (default: 3 counts)

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

**Room Code Format:**
- **8-character alphanumeric codes** (A-Z, 0-9)
- Case-insensitive (normalized to uppercase)
- Collision detection with retry logic (max 10 attempts)
- Example: `ABC12XYZ`, `GAME2024`

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
  maxPlayers: number;           // 2-10 players
  allowVisualAids: boolean;     // Host control for visual aids
  enableCountdown: boolean;     // Host control for countdown
}

interface RoomPlayer {
  uid: string;
  displayName: string;
  ready: boolean;
  score: number;
  finished: boolean;
  disconnected: boolean;
  kicked: boolean;
  wins: number;
}
```

**Methods:**
- `createRoom(gameMode, maxPlayers)` - Create new room, returns roomId, sets up onDisconnect for host
- `joinRoom(roomId)` - Join existing room, sets up onDisconnect for player
- `leaveRoom(roomId)` - Leave room, transfer host or delete room if host leaves
- `setPlayerReady(roomId, ready)` - Set player ready status
- `startGame(roomId)` - Start game (host only)
- `updatePlayerScore(roomId, score)` - Update player score
- `finishGame(roomId)` - Mark player as finished
- `resetRoom(roomId)` - Reset room to waiting state (host only)
- `updateGameMode(roomId, gameMode)` - Update game mode (host only)
- `kickPlayer(roomId, playerId)` - Kick player from room (host only)
- `updateRoomSettings(roomId, settings)` - Update room settings (host only)
- `transferHost(roomId, newHostUid)` - Transfer host privileges (host only)
- `subscribeToRoom(roomId, callback)` - Real-time room updates, callback receives Room | null

**Host Controls:**
- Host can change game mode in lobby
- Host can kick players from lobby
- Host can transfer host privileges to another player (old host becomes not ready)
- Host can toggle visual aids for all players
- Host can toggle countdown before game starts
- When host leaves, host is automatically transferred to next player
- Game Settings section is expanded by default for hosts

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

### useGameSettings (`src/hooks/useGameSettings.ts`)
**User game settings management:**
```typescript
interface GameSettings {
  groupedDigits: boolean;
  indexValueHints: boolean;
  countdownStart: boolean;
}

const DEFAULT_GAME_SETTINGS: GameSettings = {
  groupedDigits: false,
  indexValueHints: false,
  countdownStart: true,
};
```

**Methods:**
- `settings` - Current game settings (defaults for guests)
- `loading` - Loading state

**Behavior:**
- Uses Firestore `onSnapshot` for real-time updates
- Automatically syncs when settings change in Firestore
- Returns default settings for guest users
- No manual reload needed

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

**Game Controls:**
- `ExitButton.tsx` - Exit button with confirmation dialog
  - Fixed position in top-left corner
  - AlertDialog confirmation before exiting
  - Customizable exit message
  - Used in both Quiz and MultiplayerGame pages
  - Prevents accidental exits with "Your progress will not be saved" warning

- `KickedModal.tsx` - Modal for kicked users
  - AlertDialog-based modal
  - Displays when user is kicked from a room
  - Single "OK" button to acknowledge and return to multiplayer menu
  - Replaces toast notifications for better UX

**User Interface:**
- `avatarGenerator.ts` - Pixel art avatar generation (`src/lib/`)
  - Generates deterministic 8x8 pixel art avatars based on user UID
  - Uses seeded random number generator for consistency
  - 5 color palettes with background and foreground colors
  - Symmetric design (mirrored left-right)
  - Returns SVG as base64 data URL
  - Used as fallback when user has no photoURL
  - Functions:
    - `generatePixelAvatar(uid, size)` - Generate pixel art SVG
    - `getUserAvatarUrl(user, uid)` - Get photoURL or generate avatar

**Quiz:**
- `Quiz-Prompt.component.tsx` - Enhanced question display with improved layout
  - Large, centered question display with clear base labels
  - Prominent answer input field with placeholder text
  - Success animations with checkmark and scale effect
  - Responsive layout (vertical on mobile, horizontal on desktop)
  - Arrow indicator between from/to bases
  - Helper text with keyboard shortcuts
  - Auto-focus on input for better UX
  - **Keystroke tracking**: Optional callbacks for tracking keystrokes and backspaces
    - `onKeystroke` callback fired when characters are added
    - `onBackspace` callback fired when characters are removed
    - Used for accuracy calculation in single-player mode

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

#### Seeded Fisher-Yates Shuffle
- **Purpose**: Ensure all players see same questions in same order
- **Seed**: Uses `room.startedAt` timestamp
- **Implementation**: Linear Congruential Generator (LCG) for deterministic randomness
```typescript
if (updatedRoom.startedAt) {
  const seed = updatedRoom.startedAt;
  const questions = [...updatedRoom.gameMode.questions];

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

### Database Rules Considerations

#### Partial Updates
- **Avoid strict validation rules** that require all fields to be present
- **Allow partial updates** for fields like `score`, `ready`, `finished`
- **Example**: Remove `.validate` rules that block partial player updates
```json
// Good (allows partial updates):
"players": {
  "$playerId": {
    ".write": "..."
  }
}

// Bad (blocks partial updates):
"players": {
  "$playerId": {
    ".write": "...",
    ".validate": "newData.hasChildren(['displayName', 'ready'])"
  }
}
```

---

## License & Credits

**License:** GNU General Public License v3.0
**Inspired by:** [zetamac](https://arithmetic.zetamac.com)
**UI Components:** [shadcn/ui](https://ui.shadcn.com)
**Icons:** [Lucide](https://lucide.dev)
**Backend:** [Firebase](https://firebase.google.com)
