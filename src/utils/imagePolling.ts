
// This file is kept for backward compatibility
// Import all functionality from the new modular structure
import { 
  pollForImageResult, 
  dispatchImageGeneratedEvent 
} from './image';
import { generateFallbackImage, isValidNonPlaceholderImage } from './image/imageFallback';
import { checkValidImageUrl } from './image/imageValidation';
import type { PollImageParams } from './image/polling/types';

// Re-export everything
export { 
  pollForImageResult, 
  dispatchImageGeneratedEvent,
  generateFallbackImage,
  checkValidImageUrl,
  isValidNonPlaceholderImage,
  type PollImageParams
};
