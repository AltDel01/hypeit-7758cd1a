
import type { ImageRequest, RequestStatus } from '@/types/imageRequest';
import { LocalStorageService } from './storage/LocalStorageService';
import { RequestCreationService } from './requests/RequestCreationService';
import { StatusUpdateService } from './requests/StatusUpdateService';
import { UserRequestService } from './requests/UserRequestService';
import { RequestQueryService } from './requests/RequestQueryService';

class ImageRequestManager {
  private storage: LocalStorageService;
  private requestCreationService: RequestCreationService;
  private statusUpdateService: StatusUpdateService;
  private userRequestService: UserRequestService;
  private requestQueryService: RequestQueryService;

  constructor() {
    this.storage = new LocalStorageService();
    this.requestCreationService = new RequestCreationService(this.storage);
    this.statusUpdateService = new StatusUpdateService(this.storage);
    this.userRequestService = new UserRequestService(this.storage);
    this.requestQueryService = new RequestQueryService(this.storage);
  }

  createRequest(
    userId: string, 
    userName: string, 
    prompt: string, 
    aspectRatio: string, 
    productImageUrl: string | null
  ): ImageRequest {
    return this.requestCreationService.createRequest(
      userId,
      userName,
      prompt,
      aspectRatio,
      productImageUrl
    );
  }

  getAllRequests(): ImageRequest[] {
    return this.requestQueryService.getAllRequests();
  }

  getRequestsByStatus(status: RequestStatus): ImageRequest[] {
    return this.requestQueryService.getRequestsByStatus(status);
  }

  getRequestsByUser(userId: string): ImageRequest[] {
    return this.userRequestService.getRequestsByUser(userId);
  }

  updateRequestStatus(id: string, status: RequestStatus): ImageRequest | null {
    return this.statusUpdateService.updateRequestStatus(id, status);
  }

  uploadResult(id: string, resultImageUrl: string): ImageRequest | null {
    return this.statusUpdateService.uploadResult(id, resultImageUrl);
  }

  getRequestById(id: string): ImageRequest | null {
    return this.requestQueryService.getRequestById(id);
  }

  getLatestRequestForUser(userId: string): ImageRequest | null {
    return this.userRequestService.getLatestRequestForUser(userId);
  }

  clearAllRequests(): void {
    this.storage.clear();
  }
}

export const imageRequestManager = new ImageRequestManager();
export default imageRequestManager;
