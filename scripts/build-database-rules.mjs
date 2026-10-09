/**
 * Generates database.rules.json (Realtime Database security rules).
 *
 * RTDB rules are a single JSON file without functions or loops, so a few
 * expressions (seat bounds, "everyone else left") are generated here instead
 * of being copy-pasted ten times. Edit this file, then run:
 *
 *   npm run rules:db
 *
 * and commit both files. tests/rules/database.rules.test.ts covers the rules.
 *
 * Room schema: see src/hooks/useRoom.ts and src/hooks/useChat.ts.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const MAX_SLOTS = 10;
const STALE_MS = 6 * 60 * 60 * 1000; // matches ROOM_STALE_MS in useRoom.ts
const CHAT_MIN_INTERVAL_MS = 1000; // matches CHAT_MIN_INTERVAL_MS in useChat.ts
const CHAT_MAX_LENGTH = 300;
const NAME_MAX = 24;
// Plausibility (mirrors SCORE_LIMITS in src/data/limits.ts).
const MAX_CORRECT_PER_SECOND = 3;
const MAX_POINTS_PER_SECOND = MAX_CORRECT_PER_SECOND * 5;
const MIN_MS_PER_CORRECT = 250;
const MAX_RUN_MS = 3_600_000; // SCORE_LIMITS.maxDurationMs

/** Collapses whitespace so rules can be written readably below. */
const x = (s) => s.replace(/\s+/g, " ").trim();

// Room references from different depths.
// "pre" = data before the write, "post" = data after the write.
const ROOM_PRE_FROM_CHILD = "data.parent()"; // rooms/$r/<child>
const ROOM_POST_FROM_CHILD = "newData.parent()";
const ROOM_PRE_FROM_GRANDCHILD = "data.parent().parent()"; // rooms/$r/<c>/<id>
const ROOM_POST_FROM_GRANDCHILD = "newData.parent().parent()";
const ROOM_POST_FROM_FIELD = "newData.parent().parent().parent()"; // rooms/$r/players/$uid/<f>

const isHost = (room) => `${room}.child('hostUid').val() === auth.uid`;
const isMember = (room) => `${room}.child('players').child(auth.uid).exists()`;
const nameOk = `newData.isString() && newData.val().length >= 1 && newData.val().length <= ${NAME_MAX}`;

/** `$slot` (a one-digit string) is a valid seat index for maxPlayers. */
const slotBelowMax = (() => {
  const m = `${ROOM_POST_FROM_GRANDCHILD}.child('maxPlayers').val()`;
  const terms = ["$slot === '0'", "$slot === '1'"];
  for (let i = 2; i < MAX_SLOTS; i++)
    terms.push(`($slot === '${i}' && ${m} > ${i})`);
  return `(${terms.join(" || ")})`;
})();

/** Every seat is empty, mine, or held by a disconnected player (pre-write). */
const everyoneElseGone = (() => {
  const terms = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const s = `data.child('slots').child('${i}')`;
    terms.push(
      `(!${s}.exists() || ${s}.val() === auth.uid || data.child('players').child(${s}.val()).child('disconnected').val() === true)`,
    );
  }
  return terms.join(" && ");
})();

// Player field helpers (location: rooms/$r/players/$uid/<field>).
const R = ROOM_POST_FROM_FIELD;
const inRound = `${R}.child('status').val() !== 'waiting' && newData.parent().child('round').val() === ${R}.child('startedAt').val()`;
const sameRoundAsBefore = `data.parent().child('round').val() === ${R}.child('startedAt').val()`;
const counter = (perSecond) =>
  x(`newData.isNumber() && newData.val() >= 0 && (
    (${R}.child('status').val() === 'waiting' && newData.val() === 0) ||
    (${inRound}
      && newData.val() <= (now - ${R}.child('startedAt').val()) * ${perSecond} / 1000 + ${perSecond}
      && (!(${sameRoundAsBefore}) || newData.val() >= data.val()))
  )`);

const rules = {
  rules: {
    ".read": false,
    ".write": false,

    rooms: {
      // No ".read" here: rooms cannot be listed, only opened by code.
      $roomId: {
        ".read": "auth != null",
        ".write": x(`auth != null && (
          (!data.exists() && newData.child('hostUid').val() === auth.uid && newData.child('status').val() === 'waiting')
          || (data.exists() && !newData.exists() && data.child('lastActivityAt').val() < now - ${STALE_MS})
          || (data.exists() && !newData.exists() && data.child('players').child(auth.uid).exists() && ${everyoneElseGone})
        )`),
        ".validate": x(`$roomId.matches(/^[A-Z0-9]{8}$/)
          && newData.hasChildren(['hostUid', 'status', 'mode', 'maxPlayers', 'createdAt', 'lastActivityAt'])`),

        hostUid: {
          ".write": x(`auth != null && data.exists() && (
            data.val() === auth.uid
            || (newData.val() === auth.uid
                && ${isMember(ROOM_PRE_FROM_CHILD)}
                && !${ROOM_PRE_FROM_CHILD}.child('kicked').child(auth.uid).exists()
                && (!${ROOM_PRE_FROM_CHILD}.child('players').child(data.val()).exists()
                    || ${ROOM_PRE_FROM_CHILD}.child('players').child(data.val()).child('disconnected').val() === true))
          )`),
          ".validate": x(`newData.isString()
            && ${ROOM_POST_FROM_CHILD}.child('players').child(newData.val()).exists()
            && !${ROOM_POST_FROM_CHILD}.child('kicked').child(newData.val()).exists()`),
        },

        status: {
          ".write": x(`auth != null && data.exists() && (
            ${isHost(ROOM_PRE_FROM_CHILD)}
            || (${isMember(ROOM_PRE_FROM_CHILD)} && (
                 (data.val() === 'playing' && newData.val() === 'finished'
                   && ${ROOM_PRE_FROM_CHILD}.child('players').child(auth.uid).child('finished').val() === true
                   && ${ROOM_PRE_FROM_CHILD}.child('players').child(auth.uid).child('round').val() === ${ROOM_PRE_FROM_CHILD}.child('startedAt').val())
                 || (data.val() === 'finished' && newData.val() === 'waiting')))
          )`),
          ".validate": x(`newData.isString() && (
            newData.val() === 'waiting' || newData.val() === 'finished'
            || (newData.val() === 'playing' && (data.val() === 'playing' || ${ROOM_POST_FROM_CHILD}.child('startedAt').val() === now))
          )`),
        },

        mode: {
          ".write":
            x(`auth != null && data.exists() && ${isHost(ROOM_PRE_FROM_CHILD)}
            && ${ROOM_PRE_FROM_CHILD}.child('status').val() === 'waiting'`),
          ".validate": "newData.hasChildren(['id'])",
          id: {
            ".validate":
              "newData.isString() && newData.val().length >= 1 && newData.val().length <= 64",
          },
          custom: {
            conversions: {
              $i: {
                ".validate": x(
                  `$i.matches(/^([0-9]|1[0-5])$/) && newData.hasChildren(['from', 'to', 'min', 'max'])`,
                ),
                from: {
                  ".validate":
                    "newData.val() === 2 || newData.val() === 8 || newData.val() === 10 || newData.val() === 16",
                },
                to: {
                  ".validate":
                    "newData.val() === 2 || newData.val() === 8 || newData.val() === 10 || newData.val() === 16",
                },
                min: {
                  ".validate":
                    "newData.isNumber() && newData.val() >= 0 && newData.val() <= 4294967295",
                },
                max: {
                  ".validate":
                    "newData.isNumber() && newData.val() >= newData.parent().child('min').val() && newData.val() <= 4294967295",
                },
                $other: { ".validate": false },
              },
            },
            kinds: {
              $i: {
                ".validate": x(`$i.matches(/^[0-9]$/) && newData.isString()
                  && newData.val().matches(/^(power|twos|bitwise|add|color|ascii)$/)`),
              },
            },
            durationMs: {
              ".validate":
                "newData.isNumber() && newData.val() >= 5000 && newData.val() <= 3600000",
            },
            targetCount: {
              ".validate":
                "newData.isNumber() && newData.val() >= 1 && newData.val() <= 1000",
            },
            $other: { ".validate": false },
          },
          $other: { ".validate": false },
        },

        maxPlayers: {
          ".write":
            x(`auth != null && data.exists() && ${isHost(ROOM_PRE_FROM_CHILD)}
            && ${ROOM_PRE_FROM_CHILD}.child('status').val() === 'waiting'`),
          ".validate": `newData.isNumber() && newData.val() >= 2 && newData.val() <= ${MAX_SLOTS}`,
        },
        allowVisualAids: {
          ".write": `auth != null && data.exists() && ${isHost(ROOM_PRE_FROM_CHILD)}`,
          ".validate": "newData.isBoolean()",
        },
        createdAt: {
          ".validate":
            "(!data.exists() && newData.val() === now) || newData.val() === data.val()",
        },
        lastActivityAt: {
          ".write": x(
            `auth != null && (${isMember(ROOM_PRE_FROM_CHILD)} || ${isMember(ROOM_POST_FROM_CHILD)})`,
          ),
          ".validate": "newData.val() === now",
        },
        startedAt: {
          ".write": `auth != null && ${isHost(ROOM_PRE_FROM_CHILD)}`,
          ".validate": "newData.val() === now",
        },
        seed: {
          ".write": `auth != null && ${isHost(ROOM_PRE_FROM_CHILD)}`,
          ".validate":
            "newData.isNumber() && newData.val() >= 0 && newData.val() <= 4294967295",
        },

        // Seats bound the room to maxPlayers (RTDB rules cannot count children).
        slots: {
          $slot: {
            ".write": x(`auth != null && (
              (!data.exists() && newData.val() === auth.uid)
              || (data.val() === auth.uid && !newData.exists()
                  && !${ROOM_POST_FROM_GRANDCHILD}.child('players').child(auth.uid).exists())
              || (!newData.exists() && ${isHost(ROOM_PRE_FROM_GRANDCHILD)}
                  && ${ROOM_POST_FROM_GRANDCHILD}.child('kicked').child(data.val()).val() === true)
            )`),
            ".validate": x(`newData.isString() && newData.val() === auth.uid
              && ${slotBelowMax}
              && ${ROOM_POST_FROM_GRANDCHILD}.child('status').val() === 'waiting'
              && ${ROOM_POST_FROM_GRANDCHILD}.child('players').child(auth.uid).child('slot').val() === $slot
              && !${ROOM_POST_FROM_GRANDCHILD}.child('kicked').child(auth.uid).exists()`),
          },
        },

        kicked: {
          $uid: {
            ".write": `auth != null && ${isHost(ROOM_PRE_FROM_GRANDCHILD)} && $uid !== auth.uid`,
            ".validate": "newData.val() === true",
          },
        },

        players: {
          $uid: {
            ".write": x(`auth != null && (
              ($uid === auth.uid && (newData.exists()
                || ${ROOM_POST_FROM_GRANDCHILD}.child('slots').child(data.child('slot').val()).val() !== auth.uid))
              || (!newData.exists() && ${isHost(ROOM_PRE_FROM_GRANDCHILD)}
                  && ${ROOM_POST_FROM_GRANDCHILD}.child('kicked').child($uid).val() === true)
            )`),
            ".validate":
              x(`newData.hasChildren(['uid', 'displayName', 'slot', 'ready', 'score', 'correct', 'finished', 'wins'])
              && (data.exists() || (
                $uid === auth.uid
                && ${ROOM_POST_FROM_GRANDCHILD}.child('status').val() === 'waiting'
                && ${ROOM_POST_FROM_GRANDCHILD}.child('slots').child(newData.child('slot').val()).val() === $uid
                && !${ROOM_POST_FROM_GRANDCHILD}.child('kicked').child($uid).exists()))`),
            uid: { ".validate": "newData.val() === $uid" },
            displayName: { ".validate": nameOk },
            slot: {
              ".validate":
                "newData.isString() && newData.val().matches(/^[0-9]$/) && (!data.exists() || newData.val() === data.val())",
            },
            joinedAt: {
              ".validate":
                "(!data.exists() && newData.val() === now) || newData.val() === data.val()",
            },
            ready: { ".validate": "newData.isBoolean()" },
            disconnected: { ".validate": "newData.isBoolean()" },
            disconnectedAt: {
              ".validate": "newData.isNumber() && newData.val() <= now",
            },
            round: {
              ".validate": `newData.val() === ${R}.child('startedAt').val()`,
            },
            score: { ".validate": counter(MAX_POINTS_PER_SECOND) },
            correct: { ".validate": counter(MAX_CORRECT_PER_SECOND) },
            finished: {
              ".validate": x(
                `newData.isBoolean() && (newData.val() === false || (${inRound}))`,
              ),
            },
            finishMs: {
              ".validate": x(`newData.isNumber() && ${inRound}
                && newData.val() >= newData.parent().child('correct').val() * ${MIN_MS_PER_CORRECT}
                && newData.val() <= now - ${R}.child('startedAt').val()`),
            },
            // Speedrun skip penalties of a finished run (ranked by finishMs + penaltyMs).
            penaltyMs: {
              ".validate": x(`newData.isNumber() && ${inRound}
                && newData.val() >= 0 && newData.val() <= ${MAX_RUN_MS}`),
            },
            // When the current score was reached (sprint/survival tie-break).
            scoreMs: {
              ".validate": x(`newData.isNumber() && ${inRound}
                && newData.val() >= 0
                && newData.val() <= now - ${R}.child('startedAt').val()`),
            },
            wins: {
              ".validate": x(`newData.isNumber() && (
                (!data.exists() && newData.val() === 0)
                || newData.val() === data.val()
                || (newData.val() === data.val() + 1
                    && ${R}.child('status').val() === 'finished'
                    && newData.parent().child('lastWinRound').val() === ${R}.child('startedAt').val()
                    && data.parent().child('lastWinRound').val() !== ${R}.child('startedAt').val())
              )`),
            },
            lastWinRound: {
              ".validate": `newData.val() === ${R}.child('startedAt').val()`,
            },
            // scoreHistory/{k}: ms after play began at which point k was reached.
            scoreHistory: {
              $i: {
                ".validate": `$i.matches(/^[0-9]{1,3}$/) && newData.isNumber() && newData.val() >= 0 && newData.val() <= ${MAX_RUN_MS}`,
              },
            },
            $other: { ".validate": false },
          },
        },

        chat: {
          ".indexOn": ["timestamp"],
          $msgId: {
            ".write": x(`auth != null && !data.exists()
              && newData.child('senderId').val() === auth.uid
              && ${isMember(ROOM_PRE_FROM_GRANDCHILD)}
              && !${ROOM_PRE_FROM_GRANDCHILD}.child('kicked').child(auth.uid).exists()`),
            ".validate":
              x(`newData.hasChildren(['senderId', 'displayName', 'message', 'timestamp'])
              && ${ROOM_POST_FROM_GRANDCHILD}.child('lastChatAt').child(auth.uid).val() === now`),
            senderId: { ".validate": "newData.val() === auth.uid" },
            displayName: { ".validate": nameOk },
            message: {
              ".validate": `newData.isString() && newData.val().length >= 1 && newData.val().length <= ${CHAT_MAX_LENGTH}`,
            },
            timestamp: { ".validate": "newData.val() === now" },
            isSystem: {
              ".validate": x(`newData.isBoolean() && (newData.val() === false
                || newData.parent().parent().parent().child('hostUid').val() === auth.uid)`),
            },
            $other: { ".validate": false },
          },
        },

        // Per-user chat rate limit: written atomically with each message.
        lastChatAt: {
          $uid: {
            ".write": `auth != null && $uid === auth.uid && ${isMember(ROOM_PRE_FROM_GRANDCHILD)}`,
            ".validate": `newData.val() === now && (!data.exists() || now - data.val() >= ${CHAT_MIN_INTERVAL_MS})`,
          },
        },

        $other: { ".validate": false },
      },
    },

    // Self-only presence.
    presence: {
      $uid: {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        ".validate": "newData.hasChildren(['online', 'lastSeen'])",
        online: { ".validate": "newData.isBoolean()" },
        lastSeen: { ".validate": "newData.val() === now" },
        roomId: {
          ".validate":
            "newData.isString() && newData.val().matches(/^[A-Z0-9]{8}$/)",
        },
        $other: { ".validate": false },
      },
    },
  },
};

const out = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "database.rules.json",
);
writeFileSync(out, JSON.stringify(rules, null, 2) + "\n");
console.log(`Wrote ${path.relative(process.cwd(), out)}`);
