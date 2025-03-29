import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  className?: string
  color: string
  onChange: (value: string) => void
}

export function ColorPicker({
  className,
  color,
  onChange,
}: ColorPickerProps) {
  const [hsva, setHsva] = React.useState({ h: 0, s: 0, v: 0, a: 1 })

  React.useEffect(() => {
    try {
      setHsva(hexToHsva(color))
    } catch (e) {
      console.error(e)
    }
  }, [color])

  const handleHueChange = (value: number[]) => {
    const newHsva = { ...hsva, h: value[0] }
    setHsva(newHsva)
    onChange(hsvaToHex(newHsva))
  }

  const handleSaturationChange = (value: number[]) => {
    const newHsva = { ...hsva, s: value[0] / 100 }
    setHsva(newHsva)
    onChange(hsvaToHex(newHsva))
  }

  const handleValueChange = (value: number[]) => {
    const newHsva = { ...hsva, v: value[0] / 100 }
    setHsva(newHsva)
    onChange(hsvaToHex(newHsva))
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div
        className="h-24 rounded-md"
        style={{
          backgroundColor: color,
        }}
      />
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs" htmlFor="hue-slider">
            Hue
          </label>
          <span className="text-xs text-muted-foreground">
            {Math.round(hsva.h)}°
          </span>
        </div>
        <div className="relative">
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff0000] via-[#ffff00] via-[#00ff00] via-[#00ffff] via-[#0000ff] via-[#ff00ff] to-[#ff0000] z-0"
            style={{ height: "0.5rem" }}
          />
          <Slider
            id="hue-slider"
            value={[hsva.h]}
            max={360}
            step={1}
            onValueChange={handleHueChange}
            className="h-4 [&>span:first-child]:rounded-full [&>span:first-child]:h-4"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs" htmlFor="saturation-slider">
            Saturation
          </label>
          <span className="text-xs text-muted-foreground">
            {Math.round(hsva.s * 100)}%
          </span>
        </div>
        <div className="relative">
          <div 
            className="absolute inset-0 rounded-full z-0"
            style={{ 
              height: "0.5rem",
              background: `linear-gradient(to right, white, ${hsvaToRgba({
                h: hsva.h,
                s: 1,
                v: hsva.v,
                a: 1,
              })})`
            }}
          />
          <Slider
            id="saturation-slider"
            value={[hsva.s * 100]}
            max={100}
            step={1}
            onValueChange={handleSaturationChange}
            className="h-4 [&>span:first-child]:rounded-full [&>span:first-child]:h-4"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs" htmlFor="value-slider">
            Value
          </label>
          <span className="text-xs text-muted-foreground">
            {Math.round(hsva.v * 100)}%
          </span>
        </div>
        <div className="relative">
          <div 
            className="absolute inset-0 rounded-full z-0"
            style={{ 
              height: "0.5rem",
              background: `linear-gradient(to right, #000, ${hsvaToRgba({
                h: hsva.h,
                s: hsva.s,
                v: 1,
                a: 1,
              })})`
            }}
          />
          <Slider
            id="value-slider"
            value={[hsva.v * 100]}
            max={100}
            step={1}
            onValueChange={handleValueChange}
            className="h-4 [&>span:first-child]:rounded-full [&>span:first-child]:h-4"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 pt-4">
        <div
          className="h-5 w-5 rounded border border-muted-foreground"
          style={{ backgroundColor: color }}
        />
        <div className="text-sm font-medium uppercase">{color}</div>
      </div>
    </div>
  )
}

function hexToRgb(hex: string) {
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

function rgbToHsv(rgb: { r: number; g: number; b: number; a: number }) {
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

function hexToHsva(hex: string) {
  return rgbToHsv(hexToRgb(hex))
}

function hsvaToRgba(hsva: { h: number; s: number; v: number; a: number }) {
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

function rgbaToHex(rgba: { r: number; g: number; b: number; a: number }) {
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }
  const hex = `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`
  return hex
}

function hsvaToHex(hsva: { h: number; s: number; v: number; a: number }) {
  return rgbaToHex(hsvaToRgba(hsva))
}
