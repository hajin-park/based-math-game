/**
 * color: one channel of a #RRGGBB color, answered in decimal (0..255).
 */
import type { SeededRng } from "../rng";
import type { ExplanationStep, Question } from "../types";
import {
  type KindParams,
  alignColumns,
  answerStep,
  clampDifficulty,
  isWarm,
} from "./shared";

export type Channel = "red" | "green" | "blue";
const CHANNELS: readonly Channel[] = ["red", "green", "blue"];

export interface ColorParams extends KindParams {
  /** Channels to ask about (default all three). */
  channels?: Channel[];
}

function hex2(n: number): string {
  return n.toString(16).toUpperCase().padStart(2, "0");
}

export function generate(rng: SeededRng, p: ColorParams): Question {
  const channel = rng.pick(
    p.channels && p.channels.length ? p.channels : CHANNELS,
  );
  const warm = isWarm(p);
  const rgb = [rng.int(0, 255), rng.int(0, 255), rng.int(0, 255)];
  const ci = CHANNELS.indexOf(channel);
  // After warm-up the asked channel is never 00 or FF, and never a repeated
  // digit like 33 or AA, which are answerable without converting.
  if (warm) {
    let v = rgb[ci];
    for (let i = 0; i < 8 && v % 17 === 0; i++) v = rng.int(1, 254);
    rgb[ci] = v % 17 === 0 ? v + 1 : v;
  }
  const hex = `#${rgb.map(hex2).join("")}`;
  const name = channel[0].toUpperCase() + channel.slice(1);
  return {
    id: `color:${channel}:${hex.slice(1).toLowerCase()}`,
    kind: "color",
    topicId: p.topicId,
    instruction: "Hex color → Decimal channel",
    prompt: [
      { type: "text", text: `${name} channel of` },
      { type: "swatch", hex },
    ],
    answerBase: 10,
    answerFormat: "decimal",
    answer: String(rgb[ci]),
    maxLength: 3,
    difficulty: p.difficulty ?? clampDifficulty(2),
  };
}

export function explain(q: Question): ExplanationStep[] {
  const [, channel, hex] = q.id.split(":") as [string, Channel, string];
  const pairs = [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((s) =>
    s.toUpperCase(),
  );
  const ci = CHANNELS.indexOf(channel);
  const byte = pairs[ci];
  const hi = parseInt(byte[0], 16);
  const lo = parseInt(byte[1], 16);
  return [
    {
      title: "Split #RRGGBB into three bytes",
      work: alignColumns([
        ["#", ...pairs],
        ["", "R", "G", "B"],
      ]),
      note: `Each channel is one byte from 00 (off) to FF (255, full intensity). ${channel[0].toUpperCase() + channel.slice(1)} is ${byte}.`,
    },
    {
      title: `Convert ${byte} to decimal`,
      work: [
        `${byte[0]}×16 + ${byte[1]}`,
        `= ${hi}×16 + ${lo}`,
        `= ${hi * 16} + ${lo} = ${hi * 16 + lo}`,
      ],
    },
    answerStep(q, "Decimal, 0 to 255."),
  ];
}
