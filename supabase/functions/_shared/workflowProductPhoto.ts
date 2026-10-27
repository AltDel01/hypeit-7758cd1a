import { needsLongFormModel, WAN_LONGFORM_MODEL } from './dashscope.ts'

export function productPhotoPath(ref: string, userId: string): string {
  const prefix = `storage:product-images/${userId}/`
  if (!ref.startsWith(prefix) || ref.includes('..') || ref.includes('#') || ref.includes('?')) throw new Error('Invalid product photo reference')
  return ref.slice('storage:product-images/'.length)
}

export function workflowVideoInput(photo: string | null, duration: number) {
  return {
    category: photo ? 'video-r2v' : 'video-t2v',
    model: needsLongFormModel(duration) ? WAN_LONGFORM_MODEL : photo ? 'wan2.7-r2v' : 'wan2.7-t2v',
    ...(photo ? { referenceImageUrls: [photo] } : {}),
  }
}

export function workflowImageContent(prompt: string, signedPhoto: string | null) {
  return [...(signedPhoto ? [{ image: signedPhoto }] : []), { text: prompt }]
}
