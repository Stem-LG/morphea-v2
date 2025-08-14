"use client"

import { createClient } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"

interface Create3dModelParams {
  url: string;
  productVariantId: number;
  backgroundColor?: string; // Optional hex color field
}

export function useCreate3dModel() {


  const supabase = createClient()

  return useMutation({
    mutationFn: async (model: Create3dModelParams) => {

      const insertData = {
        yobjet3durl: model.url,
        yvarprodidfk: model.productVariantId,
        ...(model.backgroundColor && { ycouleurarriereplan: model.backgroundColor })
      };

      const { data, error } = await supabase.schema("morpheus").from("yobjet3d").insert(insertData).select('*')

      if (error) {
        throw new Error(error.code)
      }

      return data

    }
  })

}