
import { RequestManager } from './core/RequestManager';

class ImageRequestService extends RequestManager {
  // Inherits all functionality from RequestManager
  // Can be extended with additional service-specific methods if needed
  
  getStorageKey(): string {
    return this.getStorageHandler().getStorageKey();
  }

  // Add the missing methods referenced in hooks
  uploadResult(requestId: string, imageUrl: string) {
    return this.updateRequest(requestId, {
      status: 'completed',
      resultImage: imageUrl,
      completedAt: new Date().toISOString()
    });
  }

  clearAllRequests() {
    const allRequests = this.getAllRequests();
    if (allRequests.length === 0) return;
    
    this.getStorageHandler().saveToStorage([]);
    
    // Dispatch a custom event for clearing requests
    const clearEvent = new CustomEvent('imageRequestsCleared', {
      detail: { requests: [] }
    });
    window.dispatchEvent(clearEvent);
    
    return true;
  }
}

// Create and export a singleton instance
export const imageRequestService = new ImageRequestService();
