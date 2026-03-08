import { supabase } from '@/integrations/supabase/client';

/**
 * Resolve a result_url to a displayable URL.
 * If it starts with "storage:", create a signed URL.
 * Otherwise return as-is (legacy public URLs).
 */
export async function resolveResultUrl(resultUrl: string): Promise<string | null> {
  if (!resultUrl) return null;

  if (resultUrl.startsWith('storage:')) {
    // Format: "storage:bucket-name/path/to/file"
    const withoutPrefix = resultUrl.slice('storage:'.length);
    const slashIndex = withoutPrefix.indexOf('/');
    if (slashIndex === -1) return null;

    const bucket = withoutPrefix.slice(0, slashIndex);
    const path = withoutPrefix.slice(slashIndex + 1);

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  }

  // Legacy: already a full URL
  return resultUrl;
}
