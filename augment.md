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
**Charts:** recharts 2.15.0 (Line graphs for performance tracking)
**Forms:** React Hook Form 7.51.2 + Zod 3.22.4
**Routing:** React Router DOM 6.22.3
**Timer:** react-timer-hook 3.0.7
**PWA:** Service Worker + Web Manifest

---

## Design System

### Overview

**Academic Textbook/Notes/Papers Theme** - A unique design system inspired by scholarly materials, textbooks, and academic papers. Built on shadcn/ui components with Tailwind CSS using OKLCH color space.

**Design Philosophy:**

- **Minimalistic & Purposeful**: Every design element serves a functional purpose
- **Academic Aesthetics**: Inspired by paper, ink, highlighters, and scholarly materials
- **Flat Design**: Minimal shadows, no glassmorphism, paper-like surfaces
- **Readable Typography**: Generous line-height, optimal character width, clear hierarchy
- **Subtle Interactions**: Fast, minimal animations (< 200ms) for functional feedback only
- **Mobile-first responsive design**
- **WCAG 2.1 AA accessibility compliance**
- **Full light/dark theme support** (paper/chalkboard modes)

### Color Palette - "Ink & Paper" (OKLCH)

#### Light Mode - Paper, Ink, and Highlighters

**Inspiration**: Aged paper, blue ink, highlighter yellow, graphite pencil

```css
/* Base Colors */
--background: oklch(0.98 0.005 85); /* Warm off-white (aged paper) */
--foreground: oklch(0.15 0.01 265); /* Deep ink black */
--card: oklch(0.99 0.003 85); /* Bright paper white */

/* Primary - Academic Blue (blue ink) */
--primary: oklch(0.35 0.08 250); /* Deep academic blue */
--primary-foreground: oklch(0.99 0.003 85); /* Paper white */

/* Accent - Highlighter Yellow */
--accent: oklch(0.85 0.12 95); /* Soft yellow highlighter */
--accent-foreground: oklch(0.2 0.01 265); /* Dark text on highlight */

/* Muted - Cream (notebook margins) */
--muted: oklch(0.95 0.008 85); /* Cream/beige */
--muted-foreground: oklch(0.45 0.02 265); /* Medium gray */

/* Borders - Graphite */
--border: oklch(0.85 0.005 265); /* Light graphite line */
```

#### Dark Mode - Chalkboard and Night Reading

**Inspiration**: Chalkboard, warm reading light, reduced eye strain

```css
/* Base Colors */
--background: oklch(0.18 0.01 265); /* Deep charcoal */
--foreground: oklch(0.95 0.005 85); /* Soft white (reduced eye strain) */
--card: oklch(0.22 0.01 265); /* Lighter charcoal */

/* Primary - Chalk Blue */
--primary: oklch(0.65 0.08 250); /* Bright chalk blue */
--primary-foreground: oklch(0.18 0.01 265); /* Deep charcoal */

/* Accent - Soft Amber (warm reading light) */
--accent: oklch(0.75 0.1 75); /* Warm amber */
--accent-foreground: oklch(0.18 0.01 265); /* Deep charcoal */

/* Muted - Dark Gray */
--muted: oklch(0.28 0.01 265); /* Muted dark gray */
--muted-foreground: oklch(0.65 0.02 265); /* Medium light gray */

/* Borders - Subtle Gray */
--border: oklch(0.3 0.01 265); /* Subtle gray line */
```

#### Semantic Colors (Both Modes)

```css
/* Success - Green checkmark */
--success: oklch(0.55 0.15 150); /* Academic green (light) */
--success: oklch(0.65 0.12 150); /* Muted green (dark) */

/* Warning - Orange highlighter */
--warning: oklch(0.75 0.15 75); /* Warm orange (light) */
--warning: oklch(0.7 0.12 75); /* Muted orange (dark) */

/* Info - Blue note */
--info: oklch(0.55 0.12 240); /* Information blue (light) */
--info: oklch(0.6 0.1 240); /* Muted blue (dark) */

/* Destructive - Red ink/correction */
--destructive: oklch(0.5 0.2 25); /* Red correction pen (light) */
--destructive: oklch(0.6 0.18 25); /* Muted red (dark) */
```

### Typography - Academic Hierarchy

**Font Families:**

- **Headings**: `"Crimson Pro", "Crimson Text", Georgia, serif` - Classic serif for scholarly feel
- **Body**: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` - Clean, readable sans-serif
- **Code/Numbers**: `"JetBrains Mono", "Fira Code", "Consolas", monospace` - For base conversion numbers

**Type Scale** (with academic line-heights):

- `text-xs`: 0.75rem / line-height 1.5
- `text-sm`: 0.875rem / line-height 1.6
- `text-base`: 1rem / line-height 1.7 (optimal for reading)
- `text-lg`: 1.125rem / line-height 1.7
- `text-xl`: 1.25rem / line-height 1.6
- `text-2xl`: 1.5rem / line-height 1.5
- `text-3xl`: 1.875rem / line-height 1.4
- `text-4xl`: 2.25rem / line-height 1.3
- `text-5xl+`: Progressively tighter line-heights (1.2 → 1.0)

**Font Weights:**

- 400 (normal) - Body text
- 500 (medium) - Emphasis
- 600 (semibold) - Headings
- 700 (bold) - Strong emphasis

**Letter Spacing:**

- Headings: `-0.02em` (tighter, more elegant)
- Body: `0.01em` (subtle, improved readability)

**Content Width:**

- Optimal: `65ch` (academic standard for readability)
- Prose: `75ch` (slightly wider for long-form content)

### Spacing & Layout - Academic Paper Structure

**Professional Spacing Scale** (4px base unit):

- **Base Unit**: 4px (0.25rem)
- **Scale**: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 12 (48px), 16 (64px)
- **Philosophy**: Apply spacing at LAYOUT level (containers, sections), keep component padding minimal
- **Component Padding**: Default to p-4 (16px), use p-3 (12px) for compact variants
- **Section Spacing**: py-12 (48px) standard, py-16 (64px) hero sections
- **Grid Gaps**: gap-3 to gap-4 (12-16px) for standard grids
- **Vertical Stacks**: space-y-2 to space-y-4 (8-16px) for related content
- **Section Headers**: mb-4 to mb-5 (16-20px) below headers

**Spacing Guidelines:**

- Use spacing to create visual hierarchy, not just whitespace
- Avoid double-padding (container + component both having large padding)
- Maintain 44x44px minimum touch targets for interactive elements
- Reference `src/index.css` for detailed spacing scale documentation
- See `src/pages/Home.tsx` and `src/pages/Stats.tsx` for implementation examples

**Container Padding** (compact for better density):

- Default: `1rem` (16px)
- sm: `1.5rem` (24px)
- md: `2rem` (32px)
- lg: `2.5rem` (40px)
- xl: `3rem` (48px)
- 2xl: `4rem` (64px)

**Content Widths:**

- `max-w-content`: `65ch` (optimal reading width)
- `max-w-prose`: `75ch` (wider for prose)
- `max-w-4xl`: 896px (standard)
- `max-w-6xl`: 1152px (wide layouts)

**Border Radius** (minimal, paper-like):

- `--radius`: `0.125rem` (2px) - very subtle, almost sharp
- `rounded-sm`: `0.125rem` (2px) - minimal
- `rounded-md`: `0.1875rem` (3px) - slightly more rounded
- `rounded-lg`: `0.125rem` (2px) - same as base
- `rounded-xl`: `0.25rem` (4px) - for special cases
- `rounded-none`: `0` - sharp corners for academic look

### Custom Utility Classes - Academic Theme

**Paper-like Components:**

```css
/* Paper card - flat with subtle border */
.paper-card {
  @apply bg-card border border-border shadow-sm;
}

/* Ruled line separator - like notebook paper */
.ruled-line {
  @apply border-b border-border;
}

/* Margin note style - like textbook margins */
.margin-note {
  @apply text-sm text-muted-foreground italic;
}
```

**Interactive Elements:**

```css
/* Underline link - academic hyperlink style */
.link-underline {
  @apply underline decoration-1 underline-offset-2 hover:decoration-2 transition-all duration-150;
}

/* Hover underline - for interactive text */
.hover-underline {
  @apply hover:underline hover:decoration-1 hover:underline-offset-2 transition-all duration-150;
}

/* Focus ring - academic style */
.focus-academic {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1;
}
```

**Layout Utilities:**

```css
/* Academic content width - optimal readability */
.content-width {
  max-width: 65ch;
}
```

**Minimal Animations** (< 200ms, functional only):

```css
/* Subtle entrance */
.animate-in {
  animation: animate-in 0.2s ease-out;
}

/* Fade in */
.fade-in {
  animation: fade-in 0.2s ease-out;
}

/* Smooth transitions - minimal duration */
.transition-smooth {
  @apply transition-all duration-150 ease-in-out;
}
```

**Text Selection** (highlighter effect):

```css
::selection {
  background-color: var(--accent);
  color: var(--accent-foreground);
}
```

### Component Patterns - Academic Style

**Cards:**

- Flat design with subtle borders (like paper sheets)
- Minimal shadows (`shadow-sm` or `shadow`)
- Sharp or barely rounded corners (`rounded-sm` or `rounded-md`)
- No glassmorphism or blur effects
- Hover: Subtle border color change or slight shadow increase

**Buttons:**

- Primary: Solid background with academic blue
- Secondary: Bordered with transparent background
- Ghost: Minimal styling, underline on hover
- Link-style: Underlined text (academic hyperlink)
- Destructive: Red ink color for dangerous actions

**Inputs:**

- Bottom-border only style (like fill-in-the-blank forms)
- Or full border with sharp corners (like textbook exercises)
- Focus: Primary color ring with minimal offset

**Separators:**

- Thin horizontal rules (like section dividers in textbooks)
- Used between major sections for visual hierarchy
- Can be styled as `.ruled-line` for notebook paper effect

**Page Headers:**

- Serif headings (Crimson Pro) for scholarly feel
- Minimal decoration, focus on typography
- Optional: Subtle underline or border-bottom

**Navigation:**

- Clean, flat design
- Underline active states (like table of contents)
- Minimal hover effects (color change, underline)

### Icons

**Library:** Lucide React
**Common:** Trophy, Users, Gamepad2, TrendingUp, Shield, Settings, Info, AlertTriangle, Play, BookOpen, Filter, Target, Binary, Hash, Zap, Clock, BarChart3, Code

### Responsive Design

**Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
**Approach:** Mobile-first with responsive grids (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
**Container Padding:** Responsive padding (1rem default, 2rem sm, 4rem lg, 5rem xl, 6rem 2xl)

### Accessibility

**Focus States:** `focus:ring-2 focus:ring-primary focus:ring-offset-1` (minimal offset for academic style)
**Color Contrast:** WCAG 2.1 AA compliance with OKLCH color space
**Semantic HTML:** Proper heading hierarchy, ARIA labels, keyboard navigation
**Motion Preferences:** Respects `prefers-reduced-motion` (all animations disabled)
**Dark Mode:** Full support with automatic theme switching (paper/chalkboard modes)
**Touch Targets:** Minimum 44x44px for mobile interactions
**Readable Typography:** Generous line-height (1.7 for body), optimal content width (65ch)

### Design System Principles

**1. Function Over Form**

- Every design element must serve a functional purpose
- No decorative elements that don't aid comprehension or usability
- Prioritize clarity and readability over visual flair

**2. Academic Aesthetics**

- Inspired by scholarly materials: textbooks, papers, notebooks
- Paper-like surfaces with minimal shadows
- Ink-inspired colors (blue, black, red for corrections)
- Highlighter accents for important information

**3. Minimal Motion**

- Animations < 200ms duration
- Movement < 4px when necessary
- Prefer fade-only transitions
- Only animate for functional feedback (loading, state changes, focus)

**4. Typography First**

- Clear hierarchy with serif headings and sans-serif body
- Generous line-height for readability (1.7 for body text)
- Optimal content width (65ch) for comfortable reading
- Monospace for code and numbers (base conversion)

**5. Flat Design**

- No glassmorphism or blur effects
- Minimal shadows (paper-like elevation)
- Sharp or barely rounded corners (2-4px max)
- Clean borders instead of heavy shadows

**6. Purposeful Color**

- Limited color palette inspired by academic materials
- Semantic colors for functional feedback (success, warning, error)
- High contrast for accessibility
- Highlighter yellow for accents and selections

### Future Component Refactoring Guidelines

**When refactoring individual pages/components:**

1. **Remove Glassmorphism**: Replace `.glass`, `.glass-card`, `.glass-nav` with `.paper-card` or simple borders
2. **Update Border Radius**: Change large rounded corners to `rounded-sm` or `rounded-md`
3. **Simplify Shadows**: Use `shadow-sm` or `shadow` instead of `shadow-lg` or `shadow-xl`
4. **Update Typography**: Apply serif fonts to headings, ensure proper line-heights
5. **Minimize Animations**: Reduce animation durations, remove decorative motion
6. **Flatten Gradients**: Remove gradient backgrounds, use solid colors
7. **Academic Links**: Style links with underlines instead of color-only differentiation
8. **Content Width**: Wrap text-heavy content in `.content-width` or `max-w-content`
9. **Spacing**: Use generous margins and padding inspired by textbook layouts
10. **Focus States**: Update to use minimal ring offset (`ring-offset-1`)

**Component Refactoring Checklist:**

- [ ] Remove glassmorphism effects
- [ ] Update border radius to minimal values
- [ ] Simplify shadows to paper-like elevation
- [ ] Apply academic typography (serif headings, proper line-heights)
- [ ] Reduce animation durations and movement
- [ ] Remove gradient backgrounds
- [ ] Style links with underlines
- [ ] Apply optimal content width for readability
- [ ] Use generous, asymmetric spacing
- [ ] Update focus states to academic style
- [ ] Ensure WCAG 2.1 AA contrast compliance
- [ ] Test in both light (paper) and dark (chalkboard) modes

---

## Academic Visual Enhancements

### CSS Utility Classes

**Paper Texture Overlay**:

```css
.paper-texture /* Subtle paper grain texture */
```

**Folded Corner Effect**:

```css
.folded-corner /* Dog-eared page corner */
.folded-corner-sm /* Small fold (12px) */
.folded-corner-lg /* Large fold (20px) */
```

**Ruled Lines (Notebook Paper)**:

```css
.ruled-lines /* Horizontal lines (1.5rem spacing) */
.ruled-lines-tight /* Tighter spacing (1.25rem) */
.ruled-lines-margin /* With red margin line (composition notebook) */
```

**Ink Underline Effect**:

```css
.ink-underline /* Animated underline on hover */
.ink-underline-visible /* Always visible underline */
```

**Highlighter Marker Effect**:

```css
.highlight-marker /* Animated highlighter swipe on hover */
.highlight-visible /* Always visible highlight */
```

**Sticky Note Callout**:

```css
.sticky-note /* Yellow post-it style */
.sticky-note-pink /* Pink variant */
.sticky-note-blue /* Blue variant */
.sticky-note-green /* Green variant */
```

**Other Visual Effects**:

```css
.sketch-border /* Hand-drawn border effect */
.page-curl /* Subtle 3D page curl on hover */
.bookmark-ribbon /* Ribbon bookmark indicator */
.torn-edge-top /* Torn paper effect at top */
.focus-ring-academic /* Minimal focus ring (1px offset) */
.annotation /* Italic, rotated annotation style */
.coffee-stain /* Decorative coffee ring */
```

### Enhanced Academic Components

**Location**: `src/components/ui/academic.ts`

#### PaperCard

Enhanced card component with paper texture and academic styling.

**Variants**: `default`, `folded`, `folded-sm`, `folded-lg`, `bookmark`, `interactive`

**Usage**:

```tsx
import {
  PaperCard,
  PaperCardHeader,
  PaperCardTitle,
} from "@/components/ui/academic";

<PaperCard variant="folded">
  <PaperCardHeader>
    <PaperCardTitle>Chapter 1</PaperCardTitle>
  </PaperCardHeader>
</PaperCard>;
```

#### StickyNote

Post-it style callout component.

**Variants**: `default` (yellow), `info` (blue), `success` (green), `warning` (pink)

**Usage**:

```tsx
import { StickyNote, StickyNoteTitle } from "@/components/ui/academic";

<StickyNote variant="info">
  <StickyNoteTitle>Pro Tip</StickyNoteTitle>
</StickyNote>;
```

#### NotebookInput

Input with ruled lines and academic styling.

**Variants**: `default`, `underline`, `ruled`, `ruled-margin`

**Usage**:

```tsx
import { NotebookInput } from "@/components/ui/academic";

<NotebookInput variant="ruled" multiline />;
```

#### SectionHeader

Consistent heading with optional icon and underline.

**Usage**:

```tsx
import { SectionHeader } from "@/components/ui/academic";
import { BookOpen } from "lucide-react";

<SectionHeader title="Resources" icon={BookOpen} titleUnderline="ink" />;
```

#### RuledSeparator

Notebook-style separator.

**Variants**: `default`, `double`, `dashed`

### Updated Base Components

**Card**: Minimal border radius, serif titles, subtle shadows
**Button**: Academic styling, thicker outline borders, underline links
**Input**: Minimal radius, reduced focus offset
**Alert**: New variants (info, success, warning), serif titles
**Badge**: New variants (success, warning), minimal radius

---

### Animation Library (Framer Motion) - Academic Theme

**Location:** `src/lib/animations.ts`

**Philosophy:** Minimal, purposeful motion only - academic design principles

**Available Variants:**

- `fadeIn` - Simple opacity fade (0 → 1)
- `fadeInUp` - Fade with very subtle upward motion (y: 4px → 0) - barely noticeable
- `staggerContainer` - Container for staggered children animations
- `staggerItem` - Individual item in staggered list (very subtle)

**Transitions** (faster, more subtle):

- `transitions.fast` - Tween (duration: 0.15s, ease: easeOut) - Quick interactions
- `transitions.smooth` - Tween (duration: 0.2s, ease: easeOut) - Standard transitions

**Usage Example:**

```tsx
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";

<motion.div variants={fadeIn} initial="hidden" animate="visible">
  Content
</motion.div>;

<motion.ul variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item.id} variants={staggerItem}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>;
```

**Guidelines:**

- Only use animations when they serve a functional purpose (feedback, hierarchy, transitions)
- Avoid decorative animations that distract from the educational quiz game mission
- All animations automatically respect `prefers-reduced-motion`
- Keep animations very subtle and fast (< 0.2s for most interactions)
- Movement should be minimal (4px or less)
- Prefer fade-only animations when possible

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
│   ├── KickedModal.tsx      # Modal shown when user is kicked from room
│   ├── ChatBox.tsx          # Real-time chat component for multiplayer rooms
│   └── CookieConsent.tsx    # Cookie consent banner with preferences
├── contexts/           # React contexts
│   ├── AuthContext.tsx      # Authentication & guest user system with cookie support
│   ├── GameContexts.tsx     # Quiz & Result contexts
│   └── ThemeContext.tsx     # Light/Dark mode with cookie persistence
├── features/           # Feature modules
│   ├── quiz/          # Quiz settings, questions, results components
│   ├── tutorials/     # Tutorial components
│   └── ui/            # Navigation-Bar, Footer
├── firebase/          # Firebase config
├── hooks/             # Custom hooks
│   ├── useRoom.ts
│   ├── useChat.ts
│   ├── useStats.ts
│   ├── useGameHistory.ts
│   ├── useGameSettings.ts
│   ├── useKeyboardShortcuts.ts
│   └── useTabVisibility.ts
├── lib/               # Utility libraries
│   ├── avatarGenerator.ts   # Pixel art avatar generation
│   └── animations.ts        # Framer Motion animation variants
├── utils/             # Utilities
│   ├── displayNameValidator.ts  # Display name content moderation
│   ├── Layout.tsx           # Main layout with cookie consent
│   ├── analytics.ts
│   └── ScrollToTop.jsx
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
- `/userStats/{userId}` - User stats (gamesPlayed, totalScore, highScore, averageScore, totalKeystrokes, totalBackspaces, averageAccuracy)
- `/userStats/{userId}/gameHistory/{gameId}` - Game history (score, duration, gameModeId, timestamp, totalKeystrokes, backspaceCount, accuracy)
- `/leaderboard-{gameModeId}/{userId}` - Leaderboards (displayName, score, timestamp, gameModeId, accuracy, isGuest)

#### Realtime Database (Ephemeral)

- `/rooms/{roomId}` - Multiplayer rooms (hostUid, gameMode, players, status, maxPlayers, allowVisualAids, enableCountdown)
- `/rooms/{roomId}/chat/{messageId}` - Chat messages (senderId, displayName, message, timestamp) - auto-deleted with room
- `/users/{guestId}` - Guest users (uid starts with "guest\_", displayName, isGuest: true)
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
  difficulty: "Easy" | "Medium" | "Hard" | "Expert" | "Custom";
  duration: number;
  questions: QuestionSetting[]; // [fromBase, toBase, rangeLower, rangeUpper][]
  isOfficial?: boolean;
  targetQuestions?: number; // For speed run modes
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

### Chat System

**Hook:** `useChat.ts`
**Component:** `ChatBox.tsx`
**Functions:** sendMessage, subscribeToMessages
**Storage:** `/rooms/{roomId}/chat/{messageId}` (auto-deleted with room)
**Features:**

- Real-time messaging in lobby and during games
- Persists across multiple games within same room
- Auto-scroll to latest messages
- 500 character message limit
- Supports both authenticated and guest users
  **Locations:** RoomLobby sidebar, MultiplayerGame sidebar (under Live Scores)

---

## Stats & Leaderboards

### Stats Tracking

**Hook:** `useStats.ts`
**Function:** `saveGameResult(result: GameResult)`
**Updates:** User stats, game history, leaderboards (authenticated only)
**Guest Behavior:** Stats tracked locally, leaderboard updates blocked
**Leaderboard Logic:**

- Speedrun modes: Lower score is better (faster time)
- Timed modes: Higher score is better (more points)
- Always updates displayName to keep current
- Stores accuracy with each leaderboard entry

### Leaderboard

**Page:** `Leaderboard.tsx`
**Features:**

- Pagination: 20 entries per page with navigation controls
- Jump to rank: Button to navigate to user's rank page
- Filtering: Excludes guest users (UID starts with `guest_` or `isGuest: true`)
- Sorting: Ascending for speedrun (lower time), descending for timed (higher score)
- Display: Shows "Time: #s" for speedrun, "Points" for timed, accuracy percentage
  **Storage:** Firestore collection `leaderboard-{gameModeId}/{userId}`

### Game History

**Hook:** `useGameHistory.ts`
**Functions:**

- `fetchHistory(timeRange, limit)` - Fetch game history with time filtering
- `getStatsForTimeRange(timeRange)` - Calculate stats: games played, average accuracy, questions answered, time spent
- `getLeaderboardPlacements()` - Count top 10 finishes across all game modes
  **Analytics:** Time-based filtering (today, week, month, all), accuracy tracking, leaderboard placement counting
  **Storage:** Firestore subcollection `userStats/{userId}/gameHistory/{gameId}`

---

## Key Hooks

**useRoom:** Room management (createRoom, joinRoom, leaveRoom, setPlayerReady, startGame, updatePlayerScore, finishGame, resetRoom, subscribeToRoom)
**useChat:** Chat messaging (sendMessage, subscribeToMessages) with auto-cleanup
**useStats:** Stats tracking (saveGameResult, getUserStats) with speedrun/timed mode handling and accuracy tracking
**useGameHistory:** Game history queries (fetchHistory, getStatsForTimeRange, getLeaderboardPlacements) with time filtering and analytics
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
- Countdown - 3-2-1 countdown with semantic colors (destructive→warning→success)
- Quiz-Prompt - Question display with keystroke tracking
- Quiz-Stats - Timer display (MM:SS format, supports unlimited mode with ∞ symbol)
- Base-Select, Range-Input, Duration-Select - Form controls for game settings
- Chosen-Settings-Table - Display table for selected question types
- Game-Mode-Select - Game mode selection with filtering (base type, difficulty, game type) and collapsible details
- Playground-Settings - Custom game configuration
- ChatBox - Real-time chat component with message list, input field, auto-scroll (500 char limit)

**UI:** Navigation-Bar, ProfileDropdown, Footer, ErrorBoundary, ProtectedRoute, ConnectionStatus
**Lib:** avatarGenerator (8x8 pixel art avatars)
**Charts:** recharts (LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer) - Used for performance graphs in Results page

### Pages

All pages use Slate theme with consistent patterns, functional-first design, and optimized layouts.

**Game:** Home, Quiz, Results (with performance graphs and best score tracking), SingleplayerMode (with game filtering), MultiplayerGame
**Multiplayer:** MultiplayerHome, CreateRoom (with filtering and collapsible details), JoinRoom, RoomLobby (with chat), MultiplayerResults
**Stats:** Stats (clean header with "Your Statistics" title and inline time-range selector, two-column layout with game mode selector and content area, overview mode shows scrollable performance cards by game type, specific mode shows graphs directly in content area without card wrappers, paginated game history with 5 games per page, profile stats sidebar height-aligned with content), Leaderboard (paginated, 20 per page, jump to rank)
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
  "players/uid123/score": 10, // Relative path from roomId
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
  return user !== null && "isGuest" in user && user.isGuest === true;
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

## Recent Updates

### Sprint Mode Display (Multiplayer)

- **Room Lobby**: Shows "Target: X questions" instead of duration for sprint modes
- **Live Game**: Displays "#answered/#target" for active players, finish time (e.g., "45s") for completed players
- **Create Room**: Game mode cards show Target icon and question count for sprint modes
- **Detection**: Uses `gameMode.targetQuestions` property to identify sprint modes

### Google Sign-up Flow

- **Random Display Names**: New Google sign-ups receive randomly generated display names (e.g., "SwiftNinja42")
- **No Profile Pictures**: Google profile pictures are not used; users get auto-generated pixel art avatars
- **Implementation**: `generateRandomDisplayName()` creates names from adjectives + nouns + numbers

### Leaderboard Username Updates

- **Automatic Sync**: When users change display names, all leaderboard entries update automatically
- **Batch Updates**: Uses Firebase batch writes to update entries across all game mode leaderboards
- **User Stats**: Updates userStats document as source of truth for display names

### Display Name Content Moderation

- **Validation**: Checks for profanity, slurs, and inappropriate content
- **Length Limits**: 2-30 characters
- **Special Characters**: Maximum 5 special characters allowed
- **Error Feedback**: Clear error messages shown to users in ProfileSettings
- **Implementation**: `src/utils/displayNameValidator.ts` with blocked words list

### Guest User Room Management

- **Room Persistence**: Guest room IDs stored in localStorage for reconnection
- **Cleanup**: Room ID removed when guest leaves room
- **Duplicate Prevention**: Prevents guests from creating duplicate rooms on reconnect

### Cookie Support & Consent

- **Cookie Consent Banner**: Customizable preferences for necessary, functional, and analytics cookies
- **Theme Persistence**: Theme preference stored in cookies (365 days) when functional cookies enabled
- **Guest Account Persistence**: Guest user data stored in cookies (30 days) for cross-session persistence
- **TTL Management**: Guest data in RTDB marked with expiration timestamp (1 day) on disconnect
- **Implementation**: `src/components/CookieConsent.tsx` with localStorage-based consent tracking

### Game Selection UI Redesign

- **Sidebar Navigation**: Left sidebar with search and category filters (both multiplayer and singleplayer)
- **Categories**: Explore All, Binary, Octal, Hexadecimal, Mixed Bases
- **Search**: Real-time search across game mode names and descriptions
- **Filters**: Difficulty (Easy/Medium/Hard), Type (Timed/Speed Run), and Max Players (multiplayer only)
- **Responsive Grid**: 2-column grid for multiplayer, 3-column for singleplayer with ScrollArea
- **Clear Filters**: One-click reset button in sidebar
- **Mode Counter**: Badge in sidebar header showing filtered count
- **Mixed Bases Logic**: Shows "All Bases" games with multiple non-decimal base types
- **Track Stats Toggle**: Integrated into singleplayer sidebar for easy access

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
- Example in `Stats.tsx`: Skeleton loaders for performance graphs and game history

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
  onExpire: async () => {
    await finishGame(roomId);
  },
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

## Recent Updates

### Stats Page Layout Fixes (2025-10-24)

**Objective:** Fix layout issues in the Stats page for better visual hierarchy, alignment, and responsive design using proper CSS flexbox/grid

**Changes:**

**Header Layout:**

- Removed "Performance Overview" section and paper texture background
- Moved "Your Statistics" title to the left side with BarChart3 icon
- Time period selector now horizontally inline with "Your Statistics" title on large screens
- Simplified header: no card wrapper, clean flex layout
- Responsive: stacks vertically on mobile, horizontal on desktop
- Guest user notice moved below header

**Graph Display:**

- Removed PaperCard wrappers from individual graphs in specific game mode view
- Graphs now placed directly into content area without independent cards
- Graph height adjusted to 190px with bottom margin to prevent x-axis label overflow
- Added `margin={{ bottom: 10 }}` to LineChart components for proper spacing
- Added `pb-6` to graph container for extra bottom padding
- Changed container from `justify-center` to standard flex column with padding
- Prevents graphs from overextending the bottom of the view

**Responsive Layout with Flexbox:**

- Main container uses normal scrolling with `space-y-6` for vertical spacing between sections
- Two-column layout has fixed height of `h-[600px]` to fit on screen
- Left column: flexbox with game mode selector (`shrink-0`) and content area (`flex-1`)
- Right column: full height card with `h-full`
- Overview mode: ScrollArea component for scrollable performance cards
- Specific game mode: Wrapped in `overflow-y-auto` div for scrollable graphs
- Both content areas properly scroll when content exceeds container height
- Game history section flows naturally below main content with proper spacing
- Simple, maintainable approach using flexbox for column alignment

**Visual Improvements:**

- Cleaner, more streamlined appearance without excessive card nesting
- Better use of vertical space in graph view
- Consistent spacing and alignment across all sections
- Maintains academic paper theme with minimal borders and flat design
- Fixed x-axis label bleeding issue in graphs
- Main content fits on screen, game history scrolls independently
- Proper responsive behavior that adapts to different screen sizes

### Single Player Results UI Updates (2025-10-24)

**Objective:** Enhance the single player results page with performance graphs, updated statistics display, and improved layout

**Changes:**

**Statistics Display Updates:**

- **Timed Mode:**
  - Removed time display from bottom statistics row
  - Added accuracy metric to bottom row
  - Added best score metric to bottom row (positioned to the right of accuracy)

- **Speed Run Mode:**
  - Added best score metric to bottom row (shows best time)
  - Accuracy metric already displayed

**New Performance Graphs:**

- **Scores Over Time Graph:**
  - Animated line graph showing score progression across games
  - Time period filter tabs: "Today", "This Week", "This Month", "All Time" (default: "All Time")
  - Uses recharts library for visualization
  - Shows "Times Over Games" for speedrun modes, "Scores Over Games" for timed modes
  - Displays game number on X-axis, score/time on Y-axis
  - Academic color scheme (chart-1 color)
  - Smooth line without dots for cleaner appearance
  - 800ms animation duration with ease-in-out easing

- **Accuracy Over Time Graph:**
  - Animated line graph showing accuracy progression across games
  - Time period filter tabs: "Today", "This Week", "This Month", "All Time" (default: "All Time")
  - Y-axis domain fixed to 0-100%
  - Academic color scheme (chart-2 color)
  - Filters out games without accuracy data
  - Smooth line without dots for cleaner appearance
  - 800ms animation duration with ease-in-out easing

**Layout Changes:**

- **Two-column responsive layout:**
  - Left side: Performance graphs stacked vertically
  - Right side: Current game results card (400px width on large screens)
  - Results card uses `h-full flex flex-col` to match height of both graphs combined
  - CardContent uses `flex-grow` to fill remaining vertical space
  - Mobile: Single column with graphs above results

- **Header Positioning:**
  - "Quiz Complete!" and game mode badge moved to top of results card
  - Trophy icon and title inline on same row
  - Game mode badge displayed below title
  - Separator between header and score section
  - Aligned widths for consistent visual hierarchy

- **Graph Components:**
  - PaperCard with folded-sm variant for academic styling
  - Compact headers with icons (TrendingUp, Target)
  - Responsive chart containers (150px height for better screen fit)
  - Empty state messages when no data available
  - Custom tooltips with no background, displaying only score/accuracy values
  - Smooth animations on data load

**Bug Fixes:**

- **Play Again Button:** Now navigates to `/singleplayer` instead of home page to queue the same game type again

**Technical Implementation:**

- Added recharts library for data visualization
- Integrated useGameHistory hook to fetch historical game data
- Best score calculation from game history (min for speedrun, max for timed)
- Time-based filtering logic for graph data
- Memoized data transformations for performance
- Direct hex colors for chart lines (#2563eb for scores, #10b981 for accuracy)
- Increased strokeWidth to 3 for better visibility
- Grid and axis colors using neutral grays (#e5e7eb, #6b7280)
- Y-axis labels with 10px offset to prevent cutoff at top of chart

**Dependencies Added:**

- `recharts` - React charting library for line graphs

**Files Modified:**

- `src/pages/Results.tsx` - Complete refactor with graphs and updated layout
- `package.json` - Added recharts dependency

**Design Patterns Used:**

- PaperCard with folded-sm variant for graph containers
- Tabs component for time period filters
- ResponsiveContainer for adaptive chart sizing
- Academic color scheme for data visualization
- Compact spacing for screen-fitting (h-8 tabs, text-xs labels)

---

### Authentication Pages Refactor (2025-10-24)

**Objective:** Align Login and Signup pages with academic theme, improve UX, and ensure consistency with the design system

**Changes:**

**Login Page (`src/pages/Login.tsx`):**

- **Academic Components:** Replaced generic Card with PaperCard (folded-sm variant), NotebookInput with underline variant
- **Visual Design:**
  - Added paper texture background with subtle gradient
  - Large icon badge (LogIn icon in primary/10 background circle)
  - Scribble highlight on "Welcome Back" heading
  - Annotation-style subtitle text
  - Folded corner on main card for paper aesthetic
- **Form Inputs:** NotebookInput with underline variant for cleaner, academic look
- **Navigation:**
  - Interactive PaperCard for "Sign Up" link with icon, description, and arrow
  - Ghost button for "Continue as Guest"
- **Spacing:** Reduced padding throughout (py-8, space-y-4) for better screen fit
- **Separator:** RuledSeparator with centered text for "Or continue with"

**Signup Page (`src/pages/Signup.tsx`):**

- **Academic Components:** Replaced generic Card with PaperCard, added StickyNote for guest notice
- **Visual Design:**
  - Paper texture background with gradient
  - Success-colored icon badge (UserPlus in success/10 background)
  - Green scribble highlight on dynamic heading (changes based on guest status)
  - Annotation-style subtitle
- **Guest Notice:** Blue StickyNote with Info icon explaining guest account conversion
- **Form Inputs:** NotebookInput with underline variant for all three fields (name, email, password)
- **Dynamic Content:** Heading and subtitle change based on `isGuest` status
- **Navigation:**
  - Interactive PaperCard for "Login" link
  - Conditional "Continue as Guest" button (hidden if already guest)
- **Spacing:** Consistent with Login page for unified experience

**Design Patterns Used:**

- `PaperCard` with `variant="folded-sm"` for main form cards
- `PaperCard` with `variant="interactive"` and `padding="none"` for navigation links
- `NotebookInput` with `variant="underline"` for form fields
- `StickyNote` with `variant="info"` for informational callouts
- `RuledSeparator` with `spacing="sm"` for visual breaks
- Scribble highlights: `highlight-scribble` (yellow) and `highlight-scribble-green`
- Icon badges: circular backgrounds with icon in center
- Annotation class for subtitle text

**Files Modified:**

- `src/pages/Login.tsx` - Complete refactor with academic theme
- `src/pages/Signup.tsx` - Complete refactor with academic theme

**UX Improvements:**

- Quick navigation between Login/Signup via compact inline links with bullet separators
- Clear visual hierarchy with academic styling
- Guest account conversion prominently featured for existing guests
- Consistent spacing and component usage across both pages
- Mobile-responsive with proper touch targets
- **All content fits on laptop screens (1280x800) without scrolling** - achieved through:
  - Compact spacing (py-4, space-y-3, p-4)
  - Smaller text sizes (text-xs for labels, text-sm for inputs)
  - Reduced icon/badge sizes (w-12 h-12 instead of w-16 h-16)
  - Smaller input heights (h-8 instead of default)
  - Compact button heights (h-9)
  - Inline footer navigation instead of large cards
  - Flex centering with `flex items-center` on container

**Files Modified:**

- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`

---

## Singleplayer Mode Page Refactor (2025-01-24)

Refactored the Singleplayer Mode selection page and Game Mode Select component to align with the academic theme and ensure screen-fitting on laptop displays.

**Design Patterns:**

1. **Page Header (SingleplayerMode.tsx)**
   - Compact icon badge (w-12 h-12) with primary/10 background
   - Scribble highlight on "Singleplayer" heading
   - Annotation-style subtitle with mode count
   - Paper texture background with subtle gradient
   - Reduced spacing (py-4, space-y-1, mb-4)

2. **Game Mode Select Component**
   - **Tabs**: Compact tabs with smaller icons (h-3.5 w-3.5) and text (text-sm)
   - **Sidebar**: PaperCard with folded-sm variant, compact padding (p-3)
     - NotebookInput for search with underline variant
     - Compact category buttons (h-8, text-xs)
     - Smaller filter selects (h-8, text-xs)
     - Compact track stats toggle with scaled switch
   - **Game Mode Cards**: PaperCard with interactive variant and folded-corner-sm
     - Compact headers (p-3 pb-2)
     - Smaller titles (text-sm font-serif)
     - Tiny badges (text-[10px] h-5)
     - Compact metadata (text-[11px])
     - Smaller collapsible details (h-7, text-[11px])
     - Compact play buttons (h-8, text-xs)
   - **Custom Tab**: StickyNote for info notice, PaperCard for playground

**Component Variants Used:**

- `PaperCard` with `variant="folded-sm"` and `padding="sm"`
- `PaperCard` with `variant="interactive"` for game mode cards
- `NotebookInput` with `variant="underline"` for search
- `StickyNote` with `variant="info"` and `size="sm"` for custom tab notice

**Screen-Fitting Optimizations:**

- Page container: py-8 → py-4
- Header spacing: space-y-2 → space-y-1
- Icon badge: w-16 h-16 → w-12 h-12
- Tabs: py-3 → py-2, icons h-4 → h-3.5
- Sidebar width: 256px → 240px (w-64 → w-60)
- Sidebar padding: p-6 → p-3
- Card spacing: gap-4 → gap-3
- ScrollArea height: calc(100vh-300px) → calc(100vh-240px)
- All buttons: h-9/h-10 → h-8/h-7
- All text: reduced by 1-2 sizes

**Files Modified:**

- `src/pages/SingleplayerMode.tsx`
- `src/features/quiz/quiz-settings/Game-Mode-Select.component.tsx`

**Additional Improvements (Follow-up #1):**

1. **Track Stats Toggle Repositioned**
   - Moved from bottom of sidebar to top of page (above sidebar and game grid)
   - Now in its own PaperCard with prominent visibility
   - Automatically disabled when on Custom tab
   - Shows contextual message based on state

2. **Column-Based Layout**
   - Changed from grid (`grid-cols-2/3`) to CSS columns (`columns-1/2/3`)
   - Game cards now stack vertically in columns
   - Prevents horizontal shifting when details are expanded
   - Uses `break-inside-avoid` to keep cards intact

3. **Multiple Details Expansion**
   - Changed from single `expandedModeId` to `Set<string>` for `expandedModeIds`
   - Users can now expand details for multiple games simultaneously
   - Each card maintains its own expanded state independently

4. **Mobile Responsiveness**
   - Sidebar: `w-60` → `w-full lg:w-60` (full width on mobile)
   - Layout: `flex gap-4` → `flex flex-col lg:flex-row gap-4` (stacks on mobile)
   - Sticky positioning: Only applied on large screens (`lg:sticky lg:top-4`)
   - Main content: Added `min-w-0` to prevent overflow
   - Columns: `columns-1 md:columns-2 lg:columns-3` (responsive column count)
   - Prevents horizontal scrolling on small screens

**Files Modified:**

- `src/features/quiz/quiz-settings/Game-Mode-Select.component.tsx`

**Additional Improvements (Follow-up #2):**

1. **Minimal Track Stats Toggle**
   - Moved to inline position next to Official/Custom tabs
   - Compact design: just label + switch (no card wrapper)
   - Responsive: stacks below tabs on mobile, inline on desktop
   - Automatically disabled when Custom tab is selected
   - Removed redundant toggle from Custom tab content

2. **Fixed Column Layout Bug**
   - Reverted from CSS columns back to grid layout
   - CSS columns caused first row items to become invisible
   - Grid layout (`grid-cols-1/2/3`) provides reliable rendering
   - Cards use `h-fit` to maintain proper height

3. **Clearly Defined Scrollable Area**
   - Added visible border container around game grid
   - Border: `border-2 border-muted` with `bg-muted/10` background
   - Padding: `p-3` inside border for visual breathing room
   - ScrollArea height optimized: `calc(100vh-280px)` for better fit
   - Clear visual boundary shows where scrolling occurs

4. **Screen-Fitting Improvements**
   - Reduced spacing: `space-y-4` → `space-y-3`
   - Reduced gap: `gap-4` → `gap-3`
   - Optimized TabsContent: `mt-4` → `mt-0`
   - ScrollArea height: `calc(100vh-300px)` → `calc(100vh-280px)`
   - All content fits on laptop screens (1280x800) without overflow

**Files Modified:**

- `src/features/quiz/quiz-settings/Game-Mode-Select.component.tsx`

---

### Home Page Refactor (2025-10-24)

**Objective:** Align Home page with academic theme, prioritize quick game access, improve UX and mobile responsiveness

**Changes:**

- **Hero Section:** Redesigned to prioritize game access with prominent Singleplayer/Multiplayer cards as primary CTAs
- **Academic Components:** Replaced generic Card components with PaperCard, SectionHeader, RuledSeparator, and StickyNote
- **Content Reorganization:** Created distinct sections for:
  - Quick Start (hero with game mode cards)
  - How to Play (3-step guide using StickyNotes)
  - Stats & Leaderboard Preview (interactive preview cards)
  - Features Highlight (why practice here)
  - Final CTA
- **Navigation Bar:** Smooth scroll animation - nav bar slides up when scrolling down (past 100px), immediately reappears when scrolling up. Wrapped in sticky container to prevent border animation issues
- **Scroll Animations:** Added intersection observer-based animations for sections (fade-in, slide-in effects) with staggered delays
- **Spacing:** Applied professional 4px spacing scale throughout (p-4, gap-4, py-10, etc.)
- **Mobile Responsive:** All sections adapt to sm/md/lg breakpoints with proper grid layouts and touch targets
- **Academic Aesthetic:** Paper texture, ruled separators, folded corners, sticky notes, serif headings, coffee stains, torn edges, bookmark ribbons, ink underlines
- **Micro-interactions:** Purposeful hover effects only on clickable elements (cards, buttons), no random icon/logo animations
- **Highlighter Effects:** Hand-drawn scribble-style underlines using SVG paths with wavy, irregular strokes (yellow, green, orange)

**Files Modified:**

- `src/pages/Home.tsx` - Complete refactor with academic components and scroll animations
- `src/features/ui/Navigation-Bar.tsx` - Added smooth scroll animation (slides up on scroll down, reappears on scroll up)
- `src/features/ui/Footer.tsx` - Updated with academic theme (paper texture, ink underlines, ruled separator, no border shadow)
- `src/hooks/useScrollAnimation.ts` - New hook for intersection observer-based scroll animations
- `src/index.css` - Added highlighter scribble effects using SVG paths

**Design Patterns:**

- Use PaperCard with `variant="interactive"` for clickable cards
- Use PaperCard with `variant="folded"` for preview/info cards with bookmark ribbons
- Use StickyNote variants (info/success/warning) for step-by-step guides
- Use RuledSeparator with `variant="double"` for major section breaks
- Use SectionHeader with icons for consistent section titles
- Apply `sketch-border` and `folded-corner-sm` for paper-like card edges
- Use `ruled-lines-margin` for composition notebook style with double red vertical margin lines (2px thick each, spaced 0.25rem apart)
- Apply `coffee-stain` and `torn-edge-top` for decorative academic touches
- Highlighter scribble effect: `<span className="highlight-scribble">Text</span>` (yellow), `highlight-scribble-green`, `highlight-scribble-orange`

### Spacing & Density Refactor (2025-10-24)

**Objective:** Improve information density and reduce excessive spacing throughout the design system

**Changes:**

- **Base Components:** Reduced padding by 25-38% across Card, PaperCard, SectionHeader, RuledSeparator
- **Global Configuration:** Reduced container padding by 25-40% across all breakpoints in tailwind.config.js
- **Page-Level Updates:** Reduced section spacing by 40-50% on Home.tsx and Stats.tsx
- **Spacing Scale:** Established professional 4px-based system (1, 2, 3, 4, 5, 6, 8, 12, 16)
- **Documentation:** Added comprehensive spacing guidelines to src/index.css and augment.md

**Results:**

- 40-50% more content visible per screen
- Reduced scrolling requirements
- Clearer visual hierarchy through strategic spacing
- Maintained readability and accessibility

**Files Modified:**

- `src/components/ui/card.tsx`
- `src/components/ui/paper-card.tsx`
- `src/components/ui/section-header.tsx`
- `src/components/ui/ruled-separator.tsx`
- `tailwind.config.js`
- `src/pages/Home.tsx`
- `src/pages/Stats.tsx`
- `src/index.css`
- `augment.md`

### Previous Updates (2025-10-22)

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

### Stats Page Refactor and Enhancement

- **Redesigned:** Stats page with new two-column layout and enhanced features
- **Layout Changes:**
  - Header section: Time period selector moved inline with "Performance Overview" title
  - Two-column layout: Left side for performance data, right side for profile stats (350px fixed width)
  - Profile stats section: Displays overall statistics (games played, average accuracy, questions answered, leaderboard placements, time in game) visible regardless of game mode selection
  - Game mode selector: Dropdown with "Overview (All Modes)" option plus all game modes the user has played
  - Games Played History: Changed from "last 10 games" to "all games ever played" with pagination (5 games per page)
- **New Features:**
  - Overview mode: Displays existing performance cards (Speed Run Performance and Timed Mode Performance) in a scrollable container
  - Specific game mode view: Shows two line graphs (score/time over games, accuracy over games) synced with time period selector
  - Pagination controls: Previous/Next buttons with page indicator for game history
  - Responsive graphs: Uses recharts LineChart with academic color scheme and smooth animations
- **Data Handling:**
  - Fetches up to 1000 games for pagination support
  - Filters history by both time range and selected game mode
  - Resets to page 1 when time range changes
  - Calculates unique game modes from user's play history
- **Files Modified:** `src/pages/Stats.tsx`

---

## License & Credits

**License:** GNU General Public License v3.0
**Inspired by:** [zetamac](https://arithmetic.zetamac.com)
**UI Components:** [shadcn/ui](https://ui.shadcn.com)
**Icons:** [Lucide](https://lucide.dev)
**Backend:** [Firebase](https://firebase.google.com)
