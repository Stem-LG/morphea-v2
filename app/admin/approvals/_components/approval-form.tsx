"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    CheckCircle,
    X,
    AlertTriangle,
    Package,
    Image as ImageIcon,
    Loader2,
    Calendar,
    Store,
    User,
    MapPin,
    Settings,
} from "lucide-react";
import { useApprovalOperations } from "../_hooks/use-approval-operations";
import { useVariantApprovalOperations } from "../_hooks/use-variant-approval-operations";
import { useCategories } from "../../stores/[storeId]/_hooks/use-categories";
import { useInfospotactions } from "../_hooks/use-infospotactions";
import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { Model3DViewer } from "./three-d-viewer";
import { useAuth } from "@/hooks/useAuth";

// Variant Card Component
interface VariantCardProps {
    variant: any;
    onApprove: (promotionData?: any) => void;
    onReject: () => void;
    isLoading: boolean;
}

function VariantCard({ variant, onApprove, onReject, isLoading }: VariantCardProps) {
    const [showPromotionForm, setShowPromotionForm] = useState(false);
    const [promotionPrice, setPromotionPrice] = useState(variant.yvarprodprixpromotion || "");
    const [promotionStartDate, setPromotionStartDate] = useState(variant.yvarprodpromotiondatedeb || "");
    const [promotionEndDate, setPromotionEndDate] = useState(variant.yvarprodpromotiondatefin || "");
    const [catalogPrice, setCatalogPrice] = useState(variant.yvarprodprixcatalogue || "");
    const [selectedCurrencyId, setSelectedCurrencyId] = useState(variant.xdeviseidfk || 1);

    const supabase = createClient();

    // Fetch currencies
    const { data: currencies } = useQuery({
        queryKey: ["currencies"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("*")
                .order("xdevisecodealpha");

            if (error) throw new Error(error.message);
            return data;
        },
    });
    // Extract media data directly from the variant object (already loaded in main query)
    const models3d = variant.yobjet3d?.map((obj: any) => obj.yobjet3durl) || [];
    const allMedia = variant.yvarprodmedia?.map((media: any) => media.ymedia).filter(Boolean) || [];

    // Debug media data
    console.log("Debug media for variant", variant.yvarprodid, {
        allMedia,
        rawMedia: variant.yvarprodmedia,
        models3d,
    });

    // First, separate videos explicitly
    const videos = allMedia.filter((media: any) => {
        const isVideo =
            media.ymediaboolvideo === true ||
            media.ymediaboolvideo === "1" ||
            media.ymediaboolvideocapsule === true ||
            media.ymediaboolvideocapsule === "1";

        console.log("Media check for video:", media.ymediaid, {
            ymediaboolvideo: media.ymediaboolvideo,
            ymediaboolvideocapsule: media.ymediaboolvideocapsule,
            isVideo,
        });

        return isVideo;
    });

    // Then, treat everything else as images (including explicit image flags and fallback)
    const images = allMedia.filter((media: any) => {
        // First check if it's explicitly a video
        const isVideo =
            media.ymediaboolvideo === true ||
            media.ymediaboolvideo === "1" ||
            media.ymediaboolvideocapsule === true ||
            media.ymediaboolvideocapsule === "1";

        // If not a video, treat as image
        const isImage = !isVideo;

        console.log("Media check for image:", media.ymediaid, {
            ymediaboolphotoprod: media.ymediaboolphotoprod,
            ymediaboolphotoevent: media.ymediaboolphotoevent,
            ymediaboolphotoeditoriale: media.ymediaboolphotoeditoriale,
            ymediaboolvideo: media.ymediaboolvideo,
            isVideo,
            isImage,
        });

        return isImage;
    });

    console.log("Final media counts:", {
        models3d: models3d.length,
        images: images.length,
        videos: videos.length,
    });

    const getStatusBadge = () => {
        switch (variant.yvarprodstatut) {
            case "not_approved":
                return (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                        <X className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return null;
        }
    };

    const renderMediaPreview = () => {
        const hasAnyMedia = models3d.length > 0 || images.length > 0 || videos.length > 0;

        if (!hasAnyMedia) {
            return (
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {/* 3D Models */}
                {models3d.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs text-purple-400 font-medium">3D Models ({models3d.length})</div>
                        <div className="grid gap-2">
                            {models3d.map((modelUrl, index) => (
                                <Model3DViewer
                                    key={index}
                                    modelUrl={modelUrl}
                                    className="aspect-video"
                                    autoRotate={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Images */}
                {images.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs text-blue-400 font-medium">Images ({images.length})</div>
                        <div className="grid gap-2">
                            {images.map((image) => (
                                <div
                                    key={image.ymediaid}
                                    className="aspect-video bg-gray-800 rounded-lg overflow-hidden"
                                >
                                    <img
                                        src={image.ymediaurl}
                                        alt={image.ymediaintitule}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            target.parentElement!.innerHTML = `
                                                <div class="w-full h-full flex items-center justify-center">
                                                    <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            `;
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Videos */}
                {videos.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs text-green-400 font-medium">Videos ({videos.length})</div>
                        <div className="grid gap-2">
                            {videos.map((video) => (
                                <div
                                    key={video.ymediaid}
                                    className="aspect-video bg-gray-800 rounded-lg overflow-hidden"
                                >
                                    <video
                                        src={video.ymediaurl}
                                        className="w-full h-full object-cover"
                                        controls
                                        muted
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-white text-sm font-medium">{variant.yvarprodintitule}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span>{variant.xcouleur?.xcouleurintitule}</span>
                            <span>•</span>
                            <span>{variant.xtaille?.xtailleintitule}</span>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Media Preview */}
                {renderMediaPreview()}

                {/* Variant Details */}
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white">
                            {variant.yvarprodprixcatalogue
                                ? `${variant.yvarprodprixcatalogue} ${variant.xdevise?.xdevisecodealpha || ""}`
                                : "Not set"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Delivery:</span>
                        <span className="text-white">{variant.yvarprodnbrjourlivraison || 0} days</span>
                    </div>
                    {variant.yvarprodprixpromotion && (
                        <div className="flex justify-between">
                            <span className="text-gray-400">Promo:</span>
                            <span className="text-green-400">
                                {variant.yvarprodprixpromotion} {variant.xdevise?.xdevisecodealpha || ""}
                            </span>
                        </div>
                    )}
                </div>

                {/* Media Count Indicators */}
                {(models3d?.length > 0 || images?.length > 0 || videos?.length > 0) && (
                    <div className="flex gap-1 flex-wrap">
                        {models3d?.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs"
                            >
                                {models3d.length} 3D
                            </Badge>
                        )}
                        {images?.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                            >
                                {images.length} img
                            </Badge>
                        )}
                        {videos?.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-green-500/20 text-green-300 border-green-500/30 text-xs"
                            >
                                {videos.length} vid
                            </Badge>
                        )}
                    </div>
                )}

                {/* Promotion Form */}
                {showPromotionForm && variant.yvarprodstatut === "not_approved" && (
                    <div className="space-y-3 pt-2 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-400">Pricing & Promotion Settings</span>
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-gray-400">Catalog Price *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={catalogPrice}
                                        onChange={(e) => setCatalogPrice(e.target.value)}
                                        className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                                        placeholder="Required catalog price"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-400">Currency</Label>
                                    <Select
                                        value={selectedCurrencyId?.toString() || ""}
                                        onValueChange={(value) => setSelectedCurrencyId(parseInt(value))}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-gray-800 border-gray-600 text-white">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-600">
                                            {currencies?.map((currency) => (
                                                <SelectItem
                                                    key={currency.xdeviseid}
                                                    value={currency.xdeviseid.toString()}
                                                    className="text-white hover:bg-gray-700"
                                                >
                                                    {currency.xdevisecodealpha} - {currency.xdeviseintitule}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-400">Promotion Price</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={promotionPrice}
                                    onChange={(e) => setPromotionPrice(e.target.value)}
                                    className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                                    placeholder="Optional promotion price"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-gray-400">Start Date</Label>
                                    <Input
                                        type="datetime-local"
                                        value={promotionStartDate}
                                        onChange={(e) => setPromotionStartDate(e.target.value)}
                                        className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-400">End Date</Label>
                                    <Input
                                        type="datetime-local"
                                        value={promotionEndDate}
                                        onChange={(e) => setPromotionEndDate(e.target.value)}
                                        className="h-8 text-xs bg-gray-800 border-gray-600 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {variant.yvarprodstatut === "not_approved" && (
                    <div className="space-y-2 pt-2 border-t border-gray-700">
                        {!showPromotionForm && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowPromotionForm(true)}
                                className="w-full h-8 border-blue-600 text-blue-400 hover:bg-blue-900/50 text-xs"
                            >
                                <Settings className="h-3 w-3 mr-1" />
                                Set Price & Promotion
                            </Button>
                        )}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => {
                                    const approvalData = showPromotionForm
                                        ? {
                                              catalogPrice: catalogPrice ? parseFloat(catalogPrice) : null,
                                              currencyId: selectedCurrencyId,
                                              promotionPrice: promotionPrice ? parseFloat(promotionPrice) : null,
                                              promotionStartDate: promotionStartDate || null,
                                              promotionEndDate: promotionEndDate || null,
                                          }
                                        : null;
                                    onApprove(approvalData);
                                }}
                                disabled={isLoading || (showPromotionForm && !catalogPrice)}
                                className="flex-1 h-8 bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onReject}
                                disabled={isLoading}
                                className="flex-1 h-8 border-red-600 text-red-400 hover:bg-red-900/50 text-xs"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                            </Button>
                        </div>
                        {showPromotionForm && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowPromotionForm(false)}
                                className="w-full h-6 text-xs text-gray-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ApprovalFormProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: number;
}

export function ApprovalForm({ isOpen, onClose, productId }: ApprovalFormProps) {
    const { data: user } = useAuth();
    const isAdmin = user?.app_metadata?.roles?.includes("admin");
    
    const { approveProduct, denyProduct, isLoading } = useApprovalOperations();
    const {
        approveVariant,
        denyVariant,
        bulkApproveVariants,
        isLoading: variantLoading,
    } = useVariantApprovalOperations();
    const { data: categories } = useCategories();
    const supabase = createClient();

    // State for category and infospotaction selection
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedInfospotactionId, setSelectedInfospotactionId] = useState<number | null>(null);

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
                        ydesign:ydesignidfk(*),
                        ymall:ymallidfk(*),
                        yevent:yeventidfk(*)
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

    // Get category name
    const category = categories?.find((cat) => cat.xcategprodid === product?.xcategprodidfk);

    // Get event details
    const eventDetail = product?.ydetailsevent?.[0];
    const store = eventDetail?.yboutique;
    const designer = eventDetail?.ydesign;
    const mall = eventDetail?.ymall;
    const event = eventDetail?.yevent;

    // Get boutique ID for infospotactions
    const boutiqueId = store?.yboutiqueid;
    
    // Fetch infospotactions for the current boutique (admin only)
    const { data: infospotactions } = useInfospotactions({
        boutiqueId,
        enabled: isAdmin && !!boutiqueId && isOpen
    });

    // Get pending variants count
    const pendingVariants = product?.yvarprod?.filter((v: any) => v.yvarprodstatut === "not_approved") || [];
    const approvedVariants = product?.yvarprod?.filter((v: any) => v.yvarprodstatut === "approved") || [];
    const rejectedVariants = product?.yvarprod?.filter((v: any) => v.yvarprodstatut === "rejected") || [];

    const handleApproveProduct = async () => {
        if (!productId || !product) return;

        try {
            await approveProduct.mutateAsync({
                productId,
                approvalData: {
                    categoryId: selectedCategoryId || product.xcategprodidfk,
                    infoactionId: selectedInfospotactionId,
                },
            });
            onClose();
        } catch (error: any) {
            console.error("Product approval error:", error);
        }
    };

    const handleRejectProduct = async () => {
        if (!productId) return;

        try {
            await denyProduct.mutateAsync(productId);
            onClose();
        } catch (error: any) {
            console.error("Product rejection error:", error);
        }
    };

    const handleApproveVariant = async (variantId: number, approvalData?: any) => {
        const variant = product?.yvarprod?.find((v: any) => v.yvarprodid === variantId);
        if (!variant) return;

        try {
            await approveVariant.mutateAsync({
                variantId,
                approvalData: {
                    yvarprodprixcatalogue: approvalData?.catalogPrice || variant.yvarprodprixcatalogue || 1,
                    yvarprodprixpromotion: approvalData?.promotionPrice || variant.yvarprodprixpromotion,
                    yvarprodpromotiondatedeb: approvalData?.promotionStartDate || variant.yvarprodpromotiondatedeb,
                    yvarprodpromotiondatefin: approvalData?.promotionEndDate || variant.yvarprodpromotiondatefin,
                    yvarprodnbrjourlivraison: variant.yvarprodnbrjourlivraison || 1,
                    currencyId: approvalData?.currencyId || variant.xdeviseidfk || 1,
                },
            });
        } catch (error: any) {
            console.error("Variant approval error:", error);
        }
    };

    const handleRejectVariant = async (variantId: number) => {
        try {
            await denyVariant.mutateAsync(variantId);
        } catch (error: any) {
            console.error("Variant rejection error:", error);
        }
    };

    const handleBulkApproveVariants = async () => {
        if (!product?.yvarprod || pendingVariants.length === 0) return;

        const variantApprovals = pendingVariants.map((variant: any) => ({
            variantId: variant.yvarprodid,
            approvalData: {
                yvarprodprixcatalogue: variant.yvarprodprixcatalogue || 1,
                yvarprodprixpromotion: variant.yvarprodprixpromotion,
                yvarprodpromotiondatedeb: variant.yvarprodpromotiondatedeb,
                yvarprodpromotiondatefin: variant.yvarprodpromotiondatefin,
                yvarprodnbrjourlivraison: variant.yvarprodnbrjourlivraison || 1,
                currencyId: variant.xdeviseidfk || 1,
            },
        }));

        try {
            await bulkApproveVariants.mutateAsync({ variantApprovals });
        } catch (error: any) {
            console.error("Bulk approval error:", error);
        }
    };

    const getProductStatusBadge = () => {
        switch (product?.yprodstatut) {
            case "not_approved":
                return (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Pending Approval
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                        <X className="h-4 w-4 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (productLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogTitle className="text-lg text-white">Loading Product Approval...</DialogTitle>
                <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
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
                                Product Approval: {product.yprodintitule}
                            </DialogTitle>
                            <p className="text-sm text-gray-400 font-mono mt-1">{product.yprodcode}</p>
                        </div>
                        {getProductStatusBadge()}
                    </div>
                </DialogHeader>

                <div className="flex h-[calc(95vh-180px)]">
                    {/* Left Panel - Product Information */}
                    <div className="w-1/2 border-r border-gray-700">
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-6">
                                {/* Basic Product Info */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Product Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-gray-300 text-sm">Product Name</Label>
                                            <div className="text-white font-medium">{product.yprodintitule}</div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-300 text-sm">Product Code</Label>
                                            <div className="text-white font-mono text-sm">{product.yprodcode}</div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-300 text-sm">Category</Label>
                                            <div className="text-white">
                                                {category?.xcategprodintitule || "Unknown"}
                                            </div>
                                            {product.yprodstatut === "not_approved" && (
                                                <div className="mt-2">
                                                    <Label className="text-gray-300 text-xs">
                                                        Change Category (Optional)
                                                    </Label>
                                                    <Select
                                                        value={selectedCategoryId?.toString() || ""}
                                                        onValueChange={(value) =>
                                                            setSelectedCategoryId(value ? parseInt(value) : null)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 text-xs bg-gray-800 border-gray-600 text-white">
                                                            <SelectValue placeholder="Select new category" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-gray-800 border-gray-600">
                                                            {categories?.map((cat) => (
                                                                <SelectItem
                                                                    key={cat.xcategprodid}
                                                                    value={cat.xcategprodid.toString()}
                                                                    className="text-white hover:bg-gray-700"
                                                                >
                                                                    {cat.xcategprodintitule}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Infospotaction Selection (Admin Only) */}
                                        {isAdmin && product.yprodstatut === "not_approved" && (
                                            <div>
                                                <Label className="text-gray-300 text-sm">Product Placement</Label>
                                                <div className="text-gray-400 text-xs mb-2">
                                                    Choose where this product should be placed in the store
                                                </div>
                                                <Select
                                                    value={selectedInfospotactionId?.toString() || ""}
                                                    onValueChange={(value) =>
                                                        setSelectedInfospotactionId(value ? parseInt(value) : null)
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-xs bg-gray-800 border-gray-600 text-white">
                                                        <SelectValue placeholder="Select product placement" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600">
                                                        {infospotactions?.map((action) => (
                                                            <SelectItem
                                                                key={action.yinfospotactionsid}
                                                                value={action.yinfospotactionsid.toString()}
                                                                className="text-white hover:bg-gray-700"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{action.yinfospotactionstitle}</span>
                                                                    <span className="text-xs text-gray-400">{action.yinfospotactionsdescription}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <Label className="text-gray-300 text-sm">Technical Details</Label>
                                            <div className="text-gray-300 text-sm bg-gray-800 p-3 rounded border border-gray-600">
                                                {product.yproddetailstech || "No technical details provided"}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-300 text-sm">Info Bubble</Label>
                                            <div className="text-gray-300 text-sm bg-gray-800 p-3 rounded border border-gray-600">
                                                {product.yprodinfobulle || "No info bubble provided"}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Context Information */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Context Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {designer && (
                                            <div className="flex items-center gap-3">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <Label className="text-gray-300 text-sm">Designer</Label>
                                                    <div className="text-white">
                                                        {designer.ydesignnom} ({designer.ydesignmarque})
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {store && (
                                            <div className="flex items-center gap-3">
                                                <Store className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <Label className="text-gray-300 text-sm">Store</Label>
                                                    <div className="text-white">
                                                        {store.yboutiqueintitule || store.yboutiquecode}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {mall && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <Label className="text-gray-300 text-sm">Mall</Label>
                                                    <div className="text-white">{mall.ymallintitule}</div>
                                                </div>
                                            </div>
                                        )}
                                        {event && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <Label className="text-gray-300 text-sm">Event</Label>
                                                    <div className="text-white">{event.yeventintitule}</div>
                                                    <div className="text-gray-400 text-xs">
                                                        {event.yeventdatedeb} to {event.yeventdatefin}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Variant Summary */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg">Variant Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-yellow-400">
                                                    {pendingVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-400">Pending</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-400">
                                                    {approvedVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-400">Approved</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-red-400">
                                                    {rejectedVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-400">Rejected</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel - Variant Cards */}
                    <div className="w-1/2">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">
                                    Product Variants ({product.yvarprod?.length || 0})
                                </h3>
                                {pendingVariants.length > 0 && (
                                    <Button
                                        size="sm"
                                        onClick={handleBulkApproveVariants}
                                        disabled={variantLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve All ({pendingVariants.length})
                                    </Button>
                                )}
                            </div>

                            <ScrollArea className="h-[calc(95vh-300px)] overflow-y-auto">
                                <div className="space-y-4 pr-4">
                                    {product.yvarprod?.map((variant: any) => (
                                        <VariantCard
                                            key={variant.yvarprodid}
                                            variant={variant}
                                            onApprove={(promotionData) =>
                                                handleApproveVariant(variant.yvarprodid, promotionData)
                                            }
                                            onReject={() => handleRejectVariant(variant.yvarprodid)}
                                            isLoading={variantLoading}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
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
                        onClick={handleRejectProduct}
                        disabled={isLoading || variantLoading}
                        className="border-red-600 text-red-400 hover:bg-red-900/50"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Reject Product
                    </Button>
                    <Button
                        type="button"
                        onClick={handleApproveProduct}
                        disabled={isLoading || variantLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isLoading || variantLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Product
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
