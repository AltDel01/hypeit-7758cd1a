
import * as React from "react"
import { getColorName, hexToHsva } from "@/lib/color-utils"

interface SelectedColorProps {
  color: string
}

export function SelectedColor({ color }: SelectedColorProps) {
  const hsva = hexToHsva(color);
  
  return (
    <div className="flex items-center p-3 bg-gray-800 rounded-lg space-x-3">
      <div
        className="h-10 w-10 rounded-full border border-gray-600 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex flex-col">
        <div className="text-sm font-medium">{getColorName(hsva)}</div>
        <div className="text-xs font-mono text-gray-400">{color.toUpperCase()}</div>
      </div>
    </div>
  )
}
