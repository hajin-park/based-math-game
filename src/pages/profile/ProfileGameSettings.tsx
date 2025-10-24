import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import {
  PaperCard,
  PaperCardContent,
  PaperCardDescription,
  PaperCardHeader,
  PaperCardTitle,
  SectionHeader,
  StickyNote,
  RuledSeparator,
} from "@/components/ui/academic";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info, Loader2, Gamepad2, Eye, Hash, Timer } from "lucide-react";
import { useGameSettings, GameSettings } from "@/hooks/useGameSettings";

export default function ProfileGameSettings() {
  const { user, isGuest } = useAuth();
  const { settings, loading } = useGameSettings();
  const [saving, setSaving] = useState(false);

  // Use settings directly from the hook

  // Save settings to Firestore
  const updateSetting = async (key: keyof GameSettings, value: boolean) => {
    if (!user || isGuest) return;

    const newSettings = { ...settings, [key]: value };
    setSaving(true);

    try {
      const userRef = doc(firestore, `users/${user.uid}`);
      await setDoc(
        userRef,
        {
          gameSettings: newSettings,
        },
        { merge: true },
      );

      // Settings will be reloaded automatically by the hook
    } catch (error) {
      console.error("Error saving game settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <SectionHeader
          title="Game Settings"
          description="Customize your gameplay experience"
          icon={Gamepad2}
          align="left"
          titleSize="lg"
        />
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader
        title="Game Settings"
        description="Customize your gameplay experience"
        icon={Gamepad2}
        align="left"
        titleSize="lg"
      />

      {/* Guest User Notice */}
      {isGuest && (
        <StickyNote variant="warning">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">Guest Account:</span> Your
              settings will be saved temporarily but may be lost if you clear
              your browser data.
              <a
                href="/signup"
                className="font-medium underline ml-1 text-warning hover:text-warning/80"
              >
                Sign up
              </a>{" "}
              to save your settings permanently.
            </p>
          </div>
        </StickyNote>
      )}

      {/* Game Settings */}
      <PaperCard variant="folded" padding="none" className="shadow-lg">
        <PaperCardHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <PaperCardTitle className="text-2xl">
                Gameplay Preferences
              </PaperCardTitle>
              <PaperCardDescription className="text-base">
                Customize your gameplay experience with visual aids and game
                flow options
              </PaperCardDescription>
            </div>
          </div>
        </PaperCardHeader>
        <PaperCardContent className="p-6 pt-0 space-y-4">
          {/* Grouped Digits */}
          <PaperCard variant="folded-sm" padding="sm" className="border-2">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  <Label
                    htmlFor="grouped-digits"
                    className="text-lg font-semibold cursor-pointer"
                  >
                    Grouped Digits
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Visually group digits in numbers for easier reading:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Binary/Hex: Groups of 4 (e.g., 1010 1101)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Octal: Groups of 3 (e.g., 123 456)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Decimal: Commas for thousands (e.g., 1,234)</span>
                  </li>
                </ul>
              </div>
              <Switch
                id="grouped-digits"
                checked={settings.groupedDigits}
                onCheckedChange={(checked) =>
                  updateSetting("groupedDigits", checked)
                }
                disabled={saving || isGuest}
                className="shrink-0"
              />
            </div>
          </PaperCard>

          {/* Index Value Hints */}
          <PaperCard variant="folded-sm" padding="sm" className="border-2">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <Label
                    htmlFor="index-hints"
                    className="text-lg font-semibold cursor-pointer"
                  >
                    Index Value Hints
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Show positional values underneath each digit during gameplay.
                  Helps you understand how each digit contributes to the total
                  value.
                  <span className="block mt-1 italic">
                    (Not shown when converting from decimal)
                  </span>
                </p>
              </div>
              <Switch
                id="index-hints"
                checked={settings.indexValueHints}
                onCheckedChange={(checked) =>
                  updateSetting("indexValueHints", checked)
                }
                disabled={saving || isGuest}
                className="shrink-0"
              />
            </div>
          </PaperCard>

          {/* Countdown Start */}
          <PaperCard variant="folded-sm" padding="sm" className="border-2">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" />
                  <Label
                    htmlFor="countdown-start"
                    className="text-lg font-semibold cursor-pointer"
                  >
                    Countdown Start
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Show a 3-2-1 countdown before the game starts. Gives you time
                  to prepare before the timer begins.
                </p>
              </div>
              <Switch
                id="countdown-start"
                checked={settings.countdownStart}
                onCheckedChange={(checked) =>
                  updateSetting("countdownStart", checked)
                }
                disabled={saving || isGuest}
                className="shrink-0"
              />
            </div>
          </PaperCard>
        </PaperCardContent>
      </PaperCard>

      {/* Info Card */}
      <StickyNote variant="info">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
          <div className="space-y-3 text-sm">
            <p className="text-foreground">
              <strong className="text-info">Multiplayer Note:</strong> In
              multiplayer games, the host can control whether visual aids are
              allowed for all players. If the host disables visual aids, your
              personal settings will be overridden for that game.
            </p>
            <RuledSeparator />
            <p className="text-muted-foreground">
              Your settings are automatically saved and will apply to all future
              games.
            </p>
          </div>
        </div>
      </StickyNote>
    </div>
  );
}
