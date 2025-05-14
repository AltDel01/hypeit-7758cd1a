
export class AnalyticsService {
  private STORAGE_KEY = 'hypeit-analytics-data';

  trackPageView(pageName: string): void {
    try {
      const existingData = this.getAnalyticsData();
      
      // Update the page views
      const updatedPageViews = {
        ...(existingData.pageViews || {}),
        [pageName]: ((existingData.pageViews || {})[pageName] || 0) + 1
      };
      
      const updatedData = {
        ...existingData,
        pageViews: updatedPageViews,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  trackFormStep(formType: string, stepNumber: number): void {
    try {
      const existingData = this.getAnalyticsData();
      
      const formSteps = existingData.steps || {};
      const formTypeSteps = formSteps[formType] || [];
      
      // Only add the step if it doesn't already exist
      if (!formTypeSteps.includes(stepNumber)) {
        formTypeSteps.push(stepNumber);
      }
      
      const updatedData = {
        ...existingData,
        steps: {
          ...formSteps,
          [formType]: formTypeSteps
        },
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error tracking form step:', error);
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
    } catch (error) {
      console.error('Error tracking strategy generation:', error);
    }
  }
  
  getAnalyticsForPage(pageName: string): number {
    try {
      const existingData = this.getAnalyticsData();
      return (existingData.pageViews || {})[pageName] || 0;
    } catch (error) {
      console.error('Error getting analytics for page:', error);
      return 0;
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
      console.error('Error getting analytics data:', error);
      return defaultData;
    }
  }
}

export const analyticsService = new AnalyticsService();
