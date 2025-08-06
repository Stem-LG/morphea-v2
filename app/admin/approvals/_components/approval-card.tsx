"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    Package,
    AlertTriangle,
    Image as ImageIcon,
    Play,
    Box,
    FileSearch,
} from "lucide-react";

interface ApprovalCardProps {
    product: any;
    onAudit: () => void;
    categories?: any[];
}

export function ApprovalCard({
    product,
    onAudit,
    categories = []
}: ApprovalCardProps) {
    // Get category name
    const category = categories.find(cat => cat.xcategprodid === product.xcategprodidfk);
    
    // Get enhanced status info with variant details
    const getStatusInfo = () => {
        const variants = product.yvarprod || [];
        const pendingVariants = variants.filter((v: any) => v.yvarprodstatut === 'not_approved').length;
        const approvedVariants = variants.filter((v: any) => v.yvarprodstatut === 'approved').length;
        const revisionVariants = variants.filter((v: any) => v.yvarprodstatut === 'rejected').length;
        const rejectedVariants = variants.filter((v: any) => v.yvarprodstatut === 'rejected').length;

        if (product.yprodstatut === 'not_approved') {
            return {
                badge: (
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                            <Clock className="h-3 w-3 mr-1" />
                            Product Pending
                        </Badge>
                        {variants.length > 0 && (
                            <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                                {variants.length} variants
                            </Badge>
                        )}
                    </div>
                ),
                color: 'border-yellow-500/30'
            };
        } else if (product.yprodstatut === 'rejected') {
            return {
                badge: (
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Needs Revision
                        </Badge>
                        {variants.length > 0 && (
                            <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                                {variants.length} variants
                            </Badge>
                        )}
                    </div>
                ),
                color: 'border-orange-500/30'
            };
        } else if (pendingVariants > 0 || revisionVariants > 0) {
            return {
                badge: (
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            <Package className="h-3 w-3 mr-1" />
                            Variant Issues
                        </Badge>
                        <div className="flex flex-wrap gap-1 justify-end">
                            {pendingVariants > 0 && (
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                                    {pendingVariants} pending
                                </Badge>
                            )}
                            {revisionVariants > 0 && (
                                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                                    {revisionVariants} revision
                                </Badge>
                            )}
                            {rejectedVariants > 0 && (
                                <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                    {rejectedVariants} rejected
                                </Badge>
                            )}
                            {approvedVariants > 0 && (
                                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                    {approvedVariants} approved
                                </Badge>
                            )}
                        </div>
                    </div>
                ),
                color: 'border-blue-500/30'
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
                        <span className="text-purple-300 text-xs font-medium">3D Model Available</span>
                    </div>
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            3D Preview
                        </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {product.yobjet3d.length} Model{product.yobjet3d.length > 1 ? 's' : ''}
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
                            Video
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
    const variantCounts = {
        pending: variants.filter((v: any) => v.yvarprodstatut === 'not_approved').length,
        approved: variants.filter((v: any) => v.yvarprodstatut === 'approved').length,
        revision: variants.filter((v: any) => v.yvarprodstatut === 'rejected').length,
        rejected: variants.filter((v: any) => v.yvarprodstatut === 'rejected').length,
    };

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
                        <span className="text-gray-500 text-sm ml-2">No Media</span>
                    </div>
                )}

                {/* Product Info */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Category:</span>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {category?.xcategprodintitule || "Unknown"}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Store:</span>
                        <span className="text-white">
                            {product.store?.yboutiqueintitule || "Unknown Store"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Variants:</span>
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                            <span className="text-white">{variants.length || 0}</span>
                            {variantCounts.pending > 0 && (
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                                    {variantCounts.pending} pending
                                </Badge>
                            )}
                            {variantCounts.revision > 0 && (
                                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                                    {variantCounts.revision} revision
                                </Badge>
                            )}
                            {variantCounts.rejected > 0 && (
                                <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                    {variantCounts.rejected} rejected
                                </Badge>
                            )}
                            {variantCounts.approved > 0 && (
                                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                    {variantCounts.approved} approved
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* 3D Models indicator */}
                    {product.yobjet3d?.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">3D Models:</span>
                            <div className="flex items-center gap-1">
                                <Box className="h-3 w-3 text-purple-400" />
                                <span className="text-purple-400">{product.yobjet3d.length}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">
                            {new Date(product.sysdate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center pt-2 border-t border-gray-700/50">
                    <Button
                        size="sm"
                        onClick={onAudit}
                        className="w-full h-9 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                        title="Audit Product"
                    >
                        <FileSearch className="h-4 w-4 mr-2" />
                        Audit Product
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}