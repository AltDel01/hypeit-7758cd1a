import { assert, assertEquals, assertThrows } from 'jsr:@std/assert'
import { productPhotoPath, workflowVideoInput, workflowImageRequest } from '../_shared/workflowProductPhoto.ts'
import { ARK_VIDEO_MODEL, clampArkDuration } from '../_shared/modelark.ts'

const photo = 'storage:product-images/owner/creative-products/product.png'
Deno.test('workflow images send the actual product photo as a reference image', () => {
  const r = workflowImageRequest('Show the product', 'https://signed.example/product.png')
  assertEquals(r.images, ['https://signed.example/product.png'])
  assert(r.prompt.startsWith('Show the product'))
})
Deno.test('workflow videos send the uploaded photo as reference media on Seedance', () => {
  assertEquals(workflowVideoInput(photo, 5), { category: 'video-r2v', model: ARK_VIDEO_MODEL, referenceImageUrls: [photo] })
  assertEquals(workflowVideoInput(photo, 30), { category: 'video-r2v', model: ARK_VIDEO_MODEL, referenceImageUrls: [photo] })
})
Deno.test('workflow without a product photo keeps text generation available', () => {
  assertEquals(workflowVideoInput(null, 5), { category: 'video-t2v', model: ARK_VIDEO_MODEL })
  assertEquals(workflowImageRequest('Product', null), { prompt: 'Product', images: [] })
})
Deno.test('video durations: 30s is kept, longer is capped to 30s, never shortened below the choice', () => {
  assertEquals(clampArkDuration(15), 15)
  assertEquals(clampArkDuration(30), 30)
  assertEquals(clampArkDuration(60), 30)
})
Deno.test('product references can only access the owning user private photos', () => {
  assertEquals(productPhotoPath(photo, 'owner'), 'owner/creative-products/product.png')
  assertThrows(() => productPhotoPath(photo, 'other-owner'))
  assertThrows(() => productPhotoPath('storage:product-images/owner/../other/product.png', 'owner'))
})
