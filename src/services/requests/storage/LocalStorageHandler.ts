
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
    } catch (error) {
      console.error('Failed to save image requests to localStorage:', error);
      toast.error('Failed to save your request. Please try again later.');
    }
  }
}
