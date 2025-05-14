
import { imageRequestService } from './ImageRequestService';
import type { ImageRequest, RequestStatus } from './types';

class AnalyticsService {
  // Get statistics about the number of requests by status
  getRequestStatusCounts() {
    const requests = imageRequestService.getAllRequests();
    const statusCounts: Record<string, number> = {
      'new': 0,
      'processing': 0, 
      'completed': 0,
      'failed': 0,
      'in-progress': 0
    };
    
    requests.forEach(request => {
      if (request.status in statusCounts) {
        statusCounts[request.status]++;
      }
    });
    
    return statusCounts;
  }
  
  // Get the total number of requests
  getTotalRequestCount() {
    return imageRequestService.getAllRequests().length;
  }
  
  // Get the number of successful requests
  getSuccessfulRequestCount() {
    const requests = imageRequestService.getAllRequests();
    return requests.filter(request => request.status === 'completed').length;
  }
  
  // Get the number of failed requests
  getFailedRequestCount() {
    const requests = imageRequestService.getAllRequests();
    return requests.filter(request => request.status === 'failed').length;
  }
  
  // Get requests by status
  getRequestsByStatus(status: string) {
    const requests = imageRequestService.getAllRequests();
    return requests.filter(request => request.status === status);
  }
  
  // Get request completion rate
  getRequestCompletionRate() {
    const total = this.getTotalRequestCount();
    if (total === 0) return 0;
    
    const completed = this.getSuccessfulRequestCount();
    return (completed / total) * 100;
  }
  
  // Get requests grouped by date
  getRequestsByDate() {
    const requests = imageRequestService.getAllRequests();
    const grouped: Record<string, number> = {};
    
    requests.forEach(request => {
      const date = request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown';
      if (!grouped[date]) {
        grouped[date] = 0;
      }
      grouped[date]++;
    });
    
    return grouped;
  }
}

export const analyticsService = new AnalyticsService();
