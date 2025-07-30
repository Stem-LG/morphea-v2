"use client"

import { createClient } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"

interface createMediaParams {
    code?: string,
    name: string,
    type: "eventImage" | "productImage" | "editorialImage" | "capsuleVideo" | "video",
    url: string
}

export function useCreateMedia() {


    const supabase = createClient()

    return useMutation({
        mutationFn: async (media: createMediaParams) => {

            const timestamp = Date.now().toString()

            const code = media.code || timestamp

            const { data, error } = await supabase.schema("morpheus").from("ymedia").insert({
                ymediacode: code,
                ymediaboolphotoevent: media.type == "eventImage" ? "1" : "0",
                ymediaboolphotoprod: media.type == "productImage" ? "1" : "0",
                ymediaboolvideocapsule: media.type == "capsuleVideo" ? "1" : "0",
                ymediaboolphotoeditoriale: media.type == "editorialImage" ? true : false,
                ymediaboolvideo: media.type == "video" ? true : false,
                ymediaintitule: media.name,
                ymediaurl: media.url,
            }).select('*').single()

            if (error) {
                throw new Error(error.code)
            }

            return data

        }
    })

}