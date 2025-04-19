
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

// Define request status types
export type RequestStatus = 'new' | 'in-progress' | 'completed';

// Define image generation request interface
export interface ImageRequest {
  id: string;
  userId: string;
  userName: string;
  prompt: string;
  aspectRatio: string;
  status: RequestStatus;
  createdAt: string;
  productImage: string | null;
  resultImage: string | null;
  updatedAt: string;
}

// In a real application, this would interact with your database
class ImageRequestService {
  private requests: ImageRequest[] = [];
  private initialized: boolean = false;
  private storageKey: string = 'imageRequests';

  constructor() {
    this.loadFromStorage();
    
    // Add event listener for storage changes from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        console.log('ImageRequestService: Storage changed from another tab/window, reloading requests');
        this.loadFromStorage();
        
        // Dispatch event to notify UI components about the change
        window.dispatchEvent(new CustomEvent('imageRequestsUpdated', {
          detail: { requests: this.requests }
        }));
      }
    });
  }

  // Load existing requests from localStorage
  private loadFromStorage() {
    try {
      const savedRequests = localStorage.getItem(this.storageKey);
      if (savedRequests) {
        this.requests = JSON.parse(savedRequests);
        console.log('Loaded requests from localStorage:', this.requests);
        this.initialized = true;
      } else {
        console.log('No saved requests found in localStorage');
        this.requests = [];
        this.initialized = true;
      }
    } catch (error) {
      console.error('Failed to load image requests from localStorage:', error);
      this.requests = [];
      this.initialized = true;
    }
  }

  // Save current state to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.requests));
      console.log('Saved requests to localStorage:', this.requests);
    } catch (error) {
      console.error('Failed to save image requests to localStorage:', error);
      toast.error('Failed to save your request. Please try again later.');
    }
  }

  // Create a new image generation request
  createRequest(
    userId: string, 
    userName: string, 
    prompt: string, 
    aspectRatio: string, 
    productImageUrl: string | null
  ): ImageRequest {
    // Make sure storage is loaded before creating a request
    if (!this.initialized) {
      this.loadFromStorage();
    }

    const newRequest: ImageRequest = {
      id: nanoid(8), // Generate a short unique ID
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
    
    // Log the new request for debugging
    console.log('New image request created:', newRequest);
    console.log('Current requests:', this.requests);
    
    // Dispatch event to notify other components
    const requestEvent = new CustomEvent('imageRequestCreated', {
      detail: { request: newRequest }
    });
    window.dispatchEvent(requestEvent);
    
    return newRequest;
  }

  // Get all requests
  getAllRequests(): ImageRequest[] {
    // Ensure requests are loaded from storage
    if (!this.initialized) {
      this.loadFromStorage();
    }
    return [...this.requests];
  }

  // Get requests by status
  getRequestsByStatus(status: RequestStatus): ImageRequest[] {
    return this.getAllRequests().filter(req => req.status === status);
  }

  // Get requests by user ID
  getRequestsByUser(userId: string): ImageRequest[] {
    return this.getAllRequests().filter(req => req.userId === userId);
  }

  // Update request status
  updateRequestStatus(id: string, status: RequestStatus): ImageRequest | null {
    const index = this.requests.findIndex(req => req.id === id);
    if (index === -1) return null;

    this.requests[index] = {
      ...this.requests[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('imageRequestUpdated', {
      detail: { request: this.requests[index] }
    }));
    
    return this.requests[index];
  }

  // Upload result for a request
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
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('imageRequestCompleted', {
      detail: { request: this.requests[index] }
    }));
    
    return this.requests[index];
  }

  // Get a specific request by ID
  getRequestById(id: string): ImageRequest | null {
    const request = this.requests.find(req => req.id === id);
    return request || null;
  }

  // Get the latest request for a user
  getLatestRequestForUser(userId: string): ImageRequest | null {
    const userRequests = this.getRequestsByUser(userId);
    if (userRequests.length === 0) return null;
    
    // Sort by created date, newest first
    return userRequests.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }

  // Clear all requests (for testing purposes)
  clearAllRequests() {
    this.requests = [];
    this.saveToStorage();
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('imageRequestsCleared'));
  }
  
  // Force reload requests from storage
  forceReload(): ImageRequest[] {
    this.loadFromStorage();
    return this.getAllRequests();
  }
}

// Create a singleton instance
export const imageRequestService = new ImageRequestService();

export default imageRequestService;
