
import { nanoid } from 'nanoid';

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

  constructor() {
    // Try to load existing requests from localStorage
    try {
      const savedRequests = localStorage.getItem('imageRequests');
      if (savedRequests) {
        this.requests = JSON.parse(savedRequests);
      }
    } catch (error) {
      console.error('Failed to load image requests from localStorage:', error);
    }
  }

  // Save current state to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem('imageRequests', JSON.stringify(this.requests));
    } catch (error) {
      console.error('Failed to save image requests to localStorage:', error);
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
    
    return newRequest;
  }

  // Get all requests
  getAllRequests(): ImageRequest[] {
    return [...this.requests];
  }

  // Get requests by status
  getRequestsByStatus(status: RequestStatus): ImageRequest[] {
    return this.requests.filter(req => req.status === status);
  }

  // Get requests by user ID
  getRequestsByUser(userId: string): ImageRequest[] {
    return this.requests.filter(req => req.userId === userId);
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
  }
}

// Create a singleton instance
export const imageRequestService = new ImageRequestService();

export default imageRequestService;
