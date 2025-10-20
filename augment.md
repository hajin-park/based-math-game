# Based Math Game - Repository Analysis and Development Plan

## Project Overview
A React-based quiz game for practicing base conversion (Binary, Octal, Decimal, Hexadecimal). Users customize game settings and play timed conversion challenges. Inspired by [zetamac](https://arithmetic.zetamac.com).

**Project Name:** `ts_based_website`
**Firebase Project ID:** `based-math-game`
**Repository:** https://github.com/hajin-park/Based-Math-Game
**License:** GNU General Public License v3.0

---

## Tech Stack

### Core Technologies
- **Build Tool:** Vite 7.1.7
- **Framework:** React 19.2.0 with TypeScript 5.2.2
- **Routing:** React Router DOM 6.22.3
- **Styling:** Tailwind CSS 3.4.3
- **UI Components:** shadcn UI (Radix UI primitives)
- **Form Management:** React Hook Form 7.51.2 + Zod 3.22.4
- **Hosting:** Firebase Hosting

### Key Dependencies
- `@vitejs/plugin-react-swc` - Fast React refresh with SWC
- `react-timer-hook` 3.0.7 - Timer functionality for quiz
- `@headlessui/react` 1.7.18 - Accessible UI components
- `@heroicons/react` 2.1.3 - Icon library
- `class-variance-authority` 0.7.0 - CVA for component variants
- `tailwind-merge` 2.2.2 - Tailwind class merging utility
- `tailwindcss-animate` 1.0.7 - Animation utilities

---

## Project Structure

### Directory Layout
```
src/
├── Contexts.js              # React contexts (QuizContext, ResultContext)
├── main.tsx                 # App entry point with router config
├── index.css                # Tailwind imports + CSS variables
├── components/ui/           # shadcn UI components
├── features/
│   ├── quiz/
│   │   ├── quiz-settings/   # Settings page components
│   │   ├── quiz-questions/  # Quiz game logic & components
│   │   └── quiz-results/    # Results page components
│   ├── tutorials/           # Tutorial feature (not implemented)
│   └── ui/                  # Shared UI (Navigation, Footer)
├── pages/                   # Route pages
├── utils/                   # Layout & ScrollToTop utility
└── lib/                     # Utility functions (cn helper)
```

### Configuration Files
- `vite.config.ts` - Path aliases: `@/` → `./src/`, `@features/` → `./src/features/`
- `tsconfig.json` - TypeScript config with strict mode, `noImplicitAny: false`
- `tailwind.config.js` - shadcn theme with stone base color, CSS variables enabled
- `components.json` - shadcn config: new-york style, stone base color
- `firebase.json` - Hosting config: serves `dist/`, SPA rewrites to `/index.html`
- `.firebaserc` - Default project: `based-math-game`

---

## Application Architecture

### Routing (React Router v6)
**Routes defined in `src/main.tsx`:**
- `/` → Settings page (home/playground)
- `/quiz` → Quiz game page
- `/results` → Results page
- `/how-to-play` → Usage page (TODO - placeholder)
- `/tutorials` → Tutorials page (TODO - placeholder)

**Layout:** All routes wrapped in `<Layout>` component with Navigation + Footer

### State Management
**Context-based state (no Redux/Zustand):**

1. **QuizContext** (`src/Contexts.js`)
   - Provides: `{ settings, setSettings }`
   - Managed in: `src/utils/Layout.tsx`
   - Initial state: `{}`
   - Used by: Settings, Quiz, Results pages

2. **ResultContext** (`src/Contexts.js`)
   - Provides: `{ results, setResults }`
   - Managed in: `src/utils/Layout.tsx`
   - Initial state: `{}`
   - Used by: Quiz, Results pages

**Settings Object Structure:**
```typescript
{
  questions: Array<[fromBase: string, toBase: string, rangeLower: number, rangeUpper: number]>,
  duration: number  // in seconds
}
```

**Results Object Structure:**
```typescript
{
  score: number,        // number of correct answers
  duration?: number,    // game duration in seconds
  gameModeId?: string   // ID of the game mode played (for stats tracking)
}
```

**Note:** No accuracy/attempts tracked - the game validates on every keystroke, so only successful completions are counted.

---

## Implemented Features

### 1. Settings/Playground Page (`src/pages/Settings.tsx`)
**Purpose:** Configure quiz parameters before starting

**Components Used:**
- `SettingsHeader` - Title and description
- `BaseSelect` - Dropdown for selecting bases (from/to)
- `RangeInput` - Number inputs for min/max range
- `ChosenSettingsTable` - Scrollable list of added settings with delete
- `DurationSelect` - Dropdown for quiz duration

**Form Validation (Zod):**
- `fromBase` & `toBase`: Required strings, must be different
- `rangeLower`: Non-negative number
- `rangeUpper`: Must be ≥ `rangeLower`
- `duration`: Positive number

**Key Logic:**
- Base options dynamically filtered to prevent same from/to base
- Settings stored as array of tuples: `[fromBase, toBase, min, max]`
- Duplicate settings automatically removed
- Settings persist between games via context
- On submit: navigates to `/quiz` with settings in context

**Base Options:** `["Binary", "Octal", "Decimal", "Hexadecimal"]`
**Duration Options:** `[10, 15, 30, 60, 120, 180, 300]` seconds

### 2. Quiz Game Page (`src/pages/Quiz.tsx`)
**Purpose:** Timed base conversion quiz

**Components Used:**
- `QuizStats` - Timer countdown + current score display
- `QuizPrompt` - Question display + answer input

**Game Flow:**
1. Timer starts on mount (using `react-timer-hook`)
2. Random setting selected from `settings.questions` array
3. Question generated based on selected setting
4. User types answer in input field
5. Answer validated on each keystroke
6. If correct: score increments, input clears, new question generated
7. On timer expiry: navigate to `/results` with final score

**Key Logic:**
- Timer expiry timestamp: `new Date() + settings.duration`
- Random setting selection on mount and after each correct answer
- Real-time answer validation (no submit button)
- Score tracked in local state, passed to ResultContext on completion

### 3. Results Page (`src/pages/Results.tsx`)
**Purpose:** Display final score and replay option

**Displays:**
- Final score (from ResultContext)
- Quiz duration (from QuizContext)
- "Play again?" button → navigates to `/`

**Note:** Currently very basic, no persistence or leaderboard

---

## Core Game Logic

### Question Generation (`src/features/quiz/quiz-questions/generator.ts`)
**Function:** `generateQuestion(fromBase: string, rangeLower: number, rangeUpper: number): string`

**Process:**
1. Map base name to radix: `{ binary: 2, octal: 8, decimal: 10, hexadecimal: 16 }`
2. Generate random decimal number in range `[rangeLower, rangeUpper]`
3. Convert to `fromBase` representation using `Number.toString(radix)`
4. Return as string

**Example:** `generateQuestion("Hexadecimal", 0, 255)` → `"a7"` (167 in hex)

### Base Conversion (`src/features/quiz/quiz-questions/converter.ts`)
**Function:** `convertBase(inputString: string, fromBase: string, toBase: string): string`

**Process:**
1. Map base names to radix numbers (case-insensitive)
2. Parse `inputString` from `fromBase` to decimal: `parseInt(inputString, fromBaseRadix)`
3. Convert decimal to `toBase`: `number.toString(toBaseRadix)`
4. Return result string

**Error Handling:**
- Throws if base name not in mapping
- Throws if `inputString` invalid for `fromBase`

**Example:** `convertBase("ff", "Hexadecimal", "Decimal")` → `"255"`

### Answer Validation (`src/features/quiz/quiz-questions/validator.ts`)
**Function:** `validateAnswer(expected: string, actual: string, toBase: string): boolean`

**Process:**
1. Clean both strings:
   - Remove `0x` prefix if `toBase` is hexadecimal
   - Remove leading zeros
   - Convert to lowercase
2. Compare cleaned strings for equality

**Example:** `validateAnswer("ff", "0xFF", "Hexadecimal")` → `true`

### Quiz Prompt Component (`src/features/quiz/quiz-questions/Quiz-Prompt.component.tsx`)
**Integration of all logic:**
1. Generate question on mount and score change
2. On input change:
   - Convert question from `fromBase` to `toBase` (expected answer)
   - Validate user input against expected answer
   - If valid: clear input, increment score (triggers new question)

**Setting Structure:** `[fromBase, toBase, rangeLower, rangeUpper]`

---

## Firebase Integration

### Current Status: **HOSTING ONLY**
- **No Firebase SDK imported** in the codebase
- **No Realtime Database** integration
- **No Authentication** integration
- **No Firestore** integration

### Hosting Configuration
**File:** `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```
- Serves built files from `dist/` directory
- SPA routing: all routes rewrite to `/index.html`

### CI/CD (GitHub Actions)
**Workflows:**
1. `.github/workflows/firebase-hosting-merge.yml` - Deploy to production on push to `main`
2. `.github/workflows/firebase-hosting-pull-request.yml` - Deploy preview on PR

**Build Command:** `npm ci && npm run build`
**Service Account:** `FIREBASE_SERVICE_ACCOUNT_BASED_MATH_GAME` (GitHub secret)

### Future Integration Points
**To add Firebase features, you would need to:**
1. Install Firebase SDK: `npm install firebase`
2. Create `src/firebase.ts` with config and initialization
3. Import and initialize in `src/main.tsx` or relevant components
4. Update `firebase.json` to include database/firestore/auth rules

**Example Firebase Config Structure:**
```typescript
// src/firebase.ts (NOT CURRENTLY PRESENT)
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "based-math-game.firebaseapp.com",
  databaseURL: "https://based-math-game-default-rtdb.firebaseio.com",
  projectId: "based-math-game",
  storageBucket: "based-math-game.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
```

---

## UI Components

### shadcn Components (in `src/components/ui/`)
- `button.tsx` - Button with variants (default, destructive, outline, etc.)
- `card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `form.tsx` - Form wrapper components for react-hook-form
- `input.tsx` - Text/number input
- `label.tsx` - Form label
- `select.tsx` - Dropdown select (Radix UI)
- `scroll-area.tsx` - Scrollable container (Radix UI)
- `separator.tsx` - Horizontal/vertical divider
- `toast.tsx` + `toaster.tsx` + `use-toast.ts` - Toast notifications (not currently used)

### Custom Feature Components

**Quiz Settings:**
- `Base-Select.component.tsx` - Dropdown for base selection with form integration
- `Range-Input.component.tsx` - Number input for min/max range
- `Duration-Select.component.tsx` - Dropdown for quiz duration
- `Chosen-Settings-Table.component.tsx` - Scrollable list with delete buttons
- `Settings-Header.component.tsx` - Title and description card header

**Quiz Questions:**
- `Quiz-Prompt.component.tsx` - Question display + answer input
- `Quiz-Stats.component.tsx` - Timer + score display in card header

**UI:**
- `Navigation-Bar.tsx` - Top nav with mobile menu (Headless UI Dialog)
- `Footer.tsx` - Footer with GitHub link

---

## Styling System

### Tailwind Configuration
**Base Color:** Stone (from shadcn)
**CSS Variables:** Enabled for theming
**Dark Mode:** Class-based (`.dark` class)

**Custom CSS Variables (in `src/index.css`):**
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--radius` (0.5rem)

**Utility Function:** `cn()` in `src/lib/utils.ts` - Merges Tailwind classes with `clsx` and `tailwind-merge`

---

## Known Issues & TODOs

### Incomplete Features
1. **Usage Page** (`src/pages/Usage.tsx`) - Placeholder only
2. **Tutorials Page** (`src/pages/Tutorials.tsx`) - Placeholder only
3. **Results Persistence** - No database integration for leaderboards
4. **User Authentication** - Not implemented
5. **Settings Footer** - Commented out in Settings page

### Code Quality Notes
- Multiple `@ts-ignore` comments in Quiz/Results pages (context typing)
- Mix of `.tsx` and `.js` files (Contexts.js, ScrollToTop.jsx, index files)
- `noImplicitAny: false` in tsconfig - allows untyped code
- Console.log statement in Quiz.tsx (line 24)

### Potential Improvements
- Add TypeScript types for contexts
- Persist settings to localStorage
- Add difficulty levels
- Track accuracy (correct/incorrect ratio)
- Add sound effects
- Implement leaderboard with Firebase Realtime Database
- Add user profiles with Firebase Auth
- Mobile keyboard optimization for hex input

---

## Build & Development

### Scripts
- `npm run dev` - Start Vite dev server
- `npm run build` - TypeScript compile + Vite build to `dist/`
- `npm run preview` - Preview production build locally
- `npm run lint` - ESLint check

### Build Output
- **Directory:** `dist/`
- **Entry:** `index.html`
- **Assets:** Hashed filenames in `dist/assets/`

### Deployment
- **Platform:** Firebase Hosting
- **Trigger:** Push to `main` branch or PR
- **URL:** Configured in Firebase console (not in codebase)

---

## Critical Implementation Details

### Base Conversion Mapping (MUST USE EXACT STRINGS)
```typescript
const baseMappings = {
  "binary": 2,
  "octal": 8,
  "decimal": 10,
  "hexadecimal": 16
};
```
**IMPORTANT:** All base names are **lowercase** in the mapping. The UI displays capitalized names ("Binary", "Octal", etc.) but conversion functions use `.toLowerCase()` before lookup.

### Settings Data Flow
1. **Settings Page:** User builds array of settings → stores in QuizContext
2. **Quiz Page:** Reads settings from QuizContext → randomly selects one per question
3. **Results Page:** Reads settings.duration from QuizContext for display

### Score Calculation
- **Increment:** +1 per correct answer (no partial credit)
- **Auto-Validation:** Answers checked on every keystroke - correct input immediately advances to next question
- **No Incorrect Attempts:** Since validation is automatic, only successful completions are counted
- **No Time Bonus:** Score is purely based on number of correct answers within time limit
- **Pure Speed Metric:** The game measures how fast you can answer correctly, not accuracy
- **Storage:** Temporary (in-memory via context, lost on refresh until Firebase integration)

### Timer Implementation
- Uses `react-timer-hook` library
- Expiry timestamp calculated: `new Date().setSeconds(new Date().getSeconds() + duration)`
- `onExpire` callback sets `running` state to `false`
- `useEffect` watches `running` state to navigate to results

---

---

## PLANNED FEATURE IMPLEMENTATION GUIDE

### Overview of New Features
This section provides comprehensive implementation details for the major feature updates planned for the Based Math Game. All implementations use React 19, Firebase JS SDK v10+, and shadcn UI components.

---

## 1. FIREBASE INTEGRATION

### 1.1 Firebase SDK Setup

**Required Packages:**
```bash
npm install firebase
```

**Firebase Configuration File:** `src/firebase/config.ts`
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "based-math-game.firebaseapp.com",
  databaseURL: "https://based-math-game-default-rtdb.firebaseio.com",
  projectId: "based-math-game",
  storageBucket: "based-math-game.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectDatabaseEmulator(database, "localhost", 9000);
}
```

**Environment Variables:** Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Update firebase.json:**
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

### 1.2 Firebase Realtime Database Structure

**Database Schema:**
```
based-math-game/
├── users/
│   └── {userId}/
│       ├── displayName: string
│       ├── email: string | null
│       ├── photoURL: string | null
│       ├── isAnonymous: boolean
│       ├── createdAt: timestamp
│       └── stats/
│           └── {gameModeId}/
│               ├── gamesPlayed: number
│               ├── totalScore: number
│               ├── highScore: number
│               ├── averageScore: number
│               ├── lastPlayed: timestamp
│               └── gameHistory/
│                   └── {gameId}/
│                       ├── score: number
│                       ├── duration: number
│                       ├── timestamp: timestamp
│                       └── questionsPerSecond: number
├── rooms/
│   └── {roomId}/
│       ├── createdBy: userId
│       ├── createdAt: timestamp
│       ├── status: "waiting" | "playing" | "finished"
│       ├── hasPassword: boolean
│       ├── passwordHash: string | null
│       ├── maxPlayers: number (default 4)
│       ├── settings/
│       │   ├── questions: array
│       │   ├── duration: number
│       │   └── gameModeId: string
│       ├── players/
│       │   └── {userId}/
│       │       ├── displayName: string
│       │       ├── joinedAt: timestamp
│       │       ├── ready: boolean
│       │       ├── score: number
│       │       └── status: "connected" | "disconnected"
│       └── gameState/
│           ├── startedAt: timestamp | null
│           ├── currentQuestion: number
│           └── timeRemaining: number
├── leaderboards/
│   └── {gameModeId}/
│       └── {userId}/
│           ├── displayName: string
│           ├── highScore: number
│           ├── gamesPlayed: number
│           ├── averageScore: number
│           └── lastUpdated: timestamp
└── gameModes/
    └── {gameModeId}/
        ├── name: string
        ├── description: string
        ├── isOfficial: boolean
        ├── settings/
        │   ├── questions: array
        │   └── duration: number
        └── createdAt: timestamp
```

**Security Rules:** `database.rules.json`
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid",
        "stats": {
          ".validate": "newData.hasChildren()",
          "$gameModeId": {
            "gameHistory": {
              ".read": "auth != null",
              ".write": "$uid === auth.uid",
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
      ".read": true,
      "$gameModeId": {
        ".write": "auth != null && root.child('users').child(auth.uid).child('isAdmin').val() === true"
      }
    }
  }
}
```

---

## 2. AUTHENTICATION SYSTEM

### 2.1 Guest User Authentication

**Auth Context:** `src/contexts/AuthContext.tsx`
```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { ref, set, remove, onDisconnect } from 'firebase/database';
import { auth, database } from '@/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAsGuest: () => Promise<void>;
  linkGuestToEmail: (email: string, password: string) => Promise<void>;
  linkGuestToGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Create/update user in database
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        await set(userRef, {
          displayName: firebaseUser.displayName || `Guest${firebaseUser.uid.slice(0, 6)}`,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
          createdAt: firebaseUser.metadata.creationTime,
          lastSeen: Date.now()
        });

        // Set up presence system
        const presenceRef = ref(database, `users/${firebaseUser.uid}/presence`);
        await set(presenceRef, 'online');
        onDisconnect(presenceRef).set('offline');

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  };

  const linkGuestToEmail = async (email: string, password: string) => {
    if (!user || !user.isAnonymous) {
      throw new Error('No guest user to link');
    }

    try {
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);

      // Delete guest data if needed
      // Guest data is preserved and transferred to permanent account
    } catch (error) {
      console.error('Error linking guest to email:', error);
      throw error;
    }
  };

  const linkGuestToGoogle = async () => {
    if (!user || !user.isAnonymous) {
      throw new Error('No guest user to link');
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // User is now linked
    } catch (error) {
      console.error('Error linking guest to Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (user?.isAnonymous) {
      // Delete anonymous user data
      const userRef = ref(database, `users/${user.uid}`);
      await remove(userRef);
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInAsGuest, linkGuestToEmail, linkGuestToGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Auto Guest Sign-In:** Update `src/main.tsx`
```typescript
import { AuthProvider } from '@/contexts/AuthContext';

// Wrap app with AuthProvider
<AuthProvider>
  <RouterProvider router={router} />
</AuthProvider>
```

**Protected Route Component:** `src/components/ProtectedRoute.tsx`
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Replace with proper loading component
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

---

## 3. GAME MODES SYSTEM

### 3.1 Game Mode Types

**Types:** `src/types/gameMode.ts`
```typescript
export interface QuestionSetting {
  fromBase: string;
  toBase: string;
  rangeLower: number;
  rangeUpper: number;
}

export interface GameModeSettings {
  questions: QuestionSetting[];
  duration: number; // in seconds
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  isOfficial: boolean;
  settings: GameModeSettings;
  createdAt: number;
  createdBy?: string;
}

export const OFFICIAL_GAME_MODES: GameMode[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Binary and Decimal conversions with small numbers',
    isOfficial: true,
    settings: {
      questions: [
        { fromBase: 'Binary', toBase: 'Decimal', rangeLower: 0, rangeUpper: 15 },
        { fromBase: 'Decimal', toBase: 'Binary', rangeLower: 0, rangeUpper: 15 }
      ],
      duration: 60
    },
    createdAt: Date.now()
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'All bases with medium range numbers',
    isOfficial: true,
    settings: {
      questions: [
        { fromBase: 'Binary', toBase: 'Decimal', rangeLower: 0, rangeUpper: 255 },
        { fromBase: 'Octal', toBase: 'Decimal', rangeLower: 0, rangeUpper: 255 },
        { fromBase: 'Hexadecimal', toBase: 'Decimal', rangeLower: 0, rangeUpper: 255 },
        { fromBase: 'Decimal', toBase: 'Binary', rangeLower: 0, rangeUpper: 255 },
        { fromBase: 'Decimal', toBase: 'Octal', rangeLower: 0, rangeUpper: 255 },
        { fromBase: 'Decimal', toBase: 'Hexadecimal', rangeLower: 0, rangeUpper: 255 }
      ],
      duration: 120
    },
    createdAt: Date.now()
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'All bases with large numbers',
    isOfficial: true,
    settings: {
      questions: [
        { fromBase: 'Binary', toBase: 'Hexadecimal', rangeLower: 0, rangeUpper: 65535 },
        { fromBase: 'Hexadecimal', toBase: 'Binary', rangeLower: 0, rangeUpper: 65535 },
        { fromBase: 'Octal', toBase: 'Hexadecimal', rangeLower: 0, rangeUpper: 65535 },
        { fromBase: 'Hexadecimal', toBase: 'Octal', rangeLower: 0, rangeUpper: 65535 }
      ],
      duration: 180
    },
    createdAt: Date.now()
  },
  {
    id: 'speed',
    name: 'Speed Challenge',
    description: 'Quick conversions under time pressure',
    isOfficial: true,
    settings: {
      questions: [
        { fromBase: 'Binary', toBase: 'Decimal', rangeLower: 0, rangeUpper: 31 },
        { fromBase: 'Decimal', toBase: 'Binary', rangeLower: 0, rangeUpper: 31 },
        { fromBase: 'Hexadecimal', toBase: 'Decimal', rangeLower: 0, rangeUpper: 31 },
        { fromBase: 'Decimal', toBase: 'Hexadecimal', rangeLower: 0, rangeUpper: 31 }
      ],
      duration: 30
    },
    createdAt: Date.now()
  }
];
```

### 3.2 Game Mode Selection Component

**Component:** `src/features/quiz/quiz-settings/Game-Mode-Select.component.tsx`
```typescript
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OFFICIAL_GAME_MODES, GameMode } from '@/types/gameMode';

interface GameModeSelectProps {
  onSelectMode: (mode: GameMode) => void;
  onCustomMode: () => void;
}

export function GameModeSelect({ onSelectMode, onCustomMode }: GameModeSelectProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Select Game Mode</h2>

      <Tabs defaultValue="official">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="official">Official Modes</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="official" className="space-y-4">
          {OFFICIAL_GAME_MODES.map((mode) => (
            <Card key={mode.id} className="cursor-pointer hover:bg-accent" onClick={() => onSelectMode(mode)}>
              <CardHeader>
                <CardTitle>{mode.name}</CardTitle>
                <CardDescription>{mode.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Duration: {mode.settings.duration}s | Questions: {mode.settings.questions.length} types
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Playground Mode</CardTitle>
              <CardDescription>Create your own custom game settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onCustomMode}>Create Custom Game</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 4. MULTIPLAYER SYSTEM

### 4.1 Room Management

**Room Hook:** `src/hooks/useRoom.ts`
```typescript
import { useState, useEffect } from 'react';
import { ref, set, onValue, update, remove, push } from 'firebase/database';
import { database } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { GameModeSettings } from '@/types/gameMode';

interface Room {
  id: string;
  createdBy: string;
  createdAt: number;
  status: 'waiting' | 'playing' | 'finished';
  hasPassword: boolean;
  maxPlayers: number;
  settings: GameModeSettings;
  players: Record<string, Player>;
}

interface Player {
  displayName: string;
  joinedAt: number;
  ready: boolean;
  score: number;
  status: 'connected' | 'disconnected';
}

export function useRoom(roomId?: string) {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoom({ id: roomId, ...snapshot.val() });
      } else {
        setRoom(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const createRoom = async (settings: GameModeSettings, password?: string, maxPlayers = 4) => {
    if (!user) throw new Error('Must be authenticated');

    const roomsRef = ref(database, 'rooms');
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key!;

    const roomData: Omit<Room, 'id'> = {
      createdBy: user.uid,
      createdAt: Date.now(),
      status: 'waiting',
      hasPassword: !!password,
      maxPlayers,
      settings,
      players: {
        [user.uid]: {
          displayName: user.displayName || 'Guest',
          joinedAt: Date.now(),
          ready: false,
          score: 0,
          status: 'connected'
        }
      }
    };

    if (password) {
      // In production, hash the password
      (roomData as any).passwordHash = password;
    }

    await set(newRoomRef, roomData);
    return roomId;
  };

  const joinRoom = async (roomId: string, password?: string) => {
    if (!user) throw new Error('Must be authenticated');

    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error('Room not found');
    }

    const roomData = snapshot.val();

    if (roomData.hasPassword && roomData.passwordHash !== password) {
      throw new Error('Incorrect password');
    }

    const playerCount = Object.keys(roomData.players || {}).length;
    if (playerCount >= roomData.maxPlayers) {
      throw new Error('Room is full');
    }

    const playerRef = ref(database, `rooms/${roomId}/players/${user.uid}`);
    await set(playerRef, {
      displayName: user.displayName || 'Guest',
      joinedAt: Date.now(),
      ready: false,
      score: 0,
      status: 'connected'
    });
  };

  const leaveRoom = async (roomId: string) => {
    if (!user) return;

    const playerRef = ref(database, `rooms/${roomId}/players/${user.uid}`);
    await remove(playerRef);

    // If creator leaves, delete room
    if (room?.createdBy === user.uid) {
      const roomRef = ref(database, `rooms/${roomId}`);
      await remove(roomRef);
    }
  };

  const updatePlayerReady = async (roomId: string, ready: boolean) => {
    if (!user) return;

    const playerRef = ref(database, `rooms/${roomId}/players/${user.uid}/ready`);
    await set(playerRef, ready);
  };

  const startGame = async (roomId: string) => {
    if (!user || room?.createdBy !== user.uid) {
      throw new Error('Only room creator can start game');
    }

    const allReady = Object.values(room.players).every(p => p.ready);
    if (!allReady) {
      throw new Error('All players must be ready');
    }

    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
    await set(gameStateRef, {
      startedAt: Date.now(),
      currentQuestion: 0,
      timeRemaining: room.settings.duration
    });

    const statusRef = ref(database, `rooms/${roomId}/status`);
    await set(statusRef, 'playing');
  };

  return {
    room,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    updatePlayerReady,
    startGame
  };
}
```

### 4.2 Room Components

**Room Lobby:** `src/pages/RoomLobby.tsx`
```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '@/hooks/useRoom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RoomLobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const { room, loading, updatePlayerReady, startGame, leaveRoom } = useRoom(roomId);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;
  if (!room) return <div>Room not found</div>;

  const isCreator = room.createdBy === user?.uid;
  const currentPlayer = room.players[user?.uid || ''];
  const allReady = Object.values(room.players).every(p => p.ready);

  const handleLeave = async () => {
    await leaveRoom(roomId!);
    navigate('/');
  };

  const handleStart = async () => {
    try {
      await startGame(roomId!);
      navigate(`/multiplayer/${roomId}/game`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Room: {roomId}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {Object.keys(room.players).length} / {room.maxPlayers} players
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Players</h3>
            <div className="space-y-2">
              {Object.entries(room.players).map(([uid, player]) => (
                <div key={uid} className="flex items-center justify-between p-2 border rounded">
                  <span>{player.displayName}</span>
                  <div className="flex gap-2">
                    {room.createdBy === uid && <Badge>Host</Badge>}
                    {player.ready && <Badge variant="success">Ready</Badge>}
                    <Badge variant={player.status === 'connected' ? 'default' : 'secondary'}>
                      {player.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => updatePlayerReady(roomId!, !currentPlayer?.ready)}
              variant={currentPlayer?.ready ? 'outline' : 'default'}
            >
              {currentPlayer?.ready ? 'Not Ready' : 'Ready'}
            </Button>

            {isCreator && (
              <Button onClick={handleStart} disabled={!allReady}>
                Start Game
              </Button>
            )}

            <Button onClick={handleLeave} variant="destructive">
              Leave Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. LEADERBOARD SYSTEM

### 5.1 Stats Tracking

**IMPORTANT NOTE ON GAME MECHANICS:**
The game validates answers on every keystroke automatically. When the user types the correct answer, it immediately:
1. Awards a point
2. Clears the input
3. Generates a new question

This means there is **no concept of "incorrect attempts" or "accuracy"** - only successful completions are counted. Stats track:
- **Score**: Number of correct answers in a game session
- **High Score**: Best score achieved for a game mode
- **Average Score**: Mean score across all games played
- **Games Played**: Total number of completed games
- **Game History**: Individual game records with timestamps for time-based analytics (daily/weekly/monthly trends, progress over time, etc.)

**Stats Hook:** `src/hooks/useStats.ts`
```typescript
import { ref, set, get, push } from 'firebase/database';
import { database } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

export function useStats() {
  const { user } = useAuth();

  const updateStats = async (
    gameModeId: string,
    score: number,
    duration: number,
    trackStats: boolean
  ) => {
    if (!user || !trackStats || user.isAnonymous) return;

    const timestamp = Date.now();
    const questionsPerSecond = duration > 0 ? score / duration : 0;

    // Update aggregate stats
    const statsRef = ref(database, `users/${user.uid}/stats/${gameModeId}`);
    const snapshot = await get(statsRef);

    const currentStats = snapshot.val() || {
      gamesPlayed: 0,
      totalScore: 0,
      highScore: 0,
      averageScore: 0
    };

    const newGamesPlayed = currentStats.gamesPlayed + 1;
    const newTotalScore = currentStats.totalScore + score;

    const newStats = {
      gamesPlayed: newGamesPlayed,
      totalScore: newTotalScore,
      highScore: Math.max(currentStats.highScore, score),
      averageScore: newTotalScore / newGamesPlayed,
      lastPlayed: timestamp
    };

    await set(statsRef, newStats);

    // Store individual game record for time-based analytics
    const gameHistoryRef = ref(database, `users/${user.uid}/stats/${gameModeId}/gameHistory`);
    const newGameRef = push(gameHistoryRef);
    await set(newGameRef, {
      score,
      duration,
      timestamp,
      questionsPerSecond: parseFloat(questionsPerSecond.toFixed(2))
    });

    // Update leaderboard
    const leaderboardRef = ref(database, `leaderboards/${gameModeId}/${user.uid}`);
    await set(leaderboardRef, {
      displayName: user.displayName || 'Anonymous',
      highScore: newStats.highScore,
      gamesPlayed: newStats.gamesPlayed,
      averageScore: newStats.averageScore,
      lastUpdated: timestamp
    });
  };

  return { updateStats };
}
```

### 5.2 Leaderboard Page

**Page:** `src/pages/Leaderboard.tsx`
```typescript
import { useState, useEffect } from 'react';
import { ref, query, orderByChild, limitToFirst, onValue } from 'firebase/database';
import { database } from '@/firebase/config';
import { OFFICIAL_GAME_MODES } from '@/types/gameMode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  highScore: number;
  gamesPlayed: number;
  averageScore: number;
  lastUpdated: number;
}

export default function Leaderboard() {
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [selectedMode, setSelectedMode] = useState(OFFICIAL_GAME_MODES[0].id);

  useEffect(() => {
    const unsubscribes = OFFICIAL_GAME_MODES.map((mode) => {
      const leaderboardRef = query(
        ref(database, `leaderboards/${mode.id}`),
        orderByChild('highScore'),
        limitToFirst(100)
      );

      return onValue(leaderboardRef, (snapshot) => {
        const entries: LeaderboardEntry[] = [];
        snapshot.forEach((child) => {
          entries.push({ uid: child.key!, ...child.val() });
        });

        // Sort by high score descending
        entries.sort((a, b) => b.highScore - a.highScore);

        setLeaderboards(prev => ({ ...prev, [mode.id]: entries }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboards</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMode} onValueChange={setSelectedMode}>
            <TabsList>
              {OFFICIAL_GAME_MODES.map((mode) => (
                <TabsTrigger key={mode.id} value={mode.id}>
                  {mode.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {OFFICIAL_GAME_MODES.map((mode) => (
              <TabsContent key={mode.id} value={mode.id}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>High Score</TableHead>
                      <TableHead>Games Played</TableHead>
                      <TableHead>Avg Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(leaderboards[mode.id] || []).map((entry, index) => (
                      <TableRow key={entry.uid}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{entry.displayName}</TableCell>
                        <TableCell>{entry.highScore}</TableCell>
                        <TableCell>{entry.gamesPlayed}</TableCell>
                        <TableCell>{entry.averageScore.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5.3 Time-Based Analytics

**Game History Hook:** `src/hooks/useGameHistory.ts`
```typescript
import { useState, useEffect } from 'react';
import { ref, query, orderByChild, startAt, endAt, onValue } from 'firebase/database';
import { database } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

interface GameRecord {
  id: string;
  score: number;
  duration: number;
  timestamp: number;
  questionsPerSecond: number;
}

export function useGameHistory(gameModeId: string, timeRange?: { start: number; end: number }) {
  const { user } = useAuth();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.isAnonymous) {
      setGames([]);
      setLoading(false);
      return;
    }

    const historyRef = ref(database, `users/${user.uid}/stats/${gameModeId}/gameHistory`);

    let historyQuery = historyRef;
    if (timeRange) {
      historyQuery = query(
        historyRef,
        orderByChild('timestamp'),
        startAt(timeRange.start),
        endAt(timeRange.end)
      );
    }

    const unsubscribe = onValue(historyQuery, (snapshot) => {
      const records: GameRecord[] = [];
      snapshot.forEach((child) => {
        records.push({ id: child.key!, ...child.val() });
      });

      // Sort by timestamp descending (most recent first)
      records.sort((a, b) => b.timestamp - a.timestamp);

      setGames(records);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, gameModeId, timeRange]);

  return { games, loading };
}

// Helper functions for time ranges
export const getTimeRange = {
  today: () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: Date.now() };
  },

  thisWeek: () => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: Date.now() };
  },

  thisMonth: () => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: Date.now() };
  },

  last7Days: () => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: Date.now() };
  },

  last30Days: () => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: Date.now() };
  },

  custom: (startDate: Date, endDate: Date) => {
    return { start: startDate.getTime(), end: endDate.getTime() };
  }
};
```

**Stats Page with Analytics:** `src/pages/Stats.tsx`
```typescript
import { useState } from 'react';
import { useGameHistory, getTimeRange } from '@/hooks/useGameHistory';
import { OFFICIAL_GAME_MODES } from '@/types/gameMode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TimeRangeKey = 'today' | 'thisWeek' | 'thisMonth' | 'last7Days' | 'last30Days';

export default function Stats() {
  const [selectedMode, setSelectedMode] = useState(OFFICIAL_GAME_MODES[0].id);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('last7Days');

  const { games, loading } = useGameHistory(
    selectedMode,
    getTimeRange[timeRange]()
  );

  // Calculate analytics
  const analytics = {
    totalGames: games.length,
    totalScore: games.reduce((sum, g) => sum + g.score, 0),
    averageScore: games.length > 0 ? games.reduce((sum, g) => sum + g.score, 0) / games.length : 0,
    highScore: games.length > 0 ? Math.max(...games.map(g => g.score)) : 0,
    averageQPS: games.length > 0 ? games.reduce((sum, g) => sum + g.questionsPerSecond, 0) / games.length : 0,
    improvement: calculateImprovement(games)
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Statistics</h1>

        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRangeKey)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="last7Days">Last 7 Days</SelectItem>
            <SelectItem value="last30Days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedMode} onValueChange={setSelectedMode}>
        <TabsList>
          {OFFICIAL_GAME_MODES.map((mode) => (
            <TabsTrigger key={mode.id} value={mode.id}>
              {mode.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {OFFICIAL_GAME_MODES.map((mode) => (
          <TabsContent key={mode.id} value={mode.id} className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Games Played
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalGames}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    High Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.highScore}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.averageScore.toFixed(1)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Q/s
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.averageQPS.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Indicator */}
            {analytics.improvement !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className={analytics.improvement >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {analytics.improvement >= 0 ? '↑' : '↓'} {Math.abs(analytics.improvement).toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      vs previous period
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Games */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {games.slice(0, 10).map((game) => (
                    <div key={game.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">Score: {game.score}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(game.timestamp).toLocaleDateString()} at{' '}
                          {new Date(game.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{game.questionsPerSecond.toFixed(2)} Q/s</div>
                        <div className="text-xs text-muted-foreground">{game.duration}s</div>
                      </div>
                    </div>
                  ))}
                  {games.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No games played in this time period
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Helper function to calculate improvement
function calculateImprovement(games: GameRecord[]): number | null {
  if (games.length < 2) return null;

  const midpoint = Math.floor(games.length / 2);
  const recentGames = games.slice(0, midpoint);
  const olderGames = games.slice(midpoint);

  const recentAvg = recentGames.reduce((sum, g) => sum + g.score, 0) / recentGames.length;
  const olderAvg = olderGames.reduce((sum, g) => sum + g.score, 0) / olderGames.length;

  if (olderAvg === 0) return null;

  return ((recentAvg - olderAvg) / olderAvg) * 100;
}
```

---

## 6. UI REFACTORING & IMPROVEMENTS

### 6.1 Required shadcn Components

**Install Additional Components:**
```bash
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add table
npx shadcn@latest add drawer
npx shadcn@latest add dropdown-menu
npx shadcn@latest add navigation-menu
npx shadcn@latest add avatar
npx shadcn@latest add skeleton
npx shadcn@latest add switch
npx shadcn@latest add alert
npx shadcn@latest add alert-dialog
npx shadcn@latest add popover
```

### 6.2 Improved Navigation

**Updated Navigation Bar:** `src/features/ui/Navigation-Bar.tsx`
```typescript
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Trophy, Settings } from 'lucide-react';

export function NavigationBar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/singleplayer', label: 'Singleplayer' },
    { path: '/multiplayer', label: 'Multiplayer' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/how-to-play', label: 'How to Play' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Based Math Game</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>
                        {user.displayName?.[0] || 'G'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.displayName || 'Guest User'}
                    {user.isAnonymous && <span className="text-xs text-muted-foreground"> (Guest)</span>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!user.isAnonymous && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/stats">
                          <Trophy className="mr-2 h-4 w-4" />
                          My Stats
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user.isAnonymous && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/signup">
                          <User className="mr-2 h-4 w-4" />
                          Create Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### 6.3 Improved Layout

**Updated Layout:** `src/utils/Layout.tsx`
```typescript
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationBar, Footer } from '@features/ui';
import ScrollToTop from './ScrollToTop.jsx';
import { QuizContext, ResultContext } from '@/Contexts.js';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export const Layout = () => {
  const [settings, setSettings] = useState({});
  const [results, setResults] = useState({});
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col w-full h-screen">
        <div className="flex-none border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="flex-auto flex items-center justify-center">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full min-h-screen bg-background">
      <ScrollToTop />
      <div className="flex-none sticky top-0 z-50">
        <NavigationBar />
      </div>
      <div className="flex-auto container mx-auto px-4 py-8">
        <ResultContext.Provider value={{ results, setResults }}>
          <QuizContext.Provider value={{ settings, setSettings }}>
            <Outlet />
          </QuizContext.Provider>
        </ResultContext.Provider>
      </div>
      <div className="flex-none mt-auto">
        <Footer />
      </div>
    </main>
  );
};
```

### 6.4 Home Page Redesign

**New Home Page:** `src/pages/Home.tsx`
```typescript
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, User, Trophy, BookOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Master Base Conversions
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Practice converting between Binary, Octal, Decimal, and Hexadecimal with timed challenges
        </p>
      </div>

      {/* Game Mode Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-primary" />
              <CardTitle>Singleplayer</CardTitle>
            </div>
            <CardDescription>
              Practice alone with official modes or create custom challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/singleplayer">Play Solo</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>Multiplayer</CardTitle>
            </div>
            <CardDescription>
              Compete with friends in real-time rooms (up to 4 players)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/multiplayer">Play with Friends</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-primary" />
              <CardTitle>Leaderboards</CardTitle>
            </div>
            <CardDescription>
              View global rankings for each official game mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/leaderboard">View Rankings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle>How to Play</CardTitle>
            </div>
            <CardDescription>
              Learn the basics and improve your conversion skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/how-to-play">Learn More</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto pt-12">
        <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="text-4xl">⚡</div>
            <h3 className="font-semibold">Real-time Gameplay</h3>
            <p className="text-sm text-muted-foreground">
              Instant feedback and live multiplayer action
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl">📊</div>
            <h3 className="font-semibold">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your stats and climb the leaderboards
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl">🎮</div>
            <h3 className="font-semibold">Multiple Modes</h3>
            <p className="text-sm text-muted-foreground">
              Official challenges or custom playground settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. ROUTING UPDATES

### 7.1 Updated Router Configuration

**Updated main.tsx:**
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "./utils/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Error from "./pages/Error";
import Usage from "./pages/Usage";
import Tutorials from "./pages/Tutorials";

// Singleplayer
import SingleplayerMode from "./pages/SingleplayerMode";
import Settings from "./pages/Settings";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";

// Multiplayer
import MultiplayerHome from "./pages/MultiplayerHome";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import RoomLobby from "./pages/RoomLobby";
import MultiplayerGame from "./pages/MultiplayerGame";

// Other
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Stats from "./pages/Stats";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/singleplayer",
        element: <SingleplayerMode />,
      },
      {
        path: "/singleplayer/playground",
        element: <Settings />,
      },
      {
        path: "/quiz",
        element: <ProtectedRoute><Quiz /></ProtectedRoute>,
      },
      {
        path: "/results",
        element: <ProtectedRoute><Results /></ProtectedRoute>,
      },
      {
        path: "/multiplayer",
        element: <MultiplayerHome />,
      },
      {
        path: "/multiplayer/create",
        element: <ProtectedRoute><CreateRoom /></ProtectedRoute>,
      },
      {
        path: "/multiplayer/join",
        element: <ProtectedRoute><JoinRoom /></ProtectedRoute>,
      },
      {
        path: "/multiplayer/:roomId",
        element: <ProtectedRoute><RoomLobby /></ProtectedRoute>,
      },
      {
        path: "/multiplayer/:roomId/game",
        element: <ProtectedRoute><MultiplayerGame /></ProtectedRoute>,
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "/profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: "/stats",
        element: <ProtectedRoute><Stats /></ProtectedRoute>,
      },
      {
        path: "/how-to-play",
        element: <Usage />,
      },
      {
        path: "/tutorials",
        element: <Tutorials />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
```

---

## 8. CONTEXT UPDATES

### 8.1 TypeScript Context Definitions

**New Contexts File:** `src/contexts/GameContexts.tsx`
```typescript
import { createContext } from 'react';
import { GameModeSettings } from '@/types/gameMode';

export interface QuizSettings {
  questions: Array<[string, string, number, number]>;
  duration: number;
  gameModeId?: string;
  trackStats?: boolean;
}

export interface QuizResults {
  score: number;
  duration?: number;
  gameModeId?: string;
}

export interface QuizContextType {
  settings: QuizSettings;
  setSettings: (settings: QuizSettings) => void;
}

export interface ResultContextType {
  results: QuizResults;
  setResults: (results: QuizResults) => void;
}

export const QuizContext = createContext<QuizContextType | null>(null);
export const ResultContext = createContext<ResultContextType | null>(null);
```

**Update Layout to use typed contexts:**
```typescript
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationBar, Footer } from '@features/ui';
import ScrollToTop from './ScrollToTop.jsx';
import { QuizContext, ResultContext, QuizSettings, QuizResults } from '@/contexts/GameContexts';
import { useAuth } from '@/contexts/AuthContext';

export const Layout = () => {
  const [settings, setSettings] = useState<QuizSettings>({
    questions: [],
    duration: 60
  });
  const [results, setResults] = useState<QuizResults>({
    score: 0
  });
  const { loading } = useAuth();

  // ... rest of component
};
```

---

## 9. CRITICAL IMPLEMENTATION NOTES

### 9.1 Game Mechanics & Stats Philosophy

**Auto-Validation System:**
The game uses real-time answer validation on every keystroke. This design choice means:
- ✅ **No "Submit" button** - answers are checked automatically
- ✅ **No incorrect attempts tracked** - only successful completions count
- ✅ **Immediate feedback** - correct answers instantly advance to next question
- ✅ **Pure speed metric** - stats measure how many questions answered correctly in time limit

**Why No Accuracy Tracking:**
Since the input validates on each keystroke, users naturally iterate until correct. Tracking "attempts" would be meaningless as it would just count keystrokes. Instead, the game focuses on:
- **Speed**: How many correct answers in the time limit
- **Consistency**: Average score across multiple games
- **Peak Performance**: High score for each game mode

This makes the game a **pure speed challenge** rather than a speed + accuracy challenge.

### 9.2 Firebase Security Considerations

**IMPORTANT:**
1. **Never store passwords in plain text** - Use Firebase Auth for password management
2. **Validate all user inputs** on both client and server (security rules)
3. **Use Firebase Security Rules** to prevent unauthorized access
4. **Implement rate limiting** for room creation and game submissions
5. **Sanitize user-generated content** (display names, room names)

### 9.2 Real-time Synchronization

**For Multiplayer Games:**
- Use Firebase Realtime Database's `onValue` for live updates
- Implement `onDisconnect` handlers to clean up player presence
- Use transactions for score updates to prevent race conditions
- Implement reconnection logic for dropped connections

**Example Transaction:**
```typescript
import { runTransaction } from 'firebase/database';

const updateScore = async (roomId: string, userId: string, newScore: number) => {
  const scoreRef = ref(database, `rooms/${roomId}/players/${userId}/score`);

  await runTransaction(scoreRef, (currentScore) => {
    return Math.max(currentScore || 0, newScore);
  });
};
```

### 9.3 Performance Optimization

**React 19 Best Practices:**
1. Use `useMemo` for expensive calculations (leaderboard sorting)
2. Use `useCallback` for event handlers passed to child components
3. Implement proper cleanup in `useEffect` hooks
4. Use React.lazy for code splitting on routes
5. Memoize context values to prevent unnecessary re-renders

**Example:**
```typescript
const contextValue = useMemo(
  () => ({ settings, setSettings }),
  [settings]
);
```

### 9.4 Error Handling

**Implement comprehensive error handling:**
```typescript
try {
  await createRoom(settings);
} catch (error) {
  if (error.code === 'permission-denied') {
    toast.error('You do not have permission to create rooms');
  } else if (error.code === 'network-error') {
    toast.error('Network error. Please check your connection');
  } else {
    toast.error('An unexpected error occurred');
  }
  console.error('Room creation error:', error);
}
```

### 9.5 Testing Strategy

**Required Tests:**
1. **Unit Tests:** Game logic (converter, validator, generator)
2. **Integration Tests:** Firebase operations (auth, database)
3. **E2E Tests:** Complete user flows (create room, join room, play game)
4. **Security Rules Tests:** Firebase security rules validation

**Example Security Rules Test:**
```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

test('users can only write to their own data', async () => {
  const db = getDatabase(testEnv.authenticatedContext('user1'));
  const otherDb = getDatabase(testEnv.authenticatedContext('user2'));

  await assertSucceeds(set(ref(db, 'users/user1/displayName'), 'Alice'));
  await assertFails(set(otherDb, 'users/user1/displayName'), 'Bob'));
});
```

---

## 10. DEPLOYMENT CHECKLIST

### 10.1 Pre-Deployment Steps

1. **Environment Variables:**
   - Set up production Firebase config in hosting environment
   - Never commit `.env` files to version control
   - Use Firebase Hosting environment configuration

2. **Firebase Setup:**
   ```bash
   # Initialize Firebase features
   firebase init database
   firebase init auth

   # Deploy security rules
   firebase deploy --only database:rules

   # Deploy hosting
   firebase deploy --only hosting
   ```

3. **Build Optimization:**
   - Enable production mode in Vite
   - Minimize bundle size
   - Enable code splitting
   - Optimize images and assets

4. **Security:**
   - Review and test all security rules
   - Enable App Check for production
   - Set up monitoring and alerts
   - Configure CORS policies

### 10.2 Post-Deployment Monitoring

**Set up Firebase Analytics:**
```typescript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics(app);

// Track game completions
logEvent(analytics, 'game_completed', {
  game_mode: gameModeId,
  score: finalScore,
  duration: gameDuration
});
```

---

## 11. IMPLEMENTATION PLAN

### 11.1 Phased Development

**Phase 1: Foundation (Week 1)**
- Install Firebase SDK
- Set up authentication with guest users
- Create basic database structure
- Update contexts to TypeScript

**Phase 2: Singleplayer Enhancement (Week 2)**
- Implement game mode selection
- Add stats tracking
- Create leaderboard page
- Update UI components

**Phase 3: Multiplayer (Week 3-4)**
- Implement room creation/joining
- Build lobby system
- Create multiplayer game logic
- Add real-time synchronization

**Phase 4: Polish & Testing (Week 5)**
- UI/UX improvements
- Comprehensive testing
- Performance optimization
- Documentation

### 11.2 Clean Implementation Strategy

**Focus on modern, up-to-date implementation:**
- Refactor Settings page to become "Playground" mode with new UI
- Update all quiz logic to use latest React 19 patterns
- Implement new routing structure from scratch
- Use Firebase JS SDK v10+ modular imports throughout
- No legacy code or deprecated patterns

**Key Principles:**
- All code should use TypeScript with strict typing
- All Firebase interactions use modular SDK (no compat mode)
- All components use React 19 hooks and patterns
- All UI components use latest shadcn/ui library
- No backwards compatibility layers or legacy support

---

## 12. ADDITIONAL TECHNICAL DETAILS

### 12.1 React 19 Specific Features to Leverage

**Use React 19's improved hooks:**
```typescript
// Use the new useOptimistic hook for optimistic UI updates
import { useOptimistic } from 'react';

function RoomPlayers({ players }) {
  const [optimisticPlayers, addOptimisticPlayer] = useOptimistic(
    players,
    (state, newPlayer) => [...state, newPlayer]
  );

  async function joinRoom(player) {
    addOptimisticPlayer(player);
    await actuallyJoinRoom(player);
  }

  return (
    <div>
      {optimisticPlayers.map(player => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
```

**Use React 19's automatic batching:**
```typescript
// Multiple state updates are automatically batched
function handleGameEnd(score, stats) {
  setScore(score);           // Batched
  setResults(stats);         // Batched
  setGameState('finished');  // Batched
  // Only one re-render occurs
}
```

### 12.2 Firebase Realtime Database Best Practices

**Denormalize data for read performance:**
```typescript
// Instead of deeply nested data, duplicate where needed
// BAD:
{
  "rooms": {
    "room1": {
      "players": {
        "user1": { "userId": "user1" }
      }
    }
  },
  "users": {
    "user1": { "name": "Alice" }
  }
}

// GOOD:
{
  "rooms": {
    "room1": {
      "players": {
        "user1": {
          "userId": "user1",
          "displayName": "Alice"  // Denormalized
        }
      }
    }
  }
}
```

**Use shallow queries to limit data transfer:**
```typescript
import { ref, query, get } from 'firebase/database';

// Only get keys, not full data
const roomsRef = query(ref(database, 'rooms'), { shallow: true });
const snapshot = await get(roomsRef);
```

**Implement pagination for leaderboards:**
```typescript
import { ref, query, orderByChild, limitToFirst, startAfter } from 'firebase/database';

function useLeaderboardPagination(gameModeId: string, pageSize = 20) {
  const [entries, setEntries] = useState([]);
  const [lastKey, setLastKey] = useState(null);

  const loadMore = async () => {
    const leaderboardRef = ref(database, `leaderboards/${gameModeId}`);
    const q = lastKey
      ? query(leaderboardRef, orderByChild('highScore'), startAfter(lastKey), limitToFirst(pageSize))
      : query(leaderboardRef, orderByChild('highScore'), limitToFirst(pageSize));

    const snapshot = await get(q);
    const newEntries = [];
    snapshot.forEach(child => {
      newEntries.push({ id: child.key, ...child.val() });
    });

    setEntries(prev => [...prev, ...newEntries]);
    if (newEntries.length > 0) {
      setLastKey(newEntries[newEntries.length - 1].highScore);
    }
  };

  return { entries, loadMore };
}
```

### 12.3 Advanced Authentication Patterns

**Implement account linking UI:**
```typescript
// src/pages/Signup.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Signup() {
  const { user, linkGuestToEmail, linkGuestToGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!user?.isAnonymous) {
    return <Navigate to="/profile" />;
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await linkGuestToEmail(email, password);
      toast.success('Account created! Your progress has been saved.');
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await linkGuestToGoogle();
      toast.success('Account linked! Your progress has been saved.');
    } catch (error) {
      toast.error('Failed to link account');
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Save Your Progress</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create an account to save your stats and compete on leaderboards
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button onClick={handleGoogleSignup} variant="outline" className="w-full">
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 12.4 Multiplayer Game Synchronization

**Implement game state machine:**
```typescript
// src/hooks/useMultiplayerGame.ts
import { useState, useEffect } from 'react';
import { ref, onValue, set, serverTimestamp } from 'firebase/database';
import { database } from '@/firebase/config';

type GamePhase = 'waiting' | 'countdown' | 'playing' | 'finished';

export function useMultiplayerGame(roomId: string) {
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    const gameStateRef = ref(database, `rooms/${roomId}/gameState`);

    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      const state = snapshot.val();
      if (!state) return;

      const { startedAt, duration } = state;
      if (startedAt) {
        const elapsed = (Date.now() - startedAt) / 1000;
        const remaining = Math.max(0, duration - elapsed);

        setTimeRemaining(remaining);

        if (remaining > 0) {
          setPhase('playing');
        } else {
          setPhase('finished');
        }
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // Sync timer every second
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const submitAnswer = async (userId: string, isCorrect: boolean) => {
    if (isCorrect) {
      const scoreRef = ref(database, `rooms/${roomId}/players/${userId}/score`);
      await runTransaction(scoreRef, (current) => (current || 0) + 1);
    }
  };

  return {
    phase,
    timeRemaining,
    currentQuestion,
    submitAnswer
  };
}
```

### 12.5 Offline Support & Persistence

**Enable Firebase offline persistence:**
```typescript
// src/firebase/config.ts
import { enableMultiTabIndexedDbPersistence } from 'firebase/database';

// Enable offline persistence
enableMultiTabIndexedDbPersistence(database)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
```

**Implement connection state monitoring:**
```typescript
// src/hooks/useConnectionState.ts
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase/config';

export function useConnectionState() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const connectedRef = ref(database, '.info/connected');

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      setIsConnected(snapshot.val() === true);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
}

// Usage in component
function GameComponent() {
  const isConnected = useConnectionState();

  return (
    <div>
      {!isConnected && (
        <Alert variant="warning">
          <AlertTitle>Connection Lost</AlertTitle>
          <AlertDescription>
            Reconnecting to server...
          </AlertDescription>
        </Alert>
      )}
      {/* Rest of component */}
    </div>
  );
}
```

### 12.6 Performance Monitoring

**Add Firebase Performance Monitoring:**
```typescript
// src/firebase/config.ts
import { getPerformance } from 'firebase/performance';

export const perf = getPerformance(app);

// Track custom traces
import { trace } from 'firebase/performance';

async function loadLeaderboard() {
  const t = trace(perf, 'load_leaderboard');
  t.start();

  try {
    const data = await fetchLeaderboardData();
    t.putAttribute('data_size', data.length.toString());
    return data;
  } finally {
    t.stop();
  }
}
```

### 12.7 Accessibility Improvements

**Ensure keyboard navigation:**
```typescript
// Add keyboard shortcuts for game
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && answerInput.current) {
      answerInput.current.focus();
    }
    if (e.key === 'Escape') {
      // Pause or exit game
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Add ARIA labels:**
```typescript
<div role="timer" aria-live="polite" aria-atomic="true">
  Time remaining: {timeRemaining} seconds
</div>

<input
  aria-label="Answer input"
  aria-describedby="question-prompt"
  aria-required="true"
/>
```

### 12.8 SEO & Meta Tags

**Add dynamic meta tags:**
```typescript
// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
}

export function SEO({ title, description, image }: SEOProps) {
  const defaultTitle = 'Based Math Game - Master Base Conversions';
  const defaultDescription = 'Practice converting between Binary, Octal, Decimal, and Hexadecimal with timed challenges and multiplayer modes.';
  const defaultImage = '/og-image.png';

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* Open Graph */}
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
}
```

### 12.9 Analytics Events

**Track important user actions:**
```typescript
// src/utils/analytics.ts
import { logEvent } from 'firebase/analytics';
import { analytics } from '@/firebase/config';

export const trackEvent = {
  gameStarted: (mode: string) => {
    logEvent(analytics, 'game_started', { game_mode: mode });
  },

  gameCompleted: (mode: string, score: number, duration: number) => {
    logEvent(analytics, 'game_completed', {
      game_mode: mode,
      score,
      duration,
      questions_per_second: (score / duration).toFixed(2)
    });
  },

  roomCreated: (maxPlayers: number, hasPassword: boolean) => {
    logEvent(analytics, 'room_created', {
      max_players: maxPlayers,
      has_password: hasPassword
    });
  },

  roomJoined: (roomId: string) => {
    logEvent(analytics, 'room_joined', { room_id: roomId });
  },

  accountLinked: (method: 'email' | 'google') => {
    logEvent(analytics, 'account_linked', { method });
  }
};
```

### 12.10 Time-Based Analytics Capabilities

**With game history timestamps, the app can display:**

1. **Daily/Weekly/Monthly Trends**
   - Track performance over time
   - Identify improvement patterns
   - Show activity streaks

2. **Progress Visualization**
   - Line charts showing score progression
   - Compare recent vs. older performance
   - Highlight personal bests by date

3. **Time-of-Day Analysis**
   - Best performance times
   - Activity patterns (morning vs. evening)
   - Optimal practice times

4. **Engagement Metrics**
   - Games per day/week/month
   - Active days count
   - Longest streak

5. **Comparative Analytics**
   - This week vs. last week
   - This month vs. last month
   - Year-over-year comparison

**Example Query Patterns:**
```typescript
// Get all games from last 7 days
const last7Days = getTimeRange.last7Days();
const { games } = useGameHistory('beginner', last7Days);

// Group by day
const gamesByDay = games.reduce((acc, game) => {
  const day = new Date(game.timestamp).toLocaleDateString();
  if (!acc[day]) acc[day] = [];
  acc[day].push(game);
  return acc;
}, {} as Record<string, GameRecord[]>);

// Calculate daily averages
const dailyAverages = Object.entries(gamesByDay).map(([day, dayGames]) => ({
  day,
  avgScore: dayGames.reduce((sum, g) => sum + g.score, 0) / dayGames.length,
  gamesPlayed: dayGames.length
}));
```

---

## 13. TROUBLESHOOTING GUIDE

### 13.1 Common Issues & Solutions

**Issue: Firebase connection errors**
```typescript
// Solution: Add retry logic
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Issue: Race conditions in multiplayer**
```typescript
// Solution: Use Firebase transactions
import { runTransaction } from 'firebase/database';

const incrementScore = async (roomId: string, userId: string) => {
  const scoreRef = ref(database, `rooms/${roomId}/players/${userId}/score`);

  await runTransaction(scoreRef, (currentScore) => {
    return (currentScore || 0) + 1;
  });
};
```

**Issue: Memory leaks from listeners**
```typescript
// Solution: Always cleanup subscriptions
useEffect(() => {
  const unsubscribe = onValue(ref(database, 'path'), callback);

  return () => {
    unsubscribe(); // Critical: cleanup on unmount
  };
}, []);
```

### 13.2 Development Tools

**Firebase Emulator Suite:**
```bash
# Start all emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only auth,database

# Export data
firebase emulators:export ./emulator-data

# Import data
firebase emulators:start --import=./emulator-data
```

**React DevTools:**
- Install React DevTools browser extension
- Use Profiler to identify performance bottlenecks
- Monitor component re-renders
- Inspect context values

---

## 14. QUICK REFERENCE

### 14.1 File Structure Summary

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   └── ProtectedRoute.tsx     # Auth guard
├── contexts/
│   ├── AuthContext.tsx        # Authentication state
│   └── GameContexts.tsx       # Game state (typed)
├── features/
│   ├── quiz/
│   │   ├── quiz-settings/     # Game mode selection
│   │   ├── quiz-questions/    # Game logic
│   │   └── quiz-results/      # Results display
│   └── ui/
│       ├── Navigation-Bar.tsx # Main navigation
│       └── Footer.tsx         # Footer
├── firebase/
│   └── config.ts              # Firebase initialization
├── hooks/
│   ├── useRoom.ts             # Multiplayer room management
│   ├── useStats.ts            # Stats tracking & game history
│   ├── useGameHistory.ts      # Time-based analytics queries
│   └── useConnectionState.ts  # Connection monitoring
├── pages/
│   ├── Home.tsx               # Landing page
│   ├── SingleplayerMode.tsx   # SP mode selection
│   ├── MultiplayerHome.tsx    # MP home
│   ├── RoomLobby.tsx          # MP lobby
│   ├── Leaderboard.tsx        # Global leaderboards
│   └── ...
├── types/
│   └── gameMode.ts            # Type definitions
└── utils/
    ├── analytics.ts           # Analytics helpers
    └── Layout.tsx             # App layout
```

### 14.2 Key Commands

```bash
# Development
npm run dev                    # Start dev server
firebase emulators:start       # Start Firebase emulators

# Building
npm run build                  # Build for production
npm run preview                # Preview production build

# Deployment
firebase deploy                # Deploy everything
firebase deploy --only hosting # Deploy hosting only
firebase deploy --only database:rules # Deploy DB rules

# Testing
npm run test                   # Run tests
npm run test:e2e              # Run E2E tests
```

### 14.3 Environment Variables

```env
# .env.local (development)
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_MESSAGING_SENDER_ID=your_dev_sender_id
VITE_FIREBASE_APP_ID=your_dev_app_id

# .env.production (production)
VITE_FIREBASE_API_KEY=your_prod_api_key
VITE_FIREBASE_MESSAGING_SENDER_ID=your_prod_sender_id
VITE_FIREBASE_APP_ID=your_prod_app_id
```

---

**Last Updated:** 2025-10-20
**Implementation Guide Completed By:** Augment Agent
**Ready for Development:** ✅

**Total Sections:** 15
**Estimated Implementation Time:** 5-6 weeks
**Complexity Level:** Intermediate to Advanced

---

## 15. CRITICAL FIXES & SECURITY IMPROVEMENTS

This section addresses critical security vulnerabilities, race conditions, and quality improvements identified in the current codebase.

### 15.1 Input Validation & Sanitization (CRITICAL SECURITY)

**PROBLEM:** Current implementation has no input validation or length limits, exposing the app to:
- Performance degradation from extremely long inputs
- Browser crashes from validation loops
- No protection against malicious patterns

**Current Vulnerable Code in `Quiz-Prompt.component.tsx`:**
```typescript
// VULNERABLE - No sanitization!
function handleOnChange(event) {
    setAnswer(event.currentTarget.value.toLowerCase());
    // User could paste extremely long strings or malicious input
}
```

**FIXED Implementation:**
```typescript
// src/features/quiz/quiz-questions/Quiz-Prompt.component.tsx
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { generateQuestion } from "./generator";
import { validateAnswer } from "./validator";
import { convertBase } from "./converter";

export default function QuizPrompt({ score, setScore, setting }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setQuestion(generateQuestion(setting[0], setting[2], setting[3]));
        // Auto-focus input for better UX (especially mobile)
        inputRef.current?.focus();
    }, [score, setting]);

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        const input = event.currentTarget.value.toLowerCase();

        // Define maximum input lengths based on target base
        // Binary: 32 bits max, Octal: ~11 chars, Decimal: 10 chars, Hex: 8 chars
        const maxLengths: Record<string, number> = {
            'binary': 32,
            'octal': 11,
            'decimal': 10,
            'hexadecimal': 8
        };

        const maxLength = maxLengths[setting[1].toLowerCase()] || 16;

        // Reject if too long
        if (input.length > maxLength) return;

        // Define valid character patterns for each base
        const validPatterns: Record<string, RegExp> = {
            'binary': /^[01]*$/,
            'octal': /^[0-7]*$/,
            'decimal': /^[0-9]*$/,
            'hexadecimal': /^[0-9a-fx]*$/ // Allow 0x prefix
        };

        const pattern = validPatterns[setting[1].toLowerCase()];

        // Reject if contains invalid characters
        if (pattern && !pattern.test(input)) return;

        setAnswer(input);

        // Validate answer
        if (
            validateAnswer(
                convertBase(question, setting[0], setting[1]),
                input,
                setting[1]
            )
        ) {
            setAnswer("");
            setScore((e: number) => e + 1);
        }
    }

    return (
        <section className="grid sm:grid-rows-3 grid-rows-5 sm:grid-cols-2 grid-cols-1">
            <h1 className="row-start-1 col-start-1 sm:col-span-2 text-center font-bold">
                Convert
            </h1>
            <p className="row-start-2 col-start-1 col-span-1 row-span-1 text-center">
                {setting[0]}
            </p>
            <p className="row-start-3 col-start-1 col-span-1 row-span-1 text-center">
                {question}
            </p>
            <p className="sm:row-start-2 row-start-4 sm:col-start-2 col-start-1 col-span-1 row-span-1 text-center">
                {setting[1]}
            </p>
            <div className="sm:row-start-3 row-start-5 sm:col-start-2 col-start-1 col-span-1 row-span-1 text-center">
                <Input
                    ref={inputRef}
                    onChange={handleOnChange}
                    type="text"
                    value={answer}
                    aria-label="Answer input"
                    aria-describedby="question-prompt"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                />
            </div>
        </section>
    );
}
```

### 15.2 Race Condition Fix in Quiz Timer (CRITICAL BUG)

**PROBLEM:** Score updates and timer expiry can conflict, causing incorrect final scores to be saved.

**Current Buggy Code in `Quiz.tsx`:**
```typescript
// BUGGY - Score might still be updating!
useEffect(() => {
    if (!running) {
        setResults({ score: score }); // Race condition here
        navigate("/results");
    }
}, [running]);
```

**FIXED Implementation:**
```typescript
// src/pages/Quiz.tsx
import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { QuizPrompt, QuizStats } from "@features/quiz";
import { QuizContext, ResultContext } from "@/Contexts.js";

export default function Quiz() {
    // @ts-ignore
    const { settings } = useContext(QuizContext);
    // @ts-ignore
    const { setResults } = useContext(ResultContext);
    const [running, setRunning] = useState(true);
    const [score, setScore] = useState(0);
    const [randomSetting, setRandomSetting] = useState(
        settings.questions[
            Math.floor(Math.random() * settings.questions.length)
        ]
    );
    const navigate = useNavigate();

    // Use ref to capture final score to avoid race conditions
    const finalScoreRef = useRef(score);
    const startTimeRef = useRef(Date.now());

    // Update ref whenever score changes
    useEffect(() => {
        finalScoreRef.current = score;
    }, [score]);

    const time = new Date();
    time.setSeconds(time.getSeconds() + settings.duration);

    useEffect(() => {
        if (!running) {
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setResults({
                score: finalScoreRef.current,
                duration,
                gameModeId: settings.gameModeId
            });
            navigate("/results");
        }
    }, [running, navigate, setResults, settings.gameModeId]);

    useEffect(() => {
        const randomIndex = Math.floor(
            Math.random() * settings.questions.length
        );
        setRandomSetting(settings.questions[randomIndex]);
    }, [score, settings.questions]);

    return (
        <Card className="mx-auto w-5/6 md:w-2/3 lg:w-3/5 bg-gray-50">
            <QuizStats
                expiryTimestamp={time}
                setRunning={setRunning}
                score={score}
            />
            <CardContent>
                <QuizPrompt
                    score={score}
                    setScore={setScore}
                    setting={randomSetting}
                />
            </CardContent>
        </Card>
    );
}
```

### 15.3 Error Boundary Implementation (CRITICAL)

**PROBLEM:** No error boundaries means one error crashes the entire app with no recovery.

**Add Error Boundary Component:** `src/components/ErrorBoundary.tsx`
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to analytics/monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: true
      });
    }

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We're sorry, but something unexpected happened. The error has been logged
                and we'll look into it.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  Return to Home
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```
**Wrap App with Error Boundary in `main.tsx`:**
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./utils/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Error from "./pages/Error";
// ... other imports

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <Error />,
        children: [
            // ... routes
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    </React.StrictMode>
);
```

### 15.4 Empty Settings Validation (CRITICAL UX)

**PROBLEM:** User can start quiz with no questions configured, causing crashes.

**Fix in `Settings.tsx`:**
```typescript
// Add validation before navigation
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (chosenSettings.length === 0) {
    toast.error('Please add at least one question type before starting');
    return;
  }
  
  setSettings({
    questions: chosenSettings,
    duration: selectedDuration,
    gameModeId: 'custom'
  });
  
  navigate('/quiz');
};

// Disable start button if no settings
<Button 
  type="submit" 
  disabled={chosenSettings.length === 0}
  className="w-full"
>
  {chosenSettings.length === 0 ? 'Add Questions First' : 'Start Quiz'}
</Button>
```

### 15.5 Memory Leak Fixes

**PROBLEM:** Timer and event listeners not properly cleaned up.

**Fix Timer Cleanup in `Quiz-Stats.component.tsx`:**
```typescript
import { useTimer } from "react-timer-hook";
import { CardHeader } from "@/components/ui/card";
import { useEffect } from "react";

export default function QuizStats({ expiryTimestamp, setRunning, score }) {
    function handleOnExpire() {
        setRunning(false);
    }

    const timer = useTimer({
        expiryTimestamp,
        onExpire: handleOnExpire,
    });

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            timer.pause();
        };
    }, [timer]);

    return (
        <CardHeader className="flex flex-row justify-between">
            <h2>Seconds left: {timer.totalSeconds}</h2>
            <h2>Score: {score}</h2>
        </CardHeader>
    );
}
```

### 15.6 Keyboard Accessibility Improvements

**Add Keyboard Shortcuts:**
```typescript
// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      if (handlers[key]) {
        e.preventDefault();
        handlers[key]();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
}

// Usage in Quiz.tsx
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function Quiz() {
  // ... existing code
  
  useKeyboardShortcuts({
    'escape': () => {
      if (window.confirm('Pause game and return to menu?')) {
        navigate('/');
      }
    }
  });
  
  // ... rest of component
}
```

**Add ARIA Labels:**
```typescript
// In Quiz-Prompt.component.tsx
<div role="region" aria-label="Quiz question">
  <h1 id="question-prompt" className="...">
    Convert
  </h1>
  <p aria-label={`From ${setting[0]}`}>
    {setting[0]}
  </p>
  <p aria-label={`Question: ${question}`}>
    {question}
  </p>
  <p aria-label={`To ${setting[1]}`}>
    {setting[1]}
  </p>
  <Input
    ref={inputRef}
    onChange={handleOnChange}
    type="text"
    value={answer}
    aria-label="Answer input"
    aria-describedby="question-prompt"
    aria-required="true"
    autoComplete="off"
    autoCorrect="off"
    spellCheck="false"
  />
</div>

// In Quiz-Stats.component.tsx
<div role="timer" aria-live="polite" aria-atomic="true">
  Time remaining: {timer.totalSeconds} seconds
</div>
<div role="status" aria-live="polite">
  Score: {score}
</div>
```

### 15.7 Browser Tab Visibility Handling

**Pause Timer When Tab Hidden (Singleplayer Only):**
```typescript
// src/hooks/useTabVisibility.ts
import { useEffect, useState } from 'react';

export function useTabVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return isVisible;
}

// Usage in Quiz.tsx (for singleplayer only)
import { useTabVisibility } from '@/hooks/useTabVisibility';

export default function Quiz() {
  const isTabVisible = useTabVisibility();
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    // Only pause in singleplayer mode
    if (!settings.isMultiplayer) {
      setIsPaused(!isTabVisible);
    }
  }, [isTabVisible, settings.isMultiplayer]);
  
  // Pass isPaused to timer component
  // ... rest of component
}
```

### 15.8 Visual Feedback Enhancements

**Add Success Animation on Correct Answer:**
```typescript
// src/features/quiz/quiz-questions/Quiz-Prompt.component.tsx
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function QuizPrompt({ score, setScore, setting }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // ... existing code

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        // ... existing validation code
        
        if (isCorrect) {
            // Show success animation
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 300);
            
            setAnswer("");
            setScore((e: number) => e + 1);
        }
    }

    return (
        <section className={cn(
            "grid sm:grid-rows-3 grid-rows-5 sm:grid-cols-2 grid-cols-1 transition-all",
            showSuccess && "animate-pulse bg-green-50"
        )}>
            {/* ... existing JSX */}
        </section>
    );
}
```

**Add Combo Counter:**
```typescript
// Track consecutive correct answers
const [combo, setCombo] = useState(0);

function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    // ... validation code
    
    if (isCorrect) {
        setCombo(prev => prev + 1);
        setAnswer("");
        setScore((e: number) => e + 1);
    }
}

// Display combo
{combo >= 3 && (
  <div className="text-center text-sm font-bold text-green-600">
    🔥 {combo}x Combo!
  </div>
)}
```

### 15.9 Offline Support & Service Worker

**Add Service Worker for Offline Caching:**
```typescript
// public/sw.js
const CACHE_NAME = 'based-math-game-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

**Register Service Worker in `main.tsx`:**
```typescript
// Register service worker for offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}
```

**Connection State Monitoring:**
```typescript
// src/hooks/useConnectionState.ts
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase/config';

export function useConnectionState() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const connectedRef = ref(database, '.info/connected');
    
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      setIsConnected(snapshot.val() === true);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
}

// Usage in Layout or App component
import { useConnectionState } from '@/hooks/useConnectionState';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function App() {
  const isConnected = useConnectionState();

  return (
    <>
      {!isConnected && (
        <Alert variant="warning" className="fixed top-0 left-0 right-0 z-50">
          <AlertTitle>Connection Lost</AlertTitle>
          <AlertDescription>
            Reconnecting to server... Your progress is saved locally.
          </AlertDescription>
        </Alert>
      )}
      {/* Rest of app */}
    </>
  );
}
```

### 15.10 Code Quality & TypeScript Completion

**PROBLEM:** `Contexts.js` is still JavaScript, causing `@ts-ignore` comments everywhere.

**Convert to TypeScript:**
```typescript
// src/contexts/GameContexts.tsx (REPLACE Contexts.js)
import { createContext } from 'react';

export interface QuizSettings {
  questions: Array<[string, string, number, number]>;
  duration: number;
  gameModeId?: string;
  trackStats?: boolean;
  isMultiplayer?: boolean;
}

export interface QuizResults {
  score: number;
  duration?: number;
  gameModeId?: string;
}

export interface QuizContextType {
  settings: QuizSettings;
  setSettings: (settings: QuizSettings) => void;
}

export interface ResultContextType {
  results: QuizResults;
  setResults: (results: QuizResults) => void;
}

export const QuizContext = createContext<QuizContextType | null>(null);
export const ResultContext = createContext<ResultContextType | null>(null);
```

**Update Layout.tsx:**
```typescript
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationBar, Footer } from '@features/ui';
import ScrollToTop from './ScrollToTop.jsx';
import { QuizContext, ResultContext, QuizSettings, QuizResults } from '@/contexts/GameContexts';

export const Layout = () => {
  const [settings, setSettings] = useState<QuizSettings>({
    questions: [],
    duration: 60
  });
  const [results, setResults] = useState<QuizResults>({
    score: 0
  });

  return (
    <main className="flex flex-col w-full h-screen">
      <ScrollToTop />
      <div className="flex-none">
        <NavigationBar />
      </div>
      <div className="flex-auto">
        <ResultContext.Provider value={{ results, setResults }}>
          <QuizContext.Provider value={{ settings, setSettings }}>
            <Outlet />
          </QuizContext.Provider>
        </ResultContext.Provider>
      </div>
      <div className="flex-none">
        <Footer />
      </div>
    </main>
  );
};
```

**Remove @ts-ignore comments:**
```typescript
// In Quiz.tsx and Results.tsx
import { useContext } from 'react';
import { QuizContext, ResultContext } from '@/contexts/GameContexts';

// BEFORE:
// @ts-ignore
const { settings } = useContext(QuizContext);

// AFTER:
const context = useContext(QuizContext);
if (!context) throw new Error('QuizContext must be used within provider');
const { settings } = context;
```

### 15.11 Unit Testing Setup

**Install Testing Dependencies:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Vitest Config:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
    },
  },
});
```

**Test Setup:** `src/test/setup.ts`
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

**Example Tests:**
```typescript
// src/features/quiz/quiz-questions/__tests__/generator.test.ts
import { describe, it, expect } from 'vitest';
import { generateQuestion } from '../generator';

describe('generateQuestion', () => {
  it('generates binary numbers in range', () => {
    const question = generateQuestion('Binary', 0, 15);
    const decimal = parseInt(question, 2);
    expect(decimal).toBeGreaterThanOrEqual(0);
    expect(decimal).toBeLessThanOrEqual(15);
  });

  it('generates hexadecimal numbers in range', () => {
    const question = generateQuestion('Hexadecimal', 0, 255);
    const decimal = parseInt(question, 16);
    expect(decimal).toBeGreaterThanOrEqual(0);
    expect(decimal).toBeLessThanOrEqual(255);
  });

  it('throws error for unsupported base', () => {
    expect(() => generateQuestion('Base64', 0, 10)).toThrow();
  });
});

// src/features/quiz/quiz-questions/__tests__/validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateAnswer } from '../validator';

describe('validateAnswer', () => {
  it('validates correct binary answer', () => {
    expect(validateAnswer('1010', '1010', 'Binary')).toBe(true);
  });

  it('handles leading zeros', () => {
    expect(validateAnswer('10', '010', 'Binary')).toBe(true);
  });

  it('handles 0x prefix for hexadecimal', () => {
    expect(validateAnswer('ff', '0xff', 'Hexadecimal')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(validateAnswer('FF', 'ff', 'Hexadecimal')).toBe(true);
  });

  it('rejects incorrect answer', () => {
    expect(validateAnswer('1010', '1011', 'Binary')).toBe(false);
  });
});

// src/features/quiz/quiz-questions/__tests__/converter.test.ts
import { describe, it, expect } from 'vitest';
import { convertBase } from '../converter';

describe('convertBase', () => {
  it('converts binary to decimal', () => {
    expect(convertBase('1010', 'Binary', 'Decimal')).toBe('10');
  });

  it('converts hexadecimal to binary', () => {
    expect(convertBase('ff', 'Hexadecimal', 'Binary')).toBe('11111111');
  });

  it('handles zero', () => {
    expect(convertBase('0', 'Decimal', 'Binary')).toBe('0');
  });

  it('throws error for invalid input', () => {
    expect(() => convertBase('xyz', 'Decimal', 'Binary')).toThrow();
  });
});
```

**Add Test Script to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 15.12 Firebase App Check (Security)

**Add App Check for Bot Protection:**
```typescript
// src/firebase/config.ts
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Initialize App Check
if (import.meta.env.PROD) {
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}
```

**Environment Variable:**
```
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key
```

### 15.13 Rate Limiting for Multiplayer

**Add to Firebase Security Rules:**
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".write": "auth != null && (
          !data.exists() || 
          data.child('createdBy').val() === auth.uid || 
          data.child('players').child(auth.uid).exists()
        ) && (
          !root.child('rateLimits').child(auth.uid).child('lastRoomCreate').exists() ||
          now - root.child('rateLimits').child(auth.uid).child('lastRoomCreate').val() > 5000
        )"
      }
    },
    "rateLimits": {
      "$uid": {
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

**Track Rate Limits in Code:**
```typescript
// In useRoom.ts createRoom function
const createRoom = async (settings: GameModeSettings, password?: string, maxPlayers = 4) => {
  if (!user) throw new Error('Must be authenticated');

  // Update rate limit timestamp
  const rateLimitRef = ref(database, `rateLimits/${user.uid}/lastRoomCreate`);
  await set(rateLimitRef, Date.now());

  // ... rest of room creation
};
```

### 15.14 Mobile Optimization

**Viewport Height Fix:**
```css
/* src/index.css */
/* Use dynamic viewport height for mobile browsers */
:root {
  --vh: 1vh;
}

@supports (height: 100dvh) {
  :root {
    --vh: 1dvh;
  }
}

.h-screen {
  height: calc(var(--vh, 1vh) * 100);
}
```

**Mobile Input Optimization:**
```typescript
// In Quiz-Prompt.component.tsx
<Input
  ref={inputRef}
  onChange={handleOnChange}
  type="text"
  value={answer}
  inputMode={setting[1].toLowerCase() === 'decimal' ? 'numeric' : 'text'}
  pattern={
    setting[1].toLowerCase() === 'binary' ? '[01]*' :
    setting[1].toLowerCase() === 'octal' ? '[0-7]*' :
    setting[1].toLowerCase() === 'decimal' ? '[0-9]*' :
    '[0-9a-fA-Fx]*'
  }
  aria-label="Answer input"
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="off"
  spellCheck="false"
/>
```

### 15.15 Analytics & Monitoring

**Add Firebase Analytics:**
```typescript
// src/firebase/config.ts
import { getAnalytics } from 'firebase/analytics';

export const analytics = getAnalytics(app);
```

**Track Events:**
```typescript
// src/utils/analytics.ts
import { logEvent } from 'firebase/analytics';
import { analytics } from '@/firebase/config';

export const trackEvent = {
  gameStarted: (mode: string) => {
    logEvent(analytics, 'game_started', { game_mode: mode });
  },
  
  gameCompleted: (mode: string, score: number, duration: number) => {
    logEvent(analytics, 'game_completed', {
      game_mode: mode,
      score,
      duration,
      questions_per_second: (score / duration).toFixed(2)
    });
  },
  
  roomCreated: (maxPlayers: number, hasPassword: boolean) => {
    logEvent(analytics, 'room_created', {
      max_players: maxPlayers,
      has_password: hasPassword
    });
  },
  
  accountLinked: (method: 'email' | 'google') => {
    logEvent(analytics, 'account_linked', { method });
  },
  
  error: (errorMessage: string, fatal: boolean = false) => {
    logEvent(analytics, 'exception', {
      description: errorMessage,
      fatal
    });
  }
};
```

### 15.16 Loading States & Skeletons

**Add Skeleton Components:**
```typescript
// src/components/ui/skeleton.tsx (if not already present)
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

**Use in Loading States:**
```typescript
// In Leaderboard.tsx
if (loading) {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
```

---

## 16. PRIORITY IMPLEMENTATION ORDER

### Phase 1: Critical Fixes (Week 1)
**Must implement immediately - security and stability:**

1. ✅ **Input Validation & Sanitization** (15.1)
   - Prevents crashes and security issues
   - 2-3 hours

2. ✅ **Race Condition Fix** (15.2)
   - Ensures correct scores are saved
   - 1 hour

3. ✅ **Error Boundary** (15.3)
   - Prevents full app crashes
   - 2 hours

4. ✅ **Empty Settings Validation** (15.4)
   - Prevents user confusion and crashes
   - 30 minutes

5. ✅ **TypeScript Completion** (15.10)
   - Removes @ts-ignore, improves type safety
   - 2-3 hours

### Phase 2: Important Improvements (Week 2)
**Significantly improves UX and reliability:**

6. ✅ **Memory Leak Fixes** (15.5)
   - Prevents performance degradation
   - 1-2 hours

7. ✅ **Keyboard Accessibility** (15.6)
   - Better UX for all users
   - 3-4 hours

8. ✅ **Mobile Input Focus** (15.14)
   - Critical for mobile users
   - 1 hour

9. ✅ **Loading States** (15.16)
   - Better perceived performance
   - 2-3 hours

### Phase 3: Enhanced Features (Week 3-4)
**Nice-to-have improvements:**

10. ✅ **Tab Visibility Handling** (15.7)
    - Prevents timer issues
    - 1-2 hours

11. ✅ **Visual Feedback** (15.8)
    - More engaging UX
    - 2-3 hours

12. ✅ **Connection State Monitoring** (15.9)
    - Better offline experience
    - 2 hours

13. ✅ **Unit Tests** (15.11)
    - Prevents regressions
    - 4-6 hours

### Phase 4: Production Hardening (Week 5-6)
**Before going live:**

14. ✅ **Firebase App Check** (15.12)
    - Bot protection
    - 1 hour

15. ✅ **Rate Limiting** (15.13)
    - Prevents abuse
    - 2 hours

16. ✅ **Analytics** (15.15)
    - Track usage and errors
    - 2-3 hours

17. ✅ **Offline Support** (15.9 - Service Worker)
    - PWA capabilities
    - 3-4 hours

---

## 17. TESTING CHECKLIST

Before deploying to production, verify:

- [ ] All unit tests pass (`npm run test`)
- [ ] Input validation works for all bases
- [ ] Timer doesn't have race conditions
- [ ] Error boundary catches and displays errors
- [ ] Empty settings are prevented
- [ ] No @ts-ignore comments remain
- [ ] Memory leaks are fixed (check with React DevTools Profiler)
- [ ] Keyboard shortcuts work (Escape to exit)
- [ ] ARIA labels are present
- [ ] Mobile input focuses automatically
- [ ] Tab visibility pauses timer (singleplayer)
- [ ] Success animations show on correct answers
- [ ] Combo counter displays at 3+
- [ ] Connection state shows when offline
- [ ] Firebase App Check is enabled
- [ ] Rate limiting prevents spam
- [ ] Analytics events fire correctly
- [ ] Service worker caches assets
- [ ] App works offline (basic functionality)

---

**Section 15 Complete**
**Total Critical Fixes:** 16 major improvements
**Priority:** Implement Phase 1 immediately before adding new features

