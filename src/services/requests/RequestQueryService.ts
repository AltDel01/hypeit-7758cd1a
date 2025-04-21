
import type { ImageRequest, RequestStatus } from '@/types/imageRequest';
import { LocalStorageService } from '../storage/LocalStorageService';

export class RequestQueryService {
  constructor(private storage: LocalStorageService) {}

  getAllRequests(): ImageRequest[] {
    return this.storage.getAll();
  }

  getRequestById(id: string): ImageRequest | null {
    return this.storage.getById(id);
  }

  getRequestsByStatus(status: RequestStatus): ImageRequest[] {
    return this.storage.getAll().filter(req => req.status === status);
  }
}
