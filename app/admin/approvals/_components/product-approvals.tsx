"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    CheckCircle, 
    XCircle, 
    Eye, 
    Package, 
    Search,
    Filter,
    MoreHorizontal,
    Clock,
    Trash2,
    AlertCircle
} from "lucide-react";
import { usePendingProducts, useApproveProduct } from "@/hooks/useProductApprovals";
import { useDeleteProduct } from "@/hooks/useProducts";
import { useLanguage } from "@/hooks/useLanguage";
import type { ProductWithObjects } from "@/hooks/useProducts";
import { ApprovalStats } from "./approval-stats";
import { ProductDetailsModal } from "./product-details-modal";

type FilterStatus = "all" | "pending" | "approved" | "rejected";
type SortOption = "newest" | "oldest" | "name" | "code";

export function ProductApprovals() {
    const { t } = useLanguage();
    const [selectedProduct, setSelectedProduct] = useState<ProductWithObjects | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    
    const { data: pendingProducts, isLoading, error } = usePendingProducts();
    const approveProductMutation = useApproveProduct();
    const deleteProductMutation = useDeleteProduct();

    // Filter and sort products
    const filteredProducts = pendingProducts?.filter((product: ProductWithObjects) => {
        const matchesSearch = product.yprodintitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.yprodcode?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === "all" || 
                            (filterStatus === "pending" && product.yprodstatut === "not_approved") ||
                            (filterStatus === "approved" && product.yprodstatut === "approved") ||
                            (filterStatus === "rejected" && product.yprodstatut === "rejected");
        
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

    const handleApprove = async (productId: number) => {
        try {
            await approveProductMutation.mutateAsync(productId);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Failed to approve product:', error);
        }
    };

    const handleBulkApprove = async () => {
        if (selectedProducts.length === 0) return;
        
        if (confirm(`Are you sure you want to approve ${selectedProducts.length} products?`)) {
            try {
                for (const productId of selectedProducts) {
                    await approveProductMutation.mutateAsync(productId);
                }
                setSelectedProducts([]);
            } catch (error) {
                console.error('Failed to bulk approve products:', error);
            }
        }
    };

    const handleDelete = async (productId: number) => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                await deleteProductMutation.mutateAsync(productId);
                setSelectedProduct(null);
                setSelectedProducts(prev => prev.filter(id => id !== productId));
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
            try {
                for (const productId of selectedProducts) {
                    await deleteProductMutation.mutateAsync(productId);
                }
                setSelectedProducts([]);
            } catch (error) {
                console.error('Failed to bulk delete products:', error);
            }
        }
    };

    const toggleProductSelection = (productId: number) => {
        setSelectedProducts(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p.yprodid));
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case "rejected":
                return <XCircle className="h-4 w-4 text-red-400" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "approved":
                return "Approved";
            case "rejected":
                return "Rejected";
            default:
                return "Pending";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "text-green-400 bg-green-400/10 border-green-400/20";
            case "rejected":
                return "text-red-400 bg-red-400/10 border-red-400/20";
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
                        <p className="text-white text-lg">Loading pending products...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 text-lg">Error loading products: {error.message}</p>
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

            {/* Approval Statistics */}
            <ApprovalStats />

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
                        <option value="rejected">Rejected</option>
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

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-white font-medium">
                                    {selectedProducts.length} products selected
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedProducts([])}
                                    className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                                >
                                    Clear Selection
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleBulkApprove}
                                    disabled={approveProductMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    size="sm"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Selected
                                </Button>
                                <Button
                                    onClick={handleBulkDelete}
                                    disabled={deleteProductMutation.isPending}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-600 text-red-400 hover:bg-red-600/10"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="checkbox"
                            checked={selectedProducts.length === filteredProducts.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-morpheus-gold-light bg-morpheus-blue-dark border-slate-600 rounded focus:ring-morpheus-gold-light"
                        />
                        <span className="text-gray-300 text-sm">
                            Select all {filteredProducts.length} products
                        </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product: ProductWithObjects) => (
                            <Card
                                key={product.yprodid}
                                className={`bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group ${
                                    selectedProducts.includes(product.yprodid) ? 'ring-2 ring-morpheus-gold-light/50' : ''
                                }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product.yprodid)}
                                                onChange={() => toggleProductSelection(product.yprodid)}
                                                className="w-4 h-4 text-morpheus-gold-light bg-morpheus-blue-dark border-slate-600 rounded focus:ring-morpheus-gold-light"
                                            />
                                            <CardTitle className="text-white text-lg truncate">
                                                {product.yprodintitule}
                                            </CardTitle>
                                        </div>
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
                                            View Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(product.yprodid)}
                                            disabled={approveProductMutation.isPending}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve
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
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}