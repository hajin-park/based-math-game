/**
 * Reusable worked-solution building blocks: place-value expansion, subtracting
 * powers of two, repeated division, and bit grouping for hex/octal.
 */
import { BASES, bitLength, toBase } from "../bases";
import type { Base, ExplanationStep } from "../types";
import {
  MINUS,
  alignColumns,
  chunks,
  hexDigit,
  padToMultiple,
  show,
  stripLeadingZeros,
} from "./shared";

/** Expand `digits` (in `base`, may contain leading zeros) by place value. */
export function placeValueSteps(digits: string, base: Base): ExplanationStep[] {
  const ds = digits.toLowerCase();
  const value = parseInt(ds, base);
  if (base === 2) {
    if (value === 0) {
      return [
        {
          title: "Expand by place value",
          work: [show(ds, 2), "= 0"],
          note: "No bit is 1, so the value is 0.",
        },
      ];
    }
    const weights = [...ds].map((_, i) => 2 ** (ds.length - 1 - i));
    const used = weights.filter((_, i) => ds[i] === "1");
    const sum = `${used.join(" + ")} = ${value}`;
    if (ds.length <= 8) {
      return [
        {
          title: "Write the place value above each bit",
          work: alignColumns([
            ["weight", ...weights.map(String)],
            ["bit", ...[...ds]],
          ]),
          note: "Each place is worth twice the place to its right, starting from 1.",
        },
        { title: "Add the weights of the 1 bits", work: [sum] },
      ];
    }
    const exps = weights
      .map((w, i) => (ds[i] === "1" ? `2^${Math.log2(w)}` : ""))
      .filter(Boolean);
    return [
      {
        title: "Find the position of each 1 bit",
        work: [show(ds, 2), `= ${exps.join(" + ")}`],
        note: "Positions count from 0 at the rightmost bit; a 1 in position k is worth 2^k.",
      },
      { title: "Add the powers", work: [sum] },
    ];
  }
  const digitValues = [...ds].map((d) => parseInt(d, base));
  const weights = digitValues.map((_, i) => base ** (ds.length - 1 - i));
  const rows: string[][] = [["digit", ...[...ds].map((d) => d.toUpperCase())]];
  if (base === 16) rows.push(["value", ...digitValues.map(String)]);
  rows.push(["weight", ...weights.map(String)]);
  const terms = digitValues.map((d, i) => `${d}×${weights[i]}`);
  const products = digitValues.map((d, i) => d * weights[i]);
  return [
    {
      title: "Write the place value of each digit",
      work: alignColumns(rows),
      note: `Each ${BASES[base].name.toLowerCase()} place is worth ${base} times the place to its right.`,
    },
    {
      title: "Multiply and add",
      work: [terms.join(" + "), `= ${products.join(" + ")}`, `= ${value}`],
    },
  ];
}

/**
 * Decimal to binary by subtracting the largest power of two that fits.
 * `width` pads the bit table (e.g. 8 for a byte).
 */
export function subtractPowersSteps(
  value: number,
  width?: number,
): ExplanationStep[] {
  if (value === 0) {
    return [{ title: "Zero", work: ["0"], note: "Zero is 0 in every base." }];
  }
  const lines: string[] = [];
  let rest = value;
  const usedExps: number[] = [];
  while (rest > 0) {
    const e = bitLength(rest) - 1;
    const p = 2 ** e;
    lines.push(`${rest} ${MINUS} ${p} = ${rest - p}`);
    usedExps.push(e);
    rest -= p;
  }
  const len = Math.max(bitLength(value), width ?? 0);
  const bits = toBase(value, 2, len);
  const steps: ExplanationStep[] = [
    {
      title: "Subtract the largest power of 2 that fits, then repeat",
      work: lines,
      note: "Powers of 2: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024 …",
    },
  ];
  if (len <= 8) {
    const weights = Array.from({ length: len }, (_, i) =>
      String(2 ** (len - 1 - i)),
    );
    steps.push({
      title: "Write 1 under each power you used, 0 elsewhere",
      work: alignColumns([weights, [...bits]]),
    });
  } else {
    steps.push({
      title: "Set the bit for each power you used",
      work: [
        `powers used: ${usedExps.map((e) => `2^${e}`).join(", ")}`,
        show(bits, 2),
      ],
      note: "A 1 in position k (counting from 0 on the right) stands for 2^k.",
    });
  }
  return steps;
}

/** Decimal to base 8/16 (or 2) by repeated division, reading remainders upward. */
export function repeatedDivisionSteps(
  value: number,
  base: Base,
): ExplanationStep {
  const lines: string[] = [];
  let q = value;
  const digits: string[] = [];
  do {
    const next = Math.floor(q / base);
    const r = q % base;
    const d = hexDigit(r);
    lines.push(
      `${q} ÷ ${base} = ${next} remainder ${r}${base === 16 && r > 9 ? ` → ${d}` : ""}`,
    );
    digits.unshift(d);
    q = next;
  } while (q > 0);
  return {
    title: `Divide by ${base} until the quotient is 0`,
    work: lines,
    note: `The remainders, read from the last one up, are the ${BASES[base].name.toLowerCase()} digits: ${digits.join("")}.`,
  };
}

/** Binary → hex (size 4) or octal (size 3) by grouping bits from the right. */
export function bitsToGroupsStep(
  binDigits: string,
  base: 8 | 16,
): ExplanationStep {
  const size = base === 16 ? 4 : 3;
  const padded = padToMultiple(stripLeadingZeros(binDigits), size);
  const groups = chunks(padded, size);
  const mapped = groups.map((g) => hexDigit(parseInt(g, 2)));
  return {
    title:
      base === 16
        ? "Group the bits into nibbles from the right"
        : "Group the bits into threes from the right",
    work: [groups.join(" "), mapped.map((d) => d.padStart(size)).join(" ")],
    note:
      base === 16
        ? "Each group of 4 bits is one hex digit (0000 = 0 … 1001 = 9, 1010 = A … 1111 = F). Pad the leftmost group with zeros."
        : "Each group of 3 bits is one octal digit (000 = 0 … 111 = 7). Pad the leftmost group with zeros.",
  };
}

/** Hex/octal → binary by expanding each digit to 4 or 3 bits. */
export function groupsToBitsSteps(
  digits: string,
  base: 8 | 16,
): ExplanationStep[] {
  const size = base === 16 ? 4 : 3;
  const ds = digits.toLowerCase();
  const groups = [...ds].map((d) => toBase(parseInt(d, base), 2, size));
  const joined = groups.join("");
  const steps: ExplanationStep[] = [
    {
      title:
        base === 16
          ? "Expand each hex digit to 4 bits"
          : "Expand each octal digit to 3 bits",
      work: [
        [...ds].map((d) => d.toUpperCase().padStart(size)).join(" "),
        groups.join(" "),
      ],
      note:
        base === 16
          ? "Hex digit weights inside a nibble are 8 4 2 1, e.g. B = 11 = 8 + 2 + 1 = 1011."
          : "Octal digit weights inside a triplet are 4 2 1, e.g. 5 = 4 + 1 = 101.",
    },
  ];
  const trimmed = stripLeadingZeros(joined);
  if (trimmed !== joined) {
    steps.push({
      title: "Leading zeros are optional",
      work: [`${joined} = ${trimmed}`],
    });
  }
  return steps;
}
