import { BASES, type BaseKey } from "@/lib/bases";
import { cn } from "@/lib/utils";

/**
 * Digits with their place value printed underneath, in fixed-width columns
 * so multi-digit weights (128, 100) never crowd their neighbours.
 */
export function PlaceValueDigits({
  base,
  digits,
  className,
}: {
  base: BaseKey;
  digits: string;
  className?: string;
}) {
  const radix = BASES[base].radix;
  const chars = [...digits.toUpperCase()];
  return (
    <span className={cn("flex font-mono", BASES[base].text, className)}>
      <span className="sr-only">{digits}</span>
      {chars.map((d, i) => (
        <span
          key={i}
          aria-hidden
          className="flex w-8 flex-col items-center gap-1.5"
        >
          <span className="text-[1.375rem] font-medium leading-none">{d}</span>
          <span className="text-[0.625rem] leading-none text-muted-foreground">
            {radix ** (chars.length - 1 - i)}
          </span>
        </span>
      ))}
    </span>
  );
}
