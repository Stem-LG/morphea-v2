"use client";

import { useState } from "react";
import { Grid, List, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { useQueryStates, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs";
import { useLanguage } from "@/hooks/useLanguage";
import { useShopProducts } from "./_hooks/use-shop-products";
import { useShopMalls, useShopBoutiques, useShopCategories } from "./_hooks/use-shop-filters";
import { ProductCard } from "./_components/product-card";
import { ProductDetailsPage } from "@/app/main/_components/product-details-page";
import { cn } from "@/lib/utils";

export default function ShopPage() {
    const { t } = useLanguage();

    // URL state management for filters and view mode
    const [{ mallId, boutiqueId, categoryId, search, viewMode, page }, setQueryState] = useQueryStates({
        mallId: parseAsInteger,
        boutiqueId: parseAsInteger,
        categoryId: parseAsInteger,
        search: parseAsString.withDefault(""),
        viewMode: parseAsStringEnum(["grid", "list"]).withDefault("list"),
        page: parseAsInteger.withDefault(1),
    });

    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // State for product details modal
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showProductDetails, setShowProductDetails] = useState(false);

    const perPage = 12;

    // Fetch products with filters
    const { data: productsData, isLoading: isLoadingProducts } = useShopProducts({
        page,
        perPage,
        mallId,
        boutiqueId,
        categoryId,
        searchQuery: search,
    });

    const { products = [], totalCount = 0, currentEvent } = productsData || {};

    // Fetch filter options
    const { data: malls = [] } = useShopMalls(currentEvent?.yeventid || null);
    const { data: boutiques = [] } = useShopBoutiques(currentEvent?.yeventid || null, mallId);
    const { data: categories = [] } = useShopCategories(currentEvent?.yeventid || null);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / perPage);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Reset boutique when mall changes
    const handleMallChange = (selectedMall: number | null) => {
        setQueryState({
            mallId: selectedMall,
            boutiqueId: null,
            page: 1,
        });
    };

    // Reset page when filters change
    const handleFilterChange = (key: string) => (value: any) => {
        setQueryState({ [key]: value, page: 1 });
    };

    const clearFilters = () => {
        setQueryState({
            mallId: null,
            boutiqueId: null,
            categoryId: null,
            search: "",
            page: 1,
        });
    };

    const hasActiveFilters = mallId || boutiqueId || categoryId || search;

    const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className={cn("space-y-6", isMobile ? "p-4" : "")}>
            {/* Search */}
            <div>
                <h3 className="font-semibold text-white mb-4 text-lg">{t("shop.search")}</h3>
                <input
                    type="text"
                    placeholder={t("shop.searchPlaceholder")}
                    value={search}
                    onChange={(e) => handleFilterChange("search")(e.target.value)}
                    className="w-full px-4 py-3 bg-morpheus-blue-dark/40 border border-morpheus-gold-dark/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-morpheus-gold-light text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300"
                />
            </div>

            {/* Mall Filter */}
            {malls.length > 0 && (
                <div>
                    <h3 className="font-semibold text-white mb-4 text-lg">{t("shop.mall")}</h3>
                    <div className="space-y-3">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="mall"
                                checked={!mallId}
                                onChange={() => handleMallChange(null)}
                                className="mr-3 text-morpheus-gold-light focus:ring-morpheus-gold-light"
                            />
                            <span className="text-gray-300 group-hover:text-white transition-colors">
                                {t("shop.allMalls")}
                            </span>
                        </label>
                        {malls.map((mall) => (
                            <label key={mall.ymallid} className="flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    name="mall"
                                    checked={mallId === mall.ymallid}
                                    onChange={() => handleMallChange(mall.ymallid)}
                                    className="mr-3 text-morpheus-gold-light focus:ring-morpheus-gold-light"
                                />
                                <span className="text-gray-300 group-hover:text-white transition-colors">
                                    {mall.ymallintitule}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Boutique Filter */}
            {boutiques.length > 0 && (
                <div>
                    <h3 className="font-semibold text-white mb-4 text-lg">{t("shop.boutique")}</h3>
                    <div className="space-y-3">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="boutique"
                                checked={!boutiqueId}
                                onChange={() => handleFilterChange("boutiqueId")(null)}
                                className="mr-3 text-morpheus-gold-light focus:ring-morpheus-gold-light"
                            />
                            <span className="text-gray-300 group-hover:text-white transition-colors">
                                {t("shop.allBoutiques")}
                            </span>
                        </label>
                        {boutiques.map((boutique) => (
                            <label key={boutique.yboutiqueid} className="flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    name="boutique"
                                    checked={boutiqueId === boutique.yboutiqueid}
                                    onChange={() => handleFilterChange("boutiqueId")(boutique.yboutiqueid)}
                                    className="mr-3 text-morpheus-gold-light focus:ring-morpheus-gold-light"
                                />
                                <span className="text-gray-300 group-hover:text-white transition-colors">
                                    {boutique.yboutiqueintitule || boutique.yboutiquecode}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
                <div>
                    <h3 className="font-semibold text-white mb-4 text-lg">{t("shop.category")}</h3>
                    <div className="space-y-3">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="category"
                                checked={!categoryId}
                                onChange={() => handleFilterChange("categoryId")(null)}
                                className="mr-3 text-morpheus-gold-light focus:ring-morpheus-gold-light"
                            />
                            <span className="text-gray-300 group-hover:text-white transition-colors">
                                {t("shop.allCategories")}
                            </span>
                        </label>
                        {categories.map((category) => (
                            <label key={category.xcategprodid} className="flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    name="category"
                                    checked={categoryId === category.xcategprodid}
                                    onChange={() => handleFilterChange("categoryId")(category.xcategprodid)}
                                    className="mr-3 text-morpheus-gold-light focus:ring-morpheus-gold-light"
                                />
                                <span className="text-gray-300 group-hover:text-white transition-colors">
                                    {category.xcategprodintitule}
                                    {category.productCount && (
                                        <span className="text-morpheus-gold-light/70 ml-2">
                                            ({category.productCount})
                                        </span>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="w-full py-3 px-4 bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 border border-morpheus-gold-dark/30 text-morpheus-gold-light rounded-lg hover:from-morpheus-gold-dark/30 hover:to-morpheus-gold-light/30 transition-all duration-300 font-medium"
                >
                    {t("shop.clearFilters")}
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90">
            {/* Header */}
            <div className="bg-gradient-to-r from-morpheus-blue-dark/80 to-morpheus-blue-light/80 backdrop-blur-md border-b border-morpheus-gold-dark/20 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent drop-shadow-lg">
                                {t("shop.title")}
                            </h1>
                            {currentEvent && (
                                <p className="text-sm text-gray-300 mt-2 font-medium">{currentEvent.yeventintitule}</p>
                            )}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden p-3 bg-morpheus-blue-dark/40 border border-morpheus-gold-dark/30 rounded-lg hover:bg-morpheus-blue-dark/60 text-white transition-all duration-300"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setQueryState({ viewMode: "grid" })}
                                className={cn(
                                    "p-3 rounded-lg transition-all duration-300",
                                    viewMode === "grid"
                                        ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg"
                                        : "bg-morpheus-blue-dark/40 border border-morpheus-gold-dark/30 text-gray-300 hover:bg-morpheus-blue-dark/60 hover:text-white"
                                )}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setQueryState({ viewMode: "list" })}
                                className={cn(
                                    "p-3 rounded-lg transition-all duration-300",
                                    viewMode === "list"
                                        ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg"
                                        : "bg-morpheus-blue-dark/40 border border-morpheus-gold-dark/30 text-gray-300 hover:bg-morpheus-blue-dark/60 hover:text-white"
                                )}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 backdrop-blur-md border border-morpheus-gold-dark/20 rounded-xl p-6 sticky top-4 shadow-xl">
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Results Count */}
                        <div className="mb-6 text-gray-300 font-medium">
                            {totalCount > 0 ? (
                                <>
                                    {t("shop.showing")} {(page - 1) * perPage + 1}-
                                    {Math.min(page * perPage, totalCount)} {t("shop.of")} {totalCount}{" "}
                                    {t("shop.products")}
                                </>
                            ) : (
                                t("shop.noProductsFound")
                            )}
                        </div>

                        {/* Products Grid/List */}
                        {isLoadingProducts ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-morpheus-gold-dark/30 border-t-morpheus-gold-light"></div>
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div
                                    className={cn(
                                        viewMode === "grid"
                                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                            : "space-y-6"
                                    )}
                                >
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.yprodid}
                                            product={product}
                                            viewMode={viewMode}
                                            onViewDetails={() => {
                                                setSelectedProduct(product);
                                                setShowProductDetails(true);
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-12 flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => setQueryState({ page: Math.max(1, page - 1) })}
                                            disabled={!hasPrevPage}
                                            className={cn(
                                                "p-3 rounded-lg transition-all duration-300",
                                                hasPrevPage
                                                    ? "bg-morpheus-blue-dark/40 border border-morpheus-gold-dark/30 text-white hover:bg-morpheus-blue-dark/60"
                                                    : "bg-morpheus-blue-dark/20 border border-morpheus-gold-dark/10 text-gray-500 cursor-not-allowed"
                                            )}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="flex gap-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter((pageNum) => {
                                                    if (totalPages <= 7) return true;
                                                    if (pageNum === 1 || pageNum === totalPages) return true;
                                                    if (Math.abs(pageNum - page) <= 2) return true;
                                                    return false;
                                                })
                                                .map((pageNum, index, array) => (
                                                    <div key={pageNum} className="flex items-center">
                                                        {index > 0 && array[index - 1] !== pageNum - 1 && (
                                                            <span className="px-2 text-morpheus-gold-light/70">
                                                                ...
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => setQueryState({ page: pageNum })}
                                                            className={cn(
                                                                "px-4 py-2 rounded-lg font-medium transition-all duration-300",
                                                                page === pageNum
                                                                    ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg"
                                                                    : "bg-morpheus-blue-dark/40 border border-morpheus-gold-dark/30 text-gray-300 hover:bg-morpheus-blue-dark/60 hover:text-white"
                                                            )}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>

                                        <button
                                            onClick={() => setQueryState({ page: Math.min(totalPages, page + 1) })}
                                            disabled={!hasNextPage}
                                            className={cn(
                                                "p-3 rounded-lg transition-all duration-300",
                                                hasNextPage
                                                    ? "bg-morpheus-blue-dark/40 border border-morpheus-gold-dark/30 text-white hover:bg-morpheus-blue-dark/60"
                                                    : "bg-morpheus-blue-dark/20 border border-morpheus-gold-dark/10 text-gray-500 cursor-not-allowed"
                                            )}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 backdrop-blur-md border border-morpheus-gold-dark/20 rounded-xl p-8 max-w-md mx-auto">
                                    <p className="text-gray-300 text-lg mb-4">{t("shop.noProductsFound")}</p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white px-6 py-3 rounded-lg hover:from-morpheus-gold-light hover:to-morpheus-gold-dark transition-all duration-300 font-medium"
                                        >
                                            {t("shop.clearFilters")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowMobileFilters(false)}
                    />
                    <div className="fixed right-0 top-0 h-full w-80 bg-gradient-to-br from-morpheus-blue-dark/95 to-morpheus-blue-light/95 backdrop-blur-md border-l border-morpheus-gold-dark/20 shadow-2xl overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-morpheus-blue-dark/80 to-morpheus-blue-light/80 backdrop-blur-md border-b border-morpheus-gold-dark/20 p-4 flex items-center justify-between">
                            <h2 className="font-semibold text-xl text-white">{t("shop.filters")}</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="p-2 hover:bg-morpheus-blue-dark/40 rounded-lg text-gray-300 hover:text-white transition-all duration-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <FilterSidebar isMobile />
                    </div>
                </div>
            )}

            {/* Product Details Modal */}
            {showProductDetails && selectedProduct && (
                    <ProductDetailsPage
                        productData={selectedProduct}
                        onClose={() => {
                            setShowProductDetails(false);
                            setSelectedProduct(null);
                        }}
                        extraTop
                    />
            )}
        </div>
    );
}
