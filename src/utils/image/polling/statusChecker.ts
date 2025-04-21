
import { supabase } from "@/integrations/supabase/client";
import { ImageStatusResult } from "./types";

export async function checkImageStatus(requestId: string): Promise<ImageStatusResult> {
  const { data, error } = await supabase.functions.invoke("generate-image", {
    body: {
      requestId,
      checkOnly: true
    }
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return {
    status: data?.status,
    imageUrl: data?.imageUrl,
    apiError: data?.error,
    data
  };
}

