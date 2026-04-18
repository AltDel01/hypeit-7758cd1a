import { supabase } from '@/integrations/supabase/client';

type StorageReference = {
  bucket: string;
  path: string;
};

const KNOWN_STORAGE_BUCKETS = new Set([
  'product-images',
  'generated-images',
  'career-applications',
  'avatars',
]);

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

const parseReferenceFromPath = (value: string): StorageReference | null => {
  const normalizedValue = decodeURIComponent(value).replace(/^\/+/, '');

  for (const bucket of KNOWN_STORAGE_BUCKETS) {
    if (normalizedValue.startsWith(`${bucket}/`)) {
      return {
        bucket,
        path: normalizedValue.slice(bucket.length + 1),
      };
    }
  }

  return null;
};

const parseReferenceFromToken = (token?: string | null): StorageReference | null => {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const parsedPayload = JSON.parse(decodeBase64Url(payload));
    if (typeof parsedPayload?.url !== 'string') return null;

    return parseReferenceFromPath(parsedPayload.url);
  } catch {
    return null;
  }
};

const parseStorageReference = (value: string): StorageReference | null => {
  if (!value) return null;

  if (value.startsWith('storage:')) {
    const withoutPrefix = value.slice('storage:'.length);
    const slashIndex = withoutPrefix.indexOf('/');
    if (slashIndex === -1) return null;

    return {
      bucket: withoutPrefix.slice(0, slashIndex),
      path: withoutPrefix.slice(slashIndex + 1),
    };
  }

  const directReference = parseReferenceFromPath(value);
  if (directReference) return directReference;

  try {
    const parsedUrl = new URL(value, window.location.origin);
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    const objectIndex = segments.findIndex((segment) => segment === 'object');

    if (objectIndex === -1) return null;

    const accessMode = segments[objectIndex + 1];
    const bucket = segments[objectIndex + 2];
    const pathSegments = segments.slice(objectIndex + 3);

    if (!accessMode || !bucket || pathSegments.length === 0) return null;
    if (!['sign', 'authenticated', 'public'].includes(accessMode)) return null;

    const tokenReference = parseReferenceFromToken(parsedUrl.searchParams.get('token'));
    if (tokenReference) return tokenReference;

    return {
      bucket,
      path: decodeURIComponent(pathSegments.join('/')),
    };
  } catch {
    return null;
  }
};

/**
 * Resolve a result_url to a displayable URL.
 * Supports permanent `storage:` refs plus legacy Supabase signed URLs,
 * and always returns a fresh signed URL for private storage objects.
 */
export async function resolveResultUrl(resultUrl: string): Promise<string | null> {
  if (!resultUrl) return null;

  const storageReference = parseStorageReference(resultUrl);

  if (storageReference) {
    const { data, error } = await supabase.storage
      .from(storageReference.bucket)
      .createSignedUrl(storageReference.path, 3600);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  }

  // Legacy non-Supabase/public URLs can be used directly.
  return resultUrl;
}
