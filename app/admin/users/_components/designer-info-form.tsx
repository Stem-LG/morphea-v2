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
  showValidation?: boolean
}

export function DesignerInfoForm({ data, onChange, showValidation = false }: DesignerInfoFormProps) {
  const { t } = useLanguage()
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  const getInputClassName = (fieldName: string, value: string) => {
    const baseClass = "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-400"
    
    if (showValidation && !value.trim()) {
      return "border-red-500 bg-white text-gray-900 focus:border-red-500 focus:ring-red-500 placeholder:text-red-300"
    }
    
    return baseClass
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom" className="text-gray-700 font-medium">{t("admin.users.designer.nameRequired")}</Label>
          <Input
            id="nom"
            value={data.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            placeholder={t("admin.users.designer.namePlaceholder")}
            className={getInputClassName("nom", data.nom)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marque" className="text-gray-700 font-medium">{t("admin.users.designer.brandRequired")}</Label>
          <Input
            id="marque"
            value={data.marque}
            onChange={(e) => handleChange("marque", e.target.value)}
            placeholder={t("admin.users.designer.brandPlaceholder")}
            className={getInputClassName("marque", data.marque)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactpersonne" className="text-gray-700 font-medium">{t("admin.users.designer.contactPersonRequired")}</Label>
          <Input
            id="contactpersonne"
            value={data.contactpersonne}
            onChange={(e) => handleChange("contactpersonne", e.target.value)}
            placeholder={t("admin.users.designer.contactPersonPlaceholder")}
            className={getInputClassName("contactpersonne", data.contactpersonne)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactemail" className="text-gray-700 font-medium">{t("admin.users.designer.emailRequired")}</Label>
          <Input
            id="contactemail"
            type="email"
            value={data.contactemail}
            onChange={(e) => handleChange("contactemail", e.target.value)}
            placeholder={t("admin.users.designer.emailPlaceholder")}
            className={getInputClassName("contactemail", data.contactemail)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contacttelephone" className="text-gray-700 font-medium">{t("admin.users.designer.phoneRequired")}</Label>
          <Input
            id="contacttelephone"
            type="tel"
            value={data.contacttelephone}
            onChange={(e) => handleChange("contacttelephone", e.target.value)}
            placeholder={t("admin.users.designer.phonePlaceholder")}
            className={getInputClassName("contacttelephone", data.contacttelephone)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pays" className="text-gray-700 font-medium">{t("admin.users.designer.countryRequired")}</Label>
          <Input
            id="pays"
            value={data.pays}
            onChange={(e) => handleChange("pays", e.target.value)}
            placeholder={t("admin.users.designer.countryPlaceholder")}
            className={getInputClassName("pays", data.pays)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialite" className="text-gray-700 font-medium">{t("admin.users.designer.specialtyRequired")}</Label>
        <Input
          id="specialite"
          value={data.specialite}
          onChange={(e) => handleChange("specialite", e.target.value)}
          placeholder={t("admin.users.designer.specialtyPlaceholder")}
          className={getInputClassName("specialite", data.specialite)}
          required
        />
      </div>
    </div>
  )
}