
/**
 * Utility for handling webhook requests for image generation
 */

/**
 * Sends an image generation request to the webhook and returns the result
 */
export async function generateImageWithWebhook(
  prompt: string,
  productImage: File | null
): Promise<string> {
  // Generate a random ID for the request
  const id = Math.random().toString(36).substring(2, 15);
  
  // Prepare the request payload
  const payload: any = {
    id,
    prompt
  };
  
  // If a product image is provided, convert it to base64
  if (productImage) {
    try {
      const base64 = await fileToBase64(productImage);
      payload.product_image = base64;
      payload.product_image_type = productImage.type;
    } catch (error) {
      console.error("Error converting product image to base64:", error);
    }
  }
  
  console.log("Sending payload to webhook:", { id, prompt, hasProductImage: !!productImage });
  
  // Send the request to the webhook
  const response = await fetch("https://hook.us2.make.com/u7vimlqhga3dxu3qwesaopz4evrepcn6", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Webhook responded with status: ${response.status}`);
  }
  
  // Parse the response
  const result = await response.json();
  
  if (!result.image_base64) {
    throw new Error("Webhook response did not contain an image");
  }
  
  // Return the base64 image data
  return `data:image/png;base64,${result.image_base64}`;
}

/**
 * Converts a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract the base64 part from the data URL
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}
