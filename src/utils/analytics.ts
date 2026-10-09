/**
 * Analytics utility for tracking game events.
 *
 * Consent-gated: nothing is recorded unless the user opted in to analytics
 * in the cookie banner (localStorage "cookieConsent".analytics === true).
 * No third-party analytics SDK is loaded; if one is added later it must be
 * loaded from sendToAnalytics() only after consent, and its origins added to
 * the Content-Security-Policy in firebase.json.
 */

function storedConsent(): boolean {
  try {
    const raw = localStorage.getItem("cookieConsent");
    return raw ? JSON.parse(raw).analytics === true : false;
  } catch {
    return false;
  }
}

export interface GameEvent {
  eventName: string;
  userId?: string;
  gameModeId?: string;
  score?: number;
  duration?: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class Analytics {
  private events: GameEvent[] = [];
  private consent: boolean | null = null;

  /** Called by the cookie banner when the user saves their preferences. */
  setConsent(granted: boolean) {
    this.consent = granted;
    if (!granted) this.events = [];
  }

  private hasConsent(): boolean {
    if (this.consent === null) this.consent = storedConsent();
    return this.consent;
  }

  /**
   * Track a game event
   */
  trackEvent(event: Omit<GameEvent, "timestamp">) {
    if (!this.hasConsent()) return;
    const fullEvent: GameEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log("[Analytics]", fullEvent);
    }

    // In production, send to analytics service
    if (import.meta.env.PROD) {
      this.sendToAnalytics(fullEvent);
    }
  }

  /**
   * Track game start
   */
  trackGameStart(gameModeId: string, userId?: string) {
    this.trackEvent({
      eventName: "game_start",
      gameModeId,
      userId,
      metadata: { timestamp: new Date().toISOString() },
    });
  }

  /**
   * Track game completion
   */
  trackGameComplete(
    gameModeId: string,
    score: number,
    duration: number,
    userId?: string,
  ) {
    this.trackEvent({
      eventName: "game_complete",
      gameModeId,
      score,
      duration,
      userId,
      metadata: {
        questionsPerSecond: duration > 0 ? (score / duration).toFixed(2) : "0",
      },
    });
  }

  /**
   * Track room creation
   */
  trackRoomCreated(gameModeId: string, userId?: string) {
    this.trackEvent({
      eventName: "room_created",
      gameModeId,
      userId,
    });
  }

  /**
   * Track room joined
   */
  trackRoomJoined(gameModeId: string, userId?: string) {
    this.trackEvent({
      eventName: "room_joined",
      gameModeId,
      userId,
    });
  }

  /**
   * Track multiplayer game start
   */
  trackMultiplayerGameStart(
    gameModeId: string,
    playerCount: number,
    userId?: string,
  ) {
    this.trackEvent({
      eventName: "multiplayer_game_start",
      gameModeId,
      userId,
      metadata: { playerCount },
    });
  }

  /**
   * Track error
   */
  trackError(errorName: string, errorMessage: string, userId?: string) {
    this.trackEvent({
      eventName: "error",
      userId,
      metadata: {
        errorName,
        errorMessage,
        userAgent: navigator.userAgent,
      },
    });
  }

  /**
   * Track user authentication
   */
  trackUserAuth(authType: "guest" | "email" | "google", userId?: string) {
    this.trackEvent({
      eventName: "user_auth",
      userId,
      metadata: { authType },
    });
  }

  /**
   * Send event to analytics service (placeholder for production)
   */
  private sendToAnalytics(event: GameEvent) {
    // No analytics backend is configured. Integrations go here and must only
    // run when hasConsent() is true (trackEvent already checks it).
    void event;
  }

  /**
   * Get all tracked events
   */
  getEvents(): GameEvent[] {
    return [...this.events];
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = [];
  }
}

// Export singleton instance
export const analytics = new Analytics();
