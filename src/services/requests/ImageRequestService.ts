
import { RequestManager } from './core/RequestManager';

class ImageRequestService extends RequestManager {
  // Inherits all functionality from RequestManager
  // Can be extended with additional service-specific methods if needed
  
  getStorageKey(): string {
    return this.getStorageHandler().getStorageKey();
  }
}

// Create and export a singleton instance
export const imageRequestService = new ImageRequestService();
