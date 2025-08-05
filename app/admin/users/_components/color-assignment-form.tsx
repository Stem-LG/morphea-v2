"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorData {
  hexa?: string
  rvb?: string
  dsg?: string
}

interface ColorAssignmentFormProps {
  data: {
    couleur1?: ColorData
    couleur2?: ColorData
    couleur3?: ColorData
    [key: string]: any
  }
  onChange: (data: any) => void
}

export function ColorAssignmentForm({ data, onChange }: ColorAssignmentFormProps) {
  const handleColorChange = (colorNumber: 1 | 2 | 3, field: keyof ColorData, value: string) => {
    const colorKey = `couleur${colorNumber}` as const
    onChange({
      ...data,
      [colorKey]: {
        ...data[colorKey],
        [field]: value
      }
    })
  }

  const hexToRgb = (hex: string): string => {
    // Remove # if present
    hex = hex.replace(/^#/, '')
    
    // Parse hex values
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return `${r}, ${g}, ${b}`
    }
    return ''
  }

  const handleHexChange = (colorNumber: 1 | 2 | 3, hex: string) => {
    const colorKey = `couleur${colorNumber}` as const
    const rgb = hexToRgb(hex)
    
    onChange({
      ...data,
      [colorKey]: {
        ...data[colorKey],
        hexa: hex,
        rvb: rgb
      }
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Assign up to 3 brand colors for this designer. These colors will be used to identify their products.
      </p>

      <div className="grid gap-4">
        {/* Color 1 */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-medium">Primary Color</h3>
            <span className="text-sm text-muted-foreground">Main brand color</span>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="color1-name" className="text-xs">Color Name</Label>
              <Input
                id="color1-name"
                value={data.couleur1?.dsg || ''}
                onChange={(e) => handleColorChange(1, 'dsg', e.target.value)}
                placeholder="e.g., Midnight Blue"
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="color1-hex" className="text-xs">Hex Code</Label>
              <Input
                id="color1-hex"
                type="text"
                value={data.couleur1?.hexa || ''}
                onChange={(e) => handleHexChange(1, e.target.value)}
                placeholder="#000000"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <Input
                type="color"
                value={data.couleur1?.hexa || '#000000'}
                onChange={(e) => handleHexChange(1, e.target.value)}
                className="w-12 h-8 p-1"
              />
            </div>
          </div>
        </div>

        {/* Color 2 */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-medium">Secondary Color</h3>
            <span className="text-sm text-muted-foreground">Supporting brand color</span>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="color2-name" className="text-xs">Color Name</Label>
              <Input
                id="color2-name"
                value={data.couleur2?.dsg || ''}
                onChange={(e) => handleColorChange(2, 'dsg', e.target.value)}
                placeholder="e.g., Pearl White"
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="color2-hex" className="text-xs">Hex Code</Label>
              <Input
                id="color2-hex"
                type="text"
                value={data.couleur2?.hexa || ''}
                onChange={(e) => handleHexChange(2, e.target.value)}
                placeholder="#000000"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <Input
                type="color"
                value={data.couleur2?.hexa || '#000000'}
                onChange={(e) => handleHexChange(2, e.target.value)}
                className="w-12 h-8 p-1"
              />
            </div>
          </div>
        </div>

        {/* Color 3 */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-medium">Tertiary Color</h3>
            <span className="text-sm text-muted-foreground">Accent brand color</span>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="color3-name" className="text-xs">Color Name</Label>
              <Input
                id="color3-name"
                value={data.couleur3?.dsg || ''}
                onChange={(e) => handleColorChange(3, 'dsg', e.target.value)}
                placeholder="e.g., Rose Gold"
                className="h-8"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="color3-hex" className="text-xs">Hex Code</Label>
              <Input
                id="color3-hex"
                type="text"
                value={data.couleur3?.hexa || ''}
                onChange={(e) => handleHexChange(3, e.target.value)}
                placeholder="#000000"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <Input
                type="color"
                value={data.couleur3?.hexa || '#000000'}
                onChange={(e) => handleHexChange(3, e.target.value)}
                className="w-12 h-8 p-1"
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Note: Colors are optional but recommended for better brand identification.
      </p>
    </div>
  )
}