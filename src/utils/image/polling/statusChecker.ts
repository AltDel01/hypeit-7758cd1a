
import { supabase } from "@/integrations/supabase/client";
import { ImageStatusResult } from "./types";

/**
 * Calls the Supabase function to check the status of an image generation request
 */
export async function checkImageStatus(requestId: string): Promise<ImageStatusResult> {
  const { data, error } = await supabase.functions.invoke("generate-image", {
    body: {
      requestId,
      checkOnly: true // Add a flag to indicate this is just a status check
    }
  });
  
  if (error) {
    return { error };
  }
  
  console.log("Poll response:", data);
  
  return { 
    status: data?.status,
    imageUrl: data?.imageUrl,
    apiError: data?.error,
    data
  };
}
