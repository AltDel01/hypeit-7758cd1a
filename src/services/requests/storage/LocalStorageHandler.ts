
import { toast } from 'sonner';
import type { ImageRequest, RequestStorage } from '../types';

export class LocalStorageHandler implements RequestStorage {
  private storageKey: string = 'imageRequests';

  getStorageKey(): string {
    return this.storageKey;
  }

  loadFromStorage(): ImageRequest[] {
    try {
      const savedRequests = localStorage.getItem(this.storageKey);
      if (savedRequests) {
        console.log('Loaded requests from localStorage:', JSON.parse(savedRequests));
        return JSON.parse(savedRequests);
      }
      console.log('No saved requests found in localStorage');
      return [];
    } catch (error) {
      console.error('Failed to load image requests from localStorage:', error);
      return [];
    }
  }

  saveToStorage(requests: ImageRequest[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(requests));
      console.log('Saved requests to localStorage:', requests);

      // Dispatch a custom event that can be listened to by other components within the same window
      const storageEvent = new CustomEvent('imageRequestsUpdated', {
        detail: { requests }
      });
      window.dispatchEvent(storageEvent);
      
      // Attempt to broadcast across tabs using BroadcastChannel API if available
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('image_requests_channel');
          bc.postMessage({ type: 'imageRequestsUpdated', requests });
          console.log('Broadcast message sent to other tabs');
          bc.close();
        }
      } catch (bcError) {
        console.warn('BroadcastChannel failed, falling back to storage events:', bcError);
      }
      
    } catch (error) {
      console.error('Failed to save image requests to localStorage:', error);
      toast.error('Failed to save your request. Please try again later.');
    }
  }

  getAllRequests(): ImageRequest[] {
    return this.loadFromStorage();
  }

  getRequestById(id: string): ImageRequest | null {
    const requests = this.getAllRequests();
    return requests.find(req => req.id === id) || null;
  }

  saveRequest(request: ImageRequest): void {
    const requests = this.getAllRequests();
    const existingIndex = requests.findIndex(r => r.id === request.id);
    
    if (existingIndex >= 0) {
      requests[existingIndex] = request;
    } else {
      requests.push(request);
    }
    
    this.saveToStorage(requests);
    
    // Dispatch event for the specific request update
    const requestEvent = new CustomEvent('imageRequestUpdated', {
      detail: { request }
    });
    window.dispatchEvent(requestEvent);
  }

  deleteRequest(id: string): boolean {
    const requests = this.getAllRequests();
    const initialLength = requests.length;
    
    const filteredRequests = requests.filter(req => req.id !== id);
    
    if (filteredRequests.length !== initialLength) {
      this.saveToStorage(filteredRequests);
      return true;
    }
    
    return false;
  }
}
