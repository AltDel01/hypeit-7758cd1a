
// This file is kept for backward compatibility
// Import all functionality from the new modular structure
import { 
  pollForImageResult, 
  dispatchImageGeneratedEvent 
} from './image';
import { generateFallbackImage } from './image/imageFallback';
import type { PollImageParams } from './image/imagePolling';

// Re-export everything
export { 
  pollForImageResult, 
  dispatchImageGeneratedEvent,
  generateFallbackImage,
  type PollImageParams
};
