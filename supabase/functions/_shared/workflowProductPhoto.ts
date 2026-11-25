import { ARK_VIDEO_MODEL } from './modelark.ts'

export function productPhotoPath(ref: string, userId: string): string {
  const prefix = `storage:product-images/${userId}/`
  if (!ref.startsWith(prefix) || ref.includes('..') || ref.includes('#') || ref.includes('?')) throw new Error('Invalid product photo reference')
  return ref.slice('storage:product-images/'.length)
}

export function workflowVideoInput(photo: string | null, _duration: number, logo: string | null = null) {
  const refs = [photo, logo].filter((u): u is string => !!u)
  return {
    category: refs.length ? 'video-r2v' : 'video-t2v',
    model: ARK_VIDEO_MODEL,
    ...(refs.length ? { referenceImageUrls: refs } : {}),
  }
}

/** Seedream request: the signed product photo goes in as a real reference image. */
export function workflowImageRequest(prompt: string, signedPhoto: string | null, logo: string | null = null) {
  const notes: string[] = []
  if (signedPhoto) notes.push(`Use the product exactly as shown in reference image 1: same shape, colors, packaging and label.`)
  if (logo) notes.push(`Reference image ${signedPhoto ? 2 : 1} is the brand logo: place that exact logo once, small and clean, without changing it.`)
  return {
    prompt: notes.length ? `${prompt}\n\n${notes.join(' ')}` : prompt,
    images: [signedPhoto, logo].filter((u): u is string => !!u),
  }
}
