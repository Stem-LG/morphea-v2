"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuperSelect } from "@/components/super-select";
import { CheckCircle, Filter } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { DataTable } from "@/components/data-table";
import { useProductsByStatus } from "./_hooks/use-products-by-status";
import { useProductFilters } from "./_hooks/use-product-filters";
import { useProductColumns } from "./_components/product-columns";
import { ProductFilters } from "./_components/product-filters";
import { ProductCard } from "./_components/product-card";
import { useFilterOptions } from "./_hooks/use-filter-options";
import { ProductViewDialog } from "../stores/[storeId]/_components/product-view-dialog";

export default function AdminApprovedProductsPage() {
    const { t } = useLanguage();
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const { filters, updateFilters, pagination, updatePagination } = useProductFilters();

    // Dialog state for product view
    const [isProductViewDialogOpen, setIsProductViewDialogOpen] = useState(false);
    const [viewingProductId, setViewingProductId] = useState<number | null>(null);

    const {
        data: result,
        isLoading
    } = useProductsByStatus("approved", filters, pagination);

    const filterOptions = useFilterOptions();
    const products = result?.data || [];
    const paginationData = result?.pagination;

    const handleViewProduct = (product: any) => {
        setViewingProductId(product.yprodid);
        setIsProductViewDialogOpen(true);
    };

    const handleCloseViewDialog = () => {
        setIsProductViewDialogOpen(false);
        setViewingProductId(null);
    };

    // const handleEditProduct = (product: any) => {
    //     // TODO: Implement edit product functionality
    //     console.log("Edit product:", product);
    // };

    const columns = useProductColumns(handleViewProduct);

    // Render loading state or main content
    if (isLoading && !products.length) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-32 bg-gray-700 rounded mb-6"></div>
                    <div className="h-64 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">
                        {t("admin.approvedProducts") || "Approved Products"}
                    </h1>
                    <p className="text-lg text-gray-300">
                        {t("admin.manageApprovedProductsDesc") || "View and manage all approved products"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'table' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="border-gray-600"
                    >
                        {t("admin.approvals.table") || "Table"}
                    </Button>
                    <Button
                        variant={viewMode === 'cards' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                        className="border-gray-600"
                    >
                        {t("admin.approvals.cards") || "Cards"}
                    </Button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'table' ? (
                <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                {t("admin.approvedProductsList") || "Approved Products List"}
                            </div>
                            <div className="text-sm text-gray-300">
                                {paginationData?.total || 0} {t("admin.totalItems") || "total"}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={products}
                            columns={columns}
                            isLoading={isLoading}
                            filters={<ProductFilters filters={filters} onFiltersChange={updateFilters} />}
                            pagination={{
                                total: paginationData?.total || 0,
                                perPage: pagination.perPage,
                                pages: paginationData?.pages || 1,
                                currentPage: pagination.page,
                                onPageChange: (page) => updatePagination({ page }),
                            }}
                            serverFilters={true}
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Filters for card view */}
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm relative z-10">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-2 items-center">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <SuperSelect
                                    value={filters.event || ""}
                                    onValueChange={(value) => updateFilters({ event: value === "" ? null : (value as string) })}
                                    options={[
                                        { value: "", label: t("admin.allEvents") || "All Events" },
                                        ...filterOptions.events.map(event => ({
                                            value: event.yeventid.toString(),
                                            label: event.yeventintitule
                                        }))
                                    ]}
                                    placeholder={t("admin.selectEvent") || "Select Event"}
                                    className="w-40 md:w-44 lg:w-48"
                                />
                                <SuperSelect
                                    value={filters.mall || ""}
                                    onValueChange={(value) => updateFilters({ mall: value === "" ? null : (value as string) })}
                                    options={[
                                        { value: "", label: t("admin.allMalls") || "All Malls" },
                                        ...filterOptions.malls.map(mall => ({
                                            value: mall.ymallid.toString(),
                                            label: mall.ymallintitule
                                        }))
                                    ]}
                                    placeholder={t("admin.selectMall") || "Select Mall"}
                                    className="w-40 md:w-44 lg:w-48"
                                />
                                <SuperSelect
                                    value={filters.boutique || ""}
                                    onValueChange={(value) => updateFilters({ boutique: value === "" ? null : (value as string) })}
                                    options={[
                                        { value: "", label: t("admin.allBoutiques") || "All Boutiques" },
                                        ...filterOptions.boutiques.map(boutique => ({
                                            value: boutique.yboutiqueid.toString(),
                                            label: boutique.yboutiqueintitule || 'Unnamed Boutique'
                                        }))
                                    ]}
                                    placeholder={t("admin.selectBoutique") || "Select Boutique"}
                                    className="w-40 md:w-44 lg:w-48"
                                />
                                <SuperSelect
                                    value={filters.category || ""}
                                    onValueChange={(value) => updateFilters({ category: value === "" ? null : (value as string) })}
                                    options={[
                                        { value: "", label: t("admin.allCategories") || "All Categories" },
                                        ...filterOptions.categories.map(category => ({
                                            value: category.xcategprodid.toString(),
                                            label: category.xcategprodintitule
                                        }))
                                    ]}
                                    placeholder={t("admin.selectCategory") || "Select Category"}
                                    className="w-40 md:w-44 lg:w-48"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products?.map((product) => (
                            <ProductCard
                                key={product.yprodid}
                                product={product}
                                onView={() => handleViewProduct(product)}
                                // onEdit={() => handleEditProduct(product)}
                                categories={filterOptions.categories}
                                status="approved"
                            />
                        ))}
                    </div>

                    {/* Pagination for card view */}
                    {paginationData && paginationData.pages > 1 && (
                        <div className="flex justify-center">
                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(5, paginationData.pages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pagination.page === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => updatePagination({ page: pageNum })}
                                            className="border-gray-600"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Product View Dialog */}
            <ProductViewDialog
                isOpen={isProductViewDialogOpen}
                onClose={handleCloseViewDialog}
                productId={viewingProductId || undefined}
            />
        </div>
    );
}