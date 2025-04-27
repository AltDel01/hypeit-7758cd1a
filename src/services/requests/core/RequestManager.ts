
import { nanoid } from 'nanoid';
import type { ImageRequest, RequestStatus } from '../types';
import { LocalStorageHandler } from '../storage/LocalStorageHandler';
import { RequestEventManager } from '../events/RequestEventManager';

export class RequestManager {
  private requests: ImageRequest[] = [];
  private initialized: boolean = false;
  private storageHandler: LocalStorageHandler;
  private eventManager: RequestEventManager;
  private pollingInterval: number | null = null;

  constructor() {
    this.storageHandler = new LocalStorageHandler();
    this.eventManager = new RequestEventManager();
    this.loadFromStorage();
    
    // Set up listeners for storage events and custom events
    this.eventManager.setupStorageListener((requests) => {
      console.log('Received updated requests via event:', requests);
      this.requests = requests;
    });

    // Add a polling mechanism to periodically check for new requests
    this.setupPolling();
    
    // Add a visibility change listener to refresh data when tab becomes visible
    this.setupVisibilityListener();
  }
  
  protected getStorageHandler(): LocalStorageHandler {
    return this.storageHandler;
  }

  private loadFromStorage(): void {
    this.requests = this.storageHandler.loadFromStorage();
    this.initialized = true;
    console.log('Loaded requests from storage:', this.requests);
  }

  private saveToStorage(): void {
    this.storageHandler.saveToStorage(this.requests);
  }

  private setupPolling(): void {
    // Poll every 5 seconds to check for new requests (shorter interval for better responsiveness)
    this.pollingInterval = window.setInterval(() => {
      console.log('Polling for new requests...');
      this.loadFromStorage();
    }, 5000);
    
    // Clean up interval on page unload
    window.addEventListener('beforeunload', () => {
      if (this.pollingInterval !== null) {
        clearInterval(this.pollingInterval);
      }
    });
  }
  
  private setupVisibilityListener(): void {
    // Refresh data when the tab becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, refreshing requests');
        this.loadFromStorage();
      }
    });
  }

  createRequest(
    userId: string,
    userName: string,
    prompt: string,
    aspectRatio: string,
    productImageUrl: string | null
  ): ImageRequest {
    if (!this.initialized) {
      this.loadFromStorage();
    }

    const newRequest: ImageRequest = {
      id: nanoid(8),
      userId,
      userName,
      prompt,
      aspectRatio,
      status: 'new',
      createdAt: new Date().toISOString(),
      productImage: productImageUrl,
      resultImage: null,
      updatedAt: new Date().toISOString()
    };

    this.requests.push(newRequest);
    this.saveToStorage();
    this.eventManager.dispatchEvent('imageRequestCreated', { request: newRequest });
    
    return newRequest;
  }

  getAllRequests(): ImageRequest[] {
    if (!this.initialized) {
      this.loadFromStorage();
    }
    return [...this.requests];
  }

  getRequestById(id: string): ImageRequest | null {
    return this.requests.find(req => req.id === id) || null;
  }

  getRequestsByStatus(status: RequestStatus): ImageRequest[] {
    return this.getAllRequests().filter(req => req.status === status);
  }

  getRequestsByUser(userId: string): ImageRequest[] {
    return this.getAllRequests().filter(req => req.userId === userId);
  }

  updateRequestStatus(id: string, status: RequestStatus): ImageRequest | null {
    const index = this.requests.findIndex(req => req.id === id);
    if (index === -1) return null;

    this.requests[index] = {
      ...this.requests[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    this.eventManager.dispatchEvent('imageRequestUpdated', { request: this.requests[index] });
    
    return this.requests[index];
  }

  uploadResult(id: string, resultImageUrl: string): ImageRequest | null {
    const index = this.requests.findIndex(req => req.id === id);
    if (index === -1) return null;

    this.requests[index] = {
      ...this.requests[index],
      resultImage: resultImageUrl,
      status: 'completed',
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    this.eventManager.dispatchEvent('imageRequestCompleted', { request: this.requests[index] });
    
    return this.requests[index];
  }

  getLatestRequestForUser(userId: string): ImageRequest | null {
    const userRequests = this.getRequestsByUser(userId);
    if (userRequests.length === 0) return null;
    
    return userRequests.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }

  clearAllRequests(): void {
    this.requests = [];
    this.saveToStorage();
    this.eventManager.dispatchEvent('imageRequestsCleared', {});
  }
  
  forceReload(): ImageRequest[] {
    this.loadFromStorage();
    return this.getAllRequests();
  }
}
