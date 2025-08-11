"use client";

import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { SuperSelect } from "@/components/super-select";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    Clock,
    Package,
    Filter,
    AlertTriangle,
    FileSearch
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useApprovals } from "./_hooks/use-approvals";
import { useCategories } from "../stores/[storeId]/_hooks/use-categories";
import { useStores } from "../stores/_hooks/use-stores";
import { useApprovalStats } from "./_hooks/use-approval-stats";
import { ApprovalCard } from "./_components/approval-card";
import { ApprovalForm } from "./_components/approval-form";
import { Toaster } from "./_components/toaster";

// Let Supabase infer the types automatically
type Product = any;

export default function ApprovalsPage() {
    const { t } = useLanguage();
    
    // State for pagination, filters, and sorting using nuqs
    const [{ page, approvalType, category, store, search, sortBy, sortOrder }, setFilters] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        approvalType: parseAsString.withDefault("all"),
        category: parseAsInteger,
        store: parseAsInteger,
        search: parseAsString.withDefault(""),
        sortBy: parseAsString,
        sortOrder: parseAsString
    });
    
    // Dialog state
    const [isApprovalFormOpen, setIsApprovalFormOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    
    const perPage = 10;
    const currentPage = page;
    const categoryFilter = category;
    const storeFilter = store;

    // Convert nuqs sorting state to format expected by useApprovals
    const sortingConfig = sortBy && sortOrder ? {
        column: sortBy,
        direction: sortOrder as 'asc' | 'desc'
    } : null;

    // Convert nuqs sorting state to React Table format
    const sorting: SortingState = sortBy && sortOrder ? [{
        id: sortBy,
        desc: sortOrder === 'desc'
    }] : [];

    // Fetch data
    const { data: approvalsData, isLoading: approvalsLoading } = useApprovals({
        page: currentPage,
        perPage,
        approvalType,
        categoryFilter,
        storeFilter,
        search,
        sorting: sortingConfig
    });
    
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: storesData, isLoading: storesLoading } = useStores();
    const { data: stats } = useApprovalStats();

    // Prepare filter options
    const approvalTypeOptions = [
        { value: "all", label: t("admin.approvals.allProducts") },
        { value: "not_approved", label: t("admin.approvals.newProducts") },
        { value: "variant_approval", label: t("admin.approvals.variantApprovals") },
        { value: "rejected", label: t("admin.approvals.rejected") }
    ];

    const categoryOptions = categories?.map(cat => ({
        value: cat.xcategprodid,
        label: cat.xcategprodintitule
    })) || [];

    const allCategoryOptions = [
        { value: "all", label: t("admin.approvals.allCategories") },
        ...categoryOptions
    ];

    const storeOptions = storesData?.map(store => ({
        value: store.yboutiqueid,
        label: store.yboutiqueintitule || `Store ${store.yboutiqueid}`
    })) || [];

    const allStoreOptions = [
        { value: "all", label: t("admin.approvals.allStores") },
        ...storeOptions
    ];

    // Filter handlers
    const handleApprovalTypeChange = (value: string) => {
        setFilters({ approvalType: value, page: 1 });
    };

    const handleCategoryFilterChange = (value: string | number) => {
        if (value === "all") {
            setFilters({ category: null, page: 1 });
        } else {
            setFilters({ category: value as number, page: 1 });
        }
    };

    const handleStoreFilterChange = (value: string | number) => {
        if (value === "all") {
            setFilters({ store: null, page: 1 });
        } else {
            setFilters({ store: value as number, page: 1 });
        }
    };

    const handleSearchChange = (value: string) => {
        setFilters({ search: value, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters({ page });
    };

    const handleSortingChange = (newSorting: SortingState) => {
        if (newSorting.length === 0) {
            setFilters({ sortBy: null, sortOrder: null, page: 1 });
        } else {
            const sort = newSorting[0];
            setFilters({
                sortBy: sort.id,
                sortOrder: sort.desc ? 'desc' : 'asc',
                page: 1
            });
        }
    };

    // Product action handlers
    const handleAuditProduct = (product: Product) => {
        setEditingProductId(product.yprodid);
        setIsApprovalFormOpen(true);
    };

    const handleCloseApprovalForm = () => {
        setIsApprovalFormOpen(false);
        setEditingProductId(null);
    };


    // Get status badge with enhanced variant information
    const getStatusBadge = (product: Product) => {
        const variants = product.yvarprod || [];
        const pendingVariants = variants.filter(v => v.yvarprodstatut === 'not_approved').length;
        const approvedVariants = variants.filter(v => v.yvarprodstatut === 'approved').length;
        const rejectedVariants = variants.filter(v => v.yvarprodstatut === 'rejected').length;

        if (product.yprodstatut === 'not_approved') {
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        <Clock className="h-3 w-3 mr-1" />
                        {t("admin.approvals.productPending")}
                    </Badge>
                    {variants.length > 0 && (
                        <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                            {variants.length} {t("admin.approvals.variants")}
                        </Badge>
                    )}
                </div>
            );
        } else if (product.yprodstatut === 'rejected') {
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {t("admin.approvals.rejected")}
                    </Badge>
                    {variants.length > 0 && (
                        <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                            {variants.length} {t("admin.approvals.variants")}
                        </Badge>
                    )}
                </div>
            );
        } else if (pendingVariants > 0 || rejectedVariants > 0) {
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        <Package className="h-3 w-3 mr-1" />
                        {t("admin.approvals.variantIssues")}
                    </Badge>
                    <div className="flex items-center gap-1">
                        {pendingVariants > 0 && (
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                                {pendingVariants} {t("admin.approvals.pending")}
                            </Badge>
                        )}
                        {rejectedVariants > 0 && (
                            <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                {rejectedVariants} {t("admin.approvals.rejected")}
                            </Badge>
                        )}
                        {approvedVariants > 0 && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                {approvedVariants} {t("admin.approvals.approved")}
                            </Badge>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Define table columns
    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "yprodcode",
            header: t("admin.approvals.productCode"),
            enableSorting: true,
            cell: ({ row }) => (
                <div className="font-mono text-sm">
                    {row.getValue("yprodcode")}
                </div>
            ),
        },
        {
            accessorKey: "yprodintitule",
            header: t("admin.approvals.productName"),
            enableSorting: true,
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.getValue("yprodintitule")}
                </div>
            ),
        },
        {
            accessorKey: "xcategprodidfk",
            header: t("admin.approvals.category"),
            enableSorting: true,
            cell: ({ row }) => {
                const categoryId = row.getValue("xcategprodidfk") as number;
                const category = categories?.find(cat => cat.xcategprodid === categoryId);
                return (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {category?.xcategprodintitule || t("admin.approvals.unknown")}
                    </Badge>
                );
            },
        },
        {
            id: "status",
            header: t("admin.approvals.status"),
            cell: ({ row }) => getStatusBadge(row.original),
        },
        {
            accessorKey: "sysdate",
            header: t("admin.approvals.created"),
            enableSorting: true,
            cell: ({ row }) => {
                const date = new Date(row.getValue("sysdate"));
                return (
                    <div className="text-sm text-gray-400">
                        {date.toLocaleDateString()}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: t("admin.approvals.actions"),
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAuditProduct(product)}
                        className="h-8 px-3 text-gray-400 hover:text-blue-400 hover:bg-blue-900/50"
                        title={t("admin.approvals.auditProduct")}
                    >
                        <FileSearch className="h-3 w-3 mr-1" />
                        {t("admin.approvals.audit")}
                    </Button>
                );
            },
        },
    ];

    // Loading state
    if (approvalsLoading) {
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
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">{t("admin.approvals.title")}</h1>
                    <p className="text-lg text-gray-300">{t("admin.approvals.subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'table' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="border-gray-600"
                    >
                        {t("admin.approvals.table")}
                    </Button>
                    <Button
                        variant={viewMode === 'cards' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                        className="border-gray-600"
                    >
                        {t("admin.approvals.cards")}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                <span className="text-sm font-medium text-gray-300">{t("admin.approvals.totalRejected")}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {stats.rejected || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-yellow-400" />
                                <span className="text-sm font-medium text-gray-300">{t("admin.approvals.totalPending")}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {stats.pending || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span className="text-sm font-medium text-gray-300">{t("admin.approvals.totalApproved")}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {stats.approved || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="h-5 w-5 text-blue-400" />
                                <span className="text-sm font-medium text-gray-300">{t("admin.approvals.totalProducts")}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {stats.total || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}


            {/* Content */}
            {viewMode === 'table' ? (
                <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            {t("admin.approvals.productsAwaitingApproval")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={approvalsData?.data || []}
                            columns={columns}
                            isLoading={approvalsLoading}
                            serverFilters={true}
                            globalFilter={search}
                            onGlobalFilterChange={handleSearchChange}
                            manualSorting={{
                                sorting: sorting,
                                onSortingChange: handleSortingChange
                            }}
                            filters={
                                <div className="flex gap-2">
                                    <SuperSelect
                                        value={approvalType}
                                        onValueChange={handleApprovalTypeChange}
                                        options={approvalTypeOptions}
                                        placeholder={t("admin.approvals.filterByType")}
                                        className="w-48"
                                    />
                                    <SuperSelect
                                        value={categoryFilter || "all"}
                                        onValueChange={handleCategoryFilterChange}
                                        options={allCategoryOptions}
                                        placeholder={t("admin.approvals.filterByCategory")}
                                        className="w-48"
                                        disabled={categoriesLoading}
                                    />
                                    <SuperSelect
                                        value={storeFilter || "all"}
                                        onValueChange={handleStoreFilterChange}
                                        options={allStoreOptions}
                                        placeholder={t("admin.approvals.filterByStore")}
                                        className="w-48"
                                        disabled={storesLoading}
                                    />
                                </div>
                            }
                            pagination={{
                                total: approvalsData?.count || 0,
                                perPage,
                                pages: approvalsData?.totalPages || 1,
                                currentPage: currentPage - 1,
                                onPageChange: (page) => handlePageChange(page + 1),
                                maxVisiblePages: 5
                            }}
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {/* Filters for card view */}
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex gap-2 items-center">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <SuperSelect
                                    value={approvalType}
                                    onValueChange={handleApprovalTypeChange}
                                    options={approvalTypeOptions}
                                    placeholder={t("admin.approvals.filterByType")}
                                    className="w-48"
                                />
                                <SuperSelect
                                    value={categoryFilter || "all"}
                                    onValueChange={handleCategoryFilterChange}
                                    options={allCategoryOptions}
                                    placeholder={t("admin.approvals.filterByCategory")}
                                    className="w-48"
                                    disabled={categoriesLoading}
                                />
                                <SuperSelect
                                    value={storeFilter || "all"}
                                    onValueChange={handleStoreFilterChange}
                                    options={allStoreOptions}
                                    placeholder={t("admin.approvals.filterByStore")}
                                    className="w-48"
                                    disabled={storesLoading}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {approvalsData?.data?.map((product) => (
                            <ApprovalCard
                                key={product.yprodid}
                                product={product}
                                onAudit={() => handleAuditProduct(product)}
                                categories={categories}
                            />
                        ))}
                    </div>

                    {/* Pagination for card view */}
                    {approvalsData && approvalsData.totalPages > 1 && (
                        <div className="flex justify-center">
                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(5, approvalsData.totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
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

            {/* Approval Form Dialog */}
            <ApprovalForm
                isOpen={isApprovalFormOpen}
                onClose={handleCloseApprovalForm}
                productId={editingProductId || undefined}
            />

            {/* Toast Notifications */}
            <Toaster />
        </div>
    );
}