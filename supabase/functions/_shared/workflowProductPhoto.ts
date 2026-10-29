import { ARK_VIDEO_MODEL } from './modelark.ts'

export function productPhotoPath(ref: string, userId: string): string {
  const prefix = `storage:product-images/${userId}/`
  if (!ref.startsWith(prefix) || ref.includes('..') || ref.includes('#') || ref.includes('?')) throw new Error('Invalid product photo reference')
  return ref.slice('storage:product-images/'.length)
}

export function workflowVideoInput(photo: string | null, _duration: number) {
  return {
    category: photo ? 'video-r2v' : 'video-t2v',
    model: ARK_VIDEO_MODEL,
    ...(photo ? { referenceImageUrls: [photo] } : {}),
  }
}

/** Seedream request: the signed product photo goes in as a real reference image. */
export function workflowImageRequest(prompt: string, signedPhoto: string | null) {
  return {
    prompt: signedPhoto
      ? `${prompt}\n\nUse the product exactly as shown in the reference image: same shape, colors, packaging and label.`
      : prompt,
    images: signedPhoto ? [signedPhoto] : [],
  }
}
