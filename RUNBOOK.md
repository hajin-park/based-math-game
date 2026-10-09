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

This deploys `database.rules.json`, `firestore.rules` and `firestore.indexes.json`. Index builds take a few minutes; the leaderboard and history may show a loading error until the console shows them as **Enabled** (Firestore → Indexes).

Optional check before deploying: `npx firebase-tools emulators:exec --only auth,database,firestore --project demo-based-math "npm run test:rules"` (needs Java 21).

## 4. Remove legacy data (required)

The old data no longer matches the rules or the app (all old modes were replaced). Nothing in it is used by the new release.

- **Realtime Database** (console → Realtime Database → Data): delete the top-level nodes `users`, `cleanup`, `rooms`, `gameModes`, `presence`.
- **Firestore** (console → Firestore → Data): delete every `leaderboard-*` collection, the `userStats` collection (including `gameHistory` subcollections) and the old `users` documents.

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

## 11. If something goes wrong

- **Roll back Hosting:** Firebase console → Hosting → release history → **Rollback**, or `npx firebase-tools hosting:rollback --project based-math-game`.
- **Rules:** redeploy from the previous commit with `git checkout <sha> -- database.rules.json firestore.rules && npx firebase-tools deploy --only database,firestore --project based-math-game`.
- **Google sign-in popup blocked** (browsers that block third-party storage): set `VITE_FIREBASE_AUTH_DOMAIN` to your Hosting domain (for example `based-math-game.web.app`) and add it to the OAuth client's authorized redirect URIs (`https://based-math-game.web.app/__/auth/handler`).
- **Students see an old version:** the service worker updates on the next visit; a hard refresh also works. Old open tabs reload automatically if a deploy removed a file they need.

---

## Not used in this project

There is no YouTube, Spotify, Supabase, Vercel or Stripe integration; nothing needs configuring there. The only Supabase and Vercel projects on the connected accounts belong to a different app (`lyricai`).
