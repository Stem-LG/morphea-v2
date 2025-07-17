"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trash2, Eye, Package, ArrowLeft } from "lucide-react";
import { usePendingProducts, useApproveProduct } from "@/hooks/useProductApprovals";
import { useDeleteProduct } from "@/hooks/useProducts";
import { ApprovalStats } from "./approval-stats";
import type { ProductWithObjects } from "@/hooks/useProducts";

interface ProductDetailsModalProps {
    product: ProductWithObjects;
    onClose: () => void;
    onApprove: (productId: number) => void;
    onDelete: (productId: number) => void;
}

function ProductDetailsModal({ product, onClose, onApprove, onDelete }: ProductDetailsModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Product Details</h2>
                        <Button variant="outline" onClick={onClose}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Product Name</label>
                                    <p className="text-gray-900">{product.yproduitintitule}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Product Code</label>
                                    <p className="text-gray-900">{product.yproduitcode}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <Badge variant={product.ystatus === 'not_approved' ? 'secondary' : 'default'}>
                                        {product.ystatus === 'not_approved' ? 'Pending Approval' : product.ystatus}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Technical Details</label>
                                    <p className="text-gray-900">{product.yproduitdetailstech}</p>
                                </div>
                                {product.imageurl && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Product Image</label>
                                        <img 
                                            src={product.imageurl} 
                                            alt={product.yproduitintitule}
                                            className="mt-2 max-w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">3D Objects ({product.yobjet3d?.length || 0})</h3>
                            <div className="space-y-3">
                                {product.yobjet3d?.map((obj, index) => (
                                    <Card key={obj.id} className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Object {index + 1}</span>
                                                <Badge variant="outline">Order: {obj.order || 'N/A'}</Badge>
                                            </div>
                                            {obj.couleur && (
                                                <div>
                                                    <span className="text-sm text-gray-600">Color: </span>
                                                    <span className="text-sm">{obj.couleur}</span>
                                                </div>
                                            )}
                                            {obj.url && (
                                                <div>
                                                    <span className="text-sm text-gray-600">URL: </span>
                                                    <a 
                                                        href={obj.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        View 3D Object
                                                    </a>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-sm text-gray-600">Action: </span>
                                                <span className="text-sm">{obj.yaction}</span>
                                            </div>
                                        </div>
                                    </Card>
                                )) || <p className="text-gray-500">No 3D objects available</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onDelete(product.yproduitid)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Product
                        </Button>
                        <Button
                            onClick={() => onApprove(product.yproduitid)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Product
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProductApprovals() {
    const [selectedProduct, setSelectedProduct] = useState<ProductWithObjects | null>(null);
    
    const { data: pendingProducts, isLoading, error } = usePendingProducts();
    const approveProductMutation = useApproveProduct();
    const deleteProductMutation = useDeleteProduct();

    const handleApprove = async (productId: number) => {
        try {
            await approveProductMutation.mutateAsync(productId);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Failed to approve product:', error);
        }
    };

    const handleDelete = async (productId: number) => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                await deleteProductMutation.mutateAsync(productId);
                setSelectedProduct(null);
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-morpheus-gold-dark mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pending products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Error loading pending products: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Product Approvals</h1>
                <p className="text-gray-600 mt-2">Review and approve pending products</p>
            </div>

            <ApprovalStats />

            {pendingProducts && pendingProducts.length === 0 ? (
                <Card className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Products</h3>
                    <p className="text-gray-600">All products have been reviewed and approved.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingProducts?.map((product) => (
                        <Card key={product.yproduitid} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                        {product.yproduitintitule}
                                    </h3>
                                    <p className="text-sm text-gray-600">{product.yproduitcode}</p>
                                </div>

                                {product.imageurl && (
                                    <img 
                                        src={product.imageurl} 
                                        alt={product.yproduitintitule}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                )}

                                <div>
                                    <Badge variant="secondary">
                                        Status: {product.ystatus === 'not_approved' ? 'Pending Approval' : product.ystatus}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {product.yproduitdetailstech}
                                    </p>
                                </div>

                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">3D Objects:</span> {product.yobjet3d?.length || 0}
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedProduct(product)}
                                        className="flex-1"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                    </Button>
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(product.yproduitid)}
                                        disabled={deleteProductMutation.isPending}
                                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(product.yproduitid)}
                                        disabled={approveProductMutation.isPending}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {selectedProduct && (
                <ProductDetailsModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onApprove={handleApprove}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}