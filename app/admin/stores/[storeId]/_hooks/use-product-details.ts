"use client";

import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

interface UseProductDetailsProps {
    productId: number;
    enabled?: boolean;
}

export function useProductDetails({ productId, enabled = true }: UseProductDetailsProps) {
    const supabase = createClient();

    return useQuery({
        queryKey: ["product-details", productId],
        queryFn: async () => {
            // Fetch product details
            const { data: product, error: productError } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select("*")
                .eq("yprodid", productId)
                .single();

            if (productError) {
                throw new Error(`Failed to fetch product: ${productError.message}`);
            }

            // Fetch product variants with color and size information
            const { data: variants, error: variantsError } = await supabase
                .schema("morpheus")
                .from("yvarprod")
                .select(`
                    *,
                    xcouleuridfk(*),
                    xtailleidfk(*)
                `)
                .eq("yprodidfk", productId);

            if (variantsError) {
                throw new Error(`Failed to fetch variants: ${variantsError.message}`);
            }

            // Fetch media for each variant
            const variantsWithMedia = await Promise.all(
                (variants || []).map(async (variant) => {

                        
                    // Fetch variant media
                    const { data: variantMedia, error: mediaError } = await supabase
                        .schema("morpheus")
                        .from("yvarprodmedia")
                        .select(`
                            ymedia:ymediaidfk(
                                ymediaid,
                                ymediacode,
                                ymediaintitule,
                                ymediaurl,
                                ymediaboolphotoprod,
                                ymediaboolvideo
                            )
                        `)
                        .eq("yvarprodidfk", variant.yvarprodid);

                    if (mediaError) {
                        console.warn(`Failed to fetch media for variant ${variant.yvarprodid}:`, mediaError);
                    }

                    // Fetch 3D models for variant
                    const { data: models3d, error: modelsError } = await supabase
                        .schema("morpheus")
                        .from("yobjet3d")
                        .select("*")
                        .eq("yvarprodidfk", variant.yvarprodid);

                    if (modelsError) {
                        console.warn(`Failed to fetch 3D models for variant ${variant.yvarprodid}:`, modelsError);
                    }

                    // Separate media by type
                    const images = variantMedia?.filter(vm => vm.ymedia?.ymediaboolphotoprod === "1").map(vm => vm.ymedia) || [];
                    const videos = variantMedia?.filter(vm => vm.ymedia?.ymediaboolvideo === true).map(vm => vm.ymedia) || [];

                    return {
                        ...variant,
                        images,
                        videos,
                        models3d: models3d || []
                    };
                })
            );

            return {
                product,
                variants: variantsWithMedia
            };
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}