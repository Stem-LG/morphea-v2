"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
    CheckCircle,
    X,
    AlertTriangle,
    Package,
    Image as ImageIcon,
    Calendar,
    Store,
    User,
    MapPin,
    Eye,
    EyeOff,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/client";
import { useCategories } from "../_hooks/use-categories";
import { Model3DViewer } from "../../../approvals/_components/three-d-viewer";
import { useLanguage } from "@/hooks/useLanguage";
import { useVariantVisibility } from "../_hooks/use-variant-visibility";

interface ProductViewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: number;
}

export function ProductViewDialog({ isOpen, onClose, productId }: ProductViewDialogProps) {
    const { data: categories } = useCategories();
    const supabase = createClient();
    const { t } = useLanguage();
    const { updateBulkVisibility, isBulkUpdating } = useVariantVisibility();

    // Fetch product details (same query as approval form but read-only)
    const { data: product, isLoading: productLoading } = useQuery({
        queryKey: ["product-view", productId],
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

    // Get variants count by status
    const pendingVariants = product?.yvarprod?.filter((v: any) => v.yvarprodstatut === "not_approved") || [];
    const approvedVariants = product?.yvarprod?.filter((v: any) => v.yvarprodstatut === "approved") || [];
    const rejectedVariants = product?.yvarprod?.filter((v: any) => v.yvarprodstatut === "rejected") || [];

    // Handle bulk visibility actions for variants
    const handleBulkMakeVariantsVisible = () => {
        if (!product?.yvarprod?.length) return;
        const variantIds = product.yvarprod.map((v: any) => v.yvarprodid);
        updateBulkVisibility.mutate({
            variantIds,
            yestvisible: true,
        });
    };

    const handleBulkMakeVariantsInvisible = () => {
        if (!product?.yvarprod?.length) return;
        const variantIds = product.yvarprod.map((v: any) => v.yvarprodid);
        updateBulkVisibility.mutate({
            variantIds,
            yestvisible: false,
        });
    };

    const getProductStatusBadge = () => {
        switch (product?.yprodstatut) {
            case "not_approved":
                return (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {t("admin.productView.pendingApproval")}
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t("admin.approved")}
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                        <X className="h-4 w-4 mr-1" />
                        {t("admin.rejected")}
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    if (productLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogTitle className="text-white flex items-center gap-2">{t("admin.productView.productDetails")}</DialogTitle>
                <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
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
                                {t("admin.productView.productDetails")}: {product.yprodintitule}
                            </DialogTitle>
                            <p className="text-sm text-gray-400 font-mono mt-1">{product.yprodcode}</p>
                        </div>
                        {getProductStatusBadge()}
                    </div>
                </DialogHeader>

                <div className="flex h-[calc(95vh-120px)]">
                    {/* Left Panel - Product Information */}
                    <div className="w-1/2 border-r border-gray-700">
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-6">
                                {/* Basic Product Info */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            {t("admin.productInformation")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-gray-300 text-sm">{t("admin.productName")}</Label>
                                            <div className="text-white font-medium">{product.yprodintitule}</div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-300 text-sm">{t("admin.productCode")}</Label>
                                            <div className="text-white font-mono text-sm">{product.yprodcode}</div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-300 text-sm">{t("admin.category")}</Label>
                                            <div className="text-white">
                                                {category?.xcategprodintitule || t("admin.unknown")}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-300 text-sm">{t("admin.technicalDetails")}</Label>
                                            <div className="text-gray-300 text-sm bg-gray-800 p-3 rounded border border-gray-600">
                                                {product.yproddetailstech || t("admin.productView.noTechnicalDetails")}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-300 text-sm">{t("admin.productView.infoBubble")}</Label>
                                            <div className="text-gray-300 text-sm bg-gray-800 p-3 rounded border border-gray-600">
                                                {product.yprodinfobulle || t("admin.productView.noInfoBubble")}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Context Information */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            {t("admin.productView.contextInformation")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {designer && (
                                            <div className="flex items-center gap-3">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <Label className="text-gray-300 text-sm">{t("admin.productView.designer")}</Label>
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
                                                    <Label className="text-gray-300 text-sm">{t("admin.productView.store")}</Label>
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
                                                    <Label className="text-gray-300 text-sm">{t("admin.productView.mall")}</Label>
                                                    <div className="text-white">{mall.ymallintitule}</div>
                                                </div>
                                            </div>
                                        )}
                                        {event && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <Label className="text-gray-300 text-sm">{t("admin.productView.event")}</Label>
                                                    <div className="text-white">{event.yeventintitule}</div>
                                                    <div className="text-gray-400 text-xs">
                                                        {event.yeventdatedeb} {t("admin.productView.to")} {event.yeventdatefin}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Variant Summary */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg">{t("admin.productView.variantSummary")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-yellow-400">
                                                    {pendingVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-400">{t("admin.pending")}</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-400">
                                                    {approvedVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-400">{t("admin.approved")}</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-red-400">
                                                    {rejectedVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-400">{t("admin.rejected")}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel - Variant Cards (Read-only) */}
                    <div className="w-1/2">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">
                                    {t("admin.productView.productVariants")} ({product.yvarprod?.length || 0})
                                </h3>
                                
                                {/* Bulk Visibility Actions for Variants */}
                                {product.yvarprod?.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBulkMakeVariantsVisible}
                                            disabled={isBulkUpdating}
                                            className="border-green-600 text-green-400 hover:bg-green-600/20 text-xs"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            {t("admin.makeAllVariantsVisible") || "Show All"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBulkMakeVariantsInvisible}
                                            disabled={isBulkUpdating}
                                            className="border-gray-600 text-gray-400 hover:bg-gray-600/20 text-xs"
                                        >
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            {t("admin.makeAllVariantsInvisible") || "Hide All"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <ScrollArea className="h-[calc(95vh-200px)]">
                                <div className="space-y-4 pr-4">
                                    {product.yvarprod?.map((variant: any) => (
                                        <VariantViewCard key={variant.yvarprodid} variant={variant} t={t} />
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
                    >
                        {t("common.close")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Read-only variant card component
function VariantViewCard({ variant, t }: { variant: any; t: (key: string) => string }) {
    const { updateSingleVisibility, isUpdatingSingle } = useVariantVisibility();
    // Extract media data directly from the variant object
    const models3d = variant.yobjet3d?.map((obj: any) => obj.yobjet3durl) || [];
    const allMedia = variant.yvarprodmedia?.map((media: any) => media.ymedia).filter(Boolean) || [];

    // Filter videos and images
    const videos = allMedia.filter((media: any) => {
        return (
            media.ymediaboolvideo === true ||
            media.ymediaboolvideo === "1" ||
            media.ymediaboolvideocapsule === true ||
            media.ymediaboolvideocapsule === "1"
        );
    });

    const images = allMedia.filter((media: any) => {
        const isVideo =
            media.ymediaboolvideo === true ||
            media.ymediaboolvideo === "1" ||
            media.ymediaboolvideocapsule === true ||
            media.ymediaboolvideocapsule === "1";
        return !isVideo;
    });

    const getStatusBadge = () => {
        switch (variant.yvarprodstatut) {
            case "not_approved":
                return (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {t("admin.pending")}
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t("admin.approved")}
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                        <X className="h-3 w-3 mr-1" />
                        {t("admin.rejected")}
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
                        <div className="text-xs text-purple-400 font-medium">{t("admin.productView.threeDModels")} ({models3d.length})</div>
                        <div className="grid gap-2">
                            {models3d.map((modelUrl, index) => (
                                <Model3DViewer
                                    key={index}
                                    modelUrl={modelUrl}
                                    className="aspect-video"
                                    autoRotate={true}
                                    backgroundColor={variant.yobjet3d?.[index]?.ycouleurarriereplan || "#f0f0f0"}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Images */}
                {images.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs text-blue-400 font-medium">{t("admin.productView.images")} ({images.length})</div>
                        <div className="grid gap-2">
                            {images.map((image) => (
                                <div
                                    key={image.ymediaid}
                                    className="aspect-video bg-gray-800 rounded-lg overflow-hidden"
                                >
                                    <img
                                        src={image.ymediaurl}
                                        alt={image.ymediaintitule || `${t("admin.productView.productImage")} ${image.ymediaid}`}
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
                        <div className="text-xs text-green-400 font-medium">{t("admin.productView.videos")} ({videos.length})</div>
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
                {/* Visibility Toggle */}
                <div className="flex items-center justify-between text-xs bg-gray-700/30 p-2 rounded">
                    <span className="text-gray-400 flex items-center gap-1">
                        {variant.yestvisible ? (
                            <Eye className="h-3 w-3 text-green-400" />
                        ) : (
                            <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                        {t("admin.visibility") || "Visibility"}:
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs ${variant.yestvisible ? 'text-green-400' : 'text-gray-400'}`}>
                            {variant.yestvisible ? (t("admin.visible") || "Visible") : (t("admin.hidden") || "Hidden")}
                        </span>
                        <Switch
                            checked={variant.yestvisible || false}
                            disabled={isUpdatingSingle}
                            onCheckedChange={(checked) => {
                                updateSingleVisibility.mutate({
                                    variantId: variant.yvarprodid,
                                    yestvisible: checked,
                                });
                            }}
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600 scale-75"
                        />
                    </div>
                </div>

                {/* Media Preview */}
                {renderMediaPreview()}

                {/* Variant Details */}
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-400">{t("admin.productView.price")}:</span>
                        <span className="text-white">
                            {variant.yvarprodprixcatalogue
                                ? `${variant.yvarprodprixcatalogue} ${variant.xdevise?.xdevisecodealpha || ""}`
                                : t("admin.productView.notSet")}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">{t("admin.productView.delivery")}:</span>
                        <span className="text-white">{variant.yvarprodnbrjourlivraison || 0} {t("admin.productView.days")}</span>
                    </div>
                    {variant.yvarprodprixpromotion && (
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t("admin.productView.promo")}:</span>
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
            </CardContent>
        </Card>
    );
}
