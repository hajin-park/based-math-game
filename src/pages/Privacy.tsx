import { Link } from "react-router-dom";

import { LegalDocument, type LegalSection } from "@/components/LegalDocument";

const REPO = "https://github.com/hajin-park/based-math-game";
const ISSUES = `${REPO}/issues`;

const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a className="link" href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-sm bg-sunken px-1 py-0.5 font-mono text-[0.8125rem]">
    {children}
  </code>
);

const SUMMARY = [
  <>You can play without giving us any personal information. Guests get a random, anonymous ID.</>,
  <>If you create an account, we store your email address, display name, game settings, run history, stats and leaderboard entries.</>,
  <>Your display name and best scores are public on the leaderboard. Your email address is never shown.</>,
  <>No ads, no analytics, no tracking cookies. We don’t sell or share your data.</>,
  <>Multiplayer rooms and their chat are temporary.</>,
  <>
    You can delete your account and everything stored with it at any time
    under <Link className="link" to="/profile/settings">Profile → Account</Link>.
  </>,
];

const SECTIONS: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <>
        <p>
          Based Math Game is a free, open-source game for practising number-base
          conversions, run by the maintainers of the{" "}
          <Ext href={REPO}>based-math-game project on GitHub</Ext>. The source
          code is public under the GPL-3.0 licence, so you can check everything
          this notice says.
        </p>
        <p>
          Questions or requests: open an issue at{" "}
          <Ext href={ISSUES}>github.com/hajin-park/based-math-game/issues</Ext>.
          Please don’t post personal information in a public issue; ask for a
          private contact instead.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <h3>When you play as a guest</h3>
        <ul>
          <li>
            An <strong>anonymous account</strong> in Firebase Authentication: a
            random user ID, a generated guest name (like “WiseAce31”) and when
            it was created and last used. No email, no password.
          </li>
          <li>
            Your <strong>runs and game settings stay in your browser</strong>{" "}
            (your last 50 runs). They are not sent to our servers.
          </li>
        </ul>
        <h3>When you create an account</h3>
        <ul>
          <li>
            <strong>Email address and password.</strong> Firebase Authentication
            stores your password securely; we never see it. If you sign in with
            Google, Firebase stores the basic profile Google shares (email,
            name and picture link) with your sign-in record. We don’t display
            your Google name or picture.
          </li>
          <li>
            <strong>Profile</strong>: your display name, game settings and when
            the account was created.
          </li>
          <li>
            <strong>Run history</strong>: for each finished run, the mode,
            topic, score, correct and skipped counts, duration, accuracy and
            when it ended.
          </li>
          <li>
            <strong>Stats</strong>: totals (runs, correct answers, time played)
            and your personal best per mode.
          </li>
          <li>
            <strong>Leaderboard entries</strong> for ranked modes (see “What is
            public”).
          </li>
        </ul>
        <h3>When you play multiplayer (guests and accounts)</h3>
        <ul>
          <li>
            The room: its code, mode and settings, each player’s ID, display
            name, ready state and scores, and the chat messages players send.
          </li>
          <li>
            An online-status record (connected or not, which room, last seen)
            that only you can read. It lets the game handle dropped
            connections.
          </li>
        </ul>
        <h3>Technical data</h3>
        <p>
          Like any website, our hosting (Firebase Hosting, run by Google)
          receives your IP address and browser details when it serves the
          page. We don’t combine this with your game data or use it to profile
          you.
        </p>
      </>
    ),
  },
  {
    id: "public",
    title: "What is public",
    body: (
      <>
        <ul>
          <li>
            <strong>Leaderboards</strong> can be read by anyone. An entry shows
            your display name, score, correct and skipped counts, duration,
            accuracy and when it was set, and is stored under your random user
            ID. Only registered accounts appear; guests are never ranked.
          </li>
          <li>
            <strong>In a multiplayer room</strong>, the other players see your
            display name, your scores and the messages you send.
          </li>
          <li>Your email address and run history are never public.</li>
        </ul>
        <p>
          Pick a display name that doesn’t reveal more than you want to share,
          especially in a class.
        </p>
      </>
    ),
  },
  {
    id: "dont",
    title: "What we don’t do",
    body: (
      <ul>
        <li>
          We don’t use analytics, advertising, tracking pixels or
          fingerprinting, and we do not use analytics cookies.
        </li>
        <li>We don’t sell, rent or share your data with advertisers or data brokers.</li>
        <li>
          We don’t load third-party fonts or scripts for tracking. Our fonts
          are served from our own site.
        </li>
        <li>We don’t send marketing email. The only email you’ll get is a password reset you ask for.</li>
      </ul>
    ),
  },
  {
    id: "device",
    title: "What’s stored on your device",
    body: (
      <>
        <p>
          There’s no cookie banner because we only store what the game needs to
          work. In your browser’s storage:
        </p>
        <ul>
          <li>
            Your Firebase sign-in session (guest or account), in IndexedDB, so
            you stay signed in.
          </li>
          <li>
            <Code>theme</Code>: light, dark or system.
          </li>
          <li>
            <Code>bmg.gameSettings.v1</Code>: your game settings while you’re a
            guest.
          </li>
          <li>
            <Code>bmg.guestRuns.v1</Code>: your last 50 runs while you’re a
            guest.
          </li>
          <li>
            The app’s own files, cached by a service worker so it loads fast
            and works on a flaky connection.
          </li>
        </ul>
        <p>
          Earlier versions of the site may have saved a <Code>cookieConsent</Code>{" "}
          entry or a <Code>theme</Code> cookie. They hold no personal data and
          you can clear them with your browser’s site settings.
        </p>
      </>
    ),
  },
  {
    id: "providers",
    title: "Who processes your data",
    body: (
      <>
        <p>
          We use Google’s Firebase platform, and Google processes data on our
          behalf as our service provider:
        </p>
        <ul>
          <li>Firebase Authentication: guest and account sign-in.</li>
          <li>Cloud Firestore: profiles, settings, run history, stats and leaderboards.</li>
          <li>Firebase Realtime Database: multiplayer rooms, chat and online status.</li>
          <li>Firebase Hosting: serving the website.</li>
          <li>
            If we turn on Firebase App Check to block automated abuse, Google
            reCAPTCHA Enterprise checks that requests come from a real browser
            on our site.
          </li>
          <li>Google Sign-In, only if you choose “Continue with Google”.</li>
        </ul>
        <p>
          Our Realtime Database is hosted in the United States. Other Firebase
          data is stored on Google Cloud infrastructure, which can include
          servers in the United States and other countries. See{" "}
          <Ext href="https://firebase.google.com/support/privacy">
            Privacy and Security in Firebase
          </Ext>{" "}
          for how Google handles it.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <ul>
        <li>
          <strong>Account data</strong> (profile, runs, stats, leaderboard
          entries, including past daily challenges): until you delete your
          account.
        </li>
        <li>
          <strong>Guest data in your browser</strong>: until you clear it under
          Profile → Account → Clear guest data, or with your browser settings.
        </li>
        <li>
          <strong>Your anonymous guest ID</strong>: until you clear guest data
          in the app. If you only wipe your browser storage, the unused ID
          remains in Firebase with no personal information attached.
        </li>
        <li>
          <strong>Multiplayer rooms and chat</strong>: deleted when the last
          player leaves. Rooms idle for 6 hours count as expired and are deleted
          the next time anyone opens them.
        </li>
        <li>
          <strong>Online-status record</strong>: overwritten each time you join
          or leave a room, and deleted with your account.
        </li>
      </ul>
    ),
  },
  {
    id: "deletion",
    title: "Deleting your data",
    body: (
      <>
        <p>
          Go to{" "}
          <Link className="link" to="/profile/settings">
            Profile → Account → Delete account
          </Link>
          . This immediately deletes your profile, every saved run, your stats
          and personal bests, all your leaderboard entries, your online-status
          record and your sign-in account, and clears the game data in that
          browser. For your security we may ask for your password, or ask
          Google to confirm it’s you, first.
        </p>
        <p>
          Messages you sent in a room that is still open stay visible to that
          room until it is deleted. Copies held in Google’s infrastructure are
          removed on Google’s own deletion timelines.
        </p>
        <p>
          Guests can use Profile → Account → Clear guest data to remove their
          local runs, settings and anonymous ID.
        </p>
        <p>
          If you can’t sign in anymore and want your account removed, open an
          issue on GitHub (without your email address) and we’ll arrange a
          private way to verify and delete it.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your choices",
    body: (
      <>
        <ul>
          <li>
            <strong>See your data</strong>: your runs, bests and totals are on
            the <Link className="link" to="/stats">Stats</Link> page.
          </li>
          <li>
            <strong>Correct it</strong>: change your display name under Profile
            → Account; your leaderboard entries update too.
          </li>
          <li>
            <strong>Delete it</strong>: see above.
          </li>
          <li>
            <strong>Get a copy</strong>: open an issue and we’ll help you
            export your data.
          </li>
        </ul>
        <p>
          Depending on where you live, you may have further rights over your
          personal data. Contact us through GitHub to use them.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Students and children",
    body: (
      <>
        <p>
          Based Math Game is made for students, including in classrooms. Anyone
          can play, including in multiplayer rooms, as a guest without giving
          any personal information.
        </p>
        <p>
          Creating an account needs an email address. If you are under 13, or
          under the age where you live at which you can agree to this on your
          own, use the game with a parent, guardian or your school, or simply
          play as a guest. Teachers can run whole-class rooms without students
          creating accounts.
        </p>
        <p>
          If you think a child has created an account without the permission
          they needed, contact us and we’ll delete it.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        All traffic uses HTTPS. Database security rules let only you read your
        profile, run history and stats, and only you can change your
        leaderboard entries. Passwords are handled by Firebase Authentication.
        No system is perfectly secure; if you find a problem, please report it
        through GitHub without posting exploit details publicly.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this notice",
    body: (
      <p>
        When the way we handle data changes, we update this page and the date
        at the top. The full history of this notice is public in the{" "}
        <Ext href={REPO}>project’s repository</Ext>.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalDocument
      eyebrow="Privacy"
      title={
        <>
          Your data, <em>plainly</em>
        </>
      }
      lede="What Based Math Game stores, why, who can see it, and how to delete it."
      updated="9 October 2026"
      updatedIso="2026-10-09"
      summary={SUMMARY}
      sections={SECTIONS}
    />
  );
}
