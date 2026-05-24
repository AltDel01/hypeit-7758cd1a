import { supabase } from "@/integrations/supabase/client";
import {
  GenerationCategory,
  CATEGORY_MAP,
  pickModel,
} from "@/config/generationCategories";

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
  assigned_to: string | null;
  assigned_to_name: string | null;
  assigned_at: string | null;
  category?: GenerationCategory | null;
  auto_provider?: string | null;
  auto_model?: string | null;
  auto_failed?: boolean | null;
  provider_task_id?: string | null;
}

export interface CreateGenerationRequestParams {
  requestType: "video" | "image";
  prompt: string;
  aspectRatio?: string;
  referenceImageUrl?: string;
  creditsUsed?: number;
  /** Optional: explicit category. Falls back to image-gen / video-edit-manual. */
  category?: GenerationCategory;
  /** Optional: extra inputs for video modes (i2v, kf2v, r2v, face-swap, lipsync). */
  firstFrameUrl?: string;
  lastFrameUrl?: string;
  referenceImageUrls?: string[];
  sourceVideoUrl?: string;
  /** Optional video params */
  duration?: number;
  resolution?: string;
  faceImageUrl?: string;
  /** Lip sync: storage:bucket/path or https url for audio track */
  audioUrl?: string;
  /** Lip sync: 'portrait' (image+audio→talking) or 'video' (video+audio→relipsynced) */
  lipsyncMode?: 'portrait' | 'video';
  /** Mask inpaint: storage:bucket/path or https url for the binary mask PNG */
  maskUrl?: string;
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
      .select("display_name, email, generations_this_month, monthly_generation_limit")
      .eq("id", user.id)
      .maybeSingle();

    const userName = profile?.display_name || user.email?.split("@")[0] || "Unknown";
    const userEmail = profile?.email || user.email || "";

    // Check credit balance before inserting
    const creditsUsed = params.creditsUsed || 50;
    const remaining = (profile as any)?.monthly_generation_limit 
      ? ((profile as any).monthly_generation_limit - ((profile as any).generations_this_month || 0))
      : 500;
    
    if (creditsUsed > remaining) {
      console.error("Insufficient credits:", { creditsUsed, remaining });
      return null;
    }

    // Resolve category. Default: image -> image-gen, video -> video-edit-manual.
    const category: GenerationCategory =
      params.category ||
      (params.requestType === "image" ? "image-gen" : "video-edit-manual");

    const tier = (profile as any)?.subscription_tier || "free";
    const autoModel = pickModel(category, tier);
    const meta = CATEGORY_MAP[category];

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
        credits_used: creditsUsed,
        category,
        auto_provider: meta.provider,
        auto_model: autoModel,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating generation request:", error);
      return null;
    }

    // Auto-fulfill via the right edge function. Manual categories are skipped
    // and stay in the editor queue (existing behavior).
    if (meta.provider && autoModel) {
      dispatchAutoFulfill({
        requestId: (request as any).id,
        category,
        model: autoModel,
        prompt: params.prompt,
        referenceImageUrls: params.referenceImageUrls || (params.referenceImageUrl ? [params.referenceImageUrl] : undefined),
        firstFrameUrl: params.firstFrameUrl,
        lastFrameUrl: params.lastFrameUrl,
        sourceVideoUrl: params.sourceVideoUrl,
        faceImageUrl: params.faceImageUrl,
        size: params.aspectRatio ? aspectRatioToSize(params.aspectRatio) : undefined,
        duration: params.duration,
        resolution: params.resolution,
        audioUrl: params.audioUrl,
        lipsyncMode: params.lipsyncMode,
        maskUrl: params.maskUrl,
      }).catch((e) => console.error("[auto-fulfill] dispatch failed", e));
    }

    // Send notification email (fire and forget)
    sendNotificationEmail({
      type: "generation_request",
      userName,
      userEmail,
      requestType: params.requestType,
      prompt: params.prompt,
      aspectRatio: params.aspectRatio,
      referenceImageUrl: params.referenceImageUrl,
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
  referenceImageUrl?: string;
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
 * Claim a request (assign to current user)
 */
export async function claimGenerationRequest(
  requestId: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const displayName = profile?.display_name || user.email?.split("@")[0] || "Editor";

    const { error } = await supabase
      .from("generation_requests")
      .update({
        assigned_to: user.id,
        assigned_to_name: displayName,
        status: "in-progress",
        assigned_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error claiming request:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in claimGenerationRequest:", error);
    return false;
  }
}

/**
 * Unassign a request
 */
export async function unassignGenerationRequest(
  requestId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("generation_requests")
      .update({
        assigned_to: null,
        assigned_to_name: null,
        assigned_at: null,
        status: "new",
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error unassigning request:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in unassignGenerationRequest:", error);
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

// ─── Auto-fulfill dispatcher ────────────────────────────────────────────────

interface DispatchParams {
  requestId: string;
  category: GenerationCategory;
  model: string;
  prompt: string;
  size?: string;
  referenceImageUrls?: string[];
  firstFrameUrl?: string;
  lastFrameUrl?: string;
  sourceVideoUrl?: string;
  faceImageUrl?: string;
  duration?: number;
  resolution?: string;
  audioUrl?: string;
  lipsyncMode?: 'portrait' | 'video';
  maskUrl?: string;
}

export function aspectRatioToSize(ratio: string): string {
  switch (ratio) {
    case "1:1": return "1024*1024";
    case "16:9": return "1280*720";
    case "9:16": return "720*1280";
    case "4:3": return "1024*768";
    case "3:4": return "768*1024";
    case "21:9": return "1680*720";
    default: return "1024*1024";
  }
}

/**
 * Routes the request to the correct edge function based on category.
 * Returns immediately. Failure is silently logged; the edge function will
 * mark `auto_failed=true` so the manual editor queue takes over.
 */
async function dispatchAutoFulfill(p: DispatchParams): Promise<void> {
  if (p.category === "image-gen" || p.category === "image-edit-instruction") {
    const { error } = await supabase.functions.invoke("qwen-image", {
      body: {
        requestId: p.requestId,
        mode: p.category === "image-gen" ? "gen" : "edit",
        prompt: p.prompt,
        model: p.model,
        size: p.size,
        referenceImageUrls: p.referenceImageUrls,
      },
    });
    if (error) console.error("[qwen-image] invoke error", error);
    return;
  }

  if (p.category === "image-inpaint") {
    const { error } = await supabase.functions.invoke("dashscope-inpaint", {
      body: {
        requestId: p.requestId,
        prompt: p.prompt,
        model: p.model,
        baseImageUrl: p.referenceImageUrls?.[0],
        maskImageUrl: p.maskUrl,
      },
    });
    if (error) console.error("[dashscope-inpaint] invoke error", error);
    return;
  }

  if (
    p.category === "video-t2v" ||
    p.category === "video-i2v" ||
    p.category === "video-kf2v" ||
    p.category === "video-r2v" ||
    p.category === "video-face-swap"
  ) {
    const { error } = await supabase.functions.invoke("wan-video", {
      body: {
        requestId: p.requestId,
        category: p.category,
        prompt: p.prompt,
        model: p.model,
        size: p.size,
        firstFrameUrl: p.firstFrameUrl,
        lastFrameUrl: p.lastFrameUrl,
        referenceImageUrls: p.referenceImageUrls,
        sourceVideoUrl: p.sourceVideoUrl,
        faceImageUrl: p.faceImageUrl,
        duration: p.duration,
        resolution: p.resolution,
      },
    });
    if (error) console.error("[wan-video] invoke error", error);
    return;
  }

  if (p.category === "video-lipsync") {
    const { error } = await supabase.functions.invoke("dashscope-lipsync", {
      body: {
        requestId: p.requestId,
        prompt: p.prompt,
        mode: p.lipsyncMode || (p.sourceVideoUrl ? 'video' : 'portrait'),
        portraitUrl: p.firstFrameUrl,
        sourceVideoUrl: p.sourceVideoUrl,
        audioUrl: p.audioUrl,
      },
    });
    if (error) console.error("[dashscope-lipsync] invoke error", error);
    return;
  }
  // Decompose (coming soon) and manual categories: no dispatch.
}

/**
 * Poll a Wan video task. Returns the latest status payload.
 * Call repeatedly (e.g. every 10s) from the dashboard until status is
 * 'completed' or 'failed'.
 */
export async function pollVideoRequest(requestId: string): Promise<{
  status: "pending" | "completed" | "failed";
  resultUrl?: string;
}> {
  const { data, error } = await supabase.functions.invoke("wan-video-poll", {
    body: { requestId },
  });
  if (error) {
    console.error("[wan-video-poll] invoke error", error);
    return { status: "pending" };
  }
  return data as any;
}
