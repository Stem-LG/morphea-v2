"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/useLanguage"

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
  const { t } = useLanguage()
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
          <Label htmlFor="nom">{t("admin.users.designer.nameRequired")}</Label>
          <Input
            id="nom"
            value={data.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            placeholder={t("admin.users.designer.namePlaceholder")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marque">{t("admin.users.designer.brandRequired")}</Label>
          <Input
            id="marque"
            value={data.marque}
            onChange={(e) => handleChange("marque", e.target.value)}
            placeholder={t("admin.users.designer.brandPlaceholder")}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactpersonne">{t("admin.users.designer.contactPersonRequired")}</Label>
          <Input
            id="contactpersonne"
            value={data.contactpersonne}
            onChange={(e) => handleChange("contactpersonne", e.target.value)}
            placeholder={t("admin.users.designer.contactPersonPlaceholder")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactemail">{t("admin.users.designer.emailRequired")}</Label>
          <Input
            id="contactemail"
            type="email"
            value={data.contactemail}
            onChange={(e) => handleChange("contactemail", e.target.value)}
            placeholder={t("admin.users.designer.emailPlaceholder")}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contacttelephone">{t("admin.users.designer.phoneRequired")}</Label>
          <Input
            id="contacttelephone"
            type="tel"
            value={data.contacttelephone}
            onChange={(e) => handleChange("contacttelephone", e.target.value)}
            placeholder={t("admin.users.designer.phonePlaceholder")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pays">{t("admin.users.designer.countryRequired")}</Label>
          <Input
            id="pays"
            value={data.pays}
            onChange={(e) => handleChange("pays", e.target.value)}
            placeholder={t("admin.users.designer.countryPlaceholder")}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialite">{t("admin.users.designer.specialtyRequired")}</Label>
        <Input
          id="specialite"
          value={data.specialite}
          onChange={(e) => handleChange("specialite", e.target.value)}
          placeholder={t("admin.users.designer.specialtyPlaceholder")}
          required
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {t("admin.users.designer.requiredFields")}
      </p>
    </div>
  )
}