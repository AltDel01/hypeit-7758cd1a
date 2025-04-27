
import type { ImageRequest, RequestEventType, RequestEventDetail } from '../types';

export class RequestEventManager {
  private broadcastChannel: BroadcastChannel | null = null;
  
  constructor() {
    // Initialize BroadcastChannel if supported
    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('image_requests_channel');
        console.log('BroadcastChannel initialized for cross-tab communication');
      }
    } catch (error) {
      console.warn('BroadcastChannel not supported:', error);
      this.broadcastChannel = null;
    }
  }
  
  dispatchEvent(type: RequestEventType, detail: RequestEventDetail): void {
    const event = new CustomEvent(type, { detail });
    window.dispatchEvent(event);
    console.log(`Dispatched ${type} event:`, detail);
    
    // Also send via BroadcastChannel if available
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type, detail });
        console.log(`Broadcast ${type} event to other tabs`);
      } catch (error) {
        console.warn('Failed to broadcast message:', error);
      }
    }
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
    
    // Listen for BroadcastChannel messages from other tabs
    const handleBroadcastMessage = (event: MessageEvent) => {
      console.log('BroadcastChannel message received:', event.data);
      if (event.data.type === 'imageRequestsUpdated' || event.data.detail?.requests) {
        const requests = event.data.requests || event.data.detail.requests;
        console.log('Updating requests from broadcast message:', requests);
        callback(requests);
      }
    };

    // Set up all event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('imageRequestsUpdated', handleCustomEvent as EventListener);
    
    // Set up BroadcastChannel listener if available
    if (this.broadcastChannel) {
      this.broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }
    
    return () => {
      // Clean up all event listeners
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('imageRequestsUpdated', handleCustomEvent as EventListener);
      
      if (this.broadcastChannel) {
        this.broadcastChannel.removeEventListener('message', handleBroadcastMessage);
        this.broadcastChannel.close();
        this.broadcastChannel = null;
      }
    };
  }
}
