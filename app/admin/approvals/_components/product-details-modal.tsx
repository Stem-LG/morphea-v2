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
    AlertTriangle
} from "lucide-react";
import type { ProductWithObjects } from "@/hooks/useProducts";

// Extended type for products with variants
interface ProductWithVariants extends ProductWithObjects {
    yvarprod?: Array<{
        yvarprodid: number;
        yvarprodstatut?: string;
        yvarprodintitule: string;
        [key: string]: any;
    }>;
}
import { useLanguage } from "@/hooks/useLanguage";
import { useCategories } from "@/hooks/useCategories";
import { useProductVariants } from "@/hooks/useProductVariants";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useInfoactions } from "@/hooks/useInfoactions";
import { 
    useApproveVariant, 
    useNeedsRevisionVariant, 
    useRejectVariant, 
    useBulkApproveVariants 
} from "@/hooks/useVariantApprovals";

interface ProductDetailsModalProps {
    product: ProductWithVariants;
    onClose: () => void;
    onApprove: (productId: number, approvalData: ApprovalData) => void;
    onNeedsRevision: (productId: number, comments: string) => void;
    onDelete: (productId: number) => void;
}

interface ApprovalData {
    categoryId: number;
    infoactionId: number;
    variants: {
        yvarprodid: number;
        yvarprodprixcatalogue: number;
        yvarprodprixpromotion: number | null;
        yvarprodpromotiondatedeb: string | null;
        yvarprodpromotiondatefin: string | null;
        yvarprodnbrjourlivraison: number;
        currencyId: number;
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
    const [selectedInfoactionId, setSelectedInfoactionId] = useState<number | null>(null);
    const [variantData, setVariantData] = useState<Record<number, {
        yvarprodprixcatalogue: string;
        yvarprodprixpromotion: string;
        yvarprodpromotiondatedeb: string;
        yvarprodpromotiondatefin: string;
        yvarprodnbrjourlivraison: string;
        currencyId: string;
    }>>({});

    // Load data
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: variants, isLoading: variantsLoading } = useProductVariants(product.yprodid);
    const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
    const { actions: infoactions, loading: infoactionsLoading } = useInfoactions();

    // Variant approval mutations
    const approveVariantMutation = useApproveVariant();
    const needsRevisionVariantMutation = useNeedsRevisionVariant();
    const rejectVariantMutation = useRejectVariant();
    const bulkApproveVariantsMutation = useBulkApproveVariants();

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
                    currencyId: variant.xdeviseidfk?.toString() || '',
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
        if (!selectedCategoryId || !selectedInfoactionId) return false;
        
        if (!variants || variants.length === 0) return false;

        for (const variant of variants) {
            const data = variantData[variant.yvarprodid];
            if (!data) return false;
            
            // Required fields validation
            if (!data.yvarprodprixcatalogue ||
                !data.yvarprodnbrjourlivraison ||
                !data.currencyId) {
                return false;
            }

            // Numeric validation
            if (isNaN(Number(data.yvarprodprixcatalogue)) ||
                isNaN(Number(data.yvarprodnbrjourlivraison)) ||
                isNaN(Number(data.currencyId))) {
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
            alert(t('admin.productApprovalsDetail.fillRequiredFields'));
            return;
        }

        const approvalData: ApprovalData = {
            categoryId: selectedCategoryId!,
            infoactionId: selectedInfoactionId!,
            variants: variants!.map(variant => ({
                yvarprodid: variant.yvarprodid,
                yvarprodprixcatalogue: Number(variantData[variant.yvarprodid].yvarprodprixcatalogue),
                yvarprodprixpromotion: variantData[variant.yvarprodid].yvarprodprixpromotion
                    ? Number(variantData[variant.yvarprodid].yvarprodprixpromotion)
                    : null,
                yvarprodpromotiondatedeb: variantData[variant.yvarprodid].yvarprodpromotiondatedeb || null,
                yvarprodpromotiondatefin: variantData[variant.yvarprodid].yvarprodpromotiondatefin || null,
                yvarprodnbrjourlivraison: Number(variantData[variant.yvarprodid].yvarprodnbrjourlivraison),
                currencyId: Number(variantData[variant.yvarprodid].currencyId),
            }))
        };

        onApprove(product.yprodid, approvalData);
    };

    const handleNeedsRevision = () => {
        onNeedsRevision(product.yprodid, "");
    };

    // Individual variant approval handlers
    const handleApproveVariant = async (variantId: number) => {
        const vData = variantData[variantId];
        if (!vData) return;

        const approvalData = {
            yvarprodprixcatalogue: Number(vData.yvarprodprixcatalogue),
            yvarprodprixpromotion: vData.yvarprodprixpromotion
                ? Number(vData.yvarprodprixpromotion)
                : null,
            yvarprodpromotiondatedeb: vData.yvarprodpromotiondatedeb || null,
            yvarprodpromotiondatefin: vData.yvarprodpromotiondatefin || null,
            yvarprodnbrjourlivraison: Number(vData.yvarprodnbrjourlivraison),
            currencyId: Number(vData.currencyId),
        };

        try {
            await approveVariantMutation.mutateAsync({ variantId, approvalData });
        } catch (error) {
            console.error('Failed to approve variant:', error);
        }
    };

    const handleNeedsRevisionVariant = async (variantId: number) => {
        try {
            await needsRevisionVariantMutation.mutateAsync({ variantId, comments: "" });
        } catch (error) {
            console.error('Failed to mark variant as needs revision:', error);
        }
    };

    const handleRejectVariant = async (variantId: number) => {
        if (confirm('Are you sure you want to reject this variant?')) {
            try {
                await rejectVariantMutation.mutateAsync({ variantId });
            } catch (error) {
                console.error('Failed to reject variant:', error);
            }
        }
    };

    const handleBulkApproveVariants = async () => {
        if (!variants) return;

        const approvalDataMap: Record<number, any> = {};
        const variantIds: number[] = [];

        for (const variant of variants) {
            const data = variantData[variant.yvarprodid];
            if (data && variant.yvarprodstatut !== 'approved') {
                variantIds.push(variant.yvarprodid);
                approvalDataMap[variant.yvarprodid] = {
                    yvarprodprixcatalogue: Number(data.yvarprodprixcatalogue),
                    yvarprodprixpromotion: data.yvarprodprixpromotion
                        ? Number(data.yvarprodprixpromotion)
                        : null,
                    yvarprodpromotiondatedeb: data.yvarprodpromotiondatedeb || null,
                    yvarprodpromotiondatefin: data.yvarprodpromotiondatefin || null,
                    yvarprodnbrjourlivraison: Number(data.yvarprodnbrjourlivraison),
                    currencyId: Number(data.currencyId),
                };
            }
        }

        if (variantIds.length > 0) {
            try {
                await bulkApproveVariantsMutation.mutateAsync({ 
                    variantIds, 
                    approvalData: approvalDataMap 
                });
            } catch (error) {
                console.error('Failed to bulk approve variants:', error);
            }
        }
    };

    const validateVariantData = (variantId: number): boolean => {
        const data = variantData[variantId];
        if (!data) return false;
        
        // Required fields validation
        if (!data.yvarprodprixcatalogue ||
            !data.yvarprodnbrjourlivraison ||
            !data.currencyId) {
            return false;
        }

        // Numeric validation
        if (isNaN(Number(data.yvarprodprixcatalogue)) ||
            isNaN(Number(data.yvarprodnbrjourlivraison)) ||
            isNaN(Number(data.currencyId))) {
            return false;
        }

        // If promotion price is provided, validate dates
        if (data.yvarprodprixpromotion && 
            (!data.yvarprodpromotiondatedeb || !data.yvarprodpromotiondatefin)) {
            return false;
        }

        return true;
    };

    const getVariantStatusIcon = (status?: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case "needs_revision":
                return <AlertTriangle className="h-4 w-4 text-orange-400" />;
            case "rejected":
                return <X className="h-4 w-4 text-red-400" />;
            default:
                return <Package className="h-4 w-4 text-yellow-400" />;
        }
    };

    const getVariantStatusText = (status?: string) => {
        switch (status) {
            case "approved":
                return "Approved";
            case "needs_revision":
                return "Needs Revision";
            case "rejected":
                return "Rejected";
            default:
                return "Pending";
        }
    };

    const getVariantStatusColor = (status?: string) => {
        switch (status) {
            case "approved":
                return "text-green-400 bg-green-400/10 border-green-400/20";
            case "needs_revision":
                return "text-orange-400 bg-orange-400/10 border-orange-400/20";
            case "rejected":
                return "text-red-400 bg-red-400/10 border-red-400/20";
            default:
                return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
        }
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
                return t('admin.productApprovalsDetail.approved');
            case "needs_revision":
                return t('admin.productApprovalsDetail.needsRevisionStatus');
            default:
                return t('admin.productApprovalsDetail.pendingApproval');
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
        { id: "details", label: t('admin.productApprovalsDetail.productDetails'), icon: Package },
        { id: "objects", label: t('admin.productApprovalsDetail.objectsTab'), icon: Box },
        { id: "approval", label: t('admin.productApprovalsDetail.approvalTab'), icon: CheckCircle }
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
                                    {t('admin.productApprovalsDetail.productCode')}: {product.yprodcode}
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
                                        {t('admin.productApprovalsDetail.basicInformation')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">{t('admin.productApprovalsDetail.productName')}</label>
                                        <p className="text-white font-medium">{product.yprodintitule}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">{t('admin.productApprovalsDetail.productCode')}</label>
                                        <p className="text-white font-medium">{product.yprodcode}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400">{t('admin.productApprovalsDetail.technicalDetails')}</label>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {product.yproddetailstech || t('admin.productApprovalsDetail.noImageAvailable')}
                                        </p>
                                    </div>
                                    {product.sysdate && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-400">{t('admin.productApprovalsDetail.createdDate')}</label>
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(product.sysdate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )}
                                    {product.sysuser && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-400">{t('admin.productApprovalsDetail.createdBy')}</label>
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
                                        {t('admin.productApprovalsDetail.productPreview')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Product Image Placeholder */}
                                    <div className="w-full h-48 bg-gradient-to-br from-morpheus-blue-dark/10 to-morpheus-blue-light/10 rounded-lg flex items-center justify-center border border-slate-600/30 mb-4">
                                        <div className="text-center">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-400 text-sm">{t('admin.productApprovalsDetail.productImage')}</p>
                                            <p className="text-gray-500 text-xs">{t('admin.productApprovalsDetail.noImageAvailable')}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-morpheus-blue-dark/30 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Box className="h-4 w-4 text-blue-400" />
                                                <span className="text-xs text-gray-300">{t('admin.productApprovalsDetail.threeDObjects')}</span>
                                            </div>
                                            <div className="text-lg font-bold text-white">
                                                {product.yobjet3d?.length || 0}
                                            </div>
                                        </div>
                                        <div className="bg-morpheus-blue-dark/30 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Palette className="h-4 w-4 text-purple-400" />
                                                <span className="text-xs text-gray-300">{t('admin.productApprovalsDetail.variants')}</span>
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
                                    {t('admin.productApprovalsDetail.threeDObjectsCount').replace('{0}', (product.yobjet3d?.length || 0).toString())}
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
                                                        {t('admin.productApprovalsDetail.threeDObject')} {index + 1}
                                                    </span>
                                                    
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">                
                                                {obj.yobjet3durl && (
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-400">{t('admin.productApprovalsDetail.threeDModel')}</label>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(obj.yobjet3durl, '_blank')}
                                                                className="border-slate-600 text-blue-400 hover:bg-blue-600/10"
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                                {t('admin.productApprovalsDetail.view3DModel')}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                {t('admin.productApprovalsDetail.download')}
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
                                    <p className="text-gray-300 text-lg">{t('admin.productApprovalsDetail.noThreeDObjectsAvailable')}</p>
                                    <p className="text-gray-400 text-sm">{t('admin.productApprovalsDetail.noThreeDObjectsDescription')}</p>
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
                                        {t('admin.productApprovalsDetail.productCategory')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">{t('admin.productApprovalsDetail.selectCategory')} *</Label>
                                        {categoriesLoading ? (
                                            <div className="text-gray-400">{t('admin.productApprovalsDetail.loadingCategories')}</div>
                                        ) : (
                                            <select
                                                value={selectedCategoryId || ''}
                                                onChange={(e) => setSelectedCategoryId(Number(e.target.value) || null)}
                                                className="w-full p-3 bg-morpheus-blue-dark/30 border border-slate-600 rounded-md text-white"
                                            >
                                                <option value="">{t('admin.productApprovalsDetail.selectCategoryPlaceholder')}</option>
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

                            {/* Infoaction Selection */}
                            <Card className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border-slate-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-morpheus-gold-light" />
                                        Product Infoaction
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">Select Infoaction *</Label>
                                        {infoactionsLoading ? (
                                            <div className="text-gray-400">Loading infoactions...</div>
                                        ) : (
                                            <select
                                                value={selectedInfoactionId || ''}
                                                onChange={(e) => setSelectedInfoactionId(Number(e.target.value) || null)}
                                                className="w-full p-3 bg-morpheus-blue-dark/30 border border-slate-600 rounded-md text-white"
                                            >
                                                <option value="">Select an infoaction...</option>
                                                {infoactions?.map(infoaction => (
                                                    <option key={infoaction.yinfospotactionsid} value={infoaction.yinfospotactionsid}>
                                                        {infoaction.yinfospotactionstitle} ({infoaction.yinfospotactionstype})
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
                                        {t('admin.productApprovalsDetail.productVariants').replace('{0}', (variants?.length || 0).toString())}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {variantsLoading || currenciesLoading ? (
                                        <div className="text-gray-400">{t('admin.productApprovalsDetail.loadingVariants')}</div>
                                    ) : variants && variants.length > 0 ? (
                                        <div className="space-y-6">
                                            {/* Bulk Actions Header */}
                                            <div className="flex items-center justify-between p-4 bg-morpheus-blue-dark/30 rounded-lg border border-slate-600/30">
                                                <div className="flex items-center gap-2">
                                                    <Palette className="h-5 w-5 text-morpheus-gold-light" />
                                                    <span className="text-white font-medium">
                                                        {variants.length} Variant{variants.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <Button
                                                    onClick={handleBulkApproveVariants}
                                                    disabled={bulkApproveVariantsMutation.isPending || !variants.some(v => v.yvarprodstatut !== 'approved')}
                                                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-sm"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Approve All Pending
                                                </Button>
                                            </div>

                                            {variants.map((variant, index) => (
                                                <div key={variant.yvarprodid} className="p-4 bg-morpheus-blue-dark/20 rounded-lg border border-slate-600/30">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-white font-medium flex items-center gap-2">
                                                            <Palette className="h-4 w-4" />
                                                            {t('admin.productApprovalsDetail.variant')} {index + 1}: {variant.yvarprodintitule}
                                                        </h4>
                                                        <Badge className={`px-3 py-1 text-sm font-medium flex items-center gap-2 border ${getVariantStatusColor(variant.yvarprodstatut)}`}>
                                                            {getVariantStatusIcon(variant.yvarprodstatut)}
                                                            {getVariantStatusText(variant.yvarprodstatut)}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Currency Selection */}
                                                        <div>
                                                            <Label className="text-gray-300">Currency *</Label>
                                                            <select
                                                                value={variantData[variant.yvarprodid]?.currencyId || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'currencyId', e.target.value)}
                                                                className="w-full p-3 bg-morpheus-blue-dark/30 border border-slate-600 rounded-md text-white"
                                                                required
                                                                disabled={variant.yvarprodstatut === 'approved'}
                                                            >
                                                                <option value="">Select Currency</option>
                                                                {currencies?.map(currency => (
                                                                    <option key={currency.xdeviseid} value={currency.xdeviseid}>
                                                                        {currency.xdeviseintitule} ({currency.xdevisecodealpha})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Catalog Price */}
                                                        <div>
                                                            <Label className="text-gray-300">{t('admin.productApprovalsDetail.catalogPriceRequired')}</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={variantData[variant.yvarprodid]?.yvarprodprixcatalogue || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodprixcatalogue', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                                placeholder="0.00"
                                                                disabled={variant.yvarprodstatut === 'approved'}
                                                            />
                                                        </div>

                                                        {/* Delivery Days */}
                                                        <div>
                                                            <Label className="text-gray-300">{t('admin.productApprovalsDetail.deliveryDaysRequired')}</Label>
                                                            <Input
                                                                type="number"
                                                                value={variantData[variant.yvarprodid]?.yvarprodnbrjourlivraison || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodnbrjourlivraison', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                                placeholder="7"
                                                                disabled={variant.yvarprodstatut === 'approved'}
                                                            />
                                                        </div>

                                                        {/* Promotion Price */}
                                                        <div>
                                                            <Label className="text-gray-300">{t('admin.productApprovalsDetail.promotionPrice')}</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={variantData[variant.yvarprodid]?.yvarprodprixpromotion || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodprixpromotion', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                                placeholder="0.00"
                                                                disabled={variant.yvarprodstatut === 'approved'}
                                                            />
                                                        </div>

                                                        {/* Promotion Start Date */}
                                                        <div>
                                                            <Label className="text-gray-300">{t('admin.productApprovalsDetail.promotionStartDate')}</Label>
                                                            <Input
                                                                type="date"
                                                                value={variantData[variant.yvarprodid]?.yvarprodpromotiondatedeb || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodpromotiondatedeb', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                                disabled={variant.yvarprodstatut === 'approved'}
                                                            />
                                                        </div>

                                                        {/* Promotion End Date */}
                                                        <div className="md:col-span-2">
                                                            <Label className="text-gray-300">{t('admin.productApprovalsDetail.promotionEndDate')}</Label>
                                                            <Input
                                                                type="date"
                                                                value={variantData[variant.yvarprodid]?.yvarprodpromotiondatefin || ''}
                                                                onChange={(e) => updateVariantField(variant.yvarprodid, 'yvarprodpromotiondatefin', e.target.value)}
                                                                className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                                                disabled={variant.yvarprodstatut === 'approved'}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Variant Info */}
                                                    <div className="mt-4 flex gap-4 text-sm text-gray-400">
                                                        <span>{t('admin.productApprovalsDetail.color')}: {variant.xcouleur?.xcouleurintitule || t('admin.productApprovalsDetail.na')}</span>
                                                        <span>{t('admin.productApprovalsDetail.size')}: {variant.xtaille?.xtailleintitule || t('admin.productApprovalsDetail.na')}</span>
                                                        <span>{t('admin.productApprovalsDetail.currency')}: {variant.xdevise?.xdeviseintitule || t('admin.productApprovalsDetail.na')}</span>
                                                    </div>

                                                    {/* Individual Variant Actions */}
                                                    {variant.yvarprodstatut !== 'approved' && (
                                                        <div className="mt-4 flex gap-2">
                                                            <Button
                                                                onClick={() => handleApproveVariant(variant.yvarprodid)}
                                                                disabled={
                                                                    !validateVariantData(variant.yvarprodid) ||
                                                                    approveVariantMutation.isPending
                                                                }
                                                                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-sm disabled:opacity-50"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Approve Variant
                                                            </Button>
                                                            
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleNeedsRevisionVariant(variant.yvarprodid)}
                                                                disabled={needsRevisionVariantMutation.isPending}
                                                                className="border-orange-600 text-orange-400 hover:bg-orange-600/10 text-sm"
                                                            >
                                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                                Needs Revision
                                                            </Button>
                                                            
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleRejectVariant(variant.yvarprodid)}
                                                                disabled={rejectVariantMutation.isPending}
                                                                className="border-red-600 text-red-400 hover:bg-red-600/10 text-sm"
                                                            >
                                                                <X className="h-4 w-4 mr-2" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-300 text-lg">{t('admin.productApprovalsDetail.noVariantsFound')}</p>
                                            <p className="text-gray-400 text-sm">{t('admin.productApprovalsDetail.noVariantsDescription')}</p>
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
                        {t('admin.productApprovalsDetail.close')}
                    </Button>
                    
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onDelete(product.yprodid)}
                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('admin.productApprovalsDetail.deleteProduct')}
                        </Button>
                        
                        <Button
                            variant="outline"
                            onClick={handleNeedsRevision}
                            className="border-orange-600 text-orange-400 hover:bg-orange-600/10"
                        >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            {t('admin.productApprovalsDetail.needsRevision')}
                        </Button>
                        
                        <Button
                            onClick={handleApprove}
                            disabled={!validateApprovalData()}
                            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t('admin.productApprovalsDetail.approveProduct')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
