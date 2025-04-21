
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

export interface ImageRequestStorage {
  getAll(): ImageRequest[];
  getById(id: string): ImageRequest | null;
  create(request: Omit<ImageRequest, 'id' | 'createdAt' | 'updatedAt'>): ImageRequest;
  update(id: string, data: Partial<ImageRequest>): ImageRequest | null;
  clear(): void;
}
