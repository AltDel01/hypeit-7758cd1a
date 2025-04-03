
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
  const timestamp = Date.now();
  return url.includes('?') 
    ? `${url}&t=${timestamp}` 
    : `${url}?t=${timestamp}`;
}

/**
 * Converts a number of milliseconds to a human-readable format
 */
export function formatElapsedTime(startTime: number): string {
  const elapsed = Date.now() - startTime;
  if (elapsed < 1000) return `${elapsed}ms`;
  return `${(elapsed / 1000).toFixed(1)}s`;
}

