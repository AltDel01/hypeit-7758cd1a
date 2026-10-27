import { assertEquals, assertThrows } from 'jsr:@std/assert'
import { productPhotoPath, workflowVideoInput, workflowImageContent } from '../_shared/workflowProductPhoto.ts'

const photo = 'storage:product-images/owner/creative-products/product.png'
Deno.test('workflow images include actual product image content before the prompt', () => {
  assertEquals(workflowImageContent('Show the product', 'https://signed.example/product.png'), [
    { image: 'https://signed.example/product.png' }, { text: 'Show the product' },
  ])
})
Deno.test('workflow videos send the uploaded photo as reference media', () => {
  assertEquals(workflowVideoInput(photo, 5), { category: 'video-r2v', model: 'wan2.7-r2v', referenceImageUrls: [photo] })
  assertEquals(workflowVideoInput(photo, 30), { category: 'video-r2v', model: 'wan3.0-video', referenceImageUrls: [photo] })
})
Deno.test('workflow without a product photo keeps text generation available', () => {
  assertEquals(workflowVideoInput(null, 5), { category: 'video-t2v', model: 'wan2.7-t2v' })
  assertEquals(workflowImageContent('Product', null), [{ text: 'Product' }])
})
Deno.test('product references can only access the owning user private photos', () => {
  assertEquals(productPhotoPath(photo, 'owner'), 'owner/creative-products/product.png')
  assertThrows(() => productPhotoPath(photo, 'other-owner'))
  assertThrows(() => productPhotoPath('storage:product-images/owner/../other/product.png', 'owner'))
})