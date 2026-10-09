import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/** − / + control for the number of seats (2..10). Arrow keys work on the value. */
export function SeatStepper({
  id,
  value,
  min = 2,
  max = 10,
  onChange,
  disabled,
}: {
  id: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)));
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => set(value - 1)}
        disabled={disabled || value <= min}
        aria-label="One seat fewer"
        aria-controls={id}
      >
        <Minus aria-hidden />
      </Button>
      <div
        id={id}
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-label="Seats"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} players`}
        aria-disabled={disabled || undefined}
        onKeyDown={(e) => {
          if (disabled) return;
          const step: Record<string, number> = {
            ArrowUp: 1,
            ArrowRight: 1,
            ArrowDown: -1,
            ArrowLeft: -1,
          };
          if (e.key in step) {
            e.preventDefault();
            set(value + step[e.key]);
          } else if (e.key === "Home") {
            e.preventDefault();
            set(min);
          } else if (e.key === "End") {
            e.preventDefault();
            set(max);
          }
        }}
        className="flex h-10 min-w-16 items-center justify-center rounded-md border bg-card px-3 font-mono text-[1.125rem] tabular-nums dark:bg-sunken/60"
      >
        {value}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => set(value + 1)}
        disabled={disabled || value >= max}
        aria-label="One seat more"
        aria-controls={id}
      >
        <Plus aria-hidden />
      </Button>
    </div>
  );
}
