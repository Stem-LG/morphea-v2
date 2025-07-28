"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    CheckCircle, 
    Eye, 
    Package, 
    Search,
    Filter,
    Clock,
    Trash2,
    AlertTriangle,
    Palette
} from "lucide-react";
import { usePendingProducts, useApproveProduct, useNeedsRevisionProduct } from "@/hooks/useProductApprovals";
import { useDeleteProduct } from "@/hooks/useProducts";
import { useLanguage } from "@/hooks/useLanguage";
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
import { ProductDetailsModal } from "./product-details-modal";

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

type FilterStatus = "all" | "pending" | "approved" | "needs_revision";
type SortOption = "newest" | "oldest" | "name" | "code";

export function ProductApprovals() {
    const { t } = useLanguage();
    const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    
    const { data: pendingProducts, isLoading } = usePendingProducts();
    const approveProductMutation = useApproveProduct();
    const needsRevisionMutation = useNeedsRevisionProduct();
    const deleteProductMutation = useDeleteProduct();

    // Filter and sort products
    const filteredProducts = pendingProducts?.filter((product: ProductWithVariants) => {
        const matchesSearch = product.yprodintitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.yprodcode?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === "all" || 
                            (filterStatus === "pending" && product.yprodstatut === "not_approved") ||
                            (filterStatus === "approved" && product.yprodstatut === "approved") ||
                            (filterStatus === "needs_revision" && product.yprodstatut === "needs_revision");
        
        return matchesSearch && matchesStatus;
    })?.sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.sysdate || 0).getTime() - new Date(a.sysdate || 0).getTime();
            case "oldest":
                return new Date(a.sysdate || 0).getTime() - new Date(b.sysdate || 0).getTime();
            case "name":
                return (a.yprodintitule || "").localeCompare(b.yprodintitule || "");
            case "code":
                return (a.yprodcode || "").localeCompare(b.yprodcode || "");
            default:
                return 0;
        }
    }) || [];

    const handleApprove = async (productId: number, approvalData: ApprovalData) => {
        try {
            await approveProductMutation.mutateAsync({ productId, approvalData });
            setSelectedProduct(null);
        } catch (error) {
            console.error('Failed to approve product:', error);
        }
    };

    const handleNeedsRevision = async (productId: number) => {
        try {
            await needsRevisionMutation.mutateAsync({ productId, comments: "" });
            setSelectedProduct(null);
        } catch (error) {
            console.error('Failed to mark product as needs revision:', error);
        }
    };

    const handleDelete = async (productId: number) => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                await deleteProductMutation.mutateAsync(productId);
                setSelectedProduct(null);
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case "needs_revision":
                return <AlertTriangle className="h-4 w-4 text-orange-400" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "approved":
                return "Approved";
            case "needs_revision":
                return "Needs Revision";
            default:
                return "Pending";
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

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpheus-gold-light/30 border-t-morpheus-gold-light mx-auto mb-4"></div>
                        <p className="text-white text-lg">{t('admin.loadingProducts')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        Product Approvals
                    </h1>
                    <p className="text-lg text-gray-300">
                        Review and approve pending products from stores
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search products by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-morpheus-blue-dark/30 border-slate-600 text-white placeholder-gray-400"
                    />
                </div>
                
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                        className="px-3 py-2 bg-morpheus-blue-dark/30 border border-slate-600 rounded-md text-white text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="needs_revision">Needs Revision</option>
                    </select>
                    
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 bg-morpheus-blue-dark/30 border border-slate-600 rounded-md text-white text-sm"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name A-Z</option>
                        <option value="code">Code A-Z</option>
                    </select>
                    
                    <Button variant="outline" size="sm" className="border-slate-600 text-white hover:bg-slate-700/50">
                        <Filter className="h-4 w-4 mr-2" />
                        More Filters
                    </Button>
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                        {searchTerm || filterStatus !== "pending" ? "No products match your filters" : "No pending products"}
                    </h3>
                    <p className="text-gray-300">
                        {searchTerm || filterStatus !== "pending" 
                            ? "Try adjusting your search or filter criteria"
                            : "All products have been reviewed and approved."
                        }
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product: ProductWithVariants) => (
                            <Card
                                key={product.yprodid}
                                className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-white text-lg truncate">
                                            {product.yprodintitule}
                                        </CardTitle>
                                        <Badge className={`px-2 py-1 text-xs font-medium flex items-center gap-1 border ${getStatusColor(product.yprodstatut || 'not_approved')}`}>
                                            {getStatusIcon(product.yprodstatut || 'not_approved')}
                                            {getStatusText(product.yprodstatut || 'not_approved')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-4">
                                    {/* Product Image Placeholder */}
                                    <div className="w-full h-32 bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 rounded-lg flex items-center justify-center border border-slate-600/30">
                                        <Package className="h-8 w-8 text-gray-400" />
                                    </div>

                                    {/* Product Details */}
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-300">
                                            <span className="font-medium">Code:</span> {product.yprodcode}
                                        </p>
                                        {product.yproddetailstech && (
                                            <p className="text-sm text-gray-300 line-clamp-2">
                                                {product.yproddetailstech}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-blue-400">
                                            <Package className="h-4 w-4" />
                                            <span>{product.yobjet3d?.length || 0} 3D Objects</span>
                                        </div>
                                        {(product as ProductWithVariants).yvarprod && (product as ProductWithVariants).yvarprod!.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Palette className="h-4 w-4 text-purple-400" />
                                                <span className="text-gray-300">{(product as ProductWithVariants).yvarprod!.length} Variants:</span>
                                                <div className="flex gap-1">
                                                    {(product as ProductWithVariants).yvarprod!.filter(v => v.yvarprodstatut === 'approved').length > 0 && (
                                                        <Badge className="px-1 py-0 text-xs bg-green-400/10 text-green-400 border-green-400/20">
                                                            {(product as ProductWithVariants).yvarprod!.filter(v => v.yvarprodstatut === 'approved').length}✓
                                                        </Badge>
                                                    )}
                                                    {(product as ProductWithVariants).yvarprod!.filter(v => !v.yvarprodstatut || v.yvarprodstatut === 'not_approved').length > 0 && (
                                                        <Badge className="px-1 py-0 text-xs bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                                                            {(product as ProductWithVariants).yvarprod!.filter(v => !v.yvarprodstatut || v.yvarprodstatut === 'not_approved').length}⏳
                                                        </Badge>
                                                    )}
                                                    {(product as ProductWithVariants).yvarprod!.filter(v => v.yvarprodstatut === 'needs_revision').length > 0 && (
                                                        <Badge className="px-1 py-0 text-xs bg-orange-400/10 text-orange-400 border-orange-400/20">
                                                            {(product as ProductWithVariants).yvarprod!.filter(v => v.yvarprodstatut === 'needs_revision').length}⚠
                                                        </Badge>
                                                    )}
                                                    {(product as ProductWithVariants).yvarprod!.filter(v => v.yvarprodstatut === 'rejected').length > 0 && (
                                                        <Badge className="px-1 py-0 text-xs bg-red-400/10 text-red-400 border-red-400/20">
                                                            {(product as ProductWithVariants).yvarprod!.filter(v => v.yvarprodstatut === 'rejected').length}✕
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedProduct(product)}
                                            className="flex-1 border-slate-600 text-white hover:bg-slate-700/50"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Review
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(product.yprodid)}
                                            disabled={deleteProductMutation.isPending}
                                            className="px-3 border-red-600 text-red-400 hover:bg-red-600/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Product Details Modal */}
            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onApprove={handleApprove}
                    onNeedsRevision={handleNeedsRevision}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
