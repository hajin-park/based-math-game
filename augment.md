# Based Math Game - Technical Reference

## Project Overview
A React-based multiplayer quiz game for practicing base conversion (Binary, Octal, Decimal, Hexadecimal) with Firebase backend, real-time multiplayer, stats tracking, and leaderboards.

**Project:** `ts_based_website` | **Firebase:** `based-math-game` | **License:** GPL-3.0
**Repository:** https://github.com/hajin-park/Based-Math-Game

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
├── components/          # Shared components (ErrorBoundary, ProtectedRoute, ConnectionStatus)
│   └── ui/             # shadcn UI components (button, card, form, input, etc.)
├── contexts/           # React contexts (AuthContext, GameContexts)
├── features/           # Feature modules
│   ├── quiz/          # Quiz settings, questions, results components
│   └── ui/            # Navigation, Footer
├── firebase/          # Firebase config
├── hooks/             # Custom hooks (useRoom, useStats, useGameHistory, etc.)
├── pages/             # Route pages (Home, Quiz, Results, Leaderboard, etc.)
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
/profile → Profile (user account management)
/login → Login (email/Google sign-in)
/signup → Signup (guest account linking)
```

### State Management
**Contexts:**
- `AuthContext` - User auth state, sign-in/out, account linking
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
  ├── displayName: string
  ├── email: string | null
  ├── photoURL: string | null
  ├── isAnonymous: boolean
  ├── createdAt: timestamp
  ├── lastSeen: timestamp
  ├── presence: "online" | "offline"
  └── stats/{gameModeId}
      ├── gamesPlayed: number
      ├── totalScore: number
      ├── highScore: number
      ├── averageScore: number
      ├── lastPlayed: timestamp
      └── gameHistory/{gameId}
          ├── score: number
          ├── duration: number
          ├── timestamp: timestamp
          └── questionsPerSecond: number

/rooms/{roomId}
  ├── createdBy: userId
  ├── createdAt: timestamp
  ├── status: "waiting" | "playing" | "finished"
  ├── hasPassword: boolean
  ├── passwordHash: string | null
  ├── maxPlayers: number (default 4)
  ├── settings
  │   ├── questions: QuestionSetting[]
  │   ├── duration: number
  │   └── gameModeId: string
  ├── players/{userId}
  │   ├── displayName: string
  │   ├── joinedAt: timestamp
  │   ├── ready: boolean
  │   ├── score: number
  │   └── status: "connected" | "disconnected"
  └── gameState
      ├── startedAt: timestamp | null
      ├── currentQuestion: number
      └── timeRemaining: number

/leaderboards/{gameModeId}/{userId}
  ├── displayName: string
  ├── highScore: number
  ├── gamesPlayed: number
  ├── averageScore: number
  └── lastUpdated: timestamp

/gameModes/{gameModeId}
  ├── name: string
  ├── description: string
  ├── isOfficial: boolean
  ├── settings
  │   ├── questions: QuestionSetting[]
  │   └── duration: number
  └── createdAt: timestamp
```

### Security Rules (`database.rules.json`)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid",
        "stats": {
          "$gameModeId": {
            "gameHistory": {
              ".indexOn": ["timestamp"]
            }
          }
        }
      }
    },
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('createdBy').val() === auth.uid || data.child('players').child(auth.uid).exists())",
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid"
          }
        }
      }
    },
    "leaderboards": {
      "$gameModeId": {
        ".read": true,
        "$uid": {
          ".write": "$uid === auth.uid"
        }
      }
    },
    "gameModes": {
      ".read": true
    }
  }
}
```

---

## Authentication System

### AuthContext (`src/contexts/AuthContext.tsx`)
**Features:**
- Auto guest sign-in on app load
- Account linking (guest → email/Google)
- Presence system (online/offline status)
- User profile management

**Methods:**
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAsGuest: () => Promise<void>;
  linkGuestToEmail: (email: string, password: string) => Promise<void>;
  linkGuestToGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Flow:**
1. App loads → auto guest sign-in
2. User plays as guest
3. Optional: link guest account to email/Google
4. Guest data preserved after linking

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
createRoom(settings, hasPassword, password, maxPlayers): Promise<string>
joinRoom(roomId, password?): Promise<void>
leaveRoom(roomId): Promise<void>
updatePlayerReady(roomId, ready): Promise<void>
startGame(roomId): Promise<void>
```

**Room Lifecycle:**
1. Host creates room → status: "waiting"
2. Players join → added to players object
3. All players ready → host starts game → status: "playing"
4. Game ends → status: "finished"

**Password Protection:**
- Passwords hashed with SHA-256 before storage
- Hash compared on join attempt

**Rate Limiting:**
- Max 5 rooms per user
- Enforced in database security rules

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
saveGameResult(gameModeId: string, score: number, duration: number): Promise<void>
```

**Updates:**
1. User stats: gamesPlayed, totalScore, highScore, averageScore, lastPlayed
2. Game history: individual game record with timestamp
3. Leaderboard: user's entry for game mode

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

---

## Key Hooks

### useKeyboardShortcuts
- Escape key: Navigate to home
- Global keyboard shortcuts for accessibility

### useTabVisibility
- Pauses timer when tab hidden (singleplayer only)
- Prevents cheating in multiplayer
- Uses Page Visibility API

### useConnectionState
- Monitors Firebase connection status
- Shows alert when disconnected
- Auto-reconnect handling

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
- `Navigation-Bar.tsx` - Responsive nav with user menu, mobile sheet
- `Footer.tsx` - Footer with GitHub link
- `ErrorBoundary.tsx` - Error boundary with recovery
- `ProtectedRoute.tsx` - Route protection for auth
- `ConnectionStatus.tsx` - Firebase connection indicator

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
// Get current user
const user = auth.currentUser;

// Sign in anonymously
await signInAnonymously(auth);

// Link guest to email
const credential = EmailAuthProvider.credential(email, password);
await linkWithCredential(user, credential);

// Sign out
await signOut(auth);
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
