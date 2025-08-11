"use client";
import React, { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Plus,
    Edit,
    Trash2,
    Tag,
    Search,
    Package,
    AlertTriangle
} from "lucide-react";
import {
    useDeleteCategory,
    useCategoriesWithStats
} from "@/hooks/useCategories";
import { CreateCategoryDialog } from "./create-category-dialog";
import { UpdateCategoryDialog } from "./update-category-dialog";

export function CategoryManagement() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: categories, isLoading } = useCategoriesWithStats();
    const deleteCategoryMutation = useDeleteCategory();

    // Filter categories based on search term
    const filteredCategories = categories?.filter(category =>
        category.xcategprodintitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.xcategprodcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.xcategprodinfobulle?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];


    const { t } = useLanguage();

    const handleDelete = async (categoryId: number) => {
        if (confirm(t("admin.categories.confirmDelete"))) {
            try {
                await deleteCategoryMutation.mutateAsync(categoryId);
            } catch (error) {
                console.error('Failed to delete category:', error);
                const errorMessage = error instanceof Error ? error.message : t("admin.categories.deleteError");
                alert(errorMessage);
            }
        }
    };


    const getProductCount = (category: any) => {
        return category.yprod?.[0]?.count || 0;
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpheus-gold-light/30 border-t-morpheus-gold-light mx-auto mb-4"></div>
                        <p className="text-white text-lg">{t("admin.categories.loadingCategories")}</p>
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
                        {t("admin.categories.title")}
                    </h1>
                    <p className="text-lg text-gray-300">
                        {t("admin.categories.subtitle")}
                    </p>
                </div>
                <CreateCategoryDialog>
                    <Button className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white shadow-lg">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("admin.categories.addCategory")}
                    </Button>
                </CreateCategoryDialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-morpheus-gold-light/20 rounded-lg">
                                <Tag className="h-5 w-5 text-morpheus-gold-light" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">{t("admin.categories.totalCategories")}</p>
                                <p className="text-2xl font-bold text-white">{categories?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Package className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">{t("admin.categories.categoriesInUse")}</p>
                                <p className="text-2xl font-bold text-white">
                                    {categories?.filter(cat => getProductCount(cat) > 0).length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Search className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">{t("admin.categories.searchResults")}</p>
                                <p className="text-2xl font-bold text-white">{filteredCategories.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder={t("admin.categories.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-morpheus-blue-dark/30 border-slate-600 text-white placeholder-gray-400"
                />
            </div>


            {/* Categories List */}
            {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                    <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                        {searchTerm ? t("admin.categories.noMatchingCategories") : t("admin.categories.noCategoriesFound")}
                    </h3>
                    <p className="text-gray-300">
                        {searchTerm
                            ? t("admin.categories.adjustSearchCriteria")
                            : t("admin.categories.addFirstCategory")
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCategories.map((category) => {
                        const productCount = getProductCount(category);
                        const isInUse = productCount > 0;
                        
                        return (
                            <Card
                                key={category.xcategprodid}
                                className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-white text-lg">
                                            {category.xcategprodintitule}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {isInUse && (
                                                <Badge className="px-2 py-1 text-xs font-medium flex items-center gap-1 border text-green-400 bg-green-400/10 border-green-400/20">
                                                    <Package className="h-3 w-3" />
                                                    {productCount} {t("admin.categories.products")}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-400">{t("admin.categories.code")}:</span>
                                            <p className="text-white font-medium">{category.xcategprodcode}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">{t("admin.categories.description")}:</span>
                                            <p className="text-white text-sm leading-relaxed">
                                                {category.xcategprodinfobulle}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">{t("admin.categories.status")}:</span>
                                            <p className={`font-medium ${isInUse ? "text-green-400" : "text-gray-400"}`}>
                                                {isInUse ? `${t("admin.categories.active")} (${productCount} ${t("admin.categories.products")})` : t("admin.categories.unused")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <UpdateCategoryDialog category={category}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-slate-600 text-white hover:bg-slate-700/50"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                {t("common.edit")}
                                            </Button>
                                        </UpdateCategoryDialog>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className={isInUse ? "cursor-not-allowed" : ""}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(category.xcategprodid)}
                                                        disabled={deleteCategoryMutation.isPending || isInUse}
                                                        className={`px-3 ${isInUse 
                                                            ? "border-gray-600 text-gray-500 cursor-not-allowed" 
                                                            : "border-red-600 text-red-400 hover:bg-red-600/10"
                                                        }`}
                                                    >
                                                        {isInUse ? <AlertTriangle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{isInUse
                                                    ? `${t("admin.categories.cannotDelete")}: ${t("admin.categories.categoryUsedBy")} ${productCount} ${t("admin.categories.product")}${productCount !== 1 ? 's' : ''}`
                                                    : t("admin.categories.deleteCategory")
                                                }</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}