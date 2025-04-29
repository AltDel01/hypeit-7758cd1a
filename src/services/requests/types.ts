
export type RequestStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'in-progress' | 'new';

export type RequestEventType = 
  | 'imageRequestCreated'
  | 'imageRequestUpdated'
  | 'imageRequestCompleted'
  | 'imageRequestsUpdated'
  | 'imageRequestsCleared';

export interface RequestEventDetail {
  request?: Request;
  requests?: Request[];
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  prompt: string;
  aspectRatio: string;
  referenceImage: string | null;
  batchSize: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  progress?: number;
  resultImage?: string | null;
  batchImages?: string[];
  batchParentId?: string;
  batchIndex?: number;
}

export interface RequestStorage {
  loadFromStorage(): Request[];
  saveToStorage(requests: Request[]): void;
  getStorageKey(): string;
  getAllRequests(): Request[];
  getRequestById(id: string): Request | null;
  saveRequest(request: Request): void;
  deleteRequest(id: string): boolean;
}

// Backward compatibility type aliases
export type ImageRequest = Request;
