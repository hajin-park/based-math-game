import { useId } from "react";

import { BaseTag } from "@/components/ui/base-tag";
import { Digits } from "@/components/ui/digits";
import { Switch } from "@/components/ui/switch";
import { useGameSettings, type GameSettings } from "@/data";

type Row = { key: keyof GameSettings; title: string; description: string };

const GROUPS: { label: string; rows: Row[] }[] = [
  {
    label: "On the page",
    rows: [
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
    ],
  },
  {
    label: "During a run",
    rows: [
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
    ],
  },
];

/**
 * Game settings as a printed form: an example of the current look, then
 * switches in two groups. Works for guests (stored on this device).
 */
export function GameSettingsPanel() {
  const id = useId();
  const { settings, saveSettings, loading } = useGameSettings();
  return (
    <div className="flex flex-col gap-6">
      <figure aria-hidden className="flex flex-col gap-3 bg-tint px-4 py-4">
        <figcaption className="smallcaps text-primary">Example</figcaption>
        <div className="flex min-h-16 items-center justify-center gap-3">
          <BaseTag base="bin" size="sm" />
          <Digits
            base="bin"
            value="10110110"
            size="lg"
            group={settings.groupedDigits}
            placeValues={settings.indexValueHints}
          />
        </div>
      </figure>
      {GROUPS.map((group) => (
        <fieldset key={group.label} className="flex flex-col">
          <legend className="smallcaps float-left w-full border-b border-foreground/30 pb-1.5 text-foreground/80">
            {group.label}
          </legend>
          <ul className="flex flex-col">
            {group.rows.map((row) => (
              <li
                key={row.key}
                className="flex items-start justify-between gap-4 border-b border-border py-3.5"
              >
                <div className="flex flex-col gap-0.5">
                  <label
                    htmlFor={`${id}-${row.key}`}
                    className="cursor-pointer font-sans text-label font-bold text-foreground"
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
        </fieldset>
      ))}
    </div>
  );
}
