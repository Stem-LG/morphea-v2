"use client";
import React from "react";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus, Package, Box } from "lucide-react";
import type { ProductWithObjects } from "@/hooks/useProducts";

interface ProductListProps {
    sectionId: string;
    storeName: string;
    sectionTitle: string;
    onEditProduct: (product: ProductWithObjects) => void;
    onCreateProduct: () => void;
    onBack: () => void;
}

export function ProductList({
    sectionId,
    storeName,
    sectionTitle,
    onEditProduct,
    onCreateProduct,
    onBack,
}: ProductListProps) {
    const { data: products, isLoading, error } = useProducts(sectionId);
    const deleteProduct = useDeleteProduct();

    const handleDelete = async (productId: number) => {
        if (
            window.confirm(
                "Are you sure you want to delete this product? This will also delete all associated 3D objects."
            )
        ) {
            try {
                await deleteProduct.mutateAsync(productId);
            } catch (error) {
                console.error("Failed to delete product:", error);
                alert("Failed to delete product. Please try again.");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading products...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64 text-red-600">
                    <div>Error loading products: {error.message}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6">
            {/* Header */}
            <div className="mb-4 lg:mb-6">
                <Button variant="outline" onClick={onBack} className="mb-3 lg:mb-4 text-sm">
                    ← Back to Store Selection
                </Button>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold">Products Management</h2>
                        <p className="text-gray-600 mt-1 text-sm lg:text-base">
                            {storeName} - {sectionTitle}
                        </p>
                    </div>
                    <Button onClick={onCreateProduct} className="flex items-center gap-2 self-start lg:self-auto">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add New Product</span>
                        <span className="sm:hidden">Add Product</span>
                    </Button>
                </div>
            </div>

            {/* Products Grid */}
            {products && products.length > 0 ? (
                <div className="grid gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <Card key={product.yproduitid} className="border-2 hover:border-blue-300 transition-colors">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                                    <Package className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                                    <span className="truncate">{product.yproduitintitule}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Product Image */}
                                    {product.imageurl && (
                                        <div className="w-full h-24 lg:h-32 bg-gray-100 rounded-md overflow-hidden">
                                            <img
                                                src={product.imageurl}
                                                alt={product.yproduitintitule}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Product Details */}
                                    <div>
                                        <p className="text-xs lg:text-sm text-gray-600 mb-2">
                                            Code: {product.yproduitcode}
                                        </p>
                                        <p className="text-xs lg:text-sm text-gray-800 line-clamp-2 lg:line-clamp-3">
                                            {product.yproduitdetailstech}
                                        </p>
                                    </div>

                                    {/* 3D Objects Count */}
                                    <div className="flex items-center gap-2 text-xs lg:text-sm text-blue-600">
                                        <Box className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span>{product.yobjet3d?.length || 0} 3D Object(s)</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs lg:text-sm"
                                            onClick={() => onEditProduct(product)}
                                        >
                                            <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(product.yproduitid)}
                                            disabled={deleteProduct.isPending}
                                            className="px-2 lg:px-3"
                                        >
                                            <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 lg:py-12">
                    <Package className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-sm lg:text-base text-gray-600 mb-6">
                        Get started by creating your first product.
                    </p>
                    <Button onClick={onCreateProduct} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Product
                    </Button>
                </div>
            )}
        </div>
    );
}
