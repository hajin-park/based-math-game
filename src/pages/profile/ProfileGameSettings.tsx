import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { useGameSettings, GameSettings } from '@/hooks/useGameSettings';

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
      await setDoc(userRef, {
        gameSettings: newSettings
      }, { merge: true });

      // Settings will be reloaded automatically by the hook
    } catch (error) {
      console.error('Error saving game settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Game Settings</h1>
          <p className="text-muted-foreground mt-2">Customize your gameplay experience</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Game Settings</h1>
        <p className="text-muted-foreground mt-2">Customize your gameplay experience</p>
      </div>

      {/* Guest User Notice */}
      {isGuest && (
        <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            You're using a guest account. Your settings will be saved temporarily but may be lost if you clear your browser data.
            <a href="/signup" className="font-medium underline ml-1">Sign up</a> to save your settings permanently.
          </AlertDescription>
        </Alert>
      )}

      {/* Game Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Gameplay Preferences</CardTitle>
          <CardDescription>
            Customize your gameplay experience with visual aids and game flow options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grouped Digits */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="grouped-digits" className="text-base font-medium">
                Grouped Digits
              </Label>
              <p className="text-sm text-muted-foreground">
                Visually group digits in numbers for easier reading:
                <br />
                • Binary/Hex: Groups of 4 (e.g., 1010 1101)
                <br />
                • Octal: Groups of 3 (e.g., 123 456)
                <br />
                • Decimal: Commas for thousands (e.g., 1,234)
              </p>
            </div>
            <Switch
              id="grouped-digits"
              checked={settings.groupedDigits}
              onCheckedChange={(checked) => updateSetting('groupedDigits', checked)}
              disabled={saving || isGuest}
            />
          </div>

          {/* Index Value Hints */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="index-hints" className="text-base font-medium">
                Index Value Hints
              </Label>
              <p className="text-sm text-muted-foreground">
                Show positional values underneath each digit during gameplay. Helps you understand how each digit contributes to the total value.
                (Not shown when converting from decimal)
              </p>
            </div>
            <Switch
              id="index-hints"
              checked={settings.indexValueHints}
              onCheckedChange={(checked) => updateSetting('indexValueHints', checked)}
              disabled={saving || isGuest}
            />
          </div>

          {/* Countdown Start */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="countdown-start" className="text-base font-medium">
                Countdown Start
              </Label>
              <p className="text-sm text-muted-foreground">
                Show a 3-2-1 countdown before the game starts. Gives you time to prepare before the timer begins.
              </p>
            </div>
            <Switch
              id="countdown-start"
              checked={settings.countdownStart}
              onCheckedChange={(checked) => updateSetting('countdownStart', checked)}
              disabled={saving || isGuest}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Note:</strong> In multiplayer games, the host can control whether visual aids are allowed for all players.
                If the host disables visual aids, your personal settings will be overridden for that game.
              </p>
              <p>
                Your settings are automatically saved and will apply to all future games.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

