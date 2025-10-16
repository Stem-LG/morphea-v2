"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/hooks/useLanguage"
import { useCurrentEvent } from "@/app/main/_hooks/useCurrentEvent"
import { useShopBoutiques } from "@/app/shop/_hooks/use-shop-filters"
import { useSettings } from "@/app/admin/settings/_hooks/use-settings"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function CreatorsPage() {
  const { t } = useLanguage()
  const { data: currentEvent, isLoading: loadingEvent } = useCurrentEvent()
  const { data: boutiques = [], isLoading: loadingBoutiques } = useShopBoutiques(
    currentEvent?.yeventid || null,
    null
  )

  const { data: settings = [] } = useSettings()
  const mapping: Record<number, string> = (() => {
    const entry = settings.find((s: any) => s.key === 'creators_images_by_boutique')
    if (!entry?.value) return {}
    try {
      const obj = JSON.parse(entry.value)
      const norm: Record<number, string> = {}
      Object.entries(obj).forEach(([k, v]) => {
        const id = Number(k)
        if (id && typeof v === 'string') norm[id] = v
      })
      return norm
    } catch {
      return {}
    }
  })()

  const isLoading = loadingEvent || loadingBoutiques

  return (
    <div className="min-h-[100svh] bg-white">
      <Button className="absolute left-8 top-8 size-16" size="icon" variant="ghost" asChild>
        <Link href="/" aria-label="Back to home">
          <ChevronLeft className="size-10"/>
        </Link>
      </Button>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-recia text-3xl font-medium">
            {t("shop.creators") || "Creators"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {boutiques?.length ? `${boutiques.length} ${t("shop.results") || "results"}` : ""}
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="border-t-morpheus-gold-light h-16 w-16 animate-spin rounded-full border-4 border-gray-300" />
          </div>
        ) : boutiques && boutiques.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {boutiques.sort((a, b) => a.yboutiqueintitule.localeCompare(b.yboutiqueintitule)).map((b: any) => (
              <Link
                key={b.yboutiqueid}
                href={`/shop?boutiqueId=${b.yboutiqueid}`}
                className="group"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-50">
                  {mapping[b.yboutiqueid] ? (
                    <Image src={mapping[b.yboutiqueid]} alt={b.yboutiqueintitule || b.yboutiquecode} fill className="object-cover transition-transform group-hover:scale-[1.02]" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-xs text-gray-400">No image</div>
                  )}
                </div>
                <div className="mt-3 text-center text-sm font-medium text-gray-800 group-hover:text-morpheus-blue-dark">
                  {b.yboutiqueintitule || b.yboutiquecode}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-600">
            {t("shop.noProductsFound") || "No creators found"}
          </div>
        )}
      </div>
    </div>
  )
}

