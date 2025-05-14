
// Import the analytics service
import { analyticsService } from '../requests';

// Create a service class for virality-related functionality
class ViralityService {
  // Track strategy generation
  trackStrategyGeneration(strategyType: string) {
    analyticsService.trackStrategyGeneration(strategyType);
  }
}

// Create and export a singleton instance
export const viralityService = new ViralityService();

// Also export the function for backwards compatibility
export const trackStrategyGeneration = (strategyType: string) => {
  viralityService.trackStrategyGeneration(strategyType);
};
