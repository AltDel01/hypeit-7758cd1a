export type MediaKind = 'video' | 'image' | 'audio' | 'file';

const MULTI_ATTACHMENT_DELIMITER = '||';
const LEGACY_ATTACHMENT_SPLIT_REGEX = /,(?=(?:storage:|https?:\/\/))/g;

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'heic', 'heif']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac']);

const getNormalizedPath = (value: string) => {
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

export const getMediaFileName = (value: string) => {
  const normalizedPath = getNormalizedPath(value);
  return normalizedPath.split('/').pop() || normalizedPath;
};