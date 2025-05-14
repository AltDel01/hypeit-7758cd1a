
// Import the analytics service
import { analyticsService } from '../requests';

// Track strategy generation
export const trackStrategyGeneration = (strategyType: string) => {
  analyticsService.trackStrategyGeneration(strategyType);
};
