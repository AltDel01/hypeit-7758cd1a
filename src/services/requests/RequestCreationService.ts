
import { toast } from 'sonner';
import type { ImageRequest } from '@/types/imageRequest';
import { LocalStorageService } from '../storage/LocalStorageService';

export class RequestCreationService {
  constructor(private storage: LocalStorageService) {}

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
}
