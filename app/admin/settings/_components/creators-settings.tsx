"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, Trash2 } from "lucide-react"
import Image from "next/image"

import { useLanguage } from "@/hooks/useLanguage"
import { useCurrentEvent } from "@/app/main/_hooks/useCurrentEvent"
import { useShopBoutiques } from "@/app/shop/_hooks/use-shop-filters"
import { useSettings, useUpdateSetting } from "../_hooks/use-settings"
import { useUploadFile } from "@/app/_hooks/use-upload-file"

export function CreatorsSettings() {
  const { t } = useLanguage()
  const { data: currentEvent } = useCurrentEvent()
  const { data: boutiques = [], isLoading: loadingBoutiques } = useShopBoutiques(currentEvent?.yeventid || null, null)
  const { data: settings = [], isLoading: loadingSettings } = useSettings()
  const updateSetting = useUpdateSetting()
  const uploadFile = useUploadFile()

  const [uploading, setUploading] = useState<Record<number, boolean>>({})

  // Parse mapping from settings
  const mapping: Record<number, string> = useMemo(() => {
    const key = "creators_images_by_boutique"
    const entry = settings.find((s: any) => s.key === key)
    if (!entry?.value) return {}
    try {
      const obj = JSON.parse(entry.value)
      // Keys may be strings; normalize to number keys
      const normalized: Record<number, string> = {}
      Object.entries(obj).forEach(([k, v]) => {
        const id = Number(k)
        if (id && typeof v === "string") normalized[id] = v
      })
      return normalized
    } catch {
      return {}
    }
  }, [settings])

  const handleUpload = async (boutiqueId: number, file: File) => {
    setUploading((p) => ({ ...p, [boutiqueId]: true }))
    try {
      const url = await uploadFile.mutateAsync({ file, type: "image" })
      const newMap = { ...mapping, [boutiqueId]: url }
      await updateSetting.mutateAsync({
        key: "creators_images_by_boutique",
        value: JSON.stringify(newMap),
      })
    } finally {
      setUploading((p) => ({ ...p, [boutiqueId]: false }))
    }
  }

  const handleRemove = async (boutiqueId: number) => {
    if (!mapping[boutiqueId]) return
    setUploading((p) => ({ ...p, [boutiqueId]: true }))
    try {
      const newMap = { ...mapping }
      delete newMap[boutiqueId]
      await updateSetting.mutateAsync({
        key: "creators_images_by_boutique",
        value: JSON.stringify(newMap),
      })
    } finally {
      setUploading((p) => ({ ...p, [boutiqueId]: false }))
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.settings.creatorsImages") || "Creators Images"}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-600">
          {t("admin.settings.creatorsImagesDesc") || "Upload an image for each creator to be shown on the Creators page."}
        </p>
        <Separator className="mb-4" />
        {loadingBoutiques || loadingSettings ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {boutiques.map((b: any) => (
              <div key={b.yboutiqueid} className="rounded-lg border p-4">
                <div className="mb-3 text-sm font-medium text-gray-900">
                  {b.yboutiqueintitule || b.yboutiquecode}
                </div>
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-gray-50">
                  {mapping[b.yboutiqueid] ? (
                    <Image src={mapping[b.yboutiqueid]} alt={b.yboutiqueintitule || b.yboutiquecode} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <Label className="text-xs text-gray-600">{t("admin.settings.uploadImage") || "Upload Image"}</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUpload(b.yboutiqueid, file)
                      }}
                      disabled={!!uploading[b.yboutiqueid]}
                      className="mt-1 bg-white text-gray-900"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-5"
                    onClick={() => handleRemove(b.yboutiqueid)}
                    disabled={!!uploading[b.yboutiqueid] || !mapping[b.yboutiqueid]}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    {t("admin.settings.removeImage") || "Remove Image"}
                  </Button>
                  {uploading[b.yboutiqueid] && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

