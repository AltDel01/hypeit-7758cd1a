/** Grab a single frame from a video source as a JPEG data URL. */
export const extractVideoFrame = (
  src: string,
  position: 'first' | 'last' | number = 'last',
): Promise<string> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = src;

    const fail = () => reject(new Error('Could not read a frame from this video.'));

    const draw = () => {
      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1280 / Math.max(video.videoWidth || 1, video.videoHeight || 1));
        canvas.width = Math.round((video.videoWidth || 1280) * scale);
        canvas.height = Math.round((video.videoHeight || 720) * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return fail();
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        fail();
      }
    };

    video.onerror = fail;
    video.onloadeddata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const target =
        position === 'first' ? 0
        : position === 'last' ? Math.max(0, duration - 0.1)
        : Math.max(0, Math.min(position, Math.max(0, duration - 0.05)));
      if (target === 0) {
        draw();
        return;
      }
      video.onseeked = draw;
      video.currentTime = target;
    };
  });

/** Read a File as a data URL. */
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read this file.'));
    reader.readAsDataURL(file);
  });

/** Downscale an image data URL so the provider accepts it. */
export const normalizeImageDataUrl = (dataUrl: string, maxSide = 1536): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      if (scale === 1 && dataUrl.length < 3_000_000) return resolve(dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
