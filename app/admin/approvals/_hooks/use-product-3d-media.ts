// use-product-3d-media.ts
"use client"

import { createClient } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"

type Product3DModel = {
  yobjet3did: number
  yobjet3durl: string
  yvarprodidfk: number
  [key: string]: any
}

type Media = {
  ymediaid: number
  ymediaurl: string
  ymediaintitule: string
  ymediaboolphotoevent?: string | boolean
  ymediaboolphotoprod?: string | boolean
  ymediaboolvideocapsule?: string | boolean
  ymediaboolphotoeditoriale?: string | boolean
  ymediaboolvideo?: string | boolean
  [key: string]: any
}

interface Product3DMediaResult {
  models3d: string[]
  images: Media[]
  videos: Media[]
  isLoading: boolean
  error: Error | null
}

export function useProduct3DMedia(variantId: number): Product3DMediaResult {
  const supabase = createClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["product-3d-media", variantId],
    queryFn: async () => {
      // Fetch 3D models
      const { data: models, error: modelsError } = await supabase
        .schema("morpheus")
        .from("yobjet3d")
        .select("*")
        .eq("yvarprodidfk", variantId)

      if (modelsError) throw new Error(modelsError.message)

      // Fetch media links for this variant
      const { data: varprodmedia, error: varprodmediaError } = await supabase
        .schema("morpheus")
        .from("yvarprodmedia")
        .select("ymediaidfk")
        .eq("yvarprodidfk", variantId)

      if (varprodmediaError) throw new Error(varprodmediaError.message)

      const mediaIds = varprodmedia?.map((m: any) => m.ymediaidfk).filter(Boolean)
      let media: Media[] = []

      if (mediaIds.length > 0) {
        const { data: mediaData, error: mediaError } = await supabase
          .schema("morpheus")
          .from("ymedia")
          .select("*")
          .in("ymediaid", mediaIds)

        if (mediaError) throw new Error(mediaError.message)
        media = mediaData || []
      }

      // Separate images and videos
      const images = media.filter(
        m =>
          m.ymediaboolphotoprod === true ||
          m.ymediaboolphotoprod === "1" ||
          m.ymediaboolphotoevent === true ||
          m.ymediaboolphotoevent === "1" ||
          m.ymediaboolphotoeditoriale === true
      )
      const videos = media.filter(
        m =>
          m.ymediaboolvideo === true ||
          m.ymediaboolvideo === "1" ||
          m.ymediaboolvideocapsule === true ||
          m.ymediaboolvideocapsule === "1"
      )

      return {
        models3d: (models || []).map((m: Product3DModel) => m.yobjet3durl),
        images,
        videos,
      }
    },
  })

  return {
    models3d: data?.models3d ?? [],
    images: data?.images ?? [],
    videos: data?.videos ?? [],
    isLoading,
    error: error as Error | null,
  }
}