"use client";
import React, { useState, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    Plus,
    Tag,
    Search,
    Package,
    TreePine
} from "lucide-react";
import {
    useCategoriesWithStats
} from "@/hooks/useCategories";
import { CreateCategoryDialog } from "./create-category-dialog";
import { CategoryTree } from "./category-tree";
import {
    organizeCategoriesIntoTree,
    filterCategoriesTree,
    getTotalProductCount
} from "./category-tree-utils";

export function CategoryManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const { t } = useLanguage();
    const { data: categories, isLoading } = useCategoriesWithStats();

    // Organize categories into tree structure and apply filtering
    const { categoryTree, stats } = useMemo(() => {
        if (!categories) {
            return {
                categoryTree: [],
                stats: {
                    totalCategories: 0,
                    categoriesInUse: 0,
                    searchResults: 0
                }
            };
        }

        // Convert flat list to tree structure
        const tree = organizeCategoriesIntoTree(categories);
        
        // Apply search filter
        const filteredTree = filterCategoriesTree(tree, searchTerm);
        
        // Calculate stats
        const totalCategories = categories.length;
        const categoriesInUse = categories.filter(cat =>
            (cat.yprod?.[0]?.count || 0) > 0
        ).length;
        
        // Count filtered results (flattened)
        const countFilteredCategories = (nodes: typeof tree): number => {
            return nodes.reduce((count, node) => {
                return count + 1 + countFilteredCategories(node.children);
            }, 0);
        };
        const searchResults = countFilteredCategories(filteredTree);

        return {
            categoryTree: filteredTree,
            stats: {
                totalCategories,
                categoriesInUse,
                searchResults
            }
        };
    }, [categories, searchTerm]);

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
        <TooltipProvider>
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
                <CreateCategoryDialog categories={categories || []}>
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
                                <p className="text-2xl font-bold text-white">{stats.totalCategories}</p>
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
                                    {stats.categoriesInUse}
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
                                <p className="text-2xl font-bold text-white">{stats.searchResults}</p>
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


            {/* Categories Tree */}
            <div className="bg-gradient-to-br from-morpheus-blue-dark/20 to-morpheus-blue-light/20 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TreePine className="h-5 w-5 text-morpheus-gold-light" />
                    <h2 className="text-lg font-semibold text-white">
                        {t("admin.categories.hierarchicalView")}
                    </h2>
                </div>
                <CategoryTree
                    categories={categoryTree}
                    searchTerm={searchTerm}
                    originalCategories={categories || []}
                />
            </div>
        </div>
        </TooltipProvider>
    );
}