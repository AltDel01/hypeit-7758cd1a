
/**
 * Utility functions for image URL validation
 */

/**
 * Checks if an image URL is valid and not a placeholder
 * 
 * @param url - The URL to check
 * @returns True if the URL is valid and not a placeholder
 */
export function checkValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's not a placeholder image
  if (url.includes('placeholder.com') || url.includes('Generating+Image')) {
    return false;
  }
  
  return true;
}

/**
 * Validates an image URL by checking if it can be loaded
 * 
 * @param url - The URL to validate
 * @returns A promise that resolves to true if the image is valid
 */
export function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!checkValidImageUrl(url)) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      resolve(true);
    };
    
    img.onerror = () => {
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * Adds a cache buster to an image URL to prevent caching
 * 
 * @param url - The URL to add a cache buster to
 * @returns The URL with a cache buster parameter
 */
export function addCacheBuster(url: string): string {
  const cacheBuster = Date.now();
  return url.includes('?') 
    ? `${url}&t=${cacheBuster}` 
    : `${url}?t=${cacheBuster}`;
}
