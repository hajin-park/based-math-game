import { useId } from "react";

import { BaseTag } from "@/components/ui/base-tag";
import { Digits } from "@/components/ui/digits";
import { Switch } from "@/components/ui/switch";
import { useGameSettings, type GameSettings } from "@/data";

const ROWS: {
  key: keyof GameSettings;
  title: string;
  description: string;
}[] = [
  {
    key: "groupedDigits",
    title: "Group digits",
    description:
      "Space binary into nibbles, hex into bytes, decimal into thousands.",
  },
  {
    key: "indexValueHints",
    title: "Place-value hints",
    description: "Show the weight of each digit under the number.",
  },
  {
    key: "countdownStart",
    title: "3-2-1 countdown",
    description: "Count down before each run. Enter skips it.",
  },
  {
    key: "soundEffects",
    title: "Sound and vibration",
    description:
      "Quiet ticks for correct answers, a thud for misses, a chord at the end.",
  },
];

/** Game settings as switches with a live preview. Works for guests (stored on this device). */
export function GameSettingsPanel() {
  const id = useId();
  const { settings, saveSettings, loading } = useGameSettings();
  return (
    <div className="flex flex-col gap-6">
      <div
        aria-hidden
        className="flex min-h-24 items-center justify-center gap-3 rounded-lg border bg-sunken/50 px-4 py-5"
      >
        <BaseTag base="bin" size="sm" />
        <Digits
          base="bin"
          value="10110110"
          size="lg"
          group={settings.groupedDigits}
          placeValues={settings.indexValueHints}
        />
      </div>
      <ul className="flex flex-col divide-y">
        {ROWS.map((row) => (
          <li
            key={row.key}
            className="flex items-start justify-between gap-4 py-4 first:pt-0"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`${id}-${row.key}`}
                className="text-label font-medium text-foreground"
              >
                {row.title}
              </label>
              <p
                id={`${id}-${row.key}-d`}
                className="text-body-sm text-muted-foreground"
              >
                {row.description}
              </p>
            </div>
            <Switch
              id={`${id}-${row.key}`}
              aria-describedby={`${id}-${row.key}-d`}
              checked={settings[row.key]}
              disabled={loading}
              onCheckedChange={(checked) =>
                void saveSettings({ [row.key]: checked })
              }
              className="mt-0.5"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
