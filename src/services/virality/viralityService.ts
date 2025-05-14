
import { analyticsService } from '@/services/requests';

export const viralityService = {
  trackStrategyGeneration: (businessName: string) => {
    try {
      analyticsService.trackEvent('virality_strategy_generated', {
        businessName,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track virality strategy generation:', error);
    }
  }
};
