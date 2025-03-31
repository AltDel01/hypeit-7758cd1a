
import { dispatchImageGeneratedEvent } from './imageEvents';
import { toast } from "sonner";

/**
 * Generates a fallback image using Unsplash
 * 
 * @param prompt - The prompt to use for generating the fallback image
 */
export function generateFallbackImage(prompt: string): void {
  // Extract key terms from the prompt for better image search
  const cleanPrompt = prompt.replace(/generate|post|wording:|image|attached|instagram story/gi, '');
  
  const searchTerms = cleanPrompt
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5)
    .join(',');
  
  // Generate a cache-busting parameter
  const cacheBuster = Date.now();
  
  // Create a fallback Unsplash URL with search terms and dimensions
  let fallbackUrl = `https://source.unsplash.com/random/800x800/?${encodeURIComponent(searchTerms || 'product')}`;
  
  // Add cache-busting parameter
  fallbackUrl = `${fallbackUrl}&t=${cacheBuster}`;
  
  console.log(`Using fallback image from Unsplash with search terms: ${searchTerms}`);
  toast.info("Using alternative image source");
  
  // Dispatch the event with the fallback image
  dispatchImageGeneratedEvent(fallbackUrl, prompt);
}
