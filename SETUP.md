# Based Math Game - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - **Authentication**: Enable Anonymous, Email/Password, and Google providers
   - **Realtime Database**: Create a database in your preferred region
   - **Hosting**: Enable Firebase Hosting

3. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

4. Fill in your Firebase configuration in `.env`:
   - Get your config from Firebase Console > Project Settings > General > Your apps
   - Copy the config values to the corresponding `VITE_FIREBASE_*` variables

### 3. Deploy Database Rules

```bash
firebase deploy --only database
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Firebase Emulators (Optional for Development)

To use Firebase Emulators for local development:

1. Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize emulators (if not already done):
```bash
firebase init emulators
```

4. Set in `.env`:
```
VITE_USE_FIREBASE_EMULATORS=true
```

5. Start emulators:
```bash
firebase emulators:start
```

6. In another terminal, start the dev server:
```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

## Deploying to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.tsx
│   ├── ProtectedRoute.tsx
│   └── ConnectionStatus.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── GameContexts.tsx
├── features/           # Feature-specific components
│   ├── quiz/
│   └── ui/
├── firebase/           # Firebase configuration
│   └── config.ts
├── hooks/              # Custom React hooks
│   ├── useStats.ts
│   ├── useGameHistory.ts
│   └── useRoom.ts
├── pages/              # Page components
│   ├── Home.tsx
│   ├── SingleplayerMode.tsx
│   ├── Quiz.tsx
│   ├── Results.tsx
│   ├── Leaderboard.tsx
│   ├── Stats.tsx
│   ├── Profile.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── Multiplayer*.tsx
├── types/              # TypeScript type definitions
│   └── gameMode.ts
└── utils/              # Utility functions
    └── Layout.tsx
```

## Key Features Implemented

### Phase 1: Critical Fixes & Security ✅
- Input validation and sanitization
- Race condition fixes
- Error boundary implementation
- TypeScript conversion
- Memory leak fixes

### Phase 2: Firebase Integration ✅
- Firebase SDK v10+ with modular imports
- Guest authentication with account linking
- Real-time database integration
- Security rules
- Presence system

### Phase 3: Game Modes & Stats ✅
- 6 official game modes
- Stats tracking system
- Game history with time-based analytics
- Leaderboard system

### Phase 4: Multiplayer ✅
- Real-time multiplayer rooms
- Room creation and joining
- Live score updates
- Multiplayer game flow

### Phase 5: UI/UX Improvements ✅
- Modern home page
- Enhanced navigation
- Profile management
- Login/Signup pages
- Mobile-responsive design
- Tab visibility handling

### Phase 6: Production Hardening ✅
- Connection state monitoring
- Error handling
- Loading states
- Performance optimizations

## Environment Variables

Required variables in `.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_FIREBASE_EMULATORS=false
```

## Troubleshooting

### Firebase Connection Issues
- Verify your Firebase config in `.env`
- Check that Realtime Database is enabled
- Ensure database rules are deployed

### Authentication Issues
- Verify Anonymous and Email/Password auth are enabled
- For Google Sign-In, add your domain to authorized domains in Firebase Console

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Clear Vite cache: `rm -rf .vite`

## Support

For issues or questions, please open an issue on GitHub.

