
/**
 * Helper utilities for image polling
 */

/**
 * Delays execution for the specified amount of time
 * @param ms Milliseconds to delay
 */
export const delayExecution = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Add a cache buster parameter to a URL
 * @param url URL to add cache buster to
 */
export const addCacheBusterToUrl = (url: string): string => {
  if (!url) return url;
  
  const timestamp = Date.now();
  return url.includes('?') 
    ? `${url}&t=${timestamp}` 
    : `${url}?t=${timestamp}`;
};

/**
 * Handles errors in an image URL
 * @param url The image URL to check
 * @param fallbackUrl Optional fallback URL to use if the image URL is invalid
 */
export const handleImageUrlErrors = (url: string | undefined | null, fallbackUrl?: string): string => {
  // If no URL is provided, return the fallback or empty string
  if (!url) return fallbackUrl || '';
  
  // Check if the URL is a valid format
  try {
    new URL(url);
    return url;
  } catch (e) {
    // If not a valid URL, check if it's a data URL
    if (url.startsWith('data:image/')) {
      return url;
    }
    
    // Return the fallback URL or the original URL if no fallback
    return fallbackUrl || url;
  }
};

