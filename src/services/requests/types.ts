
export type RequestStatus = 'new' | 'processing' | 'completed' | 'failed' | 'in-progress';

export type RequestEventType = 
  | 'imageRequestCreated'
  | 'imageRequestUpdated'
  | 'imageRequestCompleted'
  | 'imageRequestsUpdated'
  | 'imageRequestsCleared';

export interface RequestEventDetail {
  request?: ImageRequest;
  requests?: ImageRequest[];
}

export interface ImageRequest {
  id: string;
  userId: string;
  userName: string;
  prompt: string;
  aspectRatio: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  productImage: string | null;
  resultImage: string | null;
  batchSize?: number;
  batchImages?: string[];
  batchParentId?: string;
  batchIndex?: number;
}

export interface RequestStorage {
  loadFromStorage(): ImageRequest[];
  saveToStorage(requests: ImageRequest[]): void;
  getStorageKey(): string;
}
