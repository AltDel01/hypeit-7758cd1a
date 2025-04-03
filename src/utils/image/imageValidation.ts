
/**
 * Validates if a given URL is a valid image URL
 * @param url The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export function checkValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // If it's a data URL for an image, it's valid
  if (url.startsWith('data:image/')) return true;
  
  // Allow Unsplash URLs
  if (url.includes('unsplash.com')) return true;
  
  // Basic URL validation
  try {
    new URL(url);
    
    // Check if the URL has a valid image extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
    const hasValidExtension = validExtensions.some(ext => 
      url.toLowerCase().endsWith(ext) || url.toLowerCase().includes(`${ext}?`)
    );
    
    return hasValidExtension;
  } catch (e) {
    return false;
  }
}

/**
 * @deprecated Use checkValidImageUrl instead
 */
export const isValidImageUrl = checkValidImageUrl;
