export type MediaKind = 'video' | 'image' | 'audio' | 'file';

/**
 * Explicit role a user assigns to an uploaded file so the pipeline never has
 * to guess what an attachment is for.
 */
export type MediaRole =
  | 'reference'
  | 'first-frame'
  | 'last-frame'
  | 'product'
  | 'face'
  | 'style'
  | 'source-video'
  | 'audio'
  | 'mask';

export const MEDIA_ROLE_LABELS: Record<MediaRole, string> = {
  reference: 'Reference',
  'first-frame': 'First frame',
  'last-frame': 'Last frame',
  product: 'Product',
  face: 'Face / character',
  style: 'Style reference',
  'source-video': 'Source video',
  audio: 'Audio / voice',
  mask: 'Mask',
};

export const DEFAULT_MEDIA_ROLE: MediaRole = 'reference';

const ROLE_TAG = '#role=';

/** Roles offered in the composer for a given generation mode. */
export const rolesForMode = (mode: 'image' | 'video' | 'chat'): MediaRole[] => {
  if (mode === 'video') {
    return ['reference', 'first-frame', 'last-frame', 'product', 'face', 'style', 'source-video'];
  }
  if (mode === 'image') {
    return ['reference', 'product', 'face', 'style', 'mask'];
  }
  return ['reference', 'product', 'style'];
};

/** Append a role tag to a stored media reference. */
export const withMediaRole = (url: string, role?: MediaRole | null) => {
  const clean = stripMediaRole(url);
  if (!role || role === DEFAULT_MEDIA_ROLE) return clean;
  return `${clean}${ROLE_TAG}${role}`;
};

/** Remove the role tag so the raw storage/http reference remains. */
export const stripMediaRole = (url: string) => {
  const index = url.indexOf(ROLE_TAG);
  return index === -1 ? url : url.slice(0, index);
};

/** Read the role tag from a stored media reference. */
export const getMediaRole = (url: string): MediaRole => {
  const index = url.indexOf(ROLE_TAG);
  if (index === -1) return DEFAULT_MEDIA_ROLE;
  const role = url.slice(index + ROLE_TAG.length) as MediaRole;
  return role in MEDIA_ROLE_LABELS ? role : DEFAULT_MEDIA_ROLE;
};

export const getMediaRoleLabel = (url: string) => MEDIA_ROLE_LABELS[getMediaRole(url)];

const MULTI_ATTACHMENT_DELIMITER = '||';
const LEGACY_ATTACHMENT_SPLIT_REGEX = /,(?=(?:storage:|https?:\/\/))/g;

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'heic', 'heif']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac']);

const getNormalizedPath = (rawValue: string) => {
  const value = stripMediaRole(rawValue);

  if (value.startsWith('storage:')) {
    return decodeURIComponent(value.slice('storage:'.length));
  }

  try {
    return decodeURIComponent(new URL(value).pathname);
  } catch {
    return decodeURIComponent(value.split('?')[0]);
  }
};

const getExtension = (value: string) => {
  const normalizedPath = getNormalizedPath(value);
  const fileName = normalizedPath.split('/').pop() || normalizedPath;
  const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
  return (extension || '').toLowerCase();
};


export const splitStoredAttachmentUrls = (value?: string | null) => {
  if (!value?.trim()) return [];

  const trimmedValue = value.trim();

  if (trimmedValue.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmedValue);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      // Fall through to delimiter-based parsing.
    }
  }

  if (trimmedValue.includes(MULTI_ATTACHMENT_DELIMITER)) {
    return trimmedValue
      .split(MULTI_ATTACHMENT_DELIMITER)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return trimmedValue
    .split(LEGACY_ATTACHMENT_SPLIT_REGEX)
    .map((item) => item.trim())
    .filter(Boolean);
};

export const joinStoredAttachmentUrls = (urls: string[]) => {
  const cleanedUrls = urls.map((url) => url.trim()).filter(Boolean);
  return cleanedUrls.length > 0 ? cleanedUrls.join(MULTI_ATTACHMENT_DELIMITER) : undefined;
};

export const getMediaKind = (value: string): MediaKind => {
  const extension = getExtension(value);

  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';

  return 'file';
};

export const getMediaKindFromMimeType = (mimeType?: string | null): MediaKind => {
  const normalizedMimeType = mimeType?.toLowerCase().trim();

  if (!normalizedMimeType) return 'file';
  if (normalizedMimeType.startsWith('video/')) return 'video';
  if (normalizedMimeType.startsWith('image/')) return 'image';
  if (normalizedMimeType.startsWith('audio/')) return 'audio';

  return 'file';
};

export const resolveMediaKind = async (rawValue?: string | null, resolvedUrl?: string | null): Promise<MediaKind> => {
  const detectedFromPath = getMediaKind(rawValue || resolvedUrl || '');
  if (detectedFromPath !== 'file' || !resolvedUrl) return detectedFromPath;

  try {
    const response = await fetch(resolvedUrl, { method: 'GET' });
    return getMediaKindFromMimeType(response.headers.get('content-type'));
  } catch {
    return 'file';
  }
};

export const getMediaFileName = (value: string) => {
  const normalizedPath = getNormalizedPath(value);
  return normalizedPath.split('/').pop() || normalizedPath;
};