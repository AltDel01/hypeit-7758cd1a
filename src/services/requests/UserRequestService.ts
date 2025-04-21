
import type { ImageRequest } from '@/types/imageRequest';
import { LocalStorageService } from '../storage/LocalStorageService';

export class UserRequestService {
  constructor(private storage: LocalStorageService) {}

  getRequestsByUser(userId: string): ImageRequest[] {
    return this.storage.getAll().filter(req => req.userId === userId);
  }

  getLatestRequestForUser(userId: string): ImageRequest | null {
    const userRequests = this.getRequestsByUser(userId);
    if (userRequests.length === 0) return null;
    
    return userRequests.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }
}
