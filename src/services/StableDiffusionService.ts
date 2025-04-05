
import { sendToMakeWebhook } from '@/utils/image/webhookHandler';

// Define the parameters type
interface SendImageParams {
  image: File;
  mask: File;
  prompt: string;
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
}

// Simple service for stable diffusion
const stableDiffusionService = {
  // Send image to webhook for processing
  sendImageToWebhook: async (params: SendImageParams) => {
    console.log('Sending image to webhook with params:', {
      prompt: params.prompt,
      hasImage: !!params.image,
      hasMask: !!params.mask
    });
    
    // Forward to the webhook handler
    return sendToMakeWebhook(params.image, params.prompt);
  }
};

export default stableDiffusionService;
