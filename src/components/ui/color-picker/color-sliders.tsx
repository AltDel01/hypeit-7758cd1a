
import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { hsvaToRgba } from "@/lib/color-utils"

interface ColorSlidersProps {
  hsva: { h: number; s: number; v: number; a: number }
  onHueChange: (value: number[]) => void
  onSaturationChange: (value: number[]) => void
  onValueChange: (value: number[]) => void
}

export function ColorSliders({
  hsva,
  onHueChange,
  onSaturationChange,
  onValueChange,
}: ColorSlidersProps) {
  return (
    <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
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
            onValueChange={onHueChange}
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
            onValueChange={onSaturationChange}
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
            onValueChange={onValueChange}
            className="h-4 [&>span:first-child]:rounded-full [&>span:first-child]:h-4"
          />
        </div>
      </div>
    </div>
  )
}
