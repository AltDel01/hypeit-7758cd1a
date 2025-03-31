
/**
 * Dispatches an event with image data
 * 
 * @param imageUrl - The URL of the generated image
 * @param prompt - The prompt used to generate the image
 */
export function dispatchImageGeneratedEvent(imageUrl: string, prompt: string): void {
  console.log(`Dispatching imageGenerated event with URL: ${imageUrl}`);
  
  // For unsplash URLs, add a timestamp to prevent caching
  const finalUrl = imageUrl.includes('unsplash.com') 
    ? `${imageUrl}&t=${Date.now()}` 
    : imageUrl;
    
  const event = new CustomEvent('imageGenerated', { 
    detail: { imageUrl: finalUrl, prompt } 
  });
  window.dispatchEvent(event);
}
