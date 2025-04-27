
import type { ImageRequest, RequestEventType, RequestEventDetail } from '../types';

export class RequestEventManager {
  dispatchEvent(type: RequestEventType, detail: RequestEventDetail): void {
    const event = new CustomEvent(type, { detail });
    window.dispatchEvent(event);
    console.log(`Dispatched ${type} event:`, detail);
  }

  setupStorageListener(callback: (requests: ImageRequest[]) => void): () => void {
    // Listen for storage events from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'imageRequests') {
        console.log('ImageRequestService: Storage changed from another tab/window, reloading requests');
        const requests = event.newValue ? JSON.parse(event.newValue) : [];
        callback(requests);
        
        this.dispatchEvent('imageRequestsUpdated', { requests });
      }
    };
    
    // Listen for custom events within the same window
    const handleCustomEvent = (event: CustomEvent) => {
      console.log('ImageRequestService: Custom event received, updating requests');
      callback(event.detail.requests);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('imageRequestsUpdated', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('imageRequestsUpdated', handleCustomEvent as EventListener);
    };
  }
}
