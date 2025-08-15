"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    X,
    Image as ImageIcon,
    Play,
    Box,
    Eye,
    Edit,
} from "lucide-react";

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
    
    // Get category name
    const category = categories.find(cat => cat.xcategprodid === product.xcategprodidfk);
    
    // Get status badge and color based on product status
    const getStatusInfo = () => {
        if (status === 'approved') {
            return {
                badge: (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t("admin.approved")}
                    </Badge>
                ),
                color: 'border-green-500/30'
            };
        } else if (status === 'rejected') {
            return {
                badge: (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                        <X className="h-3 w-3 mr-1" />
                        {t("admin.rejected")}
                    </Badge>
                ),
                color: 'border-red-500/30'
            };
        }
        return {
            badge: null,
            color: 'border-gray-700/50'
        };
    };

    const statusInfo = getStatusInfo();

    // Get media preview - prioritize 3D models when available
    const getMediaPreview = () => {
        // Check if product has 3D models first
        const has3DModels = product.yobjet3d?.length > 0;
        
        if (has3DModels) {
            return (
                <div className="relative w-full h-32 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg flex items-center justify-center border border-purple-500/30">
                    <div className="flex flex-col items-center">
                        <Box className="h-10 w-10 text-purple-400 mb-2" />
                        <span className="text-purple-300 text-xs font-medium">{t("admin.approvals.model3DAvailable")}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            {t("admin.approvals.preview3D")}
                        </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
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
                <div className="relative w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-400" />
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            {t("admin.approvals.video")}
                        </Badge>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="relative w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                        src={media.ymediaurl}
                        alt={media.ymediaintitule}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
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
            );
        }
    };

    // Get variant status counts
    const variants = product.yvarprod || [];

    return (
        <Card className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${statusInfo.color}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-white text-sm line-clamp-2">
                            {product.yprodintitule}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono">
                            {product.yprodcode}
                        </p>
                    </div>
                    {statusInfo.badge}
                </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
                {/* Media Preview */}
                {getMediaPreview() || (
                    <div className="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-gray-500 text-sm ml-2">{t("admin.approvals.noMedia")}</span>
                    </div>
                )}

                {/* Product Info */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{t("admin.approvals.category")}:</span>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {category?.xcategprodintitule || t("admin.approvals.unknown")}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{t("admin.approvals.store")}:</span>
                        <span className="text-white">
                            {product.store?.yboutiqueintitule || t("admin.approvals.unknownStore")}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{t("admin.approvals.variants")}:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-white">{variants.length || 0}</span>
                            <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                                {variants.length} {t("admin.approvals.variants")}
                            </Badge>
                        </div>
                    </div>

                    {/* 3D Models indicator */}
                    {product.yobjet3d?.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{t("admin.approvals.models3D")}:</span>
                            <div className="flex items-center gap-1">
                                <Box className="h-3 w-3 text-purple-400" />
                                <span className="text-purple-400">{product.yobjet3d.length}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{t("admin.approvals.created")}:</span>
                        <span className="text-white">
                            {new Date(product.sysdate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                    {onView && (
                        <Button
                            size="sm"
                            onClick={onView}
                            variant="outline"
                            className="flex-1 h-9 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {t("admin.viewProduct")}
                        </Button>
                    )}
                    {onEdit && (
                        <Button
                            size="sm"
                            onClick={onEdit}
                            className="flex-1 h-9 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
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