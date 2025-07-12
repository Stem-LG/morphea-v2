"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Category {
    id: string;
    name: string;
    type: string;
    modalType: string;
    products: any[];
    infospots: any[];
}

interface CategorySelectorProps {
    storeId: string;
    storeName: string;
    categories: Category[];
    onCategorySelect: (categoryId: string, categoryName: string) => void;
    onBack: () => void;
}

export function CategorySelector({ storeName, categories, onCategorySelect, onBack }: CategorySelectorProps) {
    const { t } = useLanguage();

    return (
        <div className="p-4 lg:p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t("admin.backToStores")}
                </Button>
                <div>
                    <h2 className="text-2xl lg:text-3xl font-bold">{storeName}</h2>
                    <p className="text-gray-600">{t("admin.selectProductCategory")}</p>
                </div>
            </div>

            {!categories || categories.length === 0 ? (
                <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t("admin.noProductCategoriesAvailable")}</p>
                </div>
            ) : (
                <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <Card key={category.id} className="border-2 hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                                    <Package className="h-4 w-4 lg:h-5 lg:w-5" />
                                    {category.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <ShoppingBag className="h-3 w-3 lg:h-4 lg:w-4" />
                                        <span>
                                            {category.products?.length || 0}{" "}
                                            {(category.products?.length || 0) !== 1
                                                ? t("admin.productPlural")
                                                : t("admin.productSingular")}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => onCategorySelect(category.id, category.name)}
                                        disabled={!category.products || category.products.length === 0}
                                    >
                                        {category.products && category.products.length > 0
                                            ? `${t("admin.viewProducts")} ${category.products.length} ${
                                                  category.products.length !== 1
                                                      ? t("admin.productPlural")
                                                      : t("admin.productSingular")
                                              }`
                                            : t("admin.noProducts")}
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
