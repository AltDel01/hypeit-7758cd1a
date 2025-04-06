
import { toast } from "sonner";

/**
 * Converts a File to a base64 string
 * @param file The file to convert
 * @returns Promise that resolves with the base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract only the base64 part without the data URL prefix
      const base64String = reader.result as string;
      // Remove the data:image/jpeg;base64, prefix
      const base64WithoutPrefix = base64String.split(',')[1];
      resolve(base64WithoutPrefix);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Generates an image using the webhook API
 * @param prompt The prompt to generate an image for
 * @param productImage Optional product image to use as a reference
 * @returns Promise that resolves with the URL of the generated image
 */
export const generateImageWithWebhook = async (prompt: string, productImage: File | null): Promise<string | null> => {
  try {
    // Create the payload
    const payload: any = {
      id: `img-${Date.now()}`, // Generate a random ID
      prompt: prompt,
    };

    // If a product image was provided, convert it to base64 and add it to the payload
    if (productImage) {
      const base64 = await fileToBase64(productImage);
      payload.product_image = base64;
      payload.product_image_type = productImage.type;
      console.log("Added product image to payload");
    } else {
      payload.product_image = "";
      payload.product_image_type = "";
    }

    console.log("Sending request to webhook with payload:", JSON.stringify(payload).substring(0, 100) + "...");

    // Send the request to the webhook
    const response = await fetch('https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook response: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Webhook response:", Object.keys(data));

    // Check if the response contains an image
    if (!data.image_base64) {
      console.error("No image_base64 in response");
      toast.error("No image returned from generation service");
      return null;
    }

    // Convert the base64 image to a data URL
    const imageDataUrl = `data:image/jpeg;base64,${data.image_base64}`;
    console.log("Successfully created image data URL");
    
    return imageDataUrl;
  } catch (error) {
    console.error("Error in generateImageWithWebhook:", error);
    throw error; // Re-throw to be handled by the caller
  }
};
