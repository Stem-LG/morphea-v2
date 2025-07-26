"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    X, 
    CheckCircle, 
    Trash2, 
    Package, 
    Eye,
    ExternalLink,
    Calendar,
    User,
    Tag,
    Palette,
    Box,
    Download,
    AlertTriangle,
    Save
} from "lucide-react";
import type { ProductWithObjects } from "@/hooks/useProducts";
import { useLanguage } from "@/hooks/useLanguage";
import { useCategories } from "@/hooks/useCategories";
import { useProductVariants } from "@/hooks/useProductVariants";

interface ProductDetailsModalProps {
    product: ProductWithObjects;
    onClose: () => void;
    onApprove: (productId: number, approvalData: ApprovalData) => void;
    onNeedsRevision: (productId: number, comments: string) => void;
    onDelete: (productId: number) => void;
}

interface ApprovalData {
    categoryId: number;
    variants: {
        yvarprodid: number;
        yvarprodprixcatalogue: number;
        yvarprodprixpromotion: number | null;
        yvarprodpromotiondatedeb: string | null;
        yvarprodpromotiondatefin: string | null;
        yvarprodnbrjourlivraison: number;
    }[];
}

export function ProductDetailsModal({ 
    product, 
    onClose, 
    onApprove,
    onNeedsRevision,
    onDelete 
}: ProductDetailsModalProps) {
    const { t } = useLanguage();
    const [selectedTab, setSelectedTab] = useState<"details" | "objects" | "approval">("details");
    
    // Approval form state
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [variantData, setVariantData] = useState<Record<number, {
        yvarprodprixcatalogue: string;
        yvarprodprixpromotion: string;
        yvarprodpromotiondatedeb: string;
        yvarprodpromotiondatefin: string;
        yvarprodnbrjourlivraison: string;
    }>>({});

    // Load data
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: variants, isLoading: variantsLoading } = useProductVariants(product.yprodid);

    // Initialize variant data when variants are loaded
    useEffect(() => {
        if (variants && variants.length > 0) {
            const initialData: Record<number, any> = {};
            variants.forEach(variant => {
                initialData[variant.yvarprodid] = {
                    yvarprodprixcatalogue: variant.yvarprodprixcatalogue?.toString() || '',
                    yvarprodprixpromotion: variant.yvarprodprixpromotion?.toString() || '',
                    yvarprodpromotiondatedeb: variant.yvarprodpromotiondatedeb || '',
                    yvarprodpromotiondatefin: variant.yvarprodpromotiondatefin || '',
                    yvarprodnbrjourlivraison: variant.yvarprodnbrjourlivraison?.toString() || '',
                };
            });
            setVariantData(initialData);
        }
    }, [variants]);

    const updateVariantField = (variantId: number, field: string, value: string) => {
        setVariantData(prev => ({
            ...prev,
            [variantId]: {
                ...prev[variantId],
                [field]: value
            }
        }));
    };

    const validateApprovalData = (): boolean => {
        if (!selectedCategoryId) return false;
        
        if (!variants || variants.length === 0) return false;

        for (const variant of variants) {
            const data = variantData[variant.yvarprodid];
            if (!data) return false;
            
            // Required fields validation
            if (!data.yvarprodprixcatalogue || 
                !data.yvarprodnbrjourlivraison) {
                return false;
            }

            // Numeric validation
            if (isNaN(Number(data.yvarprodprixcatalogue)) ||
                isNaN(Number(data.yvarprodnbrjourlivraison))) {
                return false;
            }

            // If promotion price is provided, validate dates
            if (data.yvarprodprixpromotion && 
                (!data.yvarprodpromotiondatedeb || !data.yvarprodpromotiondatefin)) {
                return false;
            }
        }

        return true;
    };

    const handleApprove = () => {
        if (!validateApprovalData()) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        const approvalData: ApprovalData = {
            categoryId: selectedCategoryId!,
            variants: variants!.map(variant => ({
                yvarprodid: variant.yvarprodid,
                yvarprodprixcatalogue: Number(variantData[variant.yvarprodid].yvarprodprixcatalogue),
                yvarprodprixpromotion: variantData[variant.yvarprodid].yvarprodprixpromotion 
                    ? Number(variantData[variant.yvarprodid].yvarprodprixpromotion) 
                    : null,
                yvarprodpromotiondatedeb: variantData[variant.yvarprodid].yvarprodpromotiondatedeb || null,
                yvarprodpromotiondatefin: variantData[variant.yvarprodid].yvarprodpromotiondatefin || null,
                yvarprodnbrjourlivraison: Number(variantData[variant.yvarprodid].yvarprodnbrjourlivraison),
            }))
        };

        onApprove(product.yprodid, approvalData);
    };

    const handleNeedsRevision = () => {
        onNeedsRevision(product.yprodid, "");
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case "needs_revision":
                return <AlertTriangle className="h-4 w-4 text-orange-400" />;
            default:
                return <Package className="h-4 w-4 text-yellow-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "approved":
                return "Approved";
            case "needs_revision":
                return "Needs Revision";
            default:
                return "Pending Approval";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "text-green-400 bg-green-400/10 border-green-400/20";
            case "needs_revision":
                return "text-orange-400 bg-orange-400/10 border-orange-400/20";
            default:
                return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
        }
    };

    const tabs = [
        { id: "details", label: "Product Details", icon: Package },
        { id: "objects", label: "3D Objects", icon: Box },
        { id: "approval", label: "Approval Form", icon: CheckCircle }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700/50">
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {product.yprodintitule}
                                </h2>
                                <p className="text-gray-300">
                                    Code: {product.yprodcode}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={`px-3 py-1 text-sm font-medium flex items-center gap-2 border ${getStatusColor(product.yprodstatut || 'not_approved')}`}>
                                {getStatusIcon(product.yprodstatut || 'not_approved')}
                                {getStatusText(product.yprodstatut || 'not_approved')}
                            </Badge>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4">
                    <div className="flex space-x-1 bg-morpheus-blue-dark/30 p-1 rounded-lg">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        selectedTab === tab.id
                                            ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg"
                                            : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {selectedTab === "details" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <Card className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border-slate-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Package className="h-5 w-5 text-morpheus-gold-light" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Product Name</label>
                                        <p className="text-white font-medium">{product.yprodintitule}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Product Code</label>
                                        <p className="text-white font-medium">{product.yprodcode}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">Technical Details</label>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {product.yproddetailstech || "No technical details provided"}
                                        </p>
                                    </div>
                                    {product.sysdate && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-400">Created Date</label>
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(product.sysdate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )}
                                    {product.sysuser && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-400">Created By</label>
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <User className="h-4 w-4" />
                                                <span>{product.sysuser}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Product Preview */}
                            <Card className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border-slate-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-morpheus-gold-light" />
                                        Product Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Product Image Placeholder */}
                                    <div className="w-full h-48 bg-gradient-to-br from-morpheus-blue-dark/10 to-morpheus-blue-light/10 rounded-lg flex items-center justify-center border border-slate-600/30 mb-4">
                                        <div className="text-center">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-400 text-sm">Product Image</p>
                                            <p className="text-gray-500 text-xs">No image available</p>
                                        </div>
                                    </div>
                                    
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-morpheus-blue-dark/30 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Box className="h-4 w-4 text-blue-400" />
                                                <span className="text-xs text-gray-300">3D Objects</span>
                                            </div>
                                            <div className="text-lg font-bold text-white">
                                                {product.yobjet3d?.length || 0}
                                            </div>
                                        </div>
                                        <div className="bg-morpheus-blue-dark/30 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Palette className="h-4 w-4 text-purple-400" />
                                                <span className="text-xs text-gray-300">Variants</span>
                                            </div>
                                            <div className="text-lg font-bold text-white">
                                                {variants?.length || 0}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {selectedTab === "objects" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">
                                    3D Objects ({product.yobjet3d?.length || 0})
                                </h3>
                            </div>
                            
                            {product.yobjet3d && product.yobjet3d.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {product.yobjet3d.map((obj, index) => (
                                        <Card key={obj.yobjet3did} className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border-slate-700/50">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-white flex items-center justify-between">
                                                    <span className="flex items-center gap-2">
                                                        <Box className="h-5 w-5 text-morpheus-gold-light" />
                                                        3D Object {index + 1}
                                                    </span>
                                                    <Badge variant="outline" className="border-slate-600 text-gray-300">
                                                        Order: {obj.yobjet3dorder || 'N/A'}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {obj.yobjet3dcouleur && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-400">Color</label>
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-4 h-4 rounded border border-slate-600"
                                                                style={{ backgroundColor: obj.yobjet3dcouleur }}
                                                            ></div>
                                                            <span className="text-white">{obj.yobjet3dcouleur}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div>
                                                    <label className="text-sm font-medium text-gray-400">Action</label>
                                                    <p className="text-white">{obj.yobjet3daction}</p>
                                                </div>
                                                
                                                {obj.yobjet3durl && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-400">3D Model</label>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(obj.yobjet3durl, '_blank')}
                                                                className="border-slate-600 text-blue-400 hover:bg-blue-600/10"
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                                View 3D Model
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-300 text-lg">No 3D objects available</p>
                                    <p className="text-gray-400 text-sm">This product doesn't have any 3D models attached</p>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTab === "approval" && (
                        <div className="space-y-6">
                            {/* Category Selection */}
                            <Card className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border-slate-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-morpheus-gold-light" />
                                        Product Category
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Select Category *</Label>
                                        {categoriesLoading ? (
                                            <div className="text-gray-400">Loading categories...</div>
                                        ) : (
                                            <select
                                                value={selectedCategoryId || ''}
                                                onChange={(e) => setSelectedCategoryId(Number(e.target.value) || null)}
                                                className="w-full p-3 bg-morpheus-blue-dark/30 border border-slate-600 rounded-md text-white"
                                            >
                                                <option value="">Choose a category...</option>
                                                {categories?.map(category => (
                                                    <option key={category.xcategprodid} value={category.xcategprodid}>
                                                        {category.xcategprodintitule}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Variants Pricing */}
                            <Card className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border-slate-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-morpheus-gold-light" />
                                        Product Variants ({variants?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {variantsLoading ? (
                                        <div className="text-gray-400">Loading variants...</div>
                                    ) : variants && variants.length > 0 ? (
                                        <div className="space-y-6">
                                            {variants.map((variant, index) => (
                                                <div key={variant.yvarprodid} className="p-4 bg-morpheus-blue-dark/20 rounded-lg border border-slate-600/30">
                                                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                                                        <Palette className="h-4 w-4" />
                                                        Variant {index + 1}: {variant.yvarprodintitule}
                                                    </h4>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Catalog Price */}
                                                        <div>
                                                            <Label className="text-gray-300">Catalog Price *</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={variantData[variant.yvarprodid]?.yvarprodprixcatalogue || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodprixcatalogue', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                                placeholder="0.00"
                                                            />
                                                        </div>

                                                        {/* Delivery Days */}
                                                        <div>
                                                            <Label className="text-gray-300">Delivery Days *</Label>
                                                            <Input
                                                                type="number"
                                                                value={variantData[variant.yvarprodid]?.yvarprodnbrjourlivraison || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodnbrjourlivraison', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                                placeholder="7"
                                                            />
                                                        </div>

                                                        {/* Promotion Price */}
                                                        <div>
                                                            <Label className="text-gray-300">Promotion Price</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={variantData[variant.yvarprodid]?.yvarprodprixpromotion || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodprixpromotion', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                                placeholder="0.00"
                                                            />
                                                        </div>

                                                        {/* Promotion Start Date */}
                                                        <div>
                                                            <Label className="text-gray-300">Promotion Start Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={variantData[variant.yvarprodid]?.yvarprodpromotiondatedeb || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodpromotiondatedeb', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                            />
                                                        </div>

                                                        {/* Promotion End Date */}
                                                        <div className="md:col-span-2">
                                                            <Label className="text-gray-300">Promotion End Date</Label>
                                                            <Input
                                                                type="date"
                                                                value={variantData[variant.yvarprodid]?.yvarprodpromotiondatefin || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodpromotiondatefin', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Variant Info */}
                                                    <div className="mt-4 flex gap-4 text-sm text-gray-400">
                                                        <span>Color: {variant.xcouleur?.xcouleurintitule || 'N/A'}</span>
                                                        <span>Size: {variant.xtaille?.xtailleintitule || 'N/A'}</span>
                                                        <span>Currency: {variant.xdevise?.xdeviseintitule || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-300 text-lg">No variants found</p>
                                            <p className="text-gray-400 text-sm">This product doesn't have any variants</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center p-6 border-t border-slate-700/50 bg-morpheus-blue-dark/20">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                    >
                        Close
                    </Button>
                    
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onDelete(product.yprodid)}
                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Product
                        </Button>
                        
                        <Button
                            variant="outline"
                            onClick={handleNeedsRevision}
                            className="border-orange-600 text-orange-400 hover:bg-orange-600/10"
                        >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Needs Revision
                        </Button>
                        
                        <Button
                            onClick={handleApprove}
                            disabled={!validateApprovalData()}
                            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Product
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
