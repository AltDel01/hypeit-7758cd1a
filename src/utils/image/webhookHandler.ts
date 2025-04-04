
import { toast } from "sonner";
import { dispatchImageGeneratedEvent } from './imageEvents';

/**
 * Sends a request to the Make.com webhook and processes the response
 * 
 * @param productImage - The product image file to be sent
 * @param prompt - The user's prompt text
 * @returns A promise that resolves when the image is received and processed
 */
export async function sendToMakeWebhook(productImage: File | null, prompt: string): Promise<string | null> {
  if (!productImage) {
    console.error("No product image provided for webhook");
    return null;
  }
  
  try {
    console.log("Preparing to send image to Make.com webhook");
    
    // Convert the image to base64
    const base64Image = await fileToBase64(productImage);
    
    // Prepare the payload according to the required format
    const payload = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      prompt: prompt, // Add the prompt to the payload
      product_image: base64Image,
      product_image_type: productImage.type
    };
    
    console.log("Sending request to Make.com webhook");
    
    // Send the request to the webhook
    const response = await fetch("https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Received response from Make.com webhook");
    
    if (!data.image_base64) {
      throw new Error("No image data in webhook response");
    }
    
    // Convert the base64 image to a displayable URL
    const imageUrl = `data:image/png;base64,${data.image_base64}`;
    
    // Dispatch the event with the image URL
    dispatchImageGeneratedEvent(imageUrl, "Product image processed by webhook");
    
    return imageUrl;
  } catch (error) {
    console.error("Error sending image to webhook:", error);
    toast.error(`Failed to process image through webhook: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Converts a file to a base64 string
 * 
 * @param file - The file to convert
 * @returns A promise that resolves to the base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract just the base64 part without the data URL prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
}
