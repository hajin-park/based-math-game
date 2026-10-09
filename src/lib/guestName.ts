const ADJECTIVES = [
  "Swift",
  "Clever",
  "Bright",
  "Quick",
  "Sharp",
  "Smart",
  "Wise",
  "Bold",
  "Brave",
  "Cool",
  "Epic",
  "Fast",
  "Keen",
  "Nimble",
  "Rapid",
  "Sleek",
  "Stellar",
  "Super",
  "Turbo",
  "Ultra",
  "Vivid",
  "Witty",
  "Zesty",
  "Agile",
];

const NOUNS = [
  "Coder",
  "Hacker",
  "Ninja",
  "Wizard",
  "Master",
  "Guru",
  "Pro",
  "Ace",
  "Champion",
  "Expert",
  "Genius",
  "Hero",
  "Legend",
  "Maven",
  "Sage",
  "Star",
  "Tiger",
  "Wolf",
  "Eagle",
  "Falcon",
  "Phoenix",
  "Dragon",
  "Lion",
  "Bear",
];

function randomInt(maxExclusive: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % maxExclusive;
}

/** Friendly random display name, e.g. "SwiftFalcon417" (always <= 24 chars). */
export function generateGuestName(): string {
  const adjective = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const noun = NOUNS[randomInt(NOUNS.length)];
  return `${adjective}${noun}${randomInt(1000)}`;
}
