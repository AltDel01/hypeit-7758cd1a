
import * as React from "react"
import { cn } from "@/lib/utils"
import { hexToHsva, hsvaToHex } from "@/lib/color-utils"
import { ColorPreview } from "@/components/ui/color-picker/color-preview"
import { ColorSliders } from "@/components/ui/color-picker/color-sliders"
import { SelectedColor } from "@/components/ui/color-picker/selected-color"
import { getColorName } from "@/lib/color-utils"

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
    <div className={cn("grid gap-4", className)}>
      <ColorPreview color={color} hsva={hsva} />
      
      <ColorSliders
        hsva={hsva}
        onHueChange={handleHueChange}
        onSaturationChange={handleSaturationChange}
        onValueChange={handleValueChange}
      />
      
      <SelectedColor color={color} />
    </div>
  )
}
