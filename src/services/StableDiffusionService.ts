
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to use browser cache
env.allowLocalModels = false;
env.useBrowserCache = true;

// Constants
const MAX_IMAGE_DIMENSION = 768;
const INPAINTING_MODEL = 'Xenova/stable-diffusion-2-inpainting';

interface InpaintingOptions {
  prompt: string;
  negativePrompt?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
}

export class StableDiffusionService {
  static instance: StableDiffusionService;
  private inpainter: any = null;
  private isLoading = false;
  
  // Singleton pattern
  static getInstance(): StableDiffusionService {
    if (!StableDiffusionService.instance) {
      StableDiffusionService.instance = new StableDiffusionService();
    }
    return StableDiffusionService.instance;
  }
  
  /**
   * Load the inpainting model
   */
  async loadModel(onProgress?: (progress: { status: string, progress?: number }) => void) {
    if (this.inpainter) return this.inpainter;
    if (this.isLoading) return null;
    
    try {
      this.isLoading = true;
      console.log('Loading inpainting model...');
      
      this.inpainter = await pipeline('image-to-image', INPAINTING_MODEL, {
        revision: 'main',
        quantized: false,
        progress_callback: onProgress
      });
      
      console.log('Model loaded successfully');
      this.isLoading = false;
      return this.inpainter;
    } catch (error) {
      console.error('Error loading model:', error);
      this.isLoading = false;
      throw error;
    }
  }
  
  /**
   * Perform inpainting on an image
   */
  async inpaint(
    originalImage: HTMLImageElement | HTMLCanvasElement,
    maskImage: HTMLImageElement | HTMLCanvasElement,
    options: InpaintingOptions
  ): Promise<string> {
    try {
      if (!this.inpainter) {
        await this.loadModel();
      }
      
      // Make sure we have a loaded model
      if (!this.inpainter) {
        throw new Error('Model not loaded');
      }
      
      // Run the inpainting
      console.log('Running inpainting with prompt:', options.prompt);
      const result = await this.inpainter(originalImage, {
        prompt: options.prompt,
        negative_prompt: options.negativePrompt || '',
        mask_image: maskImage,
        num_inference_steps: options.numInferenceSteps || 25,
        guidance_scale: options.guidanceScale || 7.5,
      });
      
      return result[0].blob;
    } catch (error) {
      console.error('Inpainting error:', error);
      throw error;
    }
  }
  
  /**
   * Convert a File/Blob to an HTMLImageElement
   */
  static async fileToImage(file: File | Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  /**
   * Resize an image if needed to fit within max dimensions
   */
  static resizeImageIfNeeded(image: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    let { width, height } = image;
    
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      } else {
        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
        height = MAX_IMAGE_DIMENSION;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    
    return canvas;
  }
}

export default StableDiffusionService.getInstance();
