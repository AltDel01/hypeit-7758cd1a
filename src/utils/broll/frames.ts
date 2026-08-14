/**
 * Client-side helpers for the AI b-roll editor: sample frames from an uploaded
 * video so only small JPEGs (never the raw file) are sent to the AI for analysis.
 */

export interface SampledFrame {
  time: number;
  dataUrl: string;
}

export interface VideoMeta {
  duration: number;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | 'square';
}

export function loadVideoMeta(file: File): Promise<VideoMeta & { url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.onloadedmetadata = () => {
      const { videoWidth: width, videoHeight: height, duration } = video;
      const orientation =
        width > height ? 'landscape' : height > width ? 'portrait' : 'square';
      resolve({ duration, width, height, orientation, url });
    };
    video.onerror = () => reject(new Error('That video file could not be read.'));
  });
}

/** Grabs up to `maxFrames` evenly spaced JPEG frames, downscaled for cheap analysis. */
export async function sampleFrames(
  file: File,
  duration: number,
  maxFrames = 12,
  maxEdge = 512,
): Promise<SampledFrame[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error('That video file could not be read.'));
  });

  const count = Math.max(3, Math.min(maxFrames, Math.floor(duration / 2) || 3));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const frames: SampledFrame[] = [];

  const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight));
  canvas.width = Math.max(2, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(2, Math.round(video.videoHeight * scale));

  for (let i = 0; i < count; i++) {
    const time = Math.min(duration - 0.1, (duration / count) * i + 0.2);
    await seek(video, time);
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    frames.push({ time, dataUrl: canvas.toDataURL('image/jpeg', 0.6) });
  }

  URL.revokeObjectURL(url);
  return frames;
}

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

/** Renders an on-screen callout to a transparent PNG so ffmpeg can overlay it without fonts. */
export function renderOverlayPng(
  text: string,
  width: number,
  height: number,
): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    if (!text.trim()) {
      resolve(null);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    const fontSize = Math.round(Math.min(width, height) * 0.075);
    ctx.font = `900 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const label = text.toUpperCase();
    const metrics = ctx.measureText(label);
    const padX = fontSize * 0.6;
    const padY = fontSize * 0.4;
    const boxW = metrics.width + padX * 2;
    const boxH = fontSize + padY * 2;
    const x = width / 2;
    const y = height * 0.82;

    ctx.fillStyle = 'rgba(140, 82, 255, 0.92)';
    roundRect(ctx, x - boxW / 2, y - boxH / 2, boxW, boxH, boxH / 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, x, y);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, 'image/png');
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
