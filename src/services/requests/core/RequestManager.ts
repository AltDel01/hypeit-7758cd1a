
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
    productImageUrl: string | null,
    batchSize: number = 1
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
      updatedAt: new Date().toISOString(),
      batchSize: batchSize,
      batchImages: []
    };

    this.requests.push(newRequest);
    this.saveToStorage();
    
    // Store the batch size in localStorage for reference
    localStorage.setItem('selectedImagesPerBatch', batchSize.toString());
    
    this.eventManager.dispatchEvent('imageRequestCreated', { request: newRequest });
    
    // For premium batches (15, 25), create multiple placeholder entries in Generated Content
    if (batchSize > 3) {
      this.createBatchPlaceholders(newRequest);
    }
    
    return newRequest;
  }

  private createBatchPlaceholders(request: ImageRequest): void {
    // For premium users, simulate creating batch entries that will appear in Generated Content
    const { id: parentId, batchSize, prompt, userId, aspectRatio } = request;
    
    // Create placeholder requests for each image in the batch
    for (let i = 0; i < batchSize; i++) {
      const batchRequest: ImageRequest = {
        id: `${parentId}-batch-${i}`,
        userId,
        userName: request.userName,
        prompt: `${prompt} (variation ${i+1})`,
        aspectRatio,
        status: 'new',
        createdAt: new Date().toISOString(),
        productImage: null,
        resultImage: null,
        updatedAt: new Date().toISOString(),
        batchParentId: parentId,
        batchIndex: i
      };
      
      this.requests.push(batchRequest);
      
      // Add to the parent's batch images array
      if (!request.batchImages) {
        request.batchImages = [];
      }
      request.batchImages.push(batchRequest.id);
    }
    
    this.saveToStorage();
    
    // Simulate progress for batch items
    this.simulateBatchProgress(request);
  }
  
  private simulateBatchProgress(parentRequest: ImageRequest): void {
    if (!parentRequest.batchImages || parentRequest.batchImages.length === 0) {
      return;
    }
    
    // Calculate total duration based on batch size (larger batches take longer)
    const totalDuration = parentRequest.batchSize > 15 ? 180000 : 120000; // 3 minutes or 2 minutes
    const intervalTime = 2000; // Update every 2 seconds
    const totalSteps = totalDuration / intervalTime;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(95, (currentStep / totalSteps) * 100);
      
      // Update all batch images with the current progress
      parentRequest.batchImages?.forEach((batchId, index) => {
        // Add some variation to the progress
        const individualProgress = progress + (Math.random() * 10 - 5);
        
        // Dispatch progress event for this batch item
        const progressEvent = new CustomEvent('imageGenerationProgress', {
          detail: { 
            requestId: batchId, 
            progress: Math.min(95, Math.max(0, individualProgress)) 
          }
        });
        window.dispatchEvent(progressEvent);
        
        // Every few steps, complete a random image in the batch
        if (currentStep > 10 && Math.random() > 0.85) {
          const batchRequest = this.getRequestById(batchId);
          if (batchRequest && batchRequest.status !== 'completed') {
            // Generate a placeholder result image
            const resultImageUrl = `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(parentRequest.prompt.split(' ').slice(0, 3).join(','))}&random=${Date.now()}${index}`;
            
            this.uploadResult(batchId, resultImageUrl);
          }
        }
      });
      
      // End the simulation after reaching close to 100%
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        
        // Complete any remaining batch items
        parentRequest.batchImages?.forEach(batchId => {
          const batchRequest = this.getRequestById(batchId);
          if (batchRequest && batchRequest.status !== 'completed') {
            const resultImageUrl = `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(parentRequest.prompt.split(' ').slice(0, 3).join(','))}&random=${Date.now()}`;
            this.uploadResult(batchId, resultImageUrl);
          }
        });
        
        // Mark parent request as completed
        this.updateRequestStatus(parentRequest.id, 'completed');
      }
    }, intervalTime);
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
