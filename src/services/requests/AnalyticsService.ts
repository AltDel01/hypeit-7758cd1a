
import { toast } from '@/hooks/use-toast';

class AnalyticsService {
  private readonly STORAGE_KEY = 'virality_analytics';

  trackStepCompletion(stepNumber: number, stepName: string): void {
    try {
      // Get existing analytics data
      const existingData = this.getAnalyticsData();
      
      // Update step data
      const updatedData = {
        ...existingData,
        steps: {
          ...existingData.steps,
          [stepNumber]: {
            name: stepName,
            completedAt: new Date().toISOString(),
          }
        },
        lastUpdated: new Date().toISOString()
      };
      
      // Save updated data
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error tracking step completion:', error);
    }
  }

  trackStrategyGeneration(strategyType: string, additionalData?: Record<string, any>): void {
    try {
      const existingData = this.getAnalyticsData();
      
      const updatedData = {
        ...existingData,
        generatedStrategies: [
          ...(existingData.generatedStrategies || []),
          {
            type: strategyType,
            ...(additionalData || {}),
            generatedAt: new Date().toISOString()
          }
        ],
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
      
      // Notify user with toast
      toast({
        title: "Analytics recorded",
        description: `Strategy generation for ${strategyType} has been tracked`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error tracking strategy generation:', error);
    }
  }

  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    try {
      const existingData = this.getAnalyticsData();
      
      const updatedData = {
        ...existingData,
        events: [
          ...(existingData.events || []),
          {
            name: eventName,
            ...(eventData || {}),
            timestamp: new Date().toISOString()
          }
        ],
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  private getAnalyticsData(): any {
    const defaultData = {
      steps: {},
      generatedStrategies: [],
      events: [],
      lastUpdated: new Date().toISOString()
    };
    
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : defaultData;
    } catch (error) {
      console.error('Error retrieving analytics data:', error);
      return defaultData;
    }
  }

  getCompletedSteps(): number[] {
    try {
      const { steps } = this.getAnalyticsData();
      return Object.keys(steps).map(Number);
    } catch (error) {
      console.error('Error getting completed steps:', error);
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();
