import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts'
import { extractDominantColor } from './brandSite.ts'

// CRC32 for PNG chunks.
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[i] = c >>> 0
  }
  return t
})()
function crc32(bytes: Uint8Array): number {
  let c = 0xFFFFFFFF
  for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length)
  const dv = new DataView(out.buffer)
  dv.setUint32(0, data.length)
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i)
  out.set(data, 8)
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

// Build a small RGBA PNG in memory: white background with a solid brand-color square.
async function makePng(rgb: [number, number, number]): Promise<string> {
  const w = 16, h = 16
  const raw = new Uint8Array(h * (1 + w * 4))
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 4)
    for (let x = 0; x < w; x++) {
      const o = row + 1 + x * 4
      const inSquare = x >= 4 && x < 12 && y >= 4 && y < 12
      const [r, g, b] = inSquare ? rgb : [255, 255, 255]
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = 255
    }
  }
  const compressed = new Uint8Array(await new Response(
    new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate')),
  ).arrayBuffer())
  const ihdr = new Uint8Array(13)
  const dv = new DataView(ihdr.buffer)
  dv.setUint32(0, w); dv.setUint32(4, h)
  ihdr[8] = 8; ihdr[9] = 6 // 8-bit RGBA
  const sig = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  const png = new Uint8Array(sig.length + 12 + 13 + 12 + compressed.length + 12)
  png.set(sig, 0)
  png.set(chunk('IHDR', ihdr), 8)
  png.set(chunk('IDAT', compressed), 8 + 25)
  png.set(chunk('IEND', new Uint8Array(0)), 8 + 25 + 12 + compressed.length)
  let bin = ''
  for (const b of png) bin += String.fromCharCode(b)
  return `data:image/png;base64,${btoa(bin)}`
}

Deno.test('extractDominantColor picks the logo color over a white background', async () => {
  const url = await makePng([3, 107, 50]) // Aspebindo-like green
  const color = await extractDominantColor(url)
  // Quantized to 32-step buckets: 3->0, 107->96, 50->32
  assertEquals(color, '#006020')
})

Deno.test('extractDominantColor returns null for an all-white logo', async () => {
  const url = await makePng([255, 255, 255])
  assertEquals(await extractDominantColor(url), null)
})

Deno.test('extractDominantColor returns null without a logo', async () => {
  assertEquals(await extractDominantColor(null), null)
})
