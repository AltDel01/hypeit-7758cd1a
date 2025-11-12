
/**
 * Checks if a URL is a valid image URL
 */
export const checkValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  
  // Check if it's an image URL by extension or content type
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
  
  // Handle data URLs
  const isDataUrl = url.startsWith('data:image/');
  
  // Handle blob URLs
  const isBlobUrl = url.startsWith('blob:');
  
  return hasImageExtension || isDataUrl || isBlobUrl || url.includes('unsplash.com');
};
