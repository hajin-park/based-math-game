/** Room codes: 8 characters, A-Z and 0-9 (see useRoom's randomRoomCode). */
export const ROOM_CODE_LENGTH = 8;
const CODE_RE = /^[A-Z0-9]{8}$/;

export function isRoomCode(value: string | undefined | null): value is string {
  return !!value && CODE_RE.test(value);
}

/**
 * Normalises whatever was typed or pasted into a (possibly partial) code:
 * upper-cases, drops spaces and separators, and pulls the code out of a
 * pasted invite link ("…/join/K7Q29XDM", "…/lobby/K7Q29XDM", "?code=…").
 */
export function normalizeRoomCode(raw: string): string {
  const text = raw.trim();
  const fromLink =
    /(?:\/join\/|\/lobby\/|[?&]code=)([A-Za-z0-9]{8})(?![A-Za-z0-9])/.exec(
      text,
    );
  if (fromLink) return fromLink[1].toUpperCase();
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, ROOM_CODE_LENGTH);
}

/** The two halves shown with a visual gap ("K7Q2", "9XDM"). */
export function codeHalves(code: string): [string, string] {
  return [code.slice(0, 4), code.slice(4, 8)];
}

/** Shareable one-click join link. */
export function inviteUrl(
  code: string,
  origin = window.location.origin,
): string {
  return `${origin}/join/${code}`;
}

/** Same link without the protocol, for display ("basedmath.app/join/…"). */
export function inviteLabel(
  code: string,
  origin = window.location.origin,
): string {
  return inviteUrl(code, origin).replace(/^https?:\/\//, "");
}
