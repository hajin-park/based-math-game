import type { ReactNode } from "react";

import { Digits } from "@/components/ui/digits";
import type { TopicId } from "@/game";
import { cn } from "@/lib/utils";

const Arrow = () => (
  <span aria-hidden className="text-muted-foreground">
    →
  </span>
);
const Op = ({ children }: { children: ReactNode }) => (
  <span className="font-mono text-[0.75em] text-muted-foreground">
    {children}
  </span>
);

/** One worked example per topic, typeset with Digits (mirrors Topic.example). */
const EXAMPLES: Record<Exclude<TopicId, "custom">, { node: ReactNode; label: string }> = {
  nibbles: {
    label: "1011 in binary is B in hex",
    node: (
      <>
        <Digits base="bin" value="1011" size="inherit" />
        <Arrow />
        <Digits base="hex" value="B" size="inherit" />
      </>
    ),
  },
  powers: {
    label: "2 to the 10th is 1024",
    node: (
      <>
        <span className="font-mono text-base-dec">
          2<sup className="text-[0.6em]">10</sup>
        </span>
        <Arrow />
        <Digits base="dec" value="1024" size="inherit" />
      </>
    ),
  },
  "bytes-bin": {
    label: "11000000 in binary is 192",
    node: (
      <>
        <Digits base="bin" value="11000000" group size="inherit" />
        <Arrow />
        <Digits base="dec" value="192" size="inherit" />
      </>
    ),
  },
  "bytes-hex": {
    label: "C8 in hex is 200",
    node: (
      <>
        <Digits base="hex" value="C8" size="inherit" />
        <Arrow />
        <Digits base="dec" value="200" size="inherit" />
      </>
    ),
  },
  octal: {
    label: "755 in octal is 111 101 101 in binary",
    node: (
      <>
        <Digits base="oct" value="755" size="inherit" />
        <Arrow />
        <Digits base="bin" value="111101101" group={3} size="inherit" />
      </>
    ),
  },
  words: {
    label: "1F90 in hex is 8080",
    node: (
      <>
        <Digits base="hex" value="1F90" size="inherit" />
        <Arrow />
        <Digits base="dec" value="8080" size="inherit" />
      </>
    ),
  },
  twos: {
    label: "11111110 as a signed byte is minus 2",
    node: (
      <>
        <Digits base="bin" value="11111110" group size="inherit" />
        <Arrow />
        <Digits base="dec" value="−2" size="inherit" />
      </>
    ),
  },
  bitwise: {
    label: "CA AND 0F is 0A",
    node: (
      <>
        <Digits base="hex" value="CA" size="inherit" />
        <Op>AND</Op>
        <Digits base="hex" value="0F" size="inherit" />
        <Arrow />
        <Digits base="hex" value="0A" size="inherit" />
      </>
    ),
  },
  "binary-add": {
    label: "0101 plus 0011 is 1000",
    node: (
      <>
        <Digits base="bin" value="0101" size="inherit" />
        <Op>+</Op>
        <Digits base="bin" value="0011" size="inherit" />
        <Arrow />
        <Digits base="bin" value="1000" size="inherit" />
      </>
    ),
  },
  applied: {
    label: "the green channel of 3FA0C2 is 160",
    node: (
      <>
        <span
          aria-hidden
          className="inline-block size-[0.9em] translate-y-[0.1em] rounded-[3px] bg-[#3FA0C2] ring-1 ring-inset ring-foreground/15"
        />
        <Digits base="hex" value="3FA0C2" group={2} size="inherit" />
        <Arrow />
        <Digits base="dec" value="160" size="inherit" />
      </>
    ),
  },
  mixed: {
    label: "377 in octal is FF in hex",
    node: (
      <>
        <Digits base="oct" value="377" size="inherit" />
        <Arrow />
        <Digits base="hex" value="FF" size="inherit" />
      </>
    ),
  },
};

export function TopicExample({
  topicId,
  className,
}: {
  topicId: TopicId;
  className?: string;
}) {
  if (topicId === "custom") return null;
  const ex = EXAMPLES[topicId];
  return (
    <span
      role="img"
      aria-label={`Example: ${ex.label}`}
      className={cn(
        "inline-flex items-baseline gap-2 whitespace-nowrap font-mono",
        className,
      )}
    >
      {ex.node}
    </span>
  );
}
