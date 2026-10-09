import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Digits } from "@/components/ui/digits";
import { BaseTag } from "@/components/ui/base-tag";
import { GridPaper } from "@/components/ui/grid-paper";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useGameSettings, type GameSettings } from "@/data";
import { cn } from "@/lib/utils";

const OPTIONS: {
  key: keyof GameSettings;
  title: string;
  body: string;
}[] = [
  {
    key: "groupedDigits",
    title: "Group digits",
    body: "Split long numbers into readable groups: binary in fours, hex in pairs, decimal in thousands.",
  },
  {
    key: "indexValueHints",
    title: "Place-value hints",
    body: "Show the weight of each digit (128 64 32 … 1) under the number you’re converting.",
  },
  {
    key: "countdownStart",
    title: "Countdown before a run",
    body: "A 3-2-1 countdown before the clock starts. Off: the first question appears straight away.",
  },
  {
    key: "soundEffects",
    title: "Sound effects",
    body: "Short tones for a correct answer, a skip and the last seconds on the clock.",
  },
];

function SettingRow({
  title,
  body,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <li className="flex items-start justify-between gap-6 border-b py-4 last:border-b-0">
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor={id} className="cursor-pointer text-[0.9375rem] font-medium">
          {title}
        </label>
        <p id={`${id}-d`} className="text-body-sm text-muted-foreground text-pretty">
          {body}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-describedby={`${id}-d`}
        className="mt-0.5"
      />
    </li>
  );
}

function Preview({ settings }: { settings: GameSettings }) {
  return (
    <figure
      aria-label="Preview of a question with these settings"
      className="relative isolate overflow-hidden rounded-xl border bg-card shadow-md"
    >
      <GridPaper fade />
      <div className="flex items-center justify-between border-b px-5 py-3">
        <span className="eyebrow">Preview</span>
        <span className="flex items-center gap-2 text-[0.75rem] text-muted-foreground">
          {settings.soundEffects ? (
            <Volume2 className="size-4" aria-hidden />
          ) : (
            <VolumeX className="size-4" aria-hidden />
          )}
          {settings.soundEffects ? "Sound on" : "Muted"}
        </span>
      </div>
      <div className="flex min-h-[13rem] flex-col items-center justify-center gap-5 px-5 py-8">
        <p className="flex items-center gap-2 text-label text-muted-foreground">
          <BaseTag base="bin" size="sm" /> to <BaseTag base="dec" size="sm" />
        </p>
        <Digits
          base="bin"
          value="10110110"
          size="lg"
          group={settings.groupedDigits ? 4 : false}
          placeValues={settings.indexValueHints}
          className="max-w-full"
        />
        <p className="font-mono text-[0.8125rem] text-muted-foreground">
          = <span className="text-foreground">182</span>
        </p>
      </div>
      <figcaption className="border-t px-5 py-3 text-[0.75rem] text-muted-foreground">
        {settings.countdownStart
          ? "Runs start after a 3-2-1 countdown."
          : "Runs start the moment you press play."}
      </figcaption>
    </figure>
  );
}

export default function ProfileGameSettings() {
  const { isGuest } = useAuth();
  const { settings, loading, saveSettings } = useGameSettings();
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const update = async (key: keyof GameSettings, value: boolean) => {
    setError(null);
    try {
      await saveSettings({ [key]: value });
      setStatus(
        `${OPTIONS.find((o) => o.key === key)?.title} ${value ? "on" : "off"}. Saved ${isGuest ? "on this device" : "to your account"}.`,
      );
    } catch (e) {
      console.error("Error saving game settings:", e);
      setError("Couldn’t save that change. Check your connection and try again.");
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14">
      <section aria-labelledby="gs-title" className="flex flex-col gap-2">
        <h2 id="gs-title" className="text-title font-semibold">
          Game settings
        </h2>
        <p className="text-body-sm text-muted-foreground text-pretty">
          {isGuest ? (
            <>
              Saved in this browser.{" "}
              <Link className="link" to="/signup?next=%2Fprofile%2Fgame-settings">
                Create an account
              </Link>{" "}
              to use them on every device.
            </>
          ) : (
            "Saved to your account and used on every device you sign in on."
          )}{" "}
          In multiplayer, the host can switch visual aids off for everyone.
        </p>
        {loading ? (
          <div className="mt-4 flex flex-col gap-6">
            {OPTIONS.map((o) => (
              <div key={o.key} className="flex items-center justify-between gap-6">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full max-w-sm" />
                </div>
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-2 flex flex-col">
            {OPTIONS.map((o) => (
              <SettingRow
                key={o.key}
                title={o.title}
                body={o.body}
                checked={settings[o.key]}
                onChange={(v) => void update(o.key, v)}
              />
            ))}
          </ul>
        )}
        <p
          role="status"
          className={cn(
            "min-h-5 text-[0.8125rem]",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? status}
        </p>
      </section>

      <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start">
        <Preview settings={settings} />
      </div>
    </div>
  );
}
