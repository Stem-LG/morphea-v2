"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DesignerInfoFormProps {
  data: {
    nom: string
    marque: string
    contactpersonne: string
    contactemail: string
    contacttelephone: string
    pays: string
    specialite: string
  }
  onChange: (data: any) => void
}

export function DesignerInfoForm({ data, onChange }: DesignerInfoFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Designer Name *</Label>
          <Input
            id="nom"
            value={data.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            placeholder="Enter designer name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marque">Brand *</Label>
          <Input
            id="marque"
            value={data.marque}
            onChange={(e) => handleChange("marque", e.target.value)}
            placeholder="Enter brand name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactpersonne">Contact Person *</Label>
          <Input
            id="contactpersonne"
            value={data.contactpersonne}
            onChange={(e) => handleChange("contactpersonne", e.target.value)}
            placeholder="Enter contact person name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactemail">Contact Email *</Label>
          <Input
            id="contactemail"
            type="email"
            value={data.contactemail}
            onChange={(e) => handleChange("contactemail", e.target.value)}
            placeholder="Enter contact email"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contacttelephone">Contact Phone *</Label>
          <Input
            id="contacttelephone"
            type="tel"
            value={data.contacttelephone}
            onChange={(e) => handleChange("contacttelephone", e.target.value)}
            placeholder="Enter contact phone"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pays">Country *</Label>
          <Input
            id="pays"
            value={data.pays}
            onChange={(e) => handleChange("pays", e.target.value)}
            placeholder="Enter country"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialite">Specialty *</Label>
        <Input
          id="specialite"
          value={data.specialite}
          onChange={(e) => handleChange("specialite", e.target.value)}
          placeholder="Enter specialty (e.g., Haute Couture, Prêt-à-Porter)"
          required
        />
      </div>

      <p className="text-sm text-muted-foreground">
        * Required fields
      </p>
    </div>
  )
}