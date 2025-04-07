
/**
 * Validates if an image URL is proper and not a placeholder
 * 
 * @param url The URL to check
 * @returns True if the URL is valid
 */
export function checkValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Check for data URLs
  if (url.startsWith('data:image/')) {
    return url.length > 100; // Simple heuristic to skip placeholder data URLs
  }
  
  // Skip URLs with known placeholder indicators 
  if (
    url.includes('placeholder.com') || 
    url.includes('Generating+Image') ||
    url.includes('placeholder.svg') ||
    url.includes('placeholder-image')
  ) {
    return false;
  }
  
  // Try to validate URLs
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validates if an image is actually loadable
 * 
 * @param url The image URL to check
 * @returns A promise that resolves to a boolean indicating if the image is loadable
 */
export function isImageLoadable(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!checkValidImageUrl(url)) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    const timeoutId = setTimeout(() => {
      resolve(false);
    }, 10000); // 10 second timeout
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * Adds a cache buster parameter to an image URL to avoid caching issues
 * 
 * @param url The URL to add the cache buster to
 * @returns The URL with the cache buster parameter added
 */
export function addCacheBuster(url: string): string {
  if (!url) return url;
  
  // Don't add cache busters to data URLs
  if (url.startsWith('data:')) return url;
  
  const cacheBuster = `cb=${Date.now()}`;
  
  if (url.includes('?')) {
    return `${url}&${cacheBuster}`;
  } else {
    return `${url}?${cacheBuster}`;
  }
}
