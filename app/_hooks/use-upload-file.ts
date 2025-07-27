"use client"

import { createClient } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"

type FileType = "image" | "video" | "3dmodel"

interface UploadFileParams {
    file: File
    type: FileType
}

export function useUploadFile() {
    return useMutation({
        mutationFn: uploadFile,
        onError: (error) => {
            console.error('Upload file error:', error)
        }
    })
}


export async function uploadFile({ file, type }: UploadFileParams) {

    const supabase = createClient()

    const fileName = Date.now()

    // Determine folder based on type
    const folderMap = {
        image: 'images',
        video: 'videos',
        '3dmodel': '3dmodels'
    }

    const folder = folderMap[type]
    const filePath = `${folder}/${fileName}`

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('morpheus')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('morpheus')
        .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    return publicUrl
}