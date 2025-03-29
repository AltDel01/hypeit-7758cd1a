
import * as React from "react"
import { getColorName } from "@/lib/color-utils"

interface ColorPreviewProps {
  color: string
  hsva: { h: number; s: number; v: number; a: number }
}

export function ColorPreview({ color, hsva }: ColorPreviewProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="text-sm text-gray-400 text-center mb-2">
        {getColorName(hsva)} {Math.round(hsva.v * 100)}
      </div>
      <div 
        className="h-24 rounded-md flex items-center justify-center mb-2"
        style={{
          backgroundColor: color,
        }}
      >
        <span className="material-icons text-white text-5xl">
          {/* Material icon would go here */}
        </span>
      </div>
      <div className="text-sm font-mono text-center">
        {color.toUpperCase()}
      </div>
    </div>
  )
}
