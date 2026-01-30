import { supabase } from "@/integrations/supabase/client";

export interface GenerationRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  request_type: "video" | "image";
  prompt: string;
  aspect_ratio: string | null;
  status: "new" | "in-progress" | "completed" | "failed";
  reference_image_url: string | null;
  result_url: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateGenerationRequestParams {
  requestType: "video" | "image";
  prompt: string;
  aspectRatio?: string;
  referenceImageUrl?: string;
}

/**
 * Create a new generation request and send notification email
 */
export async function createGenerationRequest(
  params: CreateGenerationRequestParams
): Promise<GenerationRequest | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    // Get user profile for display name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const userName = profile?.display_name || user.email?.split("@")[0] || "Unknown";
    const userEmail = profile?.email || user.email || "";

    // Insert generation request
    const { data: request, error } = await supabase
      .from("generation_requests")
      .insert({
        user_id: user.id,
        user_email: userEmail,
        user_name: userName,
        request_type: params.requestType,
        prompt: params.prompt,
        aspect_ratio: params.aspectRatio || null,
        reference_image_url: params.referenceImageUrl || null,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating generation request:", error);
      return null;
    }

    // Send notification email (fire and forget)
    sendNotificationEmail({
      type: "generation_request",
      userName,
      userEmail,
      requestType: params.requestType,
      prompt: params.prompt,
      aspectRatio: params.aspectRatio,
      timestamp: new Date().toISOString(),
    }).catch(console.error);

    return request as GenerationRequest;
  } catch (error) {
    console.error("Error in createGenerationRequest:", error);
    return null;
  }
}

/**
 * Send notification email via edge function
 */
export async function sendNotificationEmail(payload: {
  type: "signup" | "generation_request";
  userName: string;
  userEmail: string;
  requestType?: "video" | "image";
  prompt?: string;
  aspectRatio?: string;
  timestamp: string;
}): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("send-notification", {
      body: payload,
    });

    if (error) {
      console.error("Error sending notification:", error);
    }
  } catch (error) {
    console.error("Error invoking send-notification function:", error);
  }
}

/**
 * Fetch all generation requests (admin only)
 */
export async function fetchAllGenerationRequests(): Promise<GenerationRequest[]> {
  try {
    const { data, error } = await supabase
      .from("generation_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching generation requests:", error);
      return [];
    }

    return (data || []) as GenerationRequest[];
  } catch (error) {
    console.error("Error in fetchAllGenerationRequests:", error);
    return [];
  }
}

/**
 * Update a generation request status (admin only)
 */
export async function updateGenerationRequestStatus(
  requestId: string,
  status: "new" | "in-progress" | "completed" | "failed",
  resultUrl?: string
): Promise<boolean> {
  try {
    const updateData: any = { status };
    
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }
    
    if (resultUrl) {
      updateData.result_url = resultUrl;
    }

    const { error } = await supabase
      .from("generation_requests")
      .update(updateData)
      .eq("id", requestId);

    if (error) {
      console.error("Error updating generation request:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateGenerationRequestStatus:", error);
    return false;
  }
}

/**
 * Fetch user's own generation requests
 */
export async function fetchUserGenerationRequests(): Promise<GenerationRequest[]> {
  try {
    const { data, error } = await supabase
      .from("generation_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user generation requests:", error);
      return [];
    }

    return (data || []) as GenerationRequest[];
  } catch (error) {
    console.error("Error in fetchUserGenerationRequests:", error);
    return [];
  }
}
