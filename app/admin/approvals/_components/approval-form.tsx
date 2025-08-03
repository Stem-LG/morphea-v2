"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SuperSelect } from "@/components/super-select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertTriangle, Package, Box, Image as ImageIcon, Loader2, X, RotateCcw, Calendar, Users } from "lucide-react";
import { useApprovalOperations } from "../_hooks/use-approval-operations";
import { useVariantApprovalOperations } from "../_hooks/use-variant-approval-operations";
import { useCategories } from "../../stores/[storeId]/_hooks/use-categories";
import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import Product3DViewer from "@/components/product-3d-viewer";
import { useProduct3DMedia } from "../_hooks/use-product-3d-media";
import { useDesignerEvents, useBoutiqueEvents } from "../_hooks/use-events";
import { useEventValidation } from "../_hooks/use-event-validation";

// Separate component to handle the hook properly
interface VariantApprovalCardProps {
    variant: any;
    index: number;
    product: any;
    formData: any;
    updateVariant: (index: number, field: string, value: any) => void;
    currencyOptions: Array<{ value: number; label: string }>;
    onVariantAction?: (action: 'approve' | 'deny' | 'revision' | 'reset', variantId: number) => void;
}

function VariantApprovalCard({
    variant,
    index,
    product,
    formData,
    updateVariant,
    currencyOptions,
    onVariantAction,
}: VariantApprovalCardProps) {
    const { models3d, images, videos, isLoading } = useProduct3DMedia(variant.yvarprodid);

    const getVariantStatusBadge = () => {
        switch (variant.yvarprodstatut) {
            case "not_approved":
                return (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                        Needs Approval
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "needs_revision":
                return (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Needs Revision
                    </Badge>
                );
            case "denied":
                return (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                        <X className="h-3 w-3 mr-1" />
                        Denied
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-white text-base">{variant.yvarprodintitule}</CardTitle>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                            <span>Color: <span className="text-gray-300">{variant.xcouleur?.xcouleurintitule}</span></span>
                            <span>•</span>
                            <span>Size: <span className="text-gray-300">{variant.xtaille?.xtailleintitule}</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getVariantStatusBadge()}
                    </div>
                </div>
                
                {/* Variant Action Buttons */}
                {onVariantAction && (
                    <div className="flex items-center gap-2 mt-3">
                        {variant.yvarprodstatut === "not_approved" && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onVariantAction('approve', variant.yvarprodid)}
                                    className="h-7 px-2 text-xs border-green-600 text-green-400 hover:bg-green-900/50"
                                >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onVariantAction('revision', variant.yvarprodid)}
                                    className="h-7 px-2 text-xs border-orange-600 text-orange-400 hover:bg-orange-900/50"
                                >
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Revision
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onVariantAction('deny', variant.yvarprodid)}
                                    className="h-7 px-2 text-xs border-red-600 text-red-400 hover:bg-red-900/50"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Deny
                                </Button>
                            </>
                        )}
                        {(variant.yvarprodstatut === "approved" || variant.yvarprodstatut === "denied" || variant.yvarprodstatut === "needs_revision") && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onVariantAction('reset', variant.yvarprodid)}
                                className="h-7 px-2 text-xs border-gray-600 text-gray-400 hover:bg-gray-800/50"
                            >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reset
                            </Button>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Variant Media */}
                {variant.yvarprodmedia && variant.yvarprodmedia.length > 0 && (
                    <div>
                        <Label className="text-gray-300 text-sm mb-2 block">Variant Media</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {variant.yvarprodmedia.map((mediaItem: any, mediaIndex: number) => {
                                const media = mediaItem.ymedia;
                                return (
                                    <div key={mediaIndex} className="relative group">
                                        {media.ymediaboolvideo ? (
                                            // Video preview with controls
                                            <video
                                                src={media.ymediaurl}
                                                controls
                                                className="aspect-square object-cover rounded-lg bg-gray-700"
                                                onError={(e) => {
                                                    // fallback to icon if video fails to load
                                                    const target = e.target as HTMLVideoElement;
                                                    target.poster =
                                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZMMTAuNTg2IDkuNDE0QTIgMiAwIDAxMTMuNDE0IDkuNDE0TDE2IDE2TTYgMjBIMThBMiAyIDAgMDAyMCAxOFY2QTIgMiAwIDAwMTggNEg2QTIgMiAwIDAwNCA2VjE4QTIgMiAwIDAwNiAyMFpNMTUuNSA5LjVBMS41IDEuNSAwIDEwMTMgOEExLjUgMS41IDAgMDAxNS41IDkuNVoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                                                }}
                                            >
                                                {/* fallback for browsers that don't support video */}
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <img
                                                src={media.ymediaurl}
                                                alt={media.ymediaintitule}
                                                className="aspect-square object-cover rounded-lg"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src =
                                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZMMTAuNTg2IDkuNDE0QTIgMiAwIDAxMTMuNDE0IDkuNDE0TDE2IDE2TTYgMjBIMThBMiAyIDAgMDAyMCAxOFY2QTIgMiAwIDAwMTggNEg2QTIgMiAwIDAwNCA2VjE4QTIgMiAwIDAwNiAyMFpNMTUuNSA5LjVBMS41IDEuNSAwIDEwMTMgOEExLjUgMS41IDAgMDAxNS41IDkuNVoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                                                }}
                                            />
                                        )}
                                        <div className="absolute bottom-1 left-1">
                                            <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                                                {media.ymediaboolvideo ? "Video" : "Image"}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3D Viewer for this variant */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-6 text-gray-400">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading 3D media...</span>
                    </div>
                ) : !models3d || models3d.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-gray-400">
                        <Box className="h-8 w-8 mr-2" />
                        <span>No 3D model available for this variant</span>
                    </div>
                ) : (
                    <Product3DViewer
                        modelUrl={models3d[0]}
                        productName={`${product.yprodintitule} - ${variant.yvarprodintitule}`}
                        media={[
                            ...images.map((img: any) => ({
                                id: img.ymediaid,
                                url: img.ymediaurl,
                                title: img.ymediaintitule || "Image",
                                type: "image" as const,
                            })),
                            ...videos.map((vid: any) => ({
                                id: vid.ymediaid,
                                url: vid.ymediaurl,
                                title: vid.ymediaintitule || "Video",
                                type: "video" as const,
                            })),
                        ]}
                        height="300px"
                        showControls={true}
                        autoRotate={false}
                        compact={true}
                        className="border border-gray-600 w-full max-w-full"
                    />
                )}

                {/* No media message */}
                {(!variant.yvarprodmedia || variant.yvarprodmedia.length === 0) &&
                    (!variant.yobjet3d || variant.yobjet3d.length === 0) && (
                        <div className="flex items-center justify-center py-6 text-gray-400">
                            <ImageIcon className="h-8 w-8 mr-2" />
                            <span>No media available for this variant</span>
                        </div>
                    )}

                {/* Pricing Configuration */}
                <div className="border-t border-gray-700 pt-4">
                    <Label className="text-gray-300 text-sm mb-3 block">Pricing Configuration</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-gray-300 text-xs">Catalog Price *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.variants[index]?.yvarprodprixcatalogue || 0}
                                onChange={(e) =>
                                    updateVariant(index, "yvarprodprixcatalogue", parseFloat(e.target.value) || 0)
                                }
                                className="bg-gray-700 border-gray-600 text-white text-sm"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-300 text-xs">Promotion Price</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.variants[index]?.yvarprodprixpromotion || ""}
                                onChange={(e) =>
                                    updateVariant(
                                        index,
                                        "yvarprodprixpromotion",
                                        parseFloat(e.target.value) || undefined
                                    )
                                }
                                className="bg-gray-700 border-gray-600 text-white text-sm"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-300 text-xs">Delivery Days *</Label>
                            <Input
                                type="number"
                                value={formData.variants[index]?.yvarprodnbrjourlivraison || 0}
                                onChange={(e) =>
                                    updateVariant(index, "yvarprodnbrjourlivraison", parseInt(e.target.value) || 0)
                                }
                                className="bg-gray-700 border-gray-600 text-white text-sm"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-300 text-xs">Currency *</Label>
                            <SuperSelect
                                value={formData.variants[index]?.currencyId || 0}
                                onValueChange={(value) => updateVariant(index, "currencyId", value as number)}
                                options={currencyOptions}
                                placeholder="Select currency"
                                className="bg-gray-700 border-gray-600 text-sm"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                            <Label className="text-gray-300 text-xs">Promotion Start</Label>
                            <Input
                                type="date"
                                value={formData.variants[index]?.yvarprodpromotiondatedeb || ""}
                                onChange={(e) =>
                                    updateVariant(index, "yvarprodpromotiondatedeb", e.target.value || undefined)
                                }
                                className="bg-gray-700 border-gray-600 text-white text-sm"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-300 text-xs">Promotion End</Label>
                            <Input
                                type="date"
                                value={formData.variants[index]?.yvarprodpromotiondatefin || ""}
                                onChange={(e) =>
                                    updateVariant(index, "yvarprodpromotiondatefin", e.target.value || undefined)
                                }
                                className="bg-gray-700 border-gray-600 text-white text-sm"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface ApprovalFormData {
    categoryId: number;
    infoactionId?: number;
    selectedEventId?: number;
    variants: Array<{
        yvarprodid: number;
        yvarprodprixcatalogue: number;
        yvarprodprixpromotion?: number;
        yvarprodpromotiondatedeb?: string;
        yvarprodpromotiondatefin?: string;
        yvarprodnbrjourlivraison: number;
        currencyId: number;
    }>;
}

interface ApprovalFormProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: number;
}

export function ApprovalForm({ isOpen, onClose, productId }: ApprovalFormProps) {
    const [formData, setFormData] = useState<ApprovalFormData>({
        categoryId: 0,
        infoactionId: undefined,
        selectedEventId: undefined,
        variants: [],
    });
    const { approveProduct, markNeedsRevision, denyProduct, isLoading } = useApprovalOperations();
    const {
        approveVariant,
        markVariantNeedsRevision,
        denyVariant,
        resetVariantStatus,
        bulkApproveVariants,
        isLoading: variantLoading
    } = useVariantApprovalOperations();
    const { data: categories } = useCategories();
    const supabase = createClient();

    // Fetch product details
    const { data: product, isLoading: productLoading } = useQuery({
        queryKey: ["product-details-approval", productId],
        queryFn: async () => {
            if (!productId) return null;

            const { data, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select(
                    `
                    *,
                    yvarprod(
                        *,
                        xcouleur(*),
                        xtaille(*),
                        xdevise(*),
                        yobjet3d(*),
                        yvarprodmedia(
                            ymedia:ymediaidfk(*)
                        )
                    ),
                    ydetailsevent(
                        *,
                        yboutique:yboutiqueidfk(*),
                        ydesign:ydesignidfk(*)
                    )
                `
                )
                .eq("yprodid", productId)
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        enabled: !!productId && isOpen,
    });

    // Fetch currencies
    const { data: currencies } = useQuery({
        queryKey: ["currencies"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("*")
                .order("xdeviseintitule");

            if (error) throw new Error(error.message);
            return data;
        },
        enabled: isOpen,
    });

    // Extract designer and boutique IDs from product data
    const designerId = product?.ydesignidfk || null;
    const boutiqueId = product?.ydetailsevent?.[0]?.yboutiqueidfk || null;

    console.log('Product designer/boutique extraction:', {
        productDesignerId: product?.ydesignidfk,
        productYdetailsevent: product?.ydetailsevent,
        extractedDesignerId: designerId,
        extractedBoutiqueId: boutiqueId
    });

    // Fetch available events for the designer and boutique
    const { data: designerEvents } = useDesignerEvents(designerId, {
        onlyWithRegistrations: true,
        onlyActiveEvents: true,
        enabled: !!designerId && isOpen
    });

    const { data: boutiqueEvents } = useBoutiqueEvents(boutiqueId, {
        onlyWithRegistrations: true,
        onlyActiveEvents: true,
        enabled: !!boutiqueId && isOpen
    });

    // Event validation for selected event
    const { data: eventValidation } = useEventValidation(
        formData.selectedEventId || null,
        designerId,
        boutiqueId
    );

    // Fetch info actions
    const { data: infoActions } = useQuery({
        queryKey: ["info-actions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("yinfospotactions")
                .select("*")
                .order("yinfospotactionstitle");

            if (error) throw new Error(error.message);
            return data;
        },
        enabled: isOpen,
    });

    // Update form when product data loads
    useEffect(() => {
        if (product && currencies && currencies.length > 0) {
            const defaultCurrencyId = currencies[0]?.xdeviseid || 1;
            
            setFormData({
                categoryId: product.xcategprodidfk || 0,
                infoactionId: product.yinfospotactionsidfk || undefined,
                selectedEventId: undefined,
                variants:
                    product.yvarprod?.map((variant: any) => ({
                        yvarprodid: variant.yvarprodid,
                        yvarprodprixcatalogue: Number(variant.yvarprodprixcatalogue) || 1, // Default to 1 instead of 0
                        yvarprodprixpromotion: variant.yvarprodprixpromotion ? Number(variant.yvarprodprixpromotion) : undefined,
                        yvarprodpromotiondatedeb: variant.yvarprodpromotiondatedeb || undefined,
                        yvarprodpromotiondatefin: variant.yvarprodpromotiondatefin || undefined,
                        yvarprodnbrjourlivraison: Number(variant.yvarprodnbrjourlivraison) || 1, // Default to 1 instead of 0
                        currencyId: Number(variant.xdeviseidfk) || defaultCurrencyId,
                    })) || [],
            });
        }
    }, [product, currencies]);

    const updateFormData = (field: keyof ApprovalFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateVariant = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant)),
        }));
    };

    const handleMarkNeedsRevision = async () => {
        if (!productId) return;

        try {
            await markNeedsRevision.mutateAsync(productId);
            onClose();
        } catch {
            // Error is handled by the mutation
        }
    };

    const handleConfirm = async () => {
        if (!productId || !product) return;

        try {
            // Check if at least one variant is approved
            const approvedVariants = product.yvarprod?.filter((v: any) => v.yvarprodstatut === 'approved') || [];
            
            if (approvedVariants.length === 0) {
                throw new Error('At least one variant must be approved before approving the product');
            }

            await approveProduct.mutateAsync({
                productId,
                approvalData: formData,
            });
            onClose();
        } catch (error: any) {
            console.error('Product approval error:', error);
            // The error will be shown via toast from the mutation
        }
    };

    const handleDeny = async () => {
        if (!productId) return;

        try {
            await denyProduct.mutateAsync(productId);
            onClose();
        } catch {
            // Error is handled by the mutation
        }
    };

    const handleVariantAction = async (action: 'approve' | 'deny' | 'revision' | 'reset', variantId: number) => {
        const variantIndex = formData.variants.findIndex(v => v.yvarprodid === variantId);
        
        try {
            switch (action) {
                case 'approve':
                    if (variantIndex >= 0) {
                        const variantData = formData.variants[variantIndex];
                        
                        // Validate required fields with more lenient checks
                        const catalogPrice = Number(variantData.yvarprodprixcatalogue) || 0;
                        const deliveryDays = Number(variantData.yvarprodnbrjourlivraison) || 0;
                        const currencyId = Number(variantData.currencyId) || 0;
                        
                        if (catalogPrice <= 0) {
                            throw new Error('Please set a catalog price greater than 0');
                        }
                        if (deliveryDays <= 0) {
                            throw new Error('Please set delivery days greater than 0');
                        }
                        if (currencyId <= 0) {
                            throw new Error('Please select a currency');
                        }
                        
                        await approveVariant.mutateAsync({
                            variantId,
                            approvalData: {
                                yvarprodprixcatalogue: catalogPrice,
                                yvarprodprixpromotion: variantData.yvarprodprixpromotion ? Number(variantData.yvarprodprixpromotion) : undefined,
                                yvarprodpromotiondatedeb: variantData.yvarprodpromotiondatedeb,
                                yvarprodpromotiondatefin: variantData.yvarprodpromotiondatefin,
                                yvarprodnbrjourlivraison: deliveryDays,
                                currencyId: currencyId,
                            }
                        });
                    } else {
                        throw new Error('Variant data not found');
                    }
                    break;
                case 'deny':
                    await denyVariant.mutateAsync(variantId);
                    break;
                case 'revision':
                    await markVariantNeedsRevision.mutateAsync(variantId);
                    break;
                case 'reset':
                    await resetVariantStatus.mutateAsync(variantId);
                    break;
            }
        } catch (error: any) {
            // Show specific error message
            console.error('Variant action error:', error);
        }
    };

    const handleBulkApproveVariants = async () => {
        if (!productId || !product?.yvarprod) return;

        const pendingVariants = product.yvarprod
            .filter((variant: any) => variant.yvarprodstatut === 'not_approved')
            .map((variant: any) => {
                const variantIndex = formData.variants.findIndex(v => v.yvarprodid === variant.yvarprodid);
                if (variantIndex >= 0) {
                    const variantData = formData.variants[variantIndex];
                    
                    // Validate each variant before bulk approval
                    const catalogPrice = Number(variantData.yvarprodprixcatalogue) || 0;
                    const deliveryDays = Number(variantData.yvarprodnbrjourlivraison) || 0;
                    const currencyId = Number(variantData.currencyId) || 0;
                    
                    if (catalogPrice <= 0 || deliveryDays <= 0 || currencyId <= 0) {
                        throw new Error(`Variant ${variant.yvarprodintitule} has incomplete pricing information`);
                    }
                    
                    return {
                        variantId: variant.yvarprodid,
                        approvalData: {
                            yvarprodprixcatalogue: catalogPrice,
                            yvarprodprixpromotion: variantData.yvarprodprixpromotion ? Number(variantData.yvarprodprixpromotion) : undefined,
                            yvarprodpromotiondatedeb: variantData.yvarprodpromotiondatedeb,
                            yvarprodpromotiondatefin: variantData.yvarprodpromotiondatefin,
                            yvarprodnbrjourlivraison: deliveryDays,
                            currencyId: currencyId,
                        }
                    };
                }
                return null;
            })
            .filter(Boolean);

        if (pendingVariants.length > 0) {
            try {
                await bulkApproveVariants.mutateAsync({
                    variantApprovals: pendingVariants
                });
            } catch (error: any) {
                console.error('Bulk approval error:', error);
            }
        }
    };

    // Get status badge
    const getStatusBadge = () => {
        if (!product) return null;

        const approvedVariants = product.yvarprod?.filter((v: any) => v.yvarprodstatut === 'approved') || [];
        const hasApprovedVariants = approvedVariants.length > 0;

        if (product.yprodstatut === "not_approved") {
            return (
                <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Pending Approval
                    </Badge>
                    {!hasApprovedVariants && (
                        <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                            Needs approved variants
                        </Badge>
                    )}
                </div>
            );
        } else if (product.yprodstatut === "needs_revision") {
            return (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Needs Revision
                </Badge>
            );
        } else if (product.yvarprod?.some((v: any) => v.yvarprodstatut === "not_approved")) {
            return (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    <Package className="h-3 w-3 mr-1" />
                    Variant Approval Required
                </Badge>
            );
        }
        return null;
    };

    // Check if product can be approved (at least one variant must be approved + event validation if event selected)
    const canApproveProduct = () => {
        if (!product?.yvarprod) return false;
        
        // At least one variant must be approved
        const hasApprovedVariants = product.yvarprod.some((v: any) => v.yvarprodstatut === 'approved');
        if (!hasApprovedVariants) return false;
        
        // Check if there are available events for this designer/boutique combination
        const availableEvents = [
            ...(designerEvents?.data || [])
                .filter(event => event.registrationCount && event.registrationCount > 0),
            ...(boutiqueEvents?.data || [])
                .filter(event =>
                    event.registrationCount &&
                    event.registrationCount > 0 &&
                    !(designerEvents?.data || []).some(de => de.yeventid === event.yeventid)
                )
        ];
        
        const hasAvailableEvents = availableEvents.length > 0;
        
        // If there are available events, an event must be selected
        if (hasAvailableEvents && !formData.selectedEventId) {
            return false;
        }
        
        // If an event is selected, it must be valid
        if (formData.selectedEventId) {
            return eventValidation?.isValid === true;
        }
        
        // If no events are available, product can be approved without event selection
        return true;
    };

    // Get approval button tooltip text
    const getApprovalButtonTooltip = () => {
        if (!product?.yvarprod) return "No variants available";
        
        const hasApprovedVariants = product.yvarprod.some((v: any) => v.yvarprodstatut === 'approved');
        if (!hasApprovedVariants) return "At least one variant must be approved first";
        
        // Check if there are available events for this designer/boutique combination
        const availableEvents = [
            ...(designerEvents?.data || [])
                .filter(event => event.registrationCount && event.registrationCount > 0),
            ...(boutiqueEvents?.data || [])
                .filter(event =>
                    event.registrationCount &&
                    event.registrationCount > 0 &&
                    !(designerEvents?.data || []).some(de => de.yeventid === event.yeventid)
                )
        ];
        
        const hasAvailableEvents = availableEvents.length > 0;
        
        // If there are available events but none is selected, require event selection
        if (hasAvailableEvents && !formData.selectedEventId) {
            return "An event must be selected for approval";
        }
        
        // If no events are available, show appropriate message
        if (!hasAvailableEvents) {
            return "No active events available for this designer/boutique combination";
        }
        
        if (formData.selectedEventId && eventValidation && !eventValidation.isValid) {
            return eventValidation.message || "Selected event is not valid for approval";
        }
        
        return formData.selectedEventId ? "Approve product for selected event" : "Approve product";
    };

    // Prepare options
    const categoryOptions =
        categories?.map((cat) => ({
            value: cat.xcategprodid,
            label: cat.xcategprodintitule,
        })) || [];

    const currencyOptions =
        currencies?.map((currency) => ({
            value: currency.xdeviseid,
            label: `${currency.xdeviseintitule} (${currency.xdevisecodealpha})`,
        })) || [];

    const infoActionOptions =
        infoActions?.map((action) => ({
            value: action.yinfospotactionsid,
            label: action.yinfospotactionstitle,
        })) || [];

    if (productLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogTitle>Loading...</DialogTitle>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-morpheus-gold-light border-t-transparent" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] bg-gray-900 border-gray-700 p-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl text-white">
                                Product Audit: {product.yprodintitule}
                            </DialogTitle>
                            <p className="text-sm text-gray-400 font-mono mt-1">{product.yprodcode}</p>
                        </div>
                        <div className="flex items-center gap-2">{getStatusBadge()}</div>
                    </div>
                </DialogHeader>

                <div className="flex h-[calc(95vh-180px)]">
                    {/* Left Panel - Product Info & Settings */}
                    <div className="w-1/2 border-r border-gray-700">
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-6">
                                {/* Basic Information */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg">Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <Label className="text-gray-300">Product Name</Label>
                                                <Input
                                                    value={product.yprodintitule || ""}
                                                    disabled
                                                    className="bg-gray-700 border-gray-600 text-gray-300"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">Product Code</Label>
                                                <Input
                                                    value={product.yprodcode || ""}
                                                    disabled
                                                    className="bg-gray-700 border-gray-600 text-gray-300 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-gray-300">Technical Details</Label>
                                            <textarea
                                                value={product.yproddetailstech || ""}
                                                disabled
                                                className="w-full h-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 resize-none text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-gray-300">Info Bubble</Label>
                                            <textarea
                                                value={product.yprodinfobulle || ""}
                                                disabled
                                                className="w-full h-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 resize-none text-sm"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Approval Settings */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg">Approval Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-gray-300">Category *</Label>
                                            <SuperSelect
                                                value={formData.categoryId}
                                                onValueChange={(value) => updateFormData("categoryId", value as number)}
                                                options={categoryOptions}
                                                placeholder="Select category"
                                                className="bg-gray-700 border-gray-600"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-gray-300">Info Action</Label>
                                            <SuperSelect
                                                value={formData.infoactionId || "none"}
                                                onValueChange={(value) =>
                                                    updateFormData(
                                                        "infoactionId",
                                                        value === "none" ? undefined : (value as number)
                                                    )
                                                }
                                                options={[{ value: "none", label: "No action" }, ...infoActionOptions]}
                                                placeholder="Select info action"
                                                className="bg-gray-700 border-gray-600"
                                            />
                                        </div>

                                        {/* Event Selection Section */}
                                        {(designerId || boutiqueId) && (
                                            <div className="space-y-4 border-t border-gray-600 pt-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <Label className="text-gray-300 font-medium">Event Selection</Label>
                                                </div>
                                                
                                                <div>
                                                    {(() => {
                                                        // Check if there are available events
                                                        const availableEvents = [
                                                            ...(designerEvents?.data || [])
                                                                .filter(event => event.registrationCount && event.registrationCount > 0),
                                                            ...(boutiqueEvents?.data || [])
                                                                .filter(event =>
                                                                    event.registrationCount &&
                                                                    event.registrationCount > 0 &&
                                                                    !(designerEvents?.data || []).some(de => de.yeventid === event.yeventid)
                                                                )
                                                        ];
                                                        const hasAvailableEvents = availableEvents.length > 0;
                                                        
                                                        return (
                                                            <>
                                                                <div className="flex items-center gap-2">
                                                                    <Label className="text-gray-300 text-sm">
                                                                        Available Events
                                                                        {hasAvailableEvents && (
                                                                            <span className="text-red-400 ml-1">*</span>
                                                                        )}
                                                                    </Label>
                                                                    {hasAvailableEvents && (
                                                                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                                                            Required
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <SuperSelect
                                                                    value={formData.selectedEventId || "none"}
                                                                    onValueChange={(value) =>
                                                                        updateFormData(
                                                                            "selectedEventId",
                                                                            value === "none" ? undefined : (value as number)
                                                                        )
                                                                    }
                                                                    options={[
                                                                        {
                                                                            value: "none",
                                                                            label: hasAvailableEvents ? "Select an event (required)" : "No event selected"
                                                                        },
                                                                        ...(designerEvents?.data || [])
                                                                            .filter(event => event.registrationCount && event.registrationCount > 0)
                                                                            .map(event => ({
                                                                                value: event.yeventid,
                                                                                label: `${event.yeventintitule} (${event.registrationCount} registrations, ${event.assignmentCount} assignments)`
                                                                            })) || [],
                                                                        ...(boutiqueEvents?.data || [])
                                                                            .filter(event =>
                                                                                event.registrationCount &&
                                                                                event.registrationCount > 0 &&
                                                                                !(designerEvents?.data || []).some(de => de.yeventid === event.yeventid)
                                                                            )
                                                                            .map(event => ({
                                                                                value: event.yeventid,
                                                                                label: `${event.yeventintitule} (${event.registrationCount} registrations, ${event.assignmentCount} assignments)`
                                                                            })) || []
                                                                    ]}
                                                                    placeholder={hasAvailableEvents ? "Select an event (required)" : "Select an event"}
                                                                    className={`bg-gray-700 border-gray-600 ${hasAvailableEvents && !formData.selectedEventId ? 'border-red-500/50' : ''}`}
                                                                />
                                                                {hasAvailableEvents && !formData.selectedEventId && (
                                                                    <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
                                                                        <AlertTriangle className="h-3 w-3" />
                                                                        <span>Event selection is required for product approval</span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Event Validation Display */}
                                                {formData.selectedEventId && eventValidation && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            {eventValidation.isValid ? (
                                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                            ) : (
                                                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                                            )}
                                                            <span className={`text-sm ${eventValidation.isValid ? 'text-green-400' : 'text-red-400'}`}>
                                                                {eventValidation.message}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* No events available message */}
                                                {(!designerEvents?.data?.length && !boutiqueEvents?.data?.length) && (
                                                    <div className="text-sm text-gray-400 bg-gray-800/30 rounded-lg p-3">
                                                        No active events with registrations found for this designer/boutique combination.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel - Variants with Media */}
                    <div className="w-1/2">
                        <ScrollArea className="h-full">
                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Product Variants ({product.yvarprod?.length || 0})
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Review and configure each variant with its media and pricing
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Bulk Actions */}
                                    {product.yvarprod?.some((v: any) => v.yvarprodstatut === 'not_approved') && (
                                        <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                                            <span className="text-sm text-gray-300">Bulk Actions:</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleBulkApproveVariants}
                                                disabled={variantLoading}
                                                className="h-7 px-2 text-xs border-green-600 text-green-400 hover:bg-green-900/50"
                                            >
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Approve All Pending
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {product.yvarprod?.map((variant: any, index: number) => (
                                        <VariantApprovalCard
                                            key={variant.yvarprodid}
                                            variant={variant}
                                            index={index}
                                            product={product}
                                            formData={formData}
                                            updateVariant={updateVariant}
                                            currencyOptions={currencyOptions}
                                            onVariantAction={handleVariantAction}
                                        />
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-gray-700 flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading || variantLoading}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDeny}
                        disabled={isLoading || variantLoading}
                        className="border-red-600 text-red-400 hover:bg-red-900/50"
                    >
                        Deny
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleMarkNeedsRevision}
                        disabled={isLoading || variantLoading}
                        className="border-orange-600 text-orange-400 hover:bg-orange-900/50"
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Ask for Revision
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading || variantLoading || !canApproveProduct()}
                        className={`${
                            canApproveProduct()
                                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                                : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                        title={getApprovalButtonTooltip()}
                    >
                        {isLoading || variantLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Confirming...
                            </div>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {canApproveProduct()
                                    ? (formData.selectedEventId ? "Approve for Event" : "Approve Product")
                                    : "Cannot Approve"
                                }
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
