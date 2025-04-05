
import { dispatchImageGeneratedEvent } from './imageEvents';
import { toast } from "sonner";

/**
 * Interface for fallback generation options
 */
export interface FallbackOptions {
  suppressToast?: boolean;
  includeStyle?: boolean;
}

/**
 * Generates a fallback image using Unsplash
 * 
 * @param prompt - The prompt to use for generating the fallback image
 * @param imageSize - The size of the image to generate (e.g. "800x800")
 * @param options - Additional options for fallback generation
 */
export function generateFallbackImage(
  prompt: string, 
  imageSize: string = "800x800", 
  options: FallbackOptions = {}
): void {
  console.log(`Generating fallback image with prompt: "${prompt}", size: ${imageSize}`);
  
  try {
    // Extract search terms from the prompt for better searching
    const searchTerms = generateSearchTerms(prompt);
    
    // Create the fallback URL
    const fallbackUrl = createFallbackImageUrl(searchTerms, imageSize);
    
    // Show a toast message (unless suppressed)
    showFallbackToastIfNeeded(options);
    
    console.log(`Fallback image URL: ${fallbackUrl} with search terms: ${searchTerms}`);
    
    // Dispatch the event with the fallback image URL
    dispatchImageGeneratedEvent(fallbackUrl, prompt);
  } catch (error) {
    console.error("Error generating fallback image:", error);
    handleFallbackError(prompt);
  }
}

/**
 * Creates the Unsplash URL with appropriate search terms and cache busting
 */
function createFallbackImageUrl(searchTerms: string, imageSize: string): string {
  // Create a cache-busting timestamp
  const cacheBuster = Date.now();
  
  // Generate the appropriate Unsplash URL based on the extracted terms
  return `https://source.unsplash.com/featured/${imageSize}/?${encodeURIComponent(searchTerms)}&t=${cacheBuster}`;
}

/**
 * Shows a toast notification for fallback image generation if not suppressed
 */
function showFallbackToastIfNeeded(options: FallbackOptions): void {
  if (!options.suppressToast) {
    toast.info("Using alternative image source", { id: "fallback-image" });
  }
}

/**
 * Generates appropriate search terms from a prompt
 * 
 * @param prompt - The prompt to extract terms from
 * @returns A string of search terms for Unsplash
 */
export function generateSearchTerms(prompt: string): string {
  // Clean up the prompt by removing common instruction words
  const cleanPrompt = cleanupPrompt(prompt);
  
  // Extract key terms from the prompt
  const keyTerms = extractKeyTerms(cleanPrompt);
  
  // Extract product type and color information
  const productType = extractProductType(cleanPrompt);
  const colorTerm = extractColorTerm(cleanPrompt);
  
  // Combine the terms for better Unsplash results
  return combineSearchTerms(keyTerms, productType, colorTerm);
}

/**
 * Cleans up the prompt by removing common instruction words
 */
function cleanupPrompt(prompt: string): string {
  return prompt.replace(/generate|post|wording:|image|attached|instagram story/gi, '');
}

/**
 * Extracts key terms from a prompt
 * 
 * @param prompt - The prompt to extract terms from
 * @returns A string of key terms
 */
function extractKeyTerms(prompt: string): string {
  return prompt
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5)
    .join(',');
}

/**
 * Extracts product type from a prompt
 * 
 * @param prompt - The prompt to extract from
 * @returns The product type found in the prompt
 */
function extractProductType(prompt: string): string {
  const productMatch = prompt.match(/(?:skincare|makeup|serum|moisturizer|cleanser|toner|cream|lotion|product|bottle|package|packaging|container)/i);
  return productMatch ? productMatch[0] : 'product';
}

/**
 * Extracts color information from a prompt
 * 
 * @param prompt - The prompt to extract from
 * @returns The color term found in the prompt
 */
function extractColorTerm(prompt: string): string {
  const colorMatch = prompt.match(/(?:cream|white|black|blue|red|green|yellow|purple|pink|orange|brown|gray|grey)/i);
  return colorMatch ? colorMatch[0] : '';
}

/**
 * Combines search terms for better image results
 * 
 * @param keyTerms - Key terms extracted from the prompt
 * @param productType - The product type extracted from the prompt
 * @param colorTerm - The color term extracted from the prompt
 * @returns The combined search terms
 */
function combineSearchTerms(keyTerms: string, productType: string, colorTerm: string): string {
  // Create a list of specific terms for better image results
  const specificTerms = buildSpecificTerms(productType, colorTerm);
  
  // Use specific terms if available, otherwise use key terms or fallback
  return specificTerms || keyTerms || 'skincare,product';
}

/**
 * Builds a comma-separated list of specific search terms
 */
function buildSpecificTerms(productType: string, colorTerm: string): string {
  return [productType, colorTerm, 'photography', 'premium']
    .filter(Boolean) // Remove empty strings
    .join(',');
}

/**
 * Handles errors during fallback image generation
 * 
 * @param prompt - The original prompt
 */
function handleFallbackError(prompt: string): void {
  console.error("Emergency fallback being used due to error in primary fallback");
  
  // Generate a very simple fallback as a last resort
  const emergencyUrl = "https://source.unsplash.com/featured/800x800/?product";
  
  // Show an error toast
  toast.error("Could not generate image", { id: "fallback-error" });
  
  // Dispatch the emergency fallback
  dispatchImageGeneratedEvent(emergencyUrl, prompt);
}

/**
 * Validates if an image URL is valid and not a placeholder
 * 
 * @param url - The URL to validate
 * @returns True if the URL is valid and not a placeholder
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's not a placeholder image
  if (url.includes('placeholder.com') || url.includes('Generating+Image')) {
    return false;
  }
  
  return true;
}
