
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
    if (this.inpainter) {
      console.log("Model already loaded, returning existing instance");
      return this.inpainter;
    }
    
    if (this.isLoading) {
      console.log("Model is currently loading, waiting...");
      return null;
    }
    
    try {
      this.isLoading = true;
      console.log('Loading inpainting model:', INPAINTING_MODEL);
      
      this.inpainter = await pipeline('image-to-image', INPAINTING_MODEL, {
        revision: 'main',
        progress_callback: onProgress
      });
      
      console.log('Model loaded successfully:', this.inpainter);
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
        console.log("Inpainter not loaded, loading now...");
        await this.loadModel();
      }
      
      // Make sure we have a loaded model
      if (!this.inpainter) {
        throw new Error('Model not loaded');
      }
      
      // Log input parameters
      console.log('Running inpainting with options:', {
        prompt: options.prompt,
        negative_prompt: options.negativePrompt || '',
        num_inference_steps: options.numInferenceSteps || 25,
        guidance_scale: options.guidanceScale || 7.5,
      });
      
      console.log('Original image dimensions:', originalImage.width, 'x', originalImage.height);
      console.log('Mask image dimensions:', maskImage.width, 'x', maskImage.height);
      
      // Run the inpainting
      const result = await this.inpainter(originalImage, {
        prompt: options.prompt,
        negative_prompt: options.negativePrompt || '',
        mask_image: maskImage,
        num_inference_steps: options.numInferenceSteps || 25,
        guidance_scale: options.guidanceScale || 7.5,
      });
      
      console.log('Inpainting result:', result);
      
      return result[0].blob;
    } catch (error) {
      console.error('Inpainting error:', error);
      throw error;
    }
  }
  
  /**
   * Convert a File/Blob to an HTMLImageElement
   */
  async fileToImage(file: File | Blob): Promise<HTMLImageElement> {
    console.log(`Converting file to image: ${file.type}, size: ${file.size}`);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Image loaded: ${img.width}x${img.height}`);
        resolve(img);
      };
      img.onerror = (e) => {
        console.error('Error loading image:', e);
        reject(new Error('Failed to load image'));
      };
      const url = URL.createObjectURL(file);
      console.log('Created object URL:', url);
      img.src = url;
    });
  }
  
  /**
   * Resize an image if needed to fit within max dimensions
   */
  resizeImageIfNeeded(image: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    let { width, height } = image;
    
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      console.log(`Image needs resizing: ${width}x${height} -> max: ${MAX_IMAGE_DIMENSION}`);
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
        width = MAX_IMAGE_DIMENSION;
      } else {
        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
        height = MAX_IMAGE_DIMENSION;
      }
      console.log(`Resized dimensions: ${width}x${height}`);
    } else {
      console.log(`No resizing needed: ${width}x${height}`);
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    
    return canvas;
  }
  
  /**
   * Send an image to a webhook
   */
  async sendImageToWebhook(imageFile: File | Blob, prompt: string = ""): Promise<void> {
    try {
      const webhookUrl = 'https://ekalovable.app.n8n.cloud/webhook-test/c7d65113-1128-44ee-bcdb-6d334459913c';
      console.log(`Sending image to webhook: ${webhookUrl}`);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      if (prompt) {
        formData.append('prompt', prompt);
      }
      
      if (imageFile instanceof File) {
        formData.append('filename', imageFile.name);
        formData.append('type', imageFile.type);
        formData.append('size', imageFile.size.toString());
      }
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
      }
      
      console.log('Webhook response:', await response.json());
    } catch (error) {
      console.error('Error sending image to webhook:', error);
      throw error;
    }
  }
}

export default StableDiffusionService.getInstance();
