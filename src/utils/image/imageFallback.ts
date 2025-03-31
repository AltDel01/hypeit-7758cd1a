
import { dispatchImageGeneratedEvent } from './imageEvents';
import { toast } from "sonner";

/**
 * Generates a fallback image using Unsplash
 * 
 * @param prompt - The prompt to use for generating the fallback image
 * @param imageSize - The size of the image to generate (e.g. "800x800")
 */
export function generateFallbackImage(prompt: string, imageSize: string = "800x800"): void {
  // Extract key terms from the prompt for better image search
  const cleanPrompt = prompt.replace(/generate|post|wording:|image|attached|instagram story/gi, '');
  
  // Extract meaningful words for search
  const keyTerms = extractKeyTerms(cleanPrompt);
  
  // Extract product type and color information
  const productType = extractProductType(cleanPrompt);
  const colorTerm = extractColorTerm(cleanPrompt);
  
  // Combine specific terms with general search
  const searchTerms = combineSearchTerms(keyTerms, productType, colorTerm);
  
  // Generate a cache-busting parameter
  const cacheBuster = Date.now();
  
  // Create a fallback Unsplash URL with search terms and dimensions
  const unsplashBaseUrl = `https://source.unsplash.com/featured/${imageSize}/?`;
  let fallbackUrl = `${unsplashBaseUrl}${encodeURIComponent(searchTerms)}`;
  
  // Add cache-busting parameter
  fallbackUrl = `${fallbackUrl}&t=${cacheBuster}`;
  
  console.log(`Using fallback image from Unsplash with search terms: ${searchTerms}`);
  
  // Dispatch the event with the fallback image
  dispatchImageGeneratedEvent(fallbackUrl, prompt);
}

/**
 * Extracts key terms from a prompt
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
 */
function extractProductType(prompt: string): string {
  const productMatch = prompt.match(/(?:skincare|makeup|serum|moisturizer|cleanser|toner|cream|lotion)/i);
  return productMatch ? productMatch[0] : 'product';
}

/**
 * Extracts color information from a prompt
 */
function extractColorTerm(prompt: string): string {
  const colorMatch = prompt.match(/(?:cream|white|black|blue|red|green|yellow|purple|pink|orange|brown|gray|grey)/i);
  return colorMatch ? colorMatch[0] : '';
}

/**
 * Combines search terms for better image results
 */
function combineSearchTerms(keyTerms: string, productType: string, colorTerm: string): string {
  const specificTerms = [productType, colorTerm, 'photography', 'premium']
    .filter(Boolean)
    .join(',');
  
  return specificTerms || keyTerms || 'skincare,product';
}
