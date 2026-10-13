# Release runbook — Based Math Game

Operational steps for the Firebase project `based-math-game` that code alone can't do. Run them in order. Steps marked **required** must be done for the new release to work; the rest harden or scale the deployment.

Prerequisites: owner access to the Firebase project and its Google Cloud project, and the Firebase CLI logged in (`npx firebase-tools login`).

---

## Why the order matters

This release replaces the old guest system (invented `guest_…` ids with no authentication) with **Firebase Anonymous Authentication**, and replaces the Realtime Database and Firestore schemas and rules.

- Merging to `main` deploys **Hosting only** (GitHub Actions). It does **not** deploy security rules or indexes.
- The new client needs the Anonymous provider and the new rules. The old client is incompatible with the new rules.
- So: enable Anonymous auth first (harmless to the old site), merge, then deploy rules and indexes **immediately** after the Hosting deploy finishes (about 2–3 minutes). Expect a few minutes during which multiplayer and leaderboards are unavailable.

---

## 1. Before merging — enable Anonymous sign-in (required)

1. Firebase console → **Authentication → Sign-in method**.
2. Enable **Anonymous**. Keep **Email/Password** and **Google** enabled.
3. Authentication → **Settings → Authorized domains**: make sure `based-math-game.web.app` and `based-math-game.firebaseapp.com` are listed (plus any custom domain). Keep `localhost` only if you develop against the production project.

## 2. Merge the pull request

Wait for the "Deploy to Firebase Hosting on merge" workflow to go green in GitHub Actions.

## 3. Deploy security rules and indexes (required, right after step 2)

From a checkout of `main`:

```bash
npm ci
npx firebase-tools deploy --only database,firestore --project based-math-game
```

This deploys `database.rules.json`, `firestore.rules` and `firestore.indexes.json` (composite indexes plus a TTL policy on `dailyLocks.expireAt`, which removes each day's one-attempt lock after the day closes). Index builds take a few minutes; the leaderboard and history may show a loading error until the console shows them as **Enabled** (Firestore → Indexes).

Optional check before deploying: `npx firebase-tools emulators:exec --only auth,database,firestore --project demo-based-math "npm run test:rules"` (needs Java 21).

## 4. Remove legacy data (required)

The old data no longer matches the rules or the app (all old modes were replaced). Nothing in it is used by the new release.

- **Realtime Database** (console → Realtime Database → Data): delete the top-level nodes `users`, `cleanup`, `rooms`, `gameModes`, `presence`.
- **Firestore** (console → Firestore → Data): delete every `leaderboard-*` collection and the `userStats` collection (including `gameHistory` subcollections). The old `users` documents can stay: the app rewrites each one in the new shape on that user's next sign-in, keeping their display name and game settings (`ensureUserProfile`). Deleting them is fine too; they are then recreated with defaults.

CLI alternative (deletes **everything** in both databases):

```bash
npx firebase-tools database:remove / --project based-math-game
npx firebase-tools firestore:delete --all-collections --project based-math-game
```

Existing email/Google accounts in Authentication stay valid; those users just start with a fresh history.

## 5. Smoke test production (required)

On https://based-math-game.web.app, in two different browsers (or one normal + one private window):

1. Land on the home page, press Enter, finish a practice round, check that the result appears.
2. Play a Sprint as a guest; the result should say it is saved on this device.
3. Sign up with email in one browser; confirm the guest runs are carried over (Stats page).
4. Sign in with Google in the other browser.
5. Create a multiplayer room in browser A, join by link in browser B, ready, start, finish; chat both ways; leave.
6. Finish a ranked Sprint while signed in; check that it appears on the Leaderboard.
7. Profile → Account → Delete account on a throwaway account; confirm its leaderboard row disappears.
8. Check the response headers once (for example https://securityheaders.com/?q=based-math-game.web.app): CSP, HSTS, X-Frame-Options, Referrer-Policy and Permissions-Policy should be present.

## 6. Plan and quotas (strongly recommended before classroom use)

The free **Spark** plan allows **100 simultaneous Realtime Database connections** per project. Every player in a multiplayer room holds one, so a few concurrent classes can hit the cap and new players will fail to connect. Firestore on Spark also has daily read and write quotas; check the current numbers under Firestore → Usage.

- Upgrade to **Blaze** (Project settings → Usage and billing). Blaze keeps the same free allowance and lifts the connection cap to 200,000 per database.
- Set a **budget alert** (Google Cloud console → Billing → Budgets & alerts), for example at $10 and $50 per month.

## 7. Restrict the browser API key (recommended)

The Firebase web config in `.env` is public by design; restrictions are what protect it.

Google Cloud console → **APIs & Services → Credentials** → the browser key used in `.env`:

- **Application restrictions → Websites:** `https://based-math-game.web.app/*`, `https://based-math-game.firebaseapp.com/*`, any custom domain, and `https://based-math-game--*.web.app/*` if you use PR preview channels. Add `http://localhost:5173/*` only if you develop against production.
- **API restrictions:** Identity Toolkit API, Token Service API, Cloud Firestore API, Firebase Realtime Database API, Firebase Installations API, plus Firebase App Check API and reCAPTCHA Enterprise API if you do step 8.

## 8. App Check (recommended, optional)

Reduces abuse from scripts that call your Firebase backends directly.

1. Google Cloud console → **reCAPTCHA Enterprise** → create a **website** key for your production domains.
2. Firebase console → **App Check** → register the web app with the **reCAPTCHA Enterprise** provider and that key.
3. Add the key to the build: set `VITE_APPCHECK_SITE_KEY=<key>` in `.env` (it is a public site key) and merge. The app initializes App Check only when this variable is set.
4. Watch App Check → Metrics for about a week. When verified traffic is close to 100%, **Enforce** for Realtime Database, Cloud Firestore and Authentication.

For local development against an enforced project, register a debug token in App Check and set `VITE_APPCHECK_DEBUG_TOKEN` in `.env.local`.

## 9. Anonymous-account cleanup (optional)

Every visitor who plays gets an anonymous account. To delete stale ones automatically, upgrade to **Firebase Authentication with Identity Platform** (Authentication → Settings) and enable **automatic clean-up of anonymous users** (deletes anonymous accounts older than 30 days). This requires Blaze.

## 10. Repository settings (recommended)

GitHub → Settings → Branches → add a protection rule for `main`:

- Require a pull request before merging.
- Require status checks to pass: **CI / checks**.

Dependabot PRs can't reach repository secrets, so their "Deploy to Firebase Hosting on PR" job fails; that is expected. Rely on the CI check for those.

## 11. Known limits (accepted for this release)

- There is no backend code (no Cloud Functions), so multiplayer results are computed by the clients and checked by security rules for plausibility only (at most 3 answers per second, at least 250 ms each). The room host is trusted to end rounds and name winners.
- Rooms that everyone simply closes stay in the database until someone reopens them after 6 idle hours, when they are deleted. A scheduled clean-up would need a Cloud Function on Blaze; the data in a room is display names, scores and chat.
- Anyone signed in who knows a room's 8-character code can read that room (that is how joining works); rooms can't be listed.

## 12. If something goes wrong

- **Roll back Hosting:** Firebase console → Hosting → release history → **Rollback**, or `npx firebase-tools hosting:rollback --project based-math-game`.
- **Rules:** redeploy from the previous commit with `git checkout <sha> -- database.rules.json firestore.rules && npx firebase-tools deploy --only database,firestore --project based-math-game`.
- **Google sign-in popup blocked** (browsers that block third-party storage): set `VITE_FIREBASE_AUTH_DOMAIN` to your Hosting domain (for example `based-math-game.web.app`) and add it to the OAuth client's authorized redirect URIs (`https://based-math-game.web.app/__/auth/handler`).
- **Students see an old version:** the service worker updates on the next visit; a hard refresh also works. Old open tabs reload automatically if a deploy removed a file they need.

---

## 13. Release: the Exercise Workbook redesign (October 2026)

A visual redesign plus room, auth and daily fixes. **No console changes are needed:** no new rules, indexes, providers or environment variables. Merging to `main` deploys Hosting; open tabs pick up the new version through the service worker.

After the "Deploy to Firebase Hosting on merge" workflow is green, check on https://based-math-game.web.app:

1. **The cover.** `/` shows the blue workbook cover. Enter (or Play) swings it open and starts a run straight away; a first-time visitor gets Nibbles · Practice.
2. **Both themes.** Switch Menu → Appearance → Chalkboard, and check the cover, `/play` and a run on a phone and a laptop. The browser bar is blue on the cover, paper elsewhere, slate in Chalkboard.
3. **Red pen.** In a practice run, a correct answer gets a red tick under the answer line; Results circles the score in red.
4. **Google upgrade (fixed in this release).** In a private window, play one sprint as a guest, then Sign in → Continue with Google. The page should finish signing in, `/stats` should show the guest run, and the guest's game settings should carry over.
5. **Rooms.** Two browsers: create, join by link, ready, start, finish. Then close one browser's tab with the Back button mid-lobby: after about 10 seconds that player shows as away and no longer blocks Start.
6. **Link preview.** Paste the site URL into Slack or iMessage; the preview shows the cover (`og.png`). Previews are cached by those services and can take a day to refresh.

Known limits found in QA that need a product decision (not changed in this release):

- **A ranked daily can be previewed.** The lock is claimed when a daily finishes, so a player can quit before the end, see the questions, and retry. Closing this needs the lock claimed at the start, which is a rules change.
- **Reloading mid-round forfeits that round in a room.** The player becomes a spectator; their progress so far is kept. _Changed: see §14._
- **Removing a disconnected player also bans them.** It is the only way to free their seat; anything else needs a rules change. _Changed: see §14._
- **`userStats.bests` grows by one key per daily played.** After about 930 dailies, a player would hit the 1000-key rules limit. A clean-up or a separate daily-bests document is needed before then.
- **A device clock more than 5 minutes fast fails run saves** (the `endedAt` bound in the rules).

---

## 14. Release: rooms resume after a reload, Free seat (rules change)

Two product decisions from §13, implemented. **The Realtime Database rules change**, so deploy them right after the Hosting deploy (the old client keeps working with the new rules; the new client's Free seat fails with a toast until they are deployed):

```bash
npx firebase-tools deploy --only database --project based-math-game
```

What changed:

- **A reload mid-round resumes the round.** The player continues at the same question with the same score, on the shared clock: in a sprint the time spent reloading is lost, in a speedrun it counts, in survival the current question's clock keeps running (one life at most if it ran out). The run is kept in the browser's localStorage, so a closed tab reopened from the link continues too. From another browser or after clearing site data, the run continues from the score the room recorded, after the last correct answer: the room records neither skips nor lost lives, so a skipped question comes back, speedrun skip penalties are dropped and survival lives are full again. A finished player stays finished.
- **Free seat.** In the lobby, the host's Manage menu offers **Free seat** for a player shown as Disconnected. It opens the seat without a ban: that player can rejoin with the code or link while a seat is free, as a new player. **Remove from room** still bans, for anyone.

Check after deploying, with two browsers: start a round, reload one tab after a few answers (same question number and score, a note under the exercise says so); in the lobby, close one player's tab, then as host use Manage → Free seat and rejoin from the closed browser with the link.

## Not used in this project

There is no YouTube, Spotify, Supabase, Vercel or Stripe integration; nothing needs configuring there. The only Supabase and Vercel projects on the connected accounts belong to a different app (`lyricai`).
