import { Link } from "react-router-dom";

import { LegalDocument, type LegalSection } from "@/components/LegalDocument";

const REPO = "https://github.com/hajin-park/based-math-game";

const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a className="link" href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const SUMMARY = [
  <>Based Math Game is free and open source. Play as a guest or with a free account.</>,
  <>Play fair: no bots, scripts or tampering with scores. Suspicious scores can be removed.</>,
  <>Keep display names and chat suitable for a classroom.</>,
  <>The game is provided as is, without guarantees, and may change.</>,
  <>
    Your data is handled as described in the{" "}
    <Link className="link" to="/privacy">
      Privacy notice
    </Link>
    .
  </>,
];

const SECTIONS: LegalSection[] = [
  {
    id: "using",
    title: "Using the game",
    body: (
      <>
        <p>
          These terms apply when you use Based Math Game, the website and its
          multiplayer rooms. By playing you agree to them. If you don’t agree,
          please don’t use the game.
        </p>
        <p>
          The game is free. Every mode, including multiplayer, works without an
          account; guests are simply not ranked on leaderboards and their runs
          stay in their browser.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    body: (
      <ul>
        <li>One account per person. Use an email address you control.</li>
        <li>
          Keep your password to yourself. You’re responsible for what happens
          on your account.
        </li>
        <li>
          If you’re under 13, or under the age where you live at which you can
          agree to these terms yourself, get a parent, guardian or your school
          to agree on your behalf, or play as a guest.
        </li>
        <li>
          You can delete your account at any time under{" "}
          <Link className="link" to="/profile/settings">
            Profile → Account
          </Link>
          .
        </li>
      </ul>
    ),
  },
  {
    id: "fair-play",
    title: "Fair play and leaderboards",
    body: (
      <>
        <p>
          Leaderboards only mean something if everyone plays by hand. Don’t use
          bots, scripts, auto-typers or modified clients, and don’t submit
          scores any other way than by playing.
        </p>
        <p>
          Scores are sent by the game in your browser. Our database rules check
          each one for plausibility (for example, how fast answers can
          physically be typed) before it is accepted, but they can’t prove a
          score was earned fairly. We may remove leaderboard entries, or
          suspend accounts, that look automated or tampered with.
        </p>
        <p>
          Each daily challenge has one ranked attempt per account, on its own
          day (UTC).
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "Names and chat",
    body: (
      <>
        <p>
          Display names and room chat are seen by other players, often
          classmates. Keep them suitable for a classroom:
        </p>
        <ul>
          <li>No harassment, hate, sexual content or threats.</li>
          <li>Don’t share other people’s personal information, or your own beyond what you’re comfortable with.</li>
          <li>Don’t impersonate other people, teachers or the project.</li>
          <li>No spam or advertising.</li>
        </ul>
        <p>
          Room hosts can remove players from their room. We may rename or
          remove accounts that break these rules.
        </p>
      </>
    ),
  },
  {
    id: "content",
    title: "Content and licence",
    body: (
      <>
        <p>
          The game’s source code is licensed under the{" "}
          <Ext href={`${REPO}/blob/main/LICENSE`}>GNU General Public License v3.0</Ext>
          . You’re free to study, change and share it under that licence.
        </p>
        <p>
          You keep any rights you have in the messages you write. By sending
          them in a room you let us store and show them to that room for as
          long as the room exists.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    title: "Availability and changes",
    body: (
      <p>
        We run the game on a best-effort basis. Features, modes and scoring
        may change, the service may be interrupted, and leaderboards may be
        reset if a scoring rule changes. We’ll try to keep your saved runs
        safe, but please don’t rely on the game as the only record of
        anything important, such as coursework grades.
      </p>
    ),
  },
  {
    id: "warranty",
    title: "No warranty",
    body: (
      <p>
        The game is provided “as is” and “as available”, without warranties of
        any kind, to the extent the law allows. This matches the GPL-3.0
        licence the code is released under.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        To the extent the law allows, the maintainers are not liable for any
        indirect or consequential loss arising from your use of the game,
        including lost data or scores. Nothing in these terms limits rights
        you have under laws that can’t be waived.
      </p>
    ),
  },
  {
    id: "ending",
    title: "Ending",
    body: (
      <p>
        You can stop playing at any time and delete your account from your
        profile. We may suspend or delete accounts that seriously or
        repeatedly break these terms.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        If we change these terms, we update this page and the date at the top.
        The full history is public in the{" "}
        <Ext href={REPO}>project’s repository</Ext>. Continuing to play after a
        change means you accept the new terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions, reports of abuse or cheating: open an issue at{" "}
        <Ext href={`${REPO}/issues`}>github.com/hajin-park/based-math-game/issues</Ext>
        . Please don’t post personal information in public issues.
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <LegalDocument
      eyebrow="Terms"
      title={
        <>
          The <em>rules</em> of the game
        </>
      }
      lede="The agreement between you and the maintainers of Based Math Game, in plain language."
      updated="9 October 2026"
      updatedIso="2026-10-09"
      summary={SUMMARY}
      sections={SECTIONS}
    />
  );
}
