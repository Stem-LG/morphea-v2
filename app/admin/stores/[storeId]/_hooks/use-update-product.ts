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
    // Jewelry fields - used when product is jewelry
    typebijouxId?: string | null; // Type of jewelry ID
    materiauxId?: string | null; // Materials ID
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
    // Track deleted media for proper database updates
    deletedImages?: number[]; // Array of ymediaid to delete
    deletedVideos?: number[]; // Array of ymediaid to delete
    deletedModels3d?: number[]; // Array of yobjet3did to delete
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
    isJewelryProduct?: boolean; // Explicit jewelry flag from UI
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
                // Determine if this is a jewelry product
                // Use explicit flag if provided, otherwise auto-detect from variants
                const isJewelryProduct = productData.isJewelryProduct !== undefined 
                    ? productData.isJewelryProduct
                    : productData.variants.some(variant => 
                        variant.typebijouxId || variant.materiauxId
                    );

                console.log("Updating product with infospotaction:", {
                    productId: productData.productId,
                    infospotactionId: productData.infospotactionId,
                    isJewelryProduct
                });

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
                        yprodestbijoux: isJewelryProduct,
                        yinfospotactionsidfk: productData.infospotactionId || null,
                    })
                    .eq("yprodid", productData.productId)
                    .select("*")
                    .single();

                if (productError) {
                    throw new Error(`Failed to update product: ${productError.message}`);
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

        // Determine if this is a jewelry variant
        const isJewelryVariant = variant.typebijouxId || variant.materiauxId;

        console.log("Creating variant with jewelry data:", {
            name: variant.name,
            typebijouxId: variant.typebijouxId,
            materiauxId: variant.materiauxId,
            isJewelryVariant
        });

        const insertData: any = {
            yvarprodcode: variantCode,
            yvarprodintitule: variant.name,
            yvarprodgenre: size?.xtaillecode || 'S',
            yprodidfk: productId,
            yvarprodnbrjourlivraison: 7,
            yvarprodprixcatalogue: variant.catalogPrice || 0,
        };

        // Handle color/size vs jewelry fields based on variant type
        if (isJewelryVariant) {
            // For jewelry variants, set color/size to null and use jewelry fields
            insertData.xcouleuridfk = null;
            insertData.xtailleidfk = null;
            insertData.xtypebijouxidfk = variant.typebijouxId || null;
            insertData.xmatrieauxidfk = variant.materiauxId || null;
        } else {
            // For regular variants, use color/size and clear jewelry fields
            insertData.xcouleuridfk = variant.colorId;
            insertData.xtailleidfk = variant.sizeId;
            insertData.xtypebijouxidfk = null;
            insertData.xmatrieauxidfk = null;
        }

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
        };

        // Handle color/size vs jewelry fields based on product type
        // We need to determine if this is a jewelry product from the variant data
        const isJewelryVariant = variant.typebijouxId || variant.materiauxId;
        
        console.log("Updating variant with jewelry data:", {
            name: variant.name,
            typebijouxId: variant.typebijouxId,
            materiauxId: variant.materiauxId,
            isJewelryVariant
        });
        
        if (isJewelryVariant) {
            // For jewelry products, set color/size to null and use jewelry fields
            updateData.xcouleuridfk = null;
            updateData.xtailleidfk = null;
            updateData.xtypebijouxidfk = variant.typebijouxId || null;
            updateData.xmatrieauxidfk = variant.materiauxId || null;
        } else {
            // For regular products, use color/size and clear jewelry fields
            updateData.xcouleuridfk = variant.colorId;
            updateData.xtailleidfk = variant.sizeId;
            updateData.xtypebijouxidfk = null;
            updateData.xmatrieauxidfk = null;
        }

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

        // First, delete any media that was marked for deletion
        if (variant.deletedImages && variant.deletedImages.length > 0) {
            for (const mediaId of variant.deletedImages) {
                mediaPromises.push(
                    supabase
                        .schema("morpheus")
                        .from("yvarprodmedia")
                        .delete()
                        .eq("ymediaidfk", mediaId)
                        .eq("yvarprodidfk", variantId)
                );
            }
        }

        if (variant.deletedVideos && variant.deletedVideos.length > 0) {
            for (const mediaId of variant.deletedVideos) {
                mediaPromises.push(
                    supabase
                        .schema("morpheus")
                        .from("yvarprodmedia")
                        .delete()
                        .eq("ymediaidfk", mediaId)
                        .eq("yvarprodidfk", variantId)
                );
            }
        }

        if (variant.deletedModels3d && variant.deletedModels3d.length > 0) {
            for (const modelId of variant.deletedModels3d) {
                mediaPromises.push(
                    supabase
                        .schema("morpheus")
                        .from("yobjet3d")
                        .delete()
                        .eq("yobjet3did", modelId)
                );
            }
        }

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