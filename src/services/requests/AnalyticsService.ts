
import { imageRequestService } from './ImageRequestService';
import { Request, RequestStatus } from './types';

class AnalyticsService {
  /**
   * Get all requests by status
   * @returns An object with count of requests by status
   */
  async getRequestsByStatus(): Promise<Record<RequestStatus, number>> {
    const requests = await imageRequestService.getAllRequests();
    
    const statusCounts: Record<RequestStatus, number> = {
      [RequestStatus.PENDING]: 0,
      [RequestStatus.PROCESSING]: 0,
      [RequestStatus.COMPLETED]: 0,
      [RequestStatus.FAILED]: 0,
      [RequestStatus.CANCELLED]: 0,
    };
    
    for (const request of requests) {
      statusCounts[request.status]++;
    }
    
    return statusCounts;
  }
  
  /**
   * Get the total number of requests
   * @returns The count of all requests
   */
  async getTotalRequests(): Promise<number> {
    const requests = await imageRequestService.getAllRequests();
    return requests.length;
  }
  
  /**
   * Get the success rate of requests
   * @returns The percentage of successful requests
   */
  async getSuccessRate(): Promise<number> {
    const requests = await imageRequestService.getAllRequests();
    
    if (requests.length === 0) {
      return 0;
    }
    
    const completedRequests = requests.filter(
      (request) => request.status === RequestStatus.COMPLETED
    );
    
    return (completedRequests.length / requests.length) * 100;
  }
  
  /**
   * Get the latest requests
   * @param limit The number of requests to return
   * @returns A list of the latest requests
   */
  async getLatestRequests(limit: number = 5): Promise<Request[]> {
    const requests = await imageRequestService.getAllRequests();
    
    return requests
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const analyticsService = new AnalyticsService();
