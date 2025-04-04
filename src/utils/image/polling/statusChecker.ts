
import { supabase } from "@/integrations/supabase/client";
import { ImageStatusResult } from "./types";

/**
 * Calls the Supabase function to check the status of an image generation request
 */
export async function checkImageStatus(
  requestId: string, 
  isWebhook: boolean = false,
  imageReference?: string,
  mimeType?: string
): Promise<ImageStatusResult> {
  const requestBody: any = {
    requestId,
    checkOnly: true // Add a flag to indicate this is just a status check
  };
  
  // Add webhook-specific parameters
  if (isWebhook) {
    requestBody.isWebhook = true;
  }
  
  // Add image reference if available
  if (imageReference) {
    requestBody.imageReference = imageReference;
    requestBody.mimeType = mimeType || "image/png";
  }
  
  console.log("Sending polling request with body:", JSON.stringify(requestBody));
  
  try {
    const { data, error } = await supabase.functions.invoke("generate-image", {
      body: requestBody
    });
    
    if (error) {
      console.error("Error in checkImageStatus:", error);
      return { error, status: "error" };
    }
    
    console.log("Poll response:", data);
    
    return { 
      status: data?.status,
      imageUrl: data?.imageUrl,
      apiError: data?.error,
      isWebhook: isWebhook,
      data,
      progress: data?.progress || 0
    };
  } catch (e) {
    console.error("Exception in checkImageStatus:", e);
    return { 
      error: e, 
      status: "error",
      isWebhook: isWebhook
    };
  }
}
