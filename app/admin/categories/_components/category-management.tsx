"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Edit,
    Trash2,
    Tag,
    Search,
    Package,
    X,
    Save,
    AlertTriangle
} from "lucide-react";
import {
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    useCategoriesWithStats
} from "@/hooks/useCategories";

interface CategoryFormData {
    xcategprodintitule: string;
    xcategprodcode: string;
    xcategprodinfobulle: string;
}

export function CategoryManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<number | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        xcategprodintitule: "",
        xcategprodcode: "",
        xcategprodinfobulle: ""
    });

    const { data: categories, isLoading } = useCategoriesWithStats();
    const createCategoryMutation = useCreateCategory();
    const updateCategoryMutation = useUpdateCategory();
    const deleteCategoryMutation = useDeleteCategory();

    // Filter categories based on search term
    const filteredCategories = categories?.filter(category =>
        category.xcategprodintitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.xcategprodcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.xcategprodinfobulle?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const resetForm = () => {
        setFormData({
            xcategprodintitule: "",
            xcategprodcode: "",
            xcategprodinfobulle: ""
        });
        setEditingCategory(null);
        setShowForm(false);
    };

    const handleEdit = (category: any) => {
        setFormData({
            xcategprodintitule: category.xcategprodintitule || "",
            xcategprodcode: category.xcategprodcode || "",
            xcategprodinfobulle: category.xcategprodinfobulle || ""
        });
        setEditingCategory(category.xcategprodid);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editingCategory) {
                await updateCategoryMutation.mutateAsync({
                    categoryId: editingCategory,
                    updates: formData
                });
            } else {
                await createCategoryMutation.mutateAsync(formData);
            }
            resetForm();
        } catch (error) {
            console.error('Failed to save category:', error);
        }
    };

    const handleDelete = async (categoryId: number) => {
        if (confirm('Are you sure you want to delete this category? This action cannot be undone and will fail if the category is being used by products.')) {
            try {
                await deleteCategoryMutation.mutateAsync(categoryId);
            } catch (error) {
                console.error('Failed to delete category:', error);
                alert('Failed to delete category. It may be in use by products.');
            }
        }
    };

    const validateForm = () => {
        return formData.xcategprodintitule.trim() !== "" &&
               formData.xcategprodcode.trim() !== "" &&
               formData.xcategprodinfobulle.trim() !== "";
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
                        <p className="text-white text-lg">Loading categories...</p>
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
                        Category Management
                    </h1>
                    <p className="text-lg text-gray-300">
                        Manage global product categories for the platform
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
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
                                <p className="text-sm text-gray-400">Total Categories</p>
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
                                <p className="text-sm text-gray-400">Categories in Use</p>
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
                                <p className="text-sm text-gray-400">Search Results</p>
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
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-morpheus-blue-dark/30 border-slate-600 text-white placeholder-gray-400"
                />
            </div>

            {/* Category Form */}
            {showForm && (
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Tag className="h-5 w-5 text-morpheus-gold-light" />
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-300">Category Name *</Label>
                                    <Input
                                        value={formData.xcategprodintitule}
                                        onChange={(e) => setFormData(prev => ({ ...prev, xcategprodintitule: e.target.value }))}
                                        className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                        placeholder="e.g., Electronics"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-300">Category Code *</Label>
                                    <Input
                                        value={formData.xcategprodcode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, xcategprodcode: e.target.value.toUpperCase() }))}
                                        className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                        placeholder="e.g., ELEC"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-gray-300">Description *</Label>
                                <Textarea
                                    value={formData.xcategprodinfobulle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, xcategprodinfobulle: e.target.value }))}
                                    className="bg-morpheus-blue-dark/30 border-slate-600 text-white"
                                    placeholder="Describe this category..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={!validateForm() || createCategoryMutation.isPending || updateCategoryMutation.isPending}
                                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingCategory ? 'Update' : 'Create'} Category
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Categories List */}
            {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                    <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                        {searchTerm ? "No categories match your search" : "No categories found"}
                    </h3>
                    <p className="text-gray-300">
                        {searchTerm 
                            ? "Try adjusting your search criteria"
                            : "Start by adding your first category to the system."
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
                                                    {productCount} products
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-400">Code:</span>
                                            <p className="text-white font-medium">{category.xcategprodcode}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Description:</span>
                                            <p className="text-white text-sm leading-relaxed">
                                                {category.xcategprodinfobulle}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Status:</span>
                                            <p className={`font-medium ${isInUse ? "text-green-400" : "text-gray-400"}`}>
                                                {isInUse ? `Active (${productCount} products)` : "Unused"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(category)}
                                            className="flex-1 border-slate-600 text-white hover:bg-slate-700/50"
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(category.xcategprodid)}
                                            disabled={deleteCategoryMutation.isPending}
                                            className={`px-3 ${isInUse 
                                                ? "border-orange-600 text-orange-400 hover:bg-orange-600/10" 
                                                : "border-red-600 text-red-400 hover:bg-red-600/10"
                                            }`}
                                            title={isInUse ? "Category is in use - deletion may fail" : "Delete category"}
                                        >
                                            {isInUse ? <AlertTriangle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
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