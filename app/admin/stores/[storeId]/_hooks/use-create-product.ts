"use client";

import { createClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useUploadFile } from "@/app/_hooks/use-upload-file";
import { useCreateMedia } from "@/app/_hooks/use-create-media";
import { useCreate3dModel } from "@/app/_hooks/use-create-3dmodel";
import { useProducts } from "./use-products";
import { useParams } from "next/navigation";

interface ProductVariant {
    name: string;
    code?: string;
    colorId: number;
    sizeId: number;
    images: File[];
    videos: File[];
    models3d: File[];
}

interface CreateProductParams {
    storeId: number;
    designerId: number;
    categoryId?: number;
    productCode?: string;
    productName: string;
    shortDescription: string;
    fullDescription: string;
    variants: ProductVariant[];
}

export function useCreateProduct() {
    const params = useParams<{ storeId: string }>();
    const storeId = parseInt(params.storeId || "0", 10);


    const supabase = createClient();
    const uploadFile = useUploadFile();
    const createMedia = useCreateMedia();
    const create3dModel = useCreate3dModel();


    const { refetch: refetchProducts } = useProducts({ storeId });

    return useMutation({
        mutationFn: async (productData: CreateProductParams) => {
            try {
                // Generate product code if not provided
                const productCode = productData.productCode || Date.now().toString();

                // Step 1: Create the main product
                const { data: product, error: productError } = await supabase
                    .schema("morpheus")
                    .from("yprod")
                    .insert({
                        yprodcode: productCode,
                        yprodintitule: productData.productName,
                        yprodinfobulle: productData.shortDescription,
                        yproddetailstech: productData.fullDescription,
                        xcategprodidfk: productData.categoryId || null,
                        ydesignidfk: productData.designerId,
                    })
                    .select("*")
                    .single();

                if (productError) {
                    throw new Error(`Failed to create product: ${productError.message}`);
                }

                // Step 2: Create variants
                const createdVariants = [];
                for (const variant of productData.variants) {
                    // Get color and size codes for variant code generation
                    const { data: color } = await supabase
                        .schema("morpheus")
                        .from("xcouleur")
                        .select("xcouleurcode")
                        .eq("xcouleurid", variant.colorId)
                        .single();

                    const { data: size } = await supabase
                        .schema("morpheus")
                        .from("xtaille")
                        .select("xtaillecode")
                        .eq("xtailleid", variant.sizeId)
                        .single();

                    // Generate variant code
                    const variantCode = variant.code || `${productCode}-${color?.xcouleurcode || 'C'}-${size?.xtaillecode || 'S'}`;

                    // Create variant
                    const { data: createdVariant, error: variantError } = await supabase
                        .schema("morpheus")
                        .from("yvarprod")
                        .insert({
                            yvarprodcode: variantCode,
                            yvarprodintitule: variant.name,
                            yvarprodgenre: size?.xtaillecode || 'S', // Set genre to size code as requested
                            xcouleuridfk: variant.colorId,
                            xtailleidfk: variant.sizeId,
                            yprodidfk: product.yprodid,
                            yvarprodnbrjourlivraison: 7, // Default delivery days
                            yvarprodprixcatalogue: 0, // Default price
                        })
                        .select("*")
                        .single();

                    if (variantError) {
                        throw new Error(`Failed to create variant: ${variantError.message}`);
                    }

                    // Handle media uploads for this variant
                    const mediaPromises = [];

                    // Upload images using existing hook
                    for (const imageFile of variant.images) {
                        mediaPromises.push(
                            uploadFile.mutateAsync({ file: imageFile, type: "image" }).then(async (url) => {

                                const mediaData = await createMedia.mutateAsync({
                                    name: `${variant.name} - Image`,
                                    type: "productImage",
                                    url: url,
                                });

                                if (mediaData) {
                                    await supabase
                                        .schema("morpheus")
                                        .from("yvarprodmedia")
                                        .insert({
                                            yvarprodidfk: createdVariant.yvarprodid,
                                            ymediaidfk: mediaData.ymediaid,
                                        });
                                }
                            })
                        );
                    }

                    // Upload videos using existing hook
                    for (const videoFile of variant.videos) {
                        mediaPromises.push(
                            uploadFile.mutateAsync({ file: videoFile, type: "video" }).then(async (url) => {
                                // Create media record using existing hook
                                const mediaData = await createMedia.mutateAsync({
                                    name: `${variant.name} - Video`,
                                    type: "video",
                                    url: url,
                                });

                                if (mediaData) {
                                    // Link media to variant
                                    await supabase
                                        .schema("morpheus")
                                        .from("yvarprodmedia")
                                        .insert({
                                            yvarprodidfk: createdVariant.yvarprodid,
                                            ymediaidfk: mediaData.ymediaid,
                                        });
                                }
                            })
                        );
                    }

                    // Upload 3D models using existing hook
                    for (const modelFile of variant.models3d) {
                        mediaPromises.push(
                            uploadFile.mutateAsync({ file: modelFile, type: "3dmodel" }).then(async (url) => {
                                // Create 3D model record using existing hook
                                await create3dModel.mutateAsync({
                                    url: url,
                                    productVariantId: createdVariant.yvarprodid,
                                });
                            })
                        );
                    }

                    // Wait for all media uploads to complete
                    await Promise.all(mediaPromises);

                    createdVariants.push(createdVariant);
                }

                return {
                    product,
                    variants: createdVariants,
                };
            } catch (error) {
                console.error("Product creation error:", error);
                throw error;
            }
        },
        onSuccess: async () => {
            await refetchProducts();
        },
    });
}
