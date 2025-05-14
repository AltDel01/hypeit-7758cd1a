
import { RequestManager } from './core/RequestManager';
import { RequestEventManager } from './events/RequestEventManager';

class AnalyticsService {
  constructor(
    private requestManager: RequestManager,
    private eventManager: RequestEventManager
  ) {}

  // Track when a user views the analytics dashboard
  trackAnalyticsDashboardViewed() {
    this.eventManager.emitEvent('analytics_dashboard_viewed');
  }

  // Track when a user generates a strategy
  trackStrategyGeneration(strategyType: string) {
    this.eventManager.emitEvent('strategy_generated', { strategyType });
  }

  // Track when a user connects a social media account
  trackSocialMediaConnected(platform: string) {
    this.eventManager.emitEvent('social_media_connected', { platform });
  }
}

// Create a singleton instance
export const analyticsService = new AnalyticsService(
  new RequestManager(),
  new RequestEventManager()
);
