import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

interface CookiePreferences {
  necessary: boolean; // Always true, can't be disabled
  functional: boolean; // Theme, guest accounts
  analytics: boolean; // Analytics tracking
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: false,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch {
        // Invalid data, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);

    // Apply preferences
    if (!prefs.analytics) {
      // Clear any analytics cookies if user opts out
      // This would be where you'd disable analytics tracking
      console.log("Analytics disabled");
    }
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in fade-in-0 slide-in-from-bottom-2 sm:inset-x-auto sm:left-4 sm:bottom-4 sm:p-0"
    >
      <Card className="mx-auto max-w-md bg-popover shadow-xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Cookie
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="mb-1 text-[0.9375rem] font-semibold">Cookies</h3>
                <p className="text-body-sm text-muted-foreground">
                  Necessary cookies keep you signed in. Optional ones remember
                  your theme and help us improve the game.
                </p>
              </div>

              {showDetails && (
                <div className="space-y-3 border-t pt-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Necessary Cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Required for authentication and basic site
                        functionality. Cannot be disabled.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          functional: e.target.checked,
                        })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Functional Cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Used to remember your theme preference and guest account
                        data for a better experience.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          analytics: e.target.checked,
                        })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Analytics Cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Help us understand how you use the site so we can
                        improve it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {!showDetails ? (
                  <>
                    <Button onClick={acceptAll} size="sm">
                      Accept all
                    </Button>
                    <Button
                      onClick={acceptNecessary}
                      variant="outline"
                      size="sm"
                    >
                      Necessary only
                    </Button>
                    <Button
                      onClick={() => setShowDetails(true)}
                      variant="ghost"
                      size="sm"
                    >
                      Customize
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={saveCustom} size="sm">
                      Save preferences
                    </Button>
                    <Button onClick={acceptAll} variant="outline" size="sm">
                      Accept all
                    </Button>
                    <Button
                      onClick={() => setShowDetails(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Back
                    </Button>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mr-1.5 -mt-1.5 shrink-0"
              aria-label="Dismiss"
              onClick={() => setShowBanner(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
