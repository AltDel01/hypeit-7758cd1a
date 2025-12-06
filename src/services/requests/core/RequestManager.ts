
import { v4 as uuidv4 } from 'uuid';
import { LocalStorageHandler } from '../storage/LocalStorageHandler';
import { ImageRequest, RequestStatus } from '../types';

// Use a loose type lookup to avoid TypeScript complaining about env typings
const ENABLE_REQUEST_SIMULATION = (import.meta as any)?.env?.VITE_ENABLE_REQUEST_SIMULATION === 'true';

export class RequestManager {
  private storageHandler: LocalStorageHandler;

  constructor() {
    this.storageHandler = new LocalStorageHandler();

    // Only simulate progress if explicitly enabled
    if (ENABLE_REQUEST_SIMULATION) {
      this.startPolling();
    }
  }

  getStorageHandler(): LocalStorageHandler {
    return this.storageHandler;
  }

  createRequest(
    userId: string,
    userName: string,
    prompt: string,
    aspectRatio: string,
    imageUrl: string | null,
    batchSize: number = 1
  ): ImageRequest {
    const request: ImageRequest = {
      id: uuidv4(),
      userId,
      userName,
      prompt,
      aspectRatio,
      productImage: imageUrl,
      referenceImage: imageUrl,
      batchSize,
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resultImage: null,
      progress: 0
    };

    // Save the batch size to localStorage for reference across pages
    localStorage.setItem('selectedImagesPerBatch', batchSize.toString());
    
    this.storageHandler.saveRequest(request);
    
    // Dispatch a custom event for the request creation
    const requestEvent = new CustomEvent('imageRequestCreated', {
      detail: { request }
    });
    window.dispatchEvent(requestEvent);
    
    return request;
  }

  getRequestById(id: string): ImageRequest | null {
    return this.storageHandler.getRequestById(id);
  }

  getAllRequests(): ImageRequest[] {
    return this.storageHandler.getAllRequests();
  }

  getRequestsForUser(userId: string): ImageRequest[] {
    return this.getAllRequests().filter(request => request.userId === userId);
  }
  
  getActiveRequestsForUser(userId: string): ImageRequest[] {
    return this.getRequestsForUser(userId)
      .filter(request => ['new', 'processing', 'in-progress'].includes(request.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  getCompletedRequestsForUser(userId: string): ImageRequest[] {
    return this.getRequestsForUser(userId)
      .filter(request => request.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  getLatestRequestForUser(userId: string): ImageRequest | null {
    const userRequests = this.getRequestsForUser(userId);
    if (userRequests.length === 0) return null;
    
    return userRequests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }

  updateRequest(id: string, updates: Partial<ImageRequest>): ImageRequest | null {
    const request = this.getRequestById(id);
    if (!request) return null;

    const updatedRequest = { 
      ...request, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    
    this.storageHandler.saveRequest(updatedRequest);
    
    return updatedRequest;
  }
  
  updateRequestStatus(id: string, status: RequestStatus): ImageRequest | null {
    return this.updateRequest(id, { status });
  }

  deleteRequest(id: string): boolean {
    return this.storageHandler.deleteRequest(id);
  }
  
  forceReload(): ImageRequest[] {
    return this.storageHandler.loadFromStorage();
  }
  
  simulateGenerationProgress() {
    const pendingRequests = this.getAllRequests().filter(
      request => ['new', 'processing', 'in-progress'].includes(request.status)
    );
    
    pendingRequests.forEach(request => {
      const currentProgress = request.progress || 0;
      
      // Randomly increment progress
      if (currentProgress < 100) {
        const increment = Math.random() * 10;
        let newProgress = currentProgress + increment;
        
        if (newProgress >= 100) {
          // Complete the request
          newProgress = 100;
          this.updateRequest(request.id, {
            status: 'completed',
            progress: 100,
            resultImage: 'https://picsum.photos/seed/' + Math.random() + '/500/500',
            completedAt: new Date().toISOString()
          });
          
          // Dispatch event
          const event = new CustomEvent('imageGenerated', {
            detail: {
              requestId: request.id,
              imageUrl: 'https://picsum.photos/seed/' + Math.random() + '/500/500'
            }
          });
          window.dispatchEvent(event);
        } else {
          // Update progress
          this.updateRequest(request.id, {
            status: 'processing',
            progress: newProgress
          });
          
          // Dispatch progress event
          const progressEvent = new CustomEvent('imageGenerationProgress', {
            detail: {
              requestId: request.id,
              progress: newProgress
            }
          });
          window.dispatchEvent(progressEvent);
        }
      }
    });
  }
  
  startPolling() {
    // Poll every 5 seconds
    setInterval(() => {
      console.info('Polling for new requests...');
      this.simulateGenerationProgress();
    }, 5000);
  }
}
