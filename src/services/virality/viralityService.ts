
import { analyticsService } from '@/services/requests';

export const viralityService = {
  trackStrategyGeneration: (businessName: string) => {
    try {
      analyticsService.trackStrategyGeneration('virality_strategy', {
        businessName,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track virality strategy generation:', error);
    }
  }
};
