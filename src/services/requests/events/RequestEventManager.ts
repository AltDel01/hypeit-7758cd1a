
import type { ImageRequest, RequestEventType, RequestEventDetail } from '../types';

export class RequestEventManager {
  dispatchEvent(type: RequestEventType, detail: RequestEventDetail): void {
    const event = new CustomEvent(type, { detail });
    window.dispatchEvent(event);
    console.log(`Dispatched ${type} event:`, detail);
  }

  setupStorageListener(callback: (requests: ImageRequest[]) => void): () => void {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'imageRequests') {
        console.log('ImageRequestService: Storage changed from another tab/window, reloading requests');
        const requests = event.newValue ? JSON.parse(event.newValue) : [];
        callback(requests);
        
        this.dispatchEvent('imageRequestsUpdated', { requests });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }
}
