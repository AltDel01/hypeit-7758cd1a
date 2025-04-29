
import { toast } from 'sonner';
import type { Request } from '../types';

export class LocalStorageHandler {
  private storageKey: string = 'imageRequests';

  getStorageKey(): string {
    return this.storageKey;
  }

  loadFromStorage(): Request[] {
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

  saveToStorage(requests: Request[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(requests));
      console.log('Saved requests to localStorage:', requests);

      // Dispatch a custom event that can be listened to by other components
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

  getAllRequests(): Request[] {
    return this.loadFromStorage();
  }

  getRequestById(id: string): Request | null {
    const requests = this.getAllRequests();
    return requests.find(request => request.id === id) || null;
  }

  saveRequest(request: Request): void {
    const requests = this.getAllRequests();
    const index = requests.findIndex(r => r.id === request.id);
    
    if (index !== -1) {
      requests[index] = request;
    } else {
      requests.push(request);
    }
    
    this.saveToStorage(requests);
  }

  deleteRequest(id: string): boolean {
    const requests = this.getAllRequests();
    const initialLength = requests.length;
    const filteredRequests = requests.filter(request => request.id !== id);
    
    if (filteredRequests.length !== initialLength) {
      this.saveToStorage(filteredRequests);
      return true;
    }
    
    return false;
  }
}
