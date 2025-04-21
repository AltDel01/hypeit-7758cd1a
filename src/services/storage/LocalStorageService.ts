
import { nanoid } from 'nanoid';
import type { ImageRequest, ImageRequestStorage } from '@/types/imageRequest';

export class LocalStorageService implements ImageRequestStorage {
  private storageKey: string = 'imageRequests';
  private requests: ImageRequest[] = [];
  
  constructor() {
    this.loadFromStorage();
    this.setupStorageListener();
  }

  private loadFromStorage(): void {
    try {
      const savedRequests = localStorage.getItem(this.storageKey);
      if (savedRequests) {
        this.requests = JSON.parse(savedRequests);
        console.log('Loaded requests from localStorage:', this.requests);
      }
    } catch (error) {
      console.error('Failed to load image requests from localStorage:', error);
      this.requests = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.requests));
      console.log('Saved requests to localStorage:', this.requests);
    } catch (error) {
      console.error('Failed to save image requests to localStorage:', error);
      throw new Error('Failed to save requests to storage');
    }
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        console.log('Storage changed from another tab/window, reloading requests');
        this.loadFromStorage();
        window.dispatchEvent(new CustomEvent('imageRequestsUpdated', {
          detail: { requests: this.requests }
        }));
      }
    });
  }

  getAll(): ImageRequest[] {
    return [...this.requests];
  }

  getById(id: string): ImageRequest | null {
    return this.requests.find(req => req.id === id) || null;
  }

  create(requestData: Omit<ImageRequest, 'id' | 'createdAt' | 'updatedAt'>): ImageRequest {
    const newRequest: ImageRequest = {
      ...requestData,
      id: nanoid(8),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.requests.push(newRequest);
    this.saveToStorage();
    
    window.dispatchEvent(new CustomEvent('imageRequestCreated', {
      detail: { request: newRequest }
    }));
    
    return newRequest;
  }

  update(id: string, data: Partial<ImageRequest>): ImageRequest | null {
    const index = this.requests.findIndex(req => req.id === id);
    if (index === -1) return null;

    this.requests[index] = {
      ...this.requests[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    
    window.dispatchEvent(new CustomEvent('imageRequestUpdated', {
      detail: { request: this.requests[index] }
    }));
    
    return this.requests[index];
  }

  clear(): void {
    this.requests = [];
    this.saveToStorage();
    window.dispatchEvent(new CustomEvent('imageRequestsCleared'));
  }
}
