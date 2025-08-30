"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    CheckCircle,
    X,
    Image as ImageIcon,
    Play,
    Box,
    Eye,
    Edit,
    EyeOff,
} from "lucide-react";
import { useProductVisibility } from "../_hooks/use-product-visibility";

interface ProductCardProps {
    product: any;
    onView?: () => void;
    onEdit?: () => void;
    categories?: any[];
    status: 'approved' | 'rejected';
}

export function ProductCard({
    product,
    onView,
    onEdit,
    categories = [],
    status
}: ProductCardProps) {
    const { t } = useLanguage();
    const { updateSingleVisibility, isUpdatingSingle } = useProductVisibility();
    
    // Get category name
    const category = categories.find(cat => cat.xcategprodid === product.xcategprodidfk);
    
    // Get status badge and color based on product status
    const getStatusInfo = () => {
        if (status === 'approved') {
            return {
                badge: (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t("admin.approved")}
                    </Badge>
                ),
                color: 'border-green-200'
            };
        } else if (status === 'rejected') {
            return {
                badge: (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                        <X className="h-3 w-3 mr-1" />
                        {t("admin.rejected")}
                    </Badge>
                ),
                color: 'border-red-200'
            };
        }
        return {
            badge: null,
            color: 'border-gray-200'
        };
    };

    const statusInfo = getStatusInfo();

    // Get media preview - prioritize 3D models when available
    const getMediaPreview = () => {
        // Check if product has 3D models first
        const has3DModels = product.yobjet3d?.length > 0;
        
        if (has3DModels) {
            return (
                <div className="relative w-full h-32 bg-gradient-to-br from-purple-100 to-blue-50 rounded-lg flex items-center justify-center border border-purple-200">
                    <div className="flex flex-col items-center">
                        <Box className="h-10 w-10 text-purple-600 mb-2" />
                        <span className="text-purple-700 text-xs font-medium">{t("admin.approvals.model3DAvailable")}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                            {t("admin.approvals.preview3D")}
                        </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            {product.yobjet3d.length} {product.yobjet3d.length > 1 ? t("admin.approvals.models") : t("admin.approvals.model")}
                        </Badge>
                    </div>
                </div>
            );
        }

        // Fallback to regular media preview
        const media = product.media?.[0];
        if (!media) return null;

        if (media.ymediaboolvideo) {
            return (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-600" />
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                            {t("admin.approvals.video")}
                        </Badge>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                        src={media.ymediaurl}
                        alt={media.ymediaintitule}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center">
                                    <svg class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            `;
                        }}
                    />
                </div>
            );
        }
    };

    // Get variant status counts
    const variants = product.yvarprod || [];

    return (
        <Card className={`bg-white border shadow-sm transition-all duration-200 hover:shadow-md ${statusInfo.color}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                            {product.yprodintitule}
                        </h3>
                        <p className="text-xs text-gray-600 font-mono">
                            {product.yprodcode}
                        </p>
                    </div>
                    {statusInfo.badge}
                </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
                {/* Media Preview */}
                {getMediaPreview() || (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-600" />
                        <span className="text-gray-700 text-sm ml-2">{t("admin.approvals.noMedia")}</span>
                    </div>
                )}

                {/* Product Info */}
                <div className="space-y-2">
                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded border border-gray-200">
                        <span className="text-gray-700 flex items-center gap-1">
                            {product.yestvisible ? (
                                <Eye className="h-3 w-3 text-green-600" />
                            ) : (
                                <EyeOff className="h-3 w-3 text-gray-600" />
                            )}
                            {t("admin.visibility") || "Visibility"}:
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs ${product.yestvisible ? 'text-green-600' : 'text-gray-600'}`}>
                                {product.yestvisible ? (t("admin.visible") || "Visible") : (t("admin.hidden") || "Hidden")}
                            </span>
                            <Switch
                                checked={product.yestvisible}
                                disabled={isUpdatingSingle}
                                onCheckedChange={(checked) => {
                                    updateSingleVisibility.mutate({
                                        productId: product.yprodid,
                                        yestvisible: checked,
                                    });
                                }}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{t("admin.approvals.category")}:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            {category?.xcategprodintitule || t("admin.approvals.unknown")}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{t("admin.approvals.store")}:</span>
                        <span className="text-gray-900">
                            {product.store?.yboutiqueintitule || t("admin.approvals.unknownStore")}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{t("admin.approvals.variants")}:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-900">{variants.length || 0}</span>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                                {variants.length} {t("admin.approvals.variants")}
                            </Badge>
                        </div>
                    </div>

                    {/* 3D Models indicator */}
                    {product.yobjet3d?.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{t("admin.approvals.models3D")}:</span>
                            <div className="flex items-center gap-1">
                                <Box className="h-3 w-3 text-purple-600" />
                                <span className="text-purple-600">{product.yobjet3d.length}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{t("admin.approvals.created")}:</span>
                        <span className="text-gray-900">
                            {new Date(product.sysdate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    {onView && (
                        <Button
                            size="sm"
                            onClick={onView}
                            variant="outline"
                            className="flex-1 h-9 border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {t("admin.viewProduct")}
                        </Button>
                    )}
                    {onEdit && (
                        <Button
                            size="sm"
                            onClick={onEdit}
                            className="flex-1 h-9 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            {t("admin.editProduct")}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}