"use client"

import { createClient } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"

interface create3dModelParams {
  url: string,
  productVariantId: number,
}

export function useCreate3dModel() {


  const supabase = createClient()

  return useMutation({
    mutationFn: async (model: create3dModelParams) => {

      const { data, error } = await supabase.schema("morpheus").from("yobjet3d").insert({
        yobjet3durl: model.url,
        yvarprodidfk: model.productVariantId,
      }).select('*')

      if (error) {
        throw new Error(error.code)
      }

      return data

    }
  })

}