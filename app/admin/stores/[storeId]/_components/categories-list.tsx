"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Grid3X3,
    Plus,
    Search,
    Package,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useStoreCategories, useCategoryStats } from "@/hooks/useAdminV2Categories";
import Link from "next/link";

interface CategoriesListProps {
    storeId: string;
    store: any;
}

export function CategoriesList({ storeId, store }: CategoriesListProps) {
    const { t } = useLanguage();
    const { data: user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    // Check if user is admin
    const userMetadata = user?.app_metadata as { roles?: string[] };
    const roles = userMetadata?.roles || [];
    const isAdmin = roles.includes('admin');

    const { data: categories, isLoading, error } = useStoreCategories(storeId, {
        includeInactive: showInactive,
        search: searchTerm || undefined
    });
    const { data: categoryStats } = useCategoryStats(storeId);

    // If user is not admin, show access denied message
    if (!isAdmin) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Grid3X3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">
                            Access Restricted
                        </h3>
                        <p className="text-gray-300 mb-4">
                            Category management is only available to system administrators.
                        </p>
                        <p className="text-sm text-gray-400">
                            Categories are managed globally across all stores.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const filteredCategories = categories || [];
    const totalProducts = categoryStats?.totalProducts || 0;
    const activeCategories = categoryStats?.activeCategories || 0;

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpheus-gold-light/30 border-t-morpheus-gold-light mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading categories...</p>
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
                        <p className="text-red-400 text-lg">Error loading categories</p>
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
                        Category Management
                    </h2>
                    <p className="text-gray-300">
                        {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} • {totalProducts} total products
                    </p>
                </div>
                
                <Button className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white font-semibold shadow-2xl transition-all duration-300 hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Category
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
                            <Grid3X3 className="h-4 w-4 text-morpheus-gold-light" />
                            Total Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {filteredCategories.length}
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                            {activeCategories} active
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
                            <Package className="h-4 w-4 text-blue-400" />
                            Total Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {totalProducts}
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                            Across all categories
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
                            <Grid3X3 className="h-4 w-4 text-green-400" />
                            Average Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {filteredCategories.length > 0 ? Math.round(totalProducts / filteredCategories.length) : 0}
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                            Per category
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search categories by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-morpheus-blue-dark/30 border-slate-600 text-white placeholder-gray-400"
                    />
                </div>
                
                <div className="flex gap-2">
                    <Button
                        variant={showInactive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowInactive(!showInactive)}
                        className={showInactive 
                            ? "bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white"
                            : "border-slate-600 text-white hover:bg-slate-700/50"
                        }
                    >
                        {showInactive ? "Hide Inactive" : "Show Inactive"}
                    </Button>
                </div>
            </div>

            {/* Categories Grid */}
            {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                    <Grid3X3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                        {searchTerm ? "No categories match your search" : "No categories found"}
                    </h3>
                    <p className="text-gray-300 mb-6">
                        {searchTerm 
                            ? "Try adjusting your search criteria"
                            : "Create your first category to organize products"
                        }
                    </p>
                    {!searchTerm && (
                        <Button className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Category
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCategories.map((category) => (
                        <Card 
                            key={category.id} 
                            className={`bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group ${
                                !category.isActive ? 'opacity-60' : ''
                            }`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                                        <Grid3X3 className="h-5 w-5 text-morpheus-gold-light" />
                                        <span className="truncate">{category.name}</span>
                                    </CardTitle>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        category.isActive 
                                            ? 'text-green-400 bg-green-400/10' 
                                            : 'text-gray-400 bg-gray-400/10'
                                    }`}>
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                {/* Category Description */}
                                <p className="text-sm text-gray-300 line-clamp-2">
                                    {category.description}
                                </p>

                                {/* Category Stats */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-300">Products:</span>
                                        <span className="text-white font-medium">{category.productCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-300">Created:</span>
                                        <span className="text-white font-medium">
                                            {new Date(category.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-300">
                                        <span>Product Distribution</span>
                                        <span>{Math.round((category.productCount / totalProducts) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(category.productCount / totalProducts) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Link href={`/adminv2/stores/${storeId}/categories/${category.id}`} className="flex-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-slate-600 text-white hover:bg-slate-700/50"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View Products
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="px-3 border-slate-600 text-white hover:bg-slate-700/50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
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