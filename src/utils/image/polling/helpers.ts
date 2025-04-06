

/**
 * Helper functions for polling operations
 */

/**
 * Delays execution for a specified time
 */
export function delayExecution(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Adds a cache buster to a URL to prevent caching
 */
export function addCacheBusterToUrl(url: string): string {
  if (!url) return url;
  
  try {
    const timestamp = Date.now();
    const urlObj = new URL(url);
    urlObj.searchParams.set('t', timestamp.toString());
    return urlObj.toString();
  } catch (e) {
    // If URL parsing fails, use the old method
    const timestamp = Date.now();
    return url.includes('?') 
      ? `${url}&t=${timestamp}` 
      : `${url}?t=${timestamp}`;
  }
}

/**
 * Converts a number of milliseconds to a human-readable format
 */
export function formatElapsedTime(startTime: number): string {
  const elapsed = Date.now() - startTime;
  if (elapsed < 1000) return `${elapsed}ms`;
  return `${(elapsed / 1000).toFixed(1)}s`;
}

/**
 * Creates a more reliable timeout promise that doesn't get caught in Promise.race issues
 */
export function createTimeoutPromise(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

