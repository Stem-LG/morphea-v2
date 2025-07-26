"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Package,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useStoreProducts, useStoreProductStats } from "@/hooks/useAdminV2Products";
import { useDeleteProduct } from "@/hooks/useProducts";
import type { ProductWithObjects } from "@/hooks/useProducts";
import Image from "next/image";

interface ProductsListProps {
    storeId: string;
    store: any;
}

type FilterStatus = "all" | "approved" | "pending" | "rejected";

export function ProductsList({ storeId, store }: ProductsListProps) {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    
    const { data: products, isLoading, error } = useStoreProducts(storeId, {
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchTerm || undefined
    });
    const { data: productStats } = useStoreProductStats(storeId);
    const deleteProduct = useDeleteProduct();

    const handleDeleteProduct = async (productId: number) => {
        if (window.confirm(t('admin.confirmDeleteProduct'))) {
            try {
                await deleteProduct.mutateAsync(productId);
            } catch (error) {
                console.error("Failed to delete product:", error);
                alert(t('admin.deleteProductFailed'));
            }
        }
    };

    // Filter products based on search term and filters
    const filteredProducts = products?.filter((product: ProductWithObjects) => {
        const matchesSearch = product.yprodintitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.yprodcode?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === "all" || 
                            (filterStatus === "approved" && product.yprodstatut === "approved") ||
                            (filterStatus === "pending" && product.yprodstatut === "not_approved") ||
                            (filterStatus === "rejected" && product.yprodstatut === "rejected");
        
        return matchesSearch && matchesStatus;
    }) || [];

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
                return "text-green-400 bg-green-400/10";
            case "rejected":
                return "text-red-400 bg-red-400/10";
            default:
                return "text-yellow-400 bg-yellow-400/10";
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

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-400 text-lg">{t('admin.errorLoadingProducts')}: {error.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {t('admin.productManagement')}
                    </h2>
                    <p className="text-gray-300">
                        {filteredProducts.length} {filteredProducts.length === 1 ? t('admin.productSingular') : t('admin.productPlural')}
                    </p>
                </div>
                
                <Button
                    onClick={() => window.location.href = `/admin/stores/${storeId}/products/new`}
                    className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white font-semibold shadow-2xl transition-all duration-300 hover:scale-105"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.addNewProduct')}
                </Button>
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
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
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
                        {searchTerm || filterStatus !== "all" ? "No products match your filters" : t('admin.noProductsFound')}
                    </h3>
                    <p className="text-gray-300 mb-6">
                        {searchTerm || filterStatus !== "all" 
                            ? "Try adjusting your search or filter criteria"
                            : t('admin.noProductsDescription')
                        }
                    </p>
                    {(!searchTerm && filterStatus === "all") && (
                        <Button
                            onClick={() => window.location.href = `/admin/stores/${storeId}/products/new`}
                            className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('admin.addNewProduct')}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product: ProductWithObjects) => (
                        <Card
                            key={product.yprodid}
                            className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <Package className="h-5 w-5 text-morpheus-gold-light" />
                                        <span className="truncate">{product.yprodintitule}</span>
                                    </CardTitle>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(product.yprodstatut || 'not_approved')}`}>
                                        {getStatusIcon(product.yprodstatut || 'not_approved')}
                                        {getStatusText(product.yprodstatut || 'not_approved')}
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                {/* Product Image - Placeholder for now */}
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
                                        onClick={() => window.location.href = `/admin/stores/${storeId}/products/${product.yprodid}`}
                                        className="flex-1 border-slate-600 text-white hover:bg-slate-700/50"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.location.href = `/admin/stores/${storeId}/products/${product.yprodid}/edit`}
                                        className="flex-1 border-slate-600 text-white hover:bg-slate-700/50"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteProduct(product.yprodid)}
                                        disabled={deleteProduct.isPending}
                                        className="px-3 border-red-600 text-red-400 hover:bg-red-600/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}