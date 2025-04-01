
/**
 * Helper functions for image polling
 */

/**
 * Delays execution for the specified time
 */
export async function delayExecution(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Adds a cache-busting parameter to a URL
 */
export function addCacheBusterToUrl(url: string): string {
  const cacheBuster = Date.now();
  return url.includes('?') 
    ? `${url}&t=${cacheBuster}` 
    : `${url}?t=${cacheBuster}`;
}
