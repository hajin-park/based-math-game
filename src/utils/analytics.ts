/**
 * Analytics utility for tracking game events
 * Logs events to console in development, can be extended for production analytics
 */

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

  /**
   * Track a game event
   */
  trackEvent(event: Omit<GameEvent, 'timestamp'>) {
    const fullEvent: GameEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', fullEvent);
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
      eventName: 'game_start',
      gameModeId,
      userId,
      metadata: { timestamp: new Date().toISOString() },
    });
  }

  /**
   * Track game completion
   */
  trackGameComplete(gameModeId: string, score: number, duration: number, userId?: string) {
    this.trackEvent({
      eventName: 'game_complete',
      gameModeId,
      score,
      duration,
      userId,
      metadata: {
        questionsPerSecond: duration > 0 ? (score / duration).toFixed(2) : '0',
      },
    });
  }

  /**
   * Track room creation
   */
  trackRoomCreated(gameModeId: string, userId?: string) {
    this.trackEvent({
      eventName: 'room_created',
      gameModeId,
      userId,
    });
  }

  /**
   * Track room joined
   */
  trackRoomJoined(gameModeId: string, userId?: string) {
    this.trackEvent({
      eventName: 'room_joined',
      gameModeId,
      userId,
    });
  }

  /**
   * Track multiplayer game start
   */
  trackMultiplayerGameStart(gameModeId: string, playerCount: number, userId?: string) {
    this.trackEvent({
      eventName: 'multiplayer_game_start',
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
      eventName: 'error',
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
  trackUserAuth(authType: 'guest' | 'email' | 'google', userId?: string) {
    this.trackEvent({
      eventName: 'user_auth',
      userId,
      metadata: { authType },
    });
  }

  /**
   * Send event to analytics service (placeholder for production)
   */
  private sendToAnalytics(event: GameEvent) {
    // TODO: Implement actual analytics service integration
    // Examples: Google Analytics, Mixpanel, Firebase Analytics, etc.
    console.log('[Analytics - Production]', event);
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

