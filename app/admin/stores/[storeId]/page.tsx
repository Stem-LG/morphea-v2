"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { SuperSelect } from "@/components/super-select";
import { Badge } from "@/components/ui/badge";
import {
    Store,
    MapPin,
    Package,
    Plus,
    Edit,
    Trash2,
    Eye,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useStore } from "./_hooks/use-store";
import { useProducts } from "./_hooks/use-products";
import { useCategories } from "./_hooks/use-categories";
import { CreateProductDialog } from "./_components/create-product-dialog";
import { ProductViewDialog } from "./_components/product-view-dialog";

// Let Supabase infer the types automatically
type Product = any;

export default function StoreDetails() {
    const { t } = useLanguage();
    const params = useParams();
    const storeId = parseInt(params.storeId as string);
    const { data: user } = useAuth();
    
    const isAdmin = user?.app_metadata?.roles?.includes("admin");
    const isStoreAdmin = user?.app_metadata?.roles?.includes("store_admin");
    
    // State for pagination, filters, sorting, and event context using nuqs
    const [{ page, category, search, sortBy, sortOrder, eventId, mallId }, setFilters] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        category: parseAsInteger,
        search: parseAsString.withDefault(""),
        sortBy: parseAsString,
        sortOrder: parseAsString,
        eventId: parseAsInteger,
        mallId: parseAsInteger
    });
    
    // Dialog state
    const [isCreateProductDialogOpen, setIsCreateProductDialogOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [isProductViewDialogOpen, setIsProductViewDialogOpen] = useState(false);
    const [viewingProductId, setViewingProductId] = useState<number | null>(null);
    
    const perPage = 10;
    const currentPage = page;
    const categoryFilter = category;

    // Convert nuqs sorting state to format expected by useProducts
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
    const { data: storeData, isLoading: storeLoading, error: storeError } = useStore({ storeId });
    const { data: productsData, isLoading: productsLoading } = useProducts({
        storeId,
        eventId,
        page: currentPage,
        perPage,
        categoryFilter,
        search,
        sorting: sortingConfig
    });
    const { data: categories, isLoading: categoriesLoading } = useCategories();

    // Get the first store from the array (since the hook returns an array)
    const store = storeData?.[0];

    // Prepare category options for the filter
    const categoryOptions = categories?.map(cat => ({
        value: cat.xcategprodid,
        label: cat.xcategprodintitule
    })) || [];

    // Add "All Categories" option
    const allCategoryOptions = [
        { value: "all", label: t('admin.allCategories') },
        ...categoryOptions
    ];

    // Handle category filter change
    const handleCategoryFilterChange = (value: string | number) => {
        if (value === "all") {
            setFilters({ category: null, page: 1 });
        } else {
            setFilters({ category: value as number, page: 1 });
        }
    };

    // Handle search change
    const handleSearchChange = (value: string) => {
        setFilters({ search: value, page: 1 });
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setFilters({ page });
    };

    // Handle sorting change
    const handleSortingChange = (newSorting: SortingState) => {
        if (newSorting.length === 0) {
            // Clear sorting
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
    const handleCreateProduct = () => {
        setEditingProductId(null);
        setIsCreateProductDialogOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProductId(product.yprodid);
        setIsCreateProductDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsCreateProductDialogOpen(false);
        setEditingProductId(null);
    };

    const handleDeleteProduct = (product: Product) => {
        console.log("Delete product:", product);
        // TODO: Implement delete product functionality
    };

    const handleViewProduct = (product: Product) => {
        setViewingProductId(product.yprodid);
        setIsProductViewDialogOpen(true);
    };

    const handleCloseViewDialog = () => {
        setIsProductViewDialogOpen(false);
        setViewingProductId(null);
    };

    // Helper function to get product status
    const getProductStatus = (product: Product) => {
        // If product itself is not approved, return product status
        if (product.yprodstatut === 'rejected') return 'rejected';
        if (product.yprodstatut === 'not_approved') return 'pending';
        
        // If product is approved, check variant statuses
        if (product.yvarprod && product.yvarprod.length > 0) {
            const statuses = product.yvarprod.map((variant: any) => variant.yvarprodstatut);
            const hasRejected = statuses.includes('rejected');
            const hasPending = statuses.includes('not_approved');
            const hasApproved = statuses.includes('approved');
            
            // If there are rejected variants, show as rejected
            if (hasRejected) return 'rejected';
            
            // If there are pending variants (even with approved product), show as mixed
            if (hasPending && hasApproved) return 'mixed';
            if (hasPending) return 'pending';
            
            // All variants are approved
            if (hasApproved) return 'approved';
        }
        
        // Fallback to product status
        return product.yprodstatut === 'approved' ? 'approved' : 'pending';
    };

    // Helper function to check if product can be edited
    const canEditProduct = (product: Product) => {
        if (isAdmin) {
            // Admin can edit everything except rejected products
            return getProductStatus(product) !== 'rejected';
        }
        
        if (isStoreAdmin) {
            const status = getProductStatus(product);
            // Store admin can edit pending products, approved products (to add variants),
            // and mixed status products (to edit unapproved variants)
            return status === 'pending' || status === 'approved' || status === 'mixed';
        }
        
        return false;
    };

    // Helper function to check if product can be deleted
    const canDeleteProduct = (product: Product) => {
        if (isAdmin) {
            // Admin can delete non-rejected products
            return getProductStatus(product) !== 'rejected';
        }
        
        if (isStoreAdmin) {
            // Store admin can only delete pending products
            return getProductStatus(product) === 'pending';
        }
        
        return false;
    };

    // Define table columns
    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "yprodcode",
            header: t('admin.productCode'),
            enableSorting: true,
            cell: ({ row }) => (
                <div className="font-mono text-sm">
                    {row.getValue("yprodcode")}
                </div>
            ),
        },
        {
            accessorKey: "yprodintitule",
            header: t('admin.productName'),
            enableSorting: true,
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.getValue("yprodintitule")}
                </div>
            ),
        },
        {
            accessorKey: "xcategprodidfk",
            header: t('admin.category'),
            enableSorting: true,
            cell: ({ row }) => {
                const categoryId = row.getValue("xcategprodidfk") as number;
                const category = categories?.find(cat => cat.xcategprodid === categoryId);
                return (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        {category?.xcategprodintitule || t('admin.unknown')}
                    </Badge>
                );
            },
        },
        {
            id: "status",
            header: t('admin.status'),
            cell: ({ row }) => {
                const product = row.original;
                const status = getProductStatus(product);
                
                const statusConfig = {
                    approved: {
                        icon: CheckCircle,
                        color: "text-green-800",
                        bgColor: "bg-green-100",
                        borderColor: "border-green-200",
                        label: t('admin.approved')
                    },
                    rejected: {
                        icon: XCircle,
                        color: "text-red-800",
                        bgColor: "bg-red-100",
                        borderColor: "border-red-200",
                        label: t('admin.rejected')
                    },
                    pending: {
                        icon: Clock,
                        color: "text-yellow-800",
                        bgColor: "bg-yellow-100",
                        borderColor: "border-yellow-200",
                        label: t('admin.pending')
                    },
                    mixed: {
                        icon: AlertTriangle,
                        color: "text-blue-800",
                        bgColor: "bg-blue-100",
                        borderColor: "border-blue-200",
                        label: t('admin.mixedStatus')
                    }
                };
                
                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
                const Icon = config.icon;
                
                // For mixed status, show additional variant info
                if (status === 'mixed' && product.yvarprod) {
                    const pendingCount = product.yvarprod.filter((v: any) => v.yvarprodstatut === 'not_approved').length;
                    const approvedCount = product.yvarprod.filter((v: any) => v.yvarprodstatut === 'approved').length;
                    
                    return (
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className={`${config.bgColor} ${config.color} ${config.borderColor} flex items-center gap-1 w-fit`}
                            >
                                <Icon className="h-3 w-3" />
                                {config.label}
                            </Badge>
                            <div className="flex gap-1">
                                {approvedCount > 0 && (
                                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                        {approvedCount} {t('admin.approved').toLowerCase()}
                                    </Badge>
                                )}
                                {pendingCount > 0 && (
                                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                                        {pendingCount} {t('admin.pending').toLowerCase()}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    );
                }
                
                return (
                    <Badge
                        variant="secondary"
                        className={`${config.bgColor} ${config.color} ${config.borderColor} flex items-center gap-1 w-fit`}
                    >
                        <Icon className="h-3 w-3" />
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: t('admin.actions'),
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewProduct(product)}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            title={t('admin.viewProduct')}
                        >
                            <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditProduct(product)}
                            disabled={!canEditProduct(product)}
                            className={`h-8 w-8 p-0 ${
                                canEditProduct(product)
                                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    : "text-gray-400 cursor-not-allowed"
                            }`}
                            title={canEditProduct(product) ? t('admin.editProduct') : t('admin.cannotEditProduct')}
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={!canDeleteProduct(product)}
                            className={`h-8 w-8 p-0 ${
                                canDeleteProduct(product)
                                    ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                                    : "text-gray-400 cursor-not-allowed"
                            }`}
                            title={canDeleteProduct(product) ? t('admin.deleteProduct') : t('admin.cannotDeleteProduct')}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    // Loading state
    if (storeLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                    <div className="h-32 bg-gray-300 rounded mb-6"></div>
                    <div className="h-64 bg-gray-300 rounded"></div>
                </div>
            </div>
        );
    }

    // Error state
    if (storeError || !store) {
        return (
            <div className="p-6">
                <Card className="bg-gradient-to-br from-red-50/50 to-white/50 border-red-200 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <Store className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('admin.storeNotFound')}</h3>
                        <p className="text-gray-600 mb-4">
                            {t('admin.storeNotFoundMessage')}
                        </p>
                        <Link href={`/admin/stores${
                            eventId || mallId
                                ? `?${new URLSearchParams({
                                    ...(eventId && { eventId: eventId.toString() }),
                                    ...(mallId && { mallId: mallId.toString() })
                                }).toString()}`
                                : ''
                        }`}>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('admin.backToStores')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/admin/stores${
                    eventId || mallId
                        ? `?${new URLSearchParams({
                            ...(eventId && { eventId: eventId.toString() }),
                            ...(mallId && { mallId: mallId.toString() })
                        }).toString()}`
                        : ''
                }`}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('admin.backToStores')}
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('admin.storeDetails')}</h1>
                    <p className="text-lg text-gray-600">{t('admin.manageProductsAndStore')}</p>
                </div>
            </div>

            {/* Store Information Card */}
            <Card className="bg-gradient-to-br from-gray-50/50 to-white/50 border-gray-200 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl text-gray-900">{store.yboutiqueintitule}</CardTitle>
                            <div className="flex items-center gap-2 text-gray-600 mt-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">
                                    {store.yboutiqueadressemall || t('admin.noAddressSpecified')}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-600">{t('admin.totalProducts')}</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {productsData?.count || 0}
                            </div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Store className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-600">{t('admin.storeId')}</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                #{store.yboutiqueid}
                            </div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-600">{t('admin.mallId')}</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {store.ymallidfk ? `#${store.ymallidfk}` : "N/A"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card className="bg-gradient-to-br from-gray-50/50 to-white/50 border-gray-200 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {t('admin.products')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={productsData?.data || []}
                        columns={columns}
                        isLoading={productsLoading}
                        serverFilters={true}
                        globalFilter={search}
                        onGlobalFilterChange={handleSearchChange}
                        manualSorting={{
                            sorting: sorting,
                            onSortingChange: handleSortingChange
                        }}
                        actions={
                            isStoreAdmin && !isAdmin ? (
                                <Button
                                    onClick={handleCreateProduct}
                                    disabled={!eventId}
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={eventId ? t('admin.addProduct') : t('admin.selectEventToAddProducts')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('admin.addProduct')}
                                </Button>
                            ) : null
                        }
                        filters={
                            <SuperSelect
                                value={categoryFilter || "all"}
                                onValueChange={handleCategoryFilterChange}
                                options={allCategoryOptions}
                                placeholder={t('admin.filterByCategory')}
                                className="w-48"
                                disabled={categoriesLoading}
                            />
                        }
                        pagination={{
                            total: productsData?.count || 0,
                            perPage,
                            pages: productsData?.totalPages || 1,
                            currentPage: currentPage - 1, // DataTable expects 0-based indexing
                            onPageChange: (page) => handlePageChange(page + 1), // Convert back to 1-based
                            maxVisiblePages: 5
                        }}
                    />
                </CardContent>
            </Card>

            {/* Create/Edit Product Dialog */}
            <CreateProductDialog
                isOpen={isCreateProductDialogOpen}
                onClose={handleCloseDialog}
                productId={editingProductId || undefined}
            />

            {/* Product View Dialog */}
            <ProductViewDialog
                isOpen={isProductViewDialogOpen}
                onClose={handleCloseViewDialog}
                productId={viewingProductId || undefined}
            />
        </div>
    );
}
