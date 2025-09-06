"use client";

import { createClient } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUploadFile } from "@/app/_hooks/use-upload-file";
import { useCreateMedia } from "@/app/_hooks/use-create-media";
import { useCreate3dModel } from "@/app/_hooks/use-create-3dmodel";

interface ProductVariant {
    id?: string; // For UI tracking
    yvarprodid?: number; // Existing variant ID
    name: string;
    code?: string;
    colorId: number;
    sizeId: number;
    yvarprodcaract?: string | null; // Product characteristics
    images: (File | { ymediaid: number; ymediaurl: string; ymediaintitule: string })[];
    videos: (File | { ymediaid: number; ymediaurl: string; ymediaintitule: string })[];
    models3d: (File | { yobjet3did: number; yobjet3durl: string })[];
    backgroundColor?: string; // Hex color for 3D model background
    isDeleted?: boolean; // Mark for deletion
    // Pricing fields
    catalogPrice?: number;
    promotionPrice?: number | null;
    promotionStartDate?: string | null;
    promotionEndDate?: string | null;
    currencyId?: number | null;
}

interface UpdateProductParams {
    productId: number;
    storeId: number;
    designerId: number;
    categoryId?: number;
    productCode?: string;
    productName: string;
    shortDescription: string;
    fullDescription: string;
    variants: ProductVariant[];
    infospotactionId?: number;
    eventId?: number;
}

export function useUpdateProduct() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const uploadFile = useUploadFile();
    const createMedia = useCreateMedia();
    const create3dModel = useCreate3dModel();

    return useMutation({
        mutationFn: async (productData: UpdateProductParams) => {
            try {
                // Step 1: Update the main product
                const { data: product, error: productError } = await supabase
                    .schema("morpheus")
                    .from("yprod")
                    .update({
                        yprodcode: productData.productCode || Date.now().toString(),
                        yprodintitule: productData.productName,
                        yprodinfobulle: productData.shortDescription,
                        yproddetailstech: productData.fullDescription,
                        xcategprodidfk: productData.categoryId || null,
                        ydesignidfk: productData.designerId,
                    })
                    .eq("yprodid", productData.productId)
                    .select("*")
                    .single();

                if (productError) {
                    throw new Error(`Failed to update product: ${productError.message}`);
                }

                // Step 1.5: Update infospotaction in product if provided
                if (productData.infospotactionId !== undefined) {
                    const { error: infospotActionError } = await supabase
                        .schema("morpheus")
                        .from("yprod")
                        .update({
                            yinfospotactionsidfk: productData.infospotactionId,
                        })
                        .eq("yprodid", productData.productId);

                    if (infospotActionError) {
                        console.warn(`Failed to update infospotaction: ${infospotActionError.message}`);
                    }
                }

                // Step 2: Handle variants
                const updatedVariants = [];

                for (const variant of productData.variants) {
                    if (variant.isDeleted && variant.yvarprodid) {
                        // Delete existing variant
                        await deleteVariant(variant.yvarprodid);
                        continue;
                    }

                    let variantRecord;

                    if (variant.yvarprodid) {
                        // Update existing variant
                        variantRecord = await updateVariant(variant);
                    } else {
                        // Create new variant
                        variantRecord = await createVariant(variant, productData.productId);
                    }

                    // Handle media updates for this variant
                    await handleVariantMedia(variant, variantRecord.yvarprodid);

                    updatedVariants.push(variantRecord);
                }

                return {
                    product,
                    variants: updatedVariants,
                };
            } catch (error) {
                console.error("Product update error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product-details"] });
        },
    });

    async function createVariant(variant: ProductVariant, productId: number) {
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
        const variantCode = variant.code || `${Date.now()}-${color?.xcouleurcode || 'C'}-${size?.xtaillecode || 'S'}`;

        const insertData: any = {
            yvarprodcode: variantCode,
            yvarprodintitule: variant.name,
            yvarprodgenre: size?.xtaillecode || 'S',
            xcouleuridfk: variant.colorId,
            xtailleidfk: variant.sizeId,
            yvarprodcaract: variant.yvarprodcaract, // Product characteristics
            yprodidfk: productId,
            yvarprodnbrjourlivraison: 7,
            yvarprodprixcatalogue: variant.catalogPrice || 0,
        };

        // Add pricing data if provided
        if (variant.promotionPrice !== undefined) {
            insertData.yvarprodprixpromotion = variant.promotionPrice;
        }
        if (variant.promotionStartDate !== undefined) {
            insertData.yvarprodpromotiondatedeb = variant.promotionStartDate;
        }
        if (variant.promotionEndDate !== undefined) {
            insertData.yvarprodpromotiondatefin = variant.promotionEndDate;
        }
        if (variant.currencyId !== undefined) {
            insertData.xdeviseidfk = variant.currencyId;
        }

        const { data: createdVariant, error: variantError } = await supabase
            .schema("morpheus")
            .from("yvarprod")
            .insert(insertData)
            .select("*")
            .single();

        if (variantError) {
            throw new Error(`Failed to create variant: ${variantError.message}`);
        }

        return createdVariant;
    }

    async function updateVariant(variant: ProductVariant) {
        const updateData: any = {
            yvarprodintitule: variant.name,
            yvarprodcode: variant.code,
            xcouleuridfk: variant.colorId,
            xtailleidfk: variant.sizeId,
            yvarprodcaract: variant.yvarprodcaract, // Product characteristics
        };

        // Add pricing data if provided
        if (variant.catalogPrice !== undefined) {
            updateData.yvarprodprixcatalogue = variant.catalogPrice;
        }
        if (variant.promotionPrice !== undefined) {
            updateData.yvarprodprixpromotion = variant.promotionPrice;
        }
        if (variant.promotionStartDate !== undefined) {
            updateData.yvarprodpromotiondatedeb = variant.promotionStartDate;
        }
        if (variant.promotionEndDate !== undefined) {
            updateData.yvarprodpromotiondatefin = variant.promotionEndDate;
        }
        if (variant.currencyId !== undefined) {
            updateData.xdeviseidfk = variant.currencyId;
        }

        const { data: updatedVariant, error: variantError } = await supabase
            .schema("morpheus")
            .from("yvarprod")
            .update(updateData)
            .eq("yvarprodid", variant.yvarprodid!)
            .select("*")
            .single();

        if (variantError) {
            throw new Error(`Failed to update variant: ${variantError.message}`);
        }

        return updatedVariant;
    }

    async function deleteVariant(variantId: number) {
        // Delete variant media links
        await supabase
            .schema("morpheus")
            .from("yvarprodmedia")
            .delete()
            .eq("yvarprodidfk", variantId);

        // Delete 3D models
        await supabase
            .schema("morpheus")
            .from("yobjet3d")
            .delete()
            .eq("yvarprodidfk", variantId);

        // Delete variant
        const { error: variantError } = await supabase
            .schema("morpheus")
            .from("yvarprod")
            .delete()
            .eq("yvarprodid", variantId);

        if (variantError) {
            throw new Error(`Failed to delete variant: ${variantError.message}`);
        }
    }

    async function handleVariantMedia(variant: ProductVariant, variantId: number) {
        const mediaPromises = [];

        // Handle images
        for (const image of variant.images) {
            if (image instanceof File) {

                mediaPromises.push(
                    uploadFile.mutateAsync({ file: image, type: "image" }).then(async (url) => {
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
                                    yvarprodidfk: variantId,
                                    ymediaidfk: mediaData.ymediaid,
                                });
                        }
                    })
                );
            }
        }

        for (const video of variant.videos) {
            if (video instanceof File) {
                // New video file - upload and create media record
                mediaPromises.push(
                    uploadFile.mutateAsync({ file: video, type: "video" }).then(async (url) => {
                        const mediaData = await createMedia.mutateAsync({
                            name: `${variant.name} - Video`,
                            type: "video",
                            url: url,
                        });

                        if (mediaData) {
                            await supabase
                                .schema("morpheus")
                                .from("yvarprodmedia")
                                .insert({
                                    yvarprodidfk: variantId,
                                    ymediaidfk: mediaData.ymediaid,
                                });
                        }
                    })
                );
            }
        }

        for (const model of variant.models3d) {
            if (model instanceof File) {
                // New 3D model file - upload and create record
                mediaPromises.push(
                    uploadFile.mutateAsync({ file: model, type: "3dmodel" }).then(async (url) => {
                        await create3dModel.mutateAsync({
                            url: url,
                            productVariantId: variantId,
                            backgroundColor: variant.backgroundColor,
                        });
                    })
                );
            } else {
                // Existing 3D model - update background color if provided
                if (variant.backgroundColor !== undefined) {
                    mediaPromises.push(
                        supabase
                            .schema("morpheus")
                            .from("yobjet3d")
                            .update({
                                ycouleurarriereplan: variant.backgroundColor
                            })
                            .eq("yobjet3did", model.yobjet3did)
                            .then(({ error }) => {
                                if (error) {
                                    console.error(`Failed to update 3D model background color: ${error.message}`);
                                    throw error;
                                }
                                console.log(`Successfully updated background color for 3D model ${model.yobjet3did} to ${variant.backgroundColor}`);
                            })
                    );
                }
            }
        }

        await Promise.all(mediaPromises);
    }
}