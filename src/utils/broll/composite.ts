/**
 * Browser-side compositing for the AI b-roll editor.
 * ffmpeg.wasm is lazy-loaded on first use (single-threaded core, no SharedArrayBuffer needed)
 * and only handles short local clips. Longer videos are routed to the editor queue instead.
 */

import { renderOverlayPng } from './frames';

export interface CompositeClip {
  /** seconds into the source video where the cutaway starts */
  start: number;
  /** cutaway length in seconds */
  duration: number;
  /** downloaded b-roll mp4 */
  data: Uint8Array;
  /** optional on-screen callout */
  overlayText?: string;
}

export interface CompositeOptions {
  source: File;
  width: number;
  height: number;
  clips: CompositeClip[];
  onProgress?: (ratio: number, message: string) => void;
}

let ffmpegPromise: Promise<any> | null = null;

const CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';

async function getFfmpeg(onProgress?: (ratio: number, message: string) => void) {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import('@ffmpeg/ffmpeg'),
        import('@ffmpeg/util'),
      ]);
      const ffmpeg = new FFmpeg();
      onProgress?.(0.02, 'Loading the video engine');
      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      return ffmpeg;
    })();
  }
  return ffmpegPromise;
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

export async function compositeBroll({
  source,
  width,
  height,
  clips,
  onProgress,
}: CompositeOptions): Promise<Blob> {
  const ffmpeg = await getFfmpeg(onProgress);
  const { fetchFile } = await import('@ffmpeg/util');

  const w = even(Math.min(width, 1080));
  const h = even(Math.round((height / width) * w));

  onProgress?.(0.1, 'Preparing files');
  await ffmpeg.writeFile('source.mp4', await fetchFile(source));

  const inputs = ['-i', 'source.mp4'];
  const filters: string[] = [`[0:v]scale=${w}:${h},setsar=1[base]`];
  let last = 'base';
  let inputIndex = 1;

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const name = `broll${i}.mp4`;
    await ffmpeg.writeFile(name, clip.data);
    inputs.push('-i', name);

    const end = clip.start + clip.duration;
    filters.push(
      `[${inputIndex}:v]scale=${w}:${h},setsar=1,trim=duration=${clip.duration},setpts=PTS-STARTPTS+${clip.start}/TB[b${i}]`,
    );
    filters.push(
      `[${last}][b${i}]overlay=0:0:enable='between(t,${clip.start},${end})'[v${i}]`,
    );
    last = `v${i}`;
    inputIndex++;

    if (clip.overlayText?.trim()) {
      const png = await renderOverlayPng(clip.overlayText, w, h);
      if (png) {
        const pngName = `text${i}.png`;
        await ffmpeg.writeFile(pngName, png);
        inputs.push('-i', pngName);
        filters.push(
          `[${last}][${inputIndex}:v]overlay=0:0:enable='between(t,${clip.start},${end})'[t${i}]`,
        );
        last = `t${i}`;
        inputIndex++;
      }
    }
  }

  onProgress?.(0.25, 'Compositing b-roll');

  ffmpeg.on?.('progress', ({ progress }: { progress: number }) => {
    if (Number.isFinite(progress)) {
      onProgress?.(0.25 + Math.min(Math.max(progress, 0), 1) * 0.7, 'Rendering the final cut');
    }
  });

  await ffmpeg.exec([
    ...inputs,
    '-filter_complex',
    filters.join(';'),
    '-map',
    `[${last}]`,
    '-map',
    '0:a?',
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '26',
    '-c:a',
    'aac',
    '-shortest',
    'output.mp4',
  ]);

  onProgress?.(0.97, 'Packaging the export');
  const out = await ffmpeg.readFile('output.mp4');
  const bytes = out instanceof Uint8Array ? out : new TextEncoder().encode(String(out));

  // Free the virtual filesystem so repeat runs don't grow memory.
  await Promise.allSettled([
    ffmpeg.deleteFile('source.mp4'),
    ffmpeg.deleteFile('output.mp4'),
    ...clips.map((_, i) => ffmpeg.deleteFile(`broll${i}.mp4`)),
  ]);

  onProgress?.(1, 'Done');
  return new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'video/mp4' });
}

/** Videos above these limits are too heavy for browser compositing. */
export const MAX_SOURCE_SECONDS = 180;
export const MAX_SOURCE_BYTES = 200 * 1024 * 1024;
