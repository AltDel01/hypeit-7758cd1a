
export type RequestStatus = 'new' | 'in-progress' | 'completed';

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

export interface RequestStorage {
  getStorageKey(): string;
  loadFromStorage(): ImageRequest[];
  saveToStorage(requests: ImageRequest[]): void;
}

export type RequestEventType = 'imageRequestCreated' | 'imageRequestUpdated' | 'imageRequestCompleted' | 'imageRequestsCleared' | 'imageRequestsUpdated';

export interface RequestEventDetail {
  request?: ImageRequest;
  requests?: ImageRequest[];
}
