"use client";
import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Tag } from "lucide-react";
import { CategoryTreeItem } from "./category-tree-item";
import { CategoryTreeNode } from "./category-tree-utils";

interface CategoryTreeProps {
    categories: CategoryTreeNode[];
    originalCategories: any[]; // Flat array of original categories
    searchTerm?: string;
}

export function CategoryTree({ categories, originalCategories, searchTerm }: CategoryTreeProps) {
    const { t } = useLanguage();

    if (categories.length === 0) {
        return (
            <div className="text-center py-12">
                <Tag className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {searchTerm ? t("admin.categories.noMatchingCategories") : t("admin.categories.noCategoriesFound")}
                </h3>
                <p className="text-gray-600">
                    {searchTerm
                        ? t("admin.categories.adjustSearchCriteria")
                        : t("admin.categories.addFirstCategory")
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {categories.map((category) => (
                <CategoryTreeItem
                    key={category.xcategprodid}
                    category={category}
                    allCategories={originalCategories}
                    level={0}
                />
            ))}
        </div>
    );
}