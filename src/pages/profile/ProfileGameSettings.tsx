import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/firebase/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Game Settings</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Customize your gameplay experience
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text">Game Settings</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Customize your gameplay experience
        </p>
      </div>

      {/* Guest User Notice */}
      {isGuest && (
        <Alert className="border-warning/50 bg-warning/10">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            <span className="font-semibold">Guest Account:</span> Your settings
            will be saved temporarily but may be lost if you clear your browser
            data.
            <a
              href="/signup"
              className="font-medium underline ml-1 text-warning hover:text-warning/80"
            >
              Sign up
            </a>{" "}
            to save your settings permanently.
          </AlertDescription>
        </Alert>
      )}

      {/* Game Settings */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            Gameplay Preferences
          </CardTitle>
          <CardDescription className="text-base">
            Customize your gameplay experience with visual aids and game flow
            options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grouped Digits */}
          <Card className="border-2">
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>

          {/* Index Value Hints */}
          <Card className="border-2">
            <CardContent className="pt-6">
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
                    Show positional values underneath each digit during
                    gameplay. Helps you understand how each digit contributes to
                    the total value.
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
            </CardContent>
          </Card>

          {/* Countdown Start */}
          <Card className="border-2">
            <CardContent className="pt-6">
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
                    Show a 3-2-1 countdown before the game starts. Gives you
                    time to prepare before the timer begins.
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
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-2 border-info/30 bg-info/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2 rounded-lg bg-info/10 h-fit">
              <Info className="h-5 w-5 text-info flex-shrink-0" />
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-foreground">
                <strong className="text-info">Multiplayer Note:</strong> In
                multiplayer games, the host can control whether visual aids are
                allowed for all players. If the host disables visual aids, your
                personal settings will be overridden for that game.
              </p>
              <Separator />
              <p className="text-muted-foreground">
                Your settings are automatically saved and will apply to all
                future games.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
