# Based Math Game - Technical Reference

## Project Overview
A React-based multiplayer quiz game for practicing base conversion (Binary, Octal, Decimal, Hexadecimal) with Firebase backend, real-time multiplayer, stats tracking, and leaderboards.

**Project:** `ts_based_website` | **Firebase:** `based-math-game` | **License:** GPL-3.0
**Repository:** https://github.com/hajin-park/based-math-game

---

## Tech Stack

**Core:** React 19.2.0 + TypeScript 5.2.2 + Vite 7.1.7 + Tailwind CSS 3.4.3
**Backend:** Firebase JS SDK 12.4.0 (Realtime Database + Auth + Analytics + Hosting)
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
/singleplayer → SingleplayerMode (official modes + playground)
/settings → Settings (custom playground)
/quiz → Quiz (game page)
/results → Results (score display)
/multiplayer → MultiplayerHome (create/join room)
/multiplayer/create → CreateRoom
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
  gameModeId?: string            // optional game mode ID
}
```

---

## Firebase Integration

### Configuration (`src/firebase/config.ts`)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Environment variables from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "based-math-game.firebaseapp.com",
  databaseURL: "https://based-math-game-default-rtdb.firebaseio.com",
  projectId: "based-math-game",
  storageBucket: "based-math-game.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const analytics = getAnalytics(app);

// Emulators in development
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectDatabaseEmulator(database, "localhost", 9000);
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
export const OFFICIAL_GAME_MODES: GameMode[] = [
  {
    id: "binary-basics",
    name: "Binary Basics",
    description: "Convert between Binary and Decimal (0-255)",
    isOfficial: true,
    settings: {
      questions: [
        ["Binary", "Decimal", 0, 255],
        ["Decimal", "Binary", 0, 255]
      ],
      duration: 60
    }
  },
  // ... 5 more official modes
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
generateQuestion(fromBase: string, rangeLower: number, rangeUpper: number): string
```
1. Generate random decimal in range
2. Convert to fromBase using `Number.toString(radix)`
3. Return string

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
subscribeToRoom(roomId: string, callback: (room: Room) => void): () => void
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
  ready: boolean;
  score: number;
  finished: boolean;
}
```

**Room Lifecycle:**
1. Host creates room → status: "waiting"
2. Players join → added to players object
3. All players ready → host starts game → status: "playing"
4. Game ends → status: "finished"

**Guest User Support:**
- Both guest and authenticated users can create rooms
- Both can join rooms
- Security rules validate based on `hostUid` (supports `guest_` prefix)
- Rooms are publicly readable (`.read: "true"`)

### Real-time Synchronization
- Room state synced via Firebase Realtime Database
- Player scores updated in real-time during game
- Timer synchronized across all clients
- Disconnect handling with presence system

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
- `createRoom(gameMode)` - Create new room, returns roomId
- `joinRoom(roomId)` - Join existing room
- `leaveRoom(roomId)` - Leave room, delete if host
- `toggleReady(roomId)` - Toggle player ready status
- `startGame(roomId)` - Start game (host only)
- `updateScore(roomId, score)` - Update player score
- `finishGame(roomId)` - Mark player as finished
- `subscribeToRoom(roomId, callback)` - Real-time room updates
- `unsubscribeFromRoom(roomId)` - Clean up listener

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
- `Quiz-Prompt.component.tsx` - Question display + answer input with success animations
- `Quiz-Stats.component.tsx` - Timer + score + combo counter
- `Base-Select.component.tsx` - Base dropdown with form integration
- `Range-Input.component.tsx` - Number range inputs
- `Duration-Select.component.tsx` - Duration dropdown
- `Chosen-Settings-Table.component.tsx` - Settings list with delete
- `Game-Mode-Select.component.tsx` - Tabs for official/custom modes

**UI:**
- `Navigation-Bar.tsx` - Responsive nav with profile dropdown
  - Shows "Sign Up" button for guest users
  - Shows profile avatar dropdown for authenticated users
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
  - Singleplayer Mode: Official game modes and Playground customization
  - Multiplayer Mode: Creating/joining rooms and real-time competition
  - During the Quiz: Answer mechanics, scoring system, and on-screen info
  - Progress Tracking: Stats page and leaderboards explanation
  - Quick Tips: 6 actionable tips for improvement
  - Call-to-action section with links to Tutorials, Singleplayer, and Multiplayer
  - Minimal design with informative visual elements (color-coded bases, example displays)
  - Guest user notice about stat limitations
- `Tutorials.tsx` - Base conversion tutorials
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
- **dist/assets/index-*.css** - 43.53 kB (8.27 kB gzipped)
- **dist/assets/index-*.js** - 950.85 kB (260.74 kB gzipped)

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
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
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
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
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

### Accessibility
- **ARIA labels:** All interactive elements
- **Keyboard navigation:** Tab order, focus management
- **Screen reader support:** Semantic HTML, proper labels
- **Keyboard shortcuts:** Escape to home, etc.

### Performance
- **Code splitting:** Dynamic imports for routes (future)
- **Image optimization:** WebP format, lazy loading
- **Bundle size:** 950 kB (260 kB gzipped)
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

// Update specific fields
await update(ref(database, `rooms/${roomId}`), { status: "playing" });

// Delete data
await remove(ref(database, `rooms/${roomId}`));
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
- Verify expiry timestamp calculation
- Check useEffect cleanup

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

## License & Credits

**License:** GNU General Public License v3.0
**Inspired by:** [zetamac](https://arithmetic.zetamac.com)
**UI Components:** [shadcn/ui](https://ui.shadcn.com)
**Icons:** [Lucide](https://lucide.dev)
**Backend:** [Firebase](https://firebase.google.com)
