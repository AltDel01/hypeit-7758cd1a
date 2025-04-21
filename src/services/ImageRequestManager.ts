
import { toast } from 'sonner';
import type { ImageRequest, RequestStatus } from '@/types/imageRequest';
import { LocalStorageService } from './storage/LocalStorageService';

class ImageRequestManager {
  private storage: LocalStorageService;

  constructor() {
    this.storage = new LocalStorageService();
  }

  createRequest(
    userId: string, 
    userName: string, 
    prompt: string, 
    aspectRatio: string, 
    productImageUrl: string | null
  ): ImageRequest {
    try {
      return this.storage.create({
        userId,
        userName,
        prompt,
        aspectRatio,
        status: 'new',
        productImage: productImageUrl,
        resultImage: null
      });
    } catch (error) {
      console.error('Failed to create image request:', error);
      toast.error('Failed to save your request. Please try again later.');
      throw error;
    }
  }

  getAllRequests(): ImageRequest[] {
    return this.storage.getAll();
  }

  getRequestsByStatus(status: RequestStatus): ImageRequest[] {
    return this.storage.getAll().filter(req => req.status === status);
  }

  getRequestsByUser(userId: string): ImageRequest[] {
    return this.storage.getAll().filter(req => req.userId === userId);
  }

  updateRequestStatus(id: string, status: RequestStatus): ImageRequest | null {
    return this.storage.update(id, { status });
  }

  uploadResult(id: string, resultImageUrl: string): ImageRequest | null {
    return this.storage.update(id, {
      resultImage: resultImageUrl,
      status: 'completed'
    });
  }

  getRequestById(id: string): ImageRequest | null {
    return this.storage.getById(id);
  }

  getLatestRequestForUser(userId: string): ImageRequest | null {
    const userRequests = this.getRequestsByUser(userId);
    if (userRequests.length === 0) return null;
    
    return userRequests.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }

  clearAllRequests(): void {
    this.storage.clear();
  }
}

export const imageRequestManager = new ImageRequestManager();
export default imageRequestManager;
