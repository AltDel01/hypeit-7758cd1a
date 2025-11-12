
/**
 * Utilities for handling image loading states
 */

/**
 * Interface for image loading options
 */
export interface ImageLoadingOptions {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Default options for image loading
 */
const defaultOptions: ImageLoadingOptions = {
  timeout: 30000,   // 30 seconds timeout
  retryCount: 3,    // 3 retry attempts
  retryDelay: 1000, // 1 second between retries
};

/**
 * Creates a promise that resolves when an image is loaded or rejects on error
 * @param src Image source URL
 * @param options Loading options
 * @returns Promise that resolves when the image is loaded
 */
export const loadImageWithRetry = (src: string, options?: ImageLoadingOptions): Promise<HTMLImageElement> => {
  const { timeout, retryCount, retryDelay } = { ...defaultOptions, ...options };
  
  let attempts = 0;

  const attemptLoad = (): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        console.error(`Image loading timed out: ${src}`);
        img.src = '';
        reject(new Error(`Image loading timed out: ${src}`));
      }, timeout);
      
      // Success handler
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(img);
      };
      
      // Error handler
      img.onerror = () => {
        clearTimeout(timeoutId);
        attempts += 1;
        
        if (attempts <= retryCount!) {
          console.log(`Retrying image load (${attempts}/${retryCount}): ${src}`);
          setTimeout(() => {
            attemptLoad().then(resolve).catch(reject);
          }, retryDelay);
        } else {
          reject(new Error(`Failed to load image after ${retryCount} attempts: ${src}`));
        }
      };
      
      img.src = src;
    });
  };
  
  return attemptLoad();
};

/**
 * Checks if an image exists at the given URL
 * @param url Image URL to check
 * @returns Promise that resolves to boolean indicating if image exists
 */
export const doesImageExist = async (url: string): Promise<boolean> => {
  try {
    await loadImageWithRetry(url, { retryCount: 1, timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};
