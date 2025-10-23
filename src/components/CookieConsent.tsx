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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <Card className="max-w-4xl mx-auto border-2 shadow-2xl bg-background/95 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Cookie Preferences
                </h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your experience. Necessary cookies
                  are required for the site to function. You can choose to
                  enable optional cookies for additional features.
                </p>
              </div>

              {showDetails && (
                <div className="space-y-3 pt-2 border-t">
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
                      Accept All
                    </Button>
                    <Button
                      onClick={acceptNecessary}
                      variant="outline"
                      size="sm"
                    >
                      Necessary Only
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
                      Save Preferences
                    </Button>
                    <Button onClick={acceptAll} variant="outline" size="sm">
                      Accept All
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
              size="icon"
              className="flex-shrink-0"
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
