
export function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, "")
  let alpha = 255
  if (hex.length === 8) {
    alpha = parseInt(hex.slice(6, 8), 16)
    hex = hex.slice(0, 6)
  }
  if (hex.length === 4) {
    alpha = parseInt(hex.slice(3, 4).repeat(2), 16)
    hex = hex.slice(0, 3)
  }
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  const number = parseInt(hex, 16)
  const red = number >> 16
  const green = (number >> 8) & 255
  const blue = number & 255
  return { r: red, g: green, b: blue, a: alpha / 255 }
}

export function rgbToHsv(rgb: { r: number; g: number; b: number; a: number }) {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta === 0) {
    h = 0
  } else if (max === r) {
    h = ((g - b) / delta) % 6
  } else if (max === g) {
    h = (b - r) / delta + 2
  } else {
    h = (r - g) / delta + 4
  }
  h = Math.round(h * 60)
  if (h < 0) {
    h += 360
  }
  const s = max === 0 ? 0 : delta / max
  return { h, s, v: max, a: rgb.a }
}

export function hexToHsva(hex: string) {
  return rgbToHsv(hexToRgb(hex))
}

export function hsvaToRgba(hsva: { h: number; s: number; v: number; a: number }) {
  const { h, s, v, a } = hsva
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r, g, b
  if (h >= 0 && h < 60) {
    ;[r, g, b] = [c, x, 0]
  } else if (h >= 60 && h < 120) {
    ;[r, g, b] = [x, c, 0]
  } else if (h >= 120 && h < 180) {
    ;[r, g, b] = [0, c, x]
  } else if (h >= 180 && h < 240) {
    ;[r, g, b] = [0, x, c]
  } else if (h >= 240 && h < 300) {
    ;[r, g, b] = [x, 0, c]
  } else {
    ;[r, g, b] = [c, 0, x]
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  }
}

export function rgbaToHex(rgba: { r: number; g: number; b: number; a: number }) {
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }
  const hex = `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`
  return hex
}

export function hsvaToHex(hsva: { h: number; s: number; v: number; a: number }) {
  return rgbaToHex(hsvaToRgba(hsva))
}

// Get material design color name from hex
export function getColorName(hsva: { h: number; s: number; v: number; a: number }) {
  // This is a simplified version - in a real app you might want to use a proper color naming library
  // or a predefined mapping of hex values to material design color names
  const h = hsva.h;
  
  if (h >= 0 && h < 30) return "Red";
  if (h >= 30 && h < 60) return "Orange";
  if (h >= 60 && h < 90) return "Yellow";
  if (h >= 90 && h < 150) return "Green";
  if (h >= 150 && h < 210) return "Cyan";
  if (h >= 210 && h < 270) return "Blue";
  if (h >= 270 && h < 330) return "Purple";
  return "Red";
}
