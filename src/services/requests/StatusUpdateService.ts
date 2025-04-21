
import type { ImageRequest, RequestStatus } from '@/types/imageRequest';
import { LocalStorageService } from '../storage/LocalStorageService';

export class StatusUpdateService {
  constructor(private storage: LocalStorageService) {}

  updateRequestStatus(id: string, status: RequestStatus): ImageRequest | null {
    return this.storage.update(id, { status });
  }

  uploadResult(id: string, resultImageUrl: string): ImageRequest | null {
    return this.storage.update(id, {
      resultImage: resultImageUrl,
      status: 'completed'
    });
  }
}
