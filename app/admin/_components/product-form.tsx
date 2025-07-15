"use client";
import React, { useState, useEffect } from "react";
import {
    useCreateProduct,
    useUpdateProduct,
    useCreate3DObject,
    useUpdate3DObject,
    useDelete3DObject,
} from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, X, Trash2, Box } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { ProductWithObjects } from "@/hooks/useProducts";

interface ProductFormProps {
    product?: ProductWithObjects;
    storeId: string;
    storeName: string;
    categoryId?: string;
    categoryName?: string;
    onBack: () => void;
    onSave?: () => void;
}

interface Object3DForm {
    id?: number;
    url: string;
    couleur: string;
    order: number;
}

export function ProductForm({ product, storeId, storeName, categoryId, categoryName, onBack, onSave }: ProductFormProps) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        yproduitintitule: "",
        yproduitcode: "",
        yproduitdetailstech: "",
        imageurl: "",
        yarriereplancouleur: "",
    });

    const [objects3D, setObjects3D] = useState<Object3DForm[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const create3DObject = useCreate3DObject();
    const update3DObject = useUpdate3DObject();
    const delete3DObject = useDelete3DObject();

    useEffect(() => {
        if (product) {
            setFormData({
                yproduitintitule: product.yproduitintitule,
                yproduitcode: product.yproduitcode,
                yproduitdetailstech: product.yproduitdetailstech,
                imageurl: product.imageurl || "",
                yarriereplancouleur: product.yarriereplancouleur || "",
            });

            setObjects3D(
                product.yobjet3d?.map((obj, index) => ({
                    id: obj.id,
                    url: obj.url || "",
                    couleur: obj.couleur || "",
                    order: obj.order ?? index,
                })) || []
            );
        }
    }, [product]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAdd3DObject = () => {
        const newOrder = Math.max(...objects3D.map((obj) => obj.order), -1) + 1;
        setObjects3D((prev) => [...prev, { url: "", couleur: "", order: newOrder }]);
    };

    const handleUpdate3DObject = (index: number, field: keyof Object3DForm, value: string | number) => {
        setObjects3D((prev) => prev.map((obj, i) => (i === index ? { ...obj, [field]: value } : obj)));
    };

    const handleRemove3DObject = async (index: number) => {
        const object = objects3D[index];

        if (object.id) {
            // If it has an ID, delete from database
            try {
                await delete3DObject.mutateAsync(object.id);
            } catch (error) {
                console.error("Failed to delete 3D object:", error);
                alert(t('admin.failedToDelete3DObject'));
                return;
            }
        }

        // Remove from local state
        setObjects3D((prev) => prev.filter((_, i) => i !== index));
    };

    const handleMoveObject = (index: number, direction: "up" | "down") => {
        if ((direction === "up" && index === 0) || (direction === "down" && index === objects3D.length - 1)) {
            return;
        }

        setObjects3D((prev) => {
            const newArray = [...prev];
            const targetIndex = direction === "up" ? index - 1 : index + 1;

            // Swap the objects
            [newArray[index], newArray[targetIndex]] = [newArray[targetIndex], newArray[index]];

            // Update their order values
            newArray[index].order = index;
            newArray[targetIndex].order = targetIndex;

            return newArray;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let productId: number;

            if (product) {
                // Update existing product
                const updatedProduct = await updateProduct.mutateAsync({
                    id: product.yproduitid,
                    updates: {
                        ...formData,
                        yinfospotactionsidfk: categoryId || storeId,
                    },
                });
                productId = updatedProduct.yproduitid;
            } else {
                // Create new product with not_approved status
                const newProduct = await createProduct.mutateAsync({
                    ...formData,
                    yinfospotactionsidfk: categoryId || storeId,
                    ystatus: "not_approved", // Set initial status as not_approved for approval
                    yaction: "insert", // Use 'insert' for new products
                });
                productId = newProduct.yproduitid;
            }

            // Handle 3D objects
            for (const [index, obj] of objects3D.entries()) {
                if (obj.id) {
                    // Update existing 3D object
                    await update3DObject.mutateAsync({
                        id: obj.id,
                        updates: {
                            url: obj.url,
                            couleur: obj.couleur,
                            order: index,
                            produit_id: productId,
                        },
                    });
                } else if (obj.url.trim()) {
                    // Create new 3D object (only if URL is provided)
                    await create3DObject.mutateAsync({
                        url: obj.url,
                        couleur: obj.couleur,
                        order: index,
                        produit_id: productId,
                    });
                }
            }

            onSave?.();
            onBack();
        } catch (error) {
            console.error("Failed to save product:", error);
            alert(t('admin.saveProductFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-4 lg:mb-6">
                <Button variant="outline" onClick={onBack} className="mb-3 lg:mb-4 text-sm">
                    {t('admin.backToProductList')}
                </Button>
                <h2 className="text-2xl lg:text-3xl font-bold">{product ? t('admin.editProduct') : t('admin.createNewProduct')}</h2>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">
                    {storeName}
                    {categoryName && (
                        <span className="block text-blue-600 font-medium">
                            {t('admin.category')}: {categoryName}
                        </span>
                    )}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                {/* Product Information */}
                <Card>
                    <CardHeader className="pb-3 lg:pb-6">
                        <CardTitle className="text-lg lg:text-xl">{t('admin.productInformation')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name" className="text-sm lg:text-base">
                                    {t('admin.productName')} *
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.yproduitintitule}
                                    onChange={(e) => handleInputChange("yproduitintitule", e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="code" className="text-sm lg:text-base">
                                    {t('admin.productCode')} *
                                </Label>
                                <Input
                                    id="code"
                                    value={formData.yproduitcode}
                                    onChange={(e) => handleInputChange("yproduitcode", e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-sm lg:text-base">
                                {t('admin.description')} *
                            </Label>
                            <textarea
                                id="description"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                rows={3}
                                value={formData.yproduitdetailstech}
                                onChange={(e) => handleInputChange("yproduitdetailstech", e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="image" className="text-sm lg:text-base">
                                {t('admin.imageUrl')}
                            </Label>
                            <Input
                                id="image"
                                type="url"
                                value={formData.imageurl}
                                onChange={(e) => handleInputChange("imageurl", e.target.value)}
                                placeholder={t('admin.imageUrlPlaceholder')}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="backgroundColor" className="text-sm lg:text-base">
                                {t('admin.backgroundColorLabel')}
                            </Label>
                            <Input
                                id="backgroundColor"
                                type="text"
                                value={formData.yarriereplancouleur}
                                onChange={(e) => handleInputChange("yarriereplancouleur", e.target.value)}
                                placeholder={t('admin.backgroundColorPlaceholder')}
                                className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {t('admin.backgroundColorHelp')}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3D Objects */}
                <Card>
                    <CardHeader className="pb-3 lg:pb-6">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-lg lg:text-xl">
                                <Box className="h-4 w-4 lg:h-5 lg:w-5" />
                                {t('admin.threeDObjectsTitle')}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAdd3DObject}
                                size="sm"
                                className="self-start sm:self-auto"
                            >
                                <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                                <span className="hidden sm:inline">{t('admin.addThreeDObject')}</span>
                                <span className="sm:hidden">{t('admin.addObject')}</span>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {objects3D.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 text-sm lg:text-base">
                                {t('admin.noThreeDObjectsMessage')}
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {objects3D.map((obj, index) => (
                                    <div key={index} className="border rounded-lg p-3 lg:p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-medium text-sm lg:text-base">
                                                {t('admin.threeDObjectNumber')}{index + 1}
                                            </span>
                                            <div className="flex items-center gap-1 lg:gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleMoveObject(index, "up")}
                                                    disabled={index === 0}
                                                    className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                                                >
                                                    ↑
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleMoveObject(index, "down")}
                                                    disabled={index === objects3D.length - 1}
                                                    className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                                                >
                                                    ↓
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemove3DObject(index)}
                                                    className="h-7 w-7 lg:h-8 lg:w-8 p-0"
                                                >
                                                    <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                            <div className="lg:col-span-2">
                                                <Label htmlFor={`url-${index}`} className="text-sm lg:text-base">
                                                    {t('admin.threeDModelUrl')}
                                                </Label>
                                                <Input
                                                    id={`url-${index}`}
                                                    value={obj.url}
                                                    onChange={(e) => handleUpdate3DObject(index, "url", e.target.value)}
                                                    placeholder={t('admin.threeDModelUrlPlaceholder')}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`color-${index}`} className="text-sm lg:text-base">
                                                    {t('admin.color')}
                                                </Label>
                                                <Input
                                                    id={`color-${index}`}
                                                    value={obj.couleur}
                                                    onChange={(e) =>
                                                        handleUpdate3DObject(index, "couleur", e.target.value)
                                                    }
                                                    placeholder={t('admin.colorPlaceholder')}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Label htmlFor={`order-${index}`} className="text-sm lg:text-base">
                                                {t('admin.order')}
                                            </Label>
                                            <Input
                                                id={`order-${index}`}
                                                type="number"
                                                value={obj.order}
                                                onChange={(e) =>
                                                    handleUpdate3DObject(index, "order", parseInt(e.target.value) || 0)
                                                }
                                                className="mt-1 max-w-24"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
                    <Button type="button" variant="outline" onClick={onBack} className="order-2 sm:order-1">
                        <X className="h-4 w-4 mr-2" />
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="order-1 sm:order-2">
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? t('admin.saving') : t('admin.saveProduct')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
