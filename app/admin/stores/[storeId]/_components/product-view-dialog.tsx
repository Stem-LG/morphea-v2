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
import { useAuth } from "@/hooks/useAuth";

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
    const { data: user } = useAuth();

    // Check if current user is admin (not store_admin)
    const isAdmin = user?.app_metadata?.roles?.includes('admin');
    const isStoreAdmin = user?.app_metadata?.roles?.includes('store_admin');
    const canEditVisibility = isAdmin;

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
                        xtypebijoux(*),
                        xmateriaux(*),
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
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {t("admin.productView.pendingApproval")}
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t("admin.approved")}
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
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
                <DialogTitle className="text-gray-900 flex items-center gap-2">{t("admin.productView.productDetails")}</DialogTitle>
                <DialogContent className="max-w-6xl max-h-[90vh] bg-white border-gray-300">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <DialogContent className="max-w-7xl max-h-[95vh] bg-white border-gray-300">
                <DialogHeader className="border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl text-gray-900">
                                {t("admin.productView.productDetails")}: {product.yprodintitule}
                            </DialogTitle>
                            <p className="text-sm text-gray-600 font-mono mt-1">{product.yprodcode}</p>
                        </div>
                        {getProductStatusBadge()}
                    </div>
                </DialogHeader>

                <div className="flex h-[calc(95vh-120px)] gap-6">
                    {/* Left Panel - Product Information */}
                    <div className="w-1/2 border-r border-gray-200 pr-3">
                        <ScrollArea className="h-full">
                            <div className="space-y-6">
                                {/* Basic Product Info */}
                                <Card className="bg-gray-50 border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                                            <Package className="h-5 w-5 text-blue-600" />
                                            {t("admin.productInformation")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.productName")}</Label>
                                            <div className="text-gray-900 font-medium">{product.yprodintitule}</div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.productCode")}</Label>
                                            <div className="text-gray-900 font-mono text-sm">{product.yprodcode}</div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.category")}</Label>
                                            <div className="text-gray-900">
                                                {category?.xcategprodintitule || t("admin.unknown")}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.productView.productType") || "Product Type"}</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                {product.yprodestbijoux ? (
                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                                                        <Package className="h-3 w-3 mr-1" />
                                                        {t("admin.productView.jewelryProduct") || "Jewelry Product"}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                                        <Package className="h-3 w-3 mr-1" />
                                                        {t("admin.productView.regularProduct") || "Regular Product"}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.visibility") || "Visibility"}</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                {product.yestvisible ? (
                                                    <>
                                                        <Eye className="h-4 w-4 text-green-600" />
                                                        <span className="text-green-600 font-medium">{t("admin.visible") || "Visible"}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                                        <span className="text-gray-500 font-medium">{t("admin.invisible") || "Hidden"}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.technicalDetails")}</Label>
                                            <div className="text-gray-700 text-sm bg-gray-100 p-3 rounded border border-gray-200">
                                                {product.yproddetailstech || t("admin.productView.noTechnicalDetails")}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.productView.infoBubble")}</Label>
                                            <div className="text-gray-700 text-sm bg-gray-100 p-3 rounded border border-gray-200">
                                                {product.yprodinfobulle || t("admin.productView.noInfoBubble")}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Context Information */}
                                <Card className="bg-gray-50 border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                            {t("admin.productView.contextInformation")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {designer && (
                                            <div className="flex items-center gap-3">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <Label className="text-gray-700 text-sm">{t("admin.productView.designer")}</Label>
                                                    <div className="text-gray-900">
                                                        {designer.ydesignnom} ({designer.ydesignmarque})
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {store && (
                                            <div className="flex items-center gap-3">
                                                <Store className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <Label className="text-gray-700 text-sm">{t("admin.productView.store")}</Label>
                                                    <div className="text-gray-900">
                                                        {store.yboutiqueintitule || store.yboutiquecode}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {mall && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <Label className="text-gray-700 text-sm">{t("admin.productView.mall")}</Label>
                                                    <div className="text-gray-900">{mall.ymallintitule}</div>
                                                </div>
                                            </div>
                                        )}
                                        {event && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <Label className="text-gray-700 text-sm">{t("admin.productView.event")}</Label>
                                                    <div className="text-gray-900">{event.yeventintitule}</div>
                                                    <div className="text-gray-600 text-xs">
                                                        {event.yeventdatedeb} {t("admin.productView.to")} {event.yeventdatefin}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Variant Summary */}
                                <Card className="bg-gray-50 border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 text-lg">{t("admin.productView.variantSummary")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    {pendingVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-600">{t("admin.pending")}</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    {approvedVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-600">{t("admin.approved")}</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-red-600">
                                                    {rejectedVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-600">{t("admin.rejected")}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel - Variant Cards (Read-only) */}
                    <div className="w-1/2 pl-3">
                        <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {t("admin.productView.productVariants")} ({product.yvarprod?.length || 0})
                                </h3>

                                {/* Bulk Visibility Actions for Variants */}
                                {product.yvarprod?.length > 0 && canEditVisibility && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBulkMakeVariantsVisible}
                                            disabled={isBulkUpdating}
                                            className="border-green-300 text-green-600 hover:bg-green-50 text-xs"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            {t("admin.makeAllVariantsVisible") || "Show All"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBulkMakeVariantsInvisible}
                                            disabled={isBulkUpdating}
                                            className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs"
                                        >
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            {t("admin.makeAllVariantsInvisible") || "Hide All"}
                                        </Button>
                                    </div>
                                )}

                                {/* Visibility Summary for non-admin users */}
                                {product.yvarprod?.length > 0 && !canEditVisibility && (
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1 text-green-400">
                                            <Eye className="h-3 w-3" />
                                            <span>{product.yvarprod?.filter((v: any) => v.yestvisible).length || 0} {t("admin.visible") || "Visible"}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <EyeOff className="h-3 w-3" />
                                            <span>{product.yvarprod?.filter((v: any) => !v.yestvisible).length || 0} {t("admin.invisible") || "Hidden"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <ScrollArea className="h-[calc(95vh-200px)]">
                                <div className="space-y-4 pr-4">
                                    {product.yvarprod?.map((variant: any) => (
                                        <VariantViewCard key={variant.yvarprodid} variant={variant} t={t} canEditVisibility={canEditVisibility} />
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
            </DialogContent>
        </Dialog>
    );
}

// Read-only variant card component
function VariantViewCard({ variant, t, canEditVisibility }: { variant: any; t: (key: string) => string; canEditVisibility: boolean }) {
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
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {t("admin.pending")}
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t("admin.approved")}
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
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
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {/* 3D Models */}
                {models3d.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs text-purple-600 font-medium">{t("admin.productView.threeDModels")} ({models3d.length})</div>
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
                        <div className="text-xs text-blue-600 font-medium">{t("admin.productView.images")} ({images.length})</div>
                        <div className="grid gap-2">
                            {images.map((image) => (
                                <div
                                    key={image.ymediaid}
                                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
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
                        <div className="text-xs text-green-600 font-medium">{t("admin.productView.videos")} ({videos.length})</div>
                        <div className="grid gap-2">
                            {videos.map((video) => (
                                <div
                                    key={video.ymediaid}
                                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
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
        <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-gray-900 text-sm font-medium">{variant.yvarprodintitule}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                            {/* Always show all available attributes */}
                            {variant.xtypebijoux && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded border border-purple-200 font-medium">
                                    {t("admin.productView.type") || "Type"}: {variant.xtypebijoux.xtypebijouxintitule}
                                </span>
                            )}
                            
                            {variant.xmateriaux && (
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded border border-orange-200 font-medium">
                                    {t("admin.productView.material") || "Material"}: {variant.xmateriaux.xmateriauxintitule}
                                </span>
                            )}
                            
                            {variant.xcouleur && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200 font-medium">
                                    {t("admin.productView.color") || "Color"}: {variant.xcouleur.xcouleurintitule}
                                </span>
                            )}
                            
                            {variant.xtaille && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200 font-medium">
                                    {t("admin.productView.size") || "Size"}: {variant.xtaille.xtailleintitule}
                                </span>
                            )}
                            
                            {/* Show message if no attributes are available */}
                            {!variant.xtypebijoux && !variant.xmateriaux && !variant.xcouleur && !variant.xtaille && (
                                <span className="text-gray-500 italic">
                                    {t("admin.productView.noAttributes") || "No attributes defined"}
                                </span>
                            )}
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Visibility Toggle */}
                <div className="flex items-center justify-between text-xs bg-gray-100 p-2 rounded">
                    <span className="text-gray-600 flex items-center gap-1">
                        {variant.yestvisible ? (
                            <Eye className="h-3 w-3 text-green-600" />
                        ) : (
                            <EyeOff className="h-3 w-3 text-gray-500" />
                        )}
                        {t("admin.visibility") || "Visibility"}:
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs ${variant.yestvisible ? 'text-green-600' : 'text-gray-600'}`}>
                            {variant.yestvisible ? (t("admin.visible") || "Visible") : (t("admin.hidden") || "Hidden")}
                        </span>
                        {canEditVisibility && (
                            <Switch
                                checked={variant.yestvisible || false}
                                disabled={isUpdatingSingle}
                                onCheckedChange={(checked) => {
                                    updateSingleVisibility.mutate({
                                        variantId: variant.yvarprodid,
                                        yestvisible: checked,
                                    });
                                }}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400 scale-75"
                            />
                        )}
                    </div>
                </div>

                {/* Media Preview */}
                {renderMediaPreview()}

                {/* Variant Details */}
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("admin.productView.price")}:</span>
                        <span className="text-gray-900">
                            {variant.yvarprodprixcatalogue
                                ? `${variant.yvarprodprixcatalogue} ${variant.xdevise?.xdevisecodealpha || ""}`
                                : t("admin.productView.notSet")}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("admin.productView.delivery")}:</span>
                        <span className="text-gray-900">{variant.yvarprodnbrjourlivraison || 0} {t("admin.productView.days")}</span>
                    </div>
                    {variant.yvarprodprixpromotion && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">{t("admin.productView.promo")}:</span>
                            <span className="text-green-600">
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
                                className="bg-purple-100 text-purple-800 border-purple-200 text-xs"
                            >
                                {models3d.length} 3D
                            </Badge>
                        )}
                        {images?.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
                            >
                                {images.length} img
                            </Badge>
                        )}
                        {videos?.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 border-green-200 text-xs"
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
