"use client";
import React, { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    ChevronRight,
    ChevronDown,
    Edit,
    Trash2,
    Tag,
    Package,
    AlertTriangle,
    Folder,
    FolderOpen,
    Plus
} from "lucide-react";
import {
    useDeleteCategory
} from "@/hooks/useCategories";
import { CreateCategoryDialog } from "./create-category-dialog";
import { UpdateCategoryDialog } from "./update-category-dialog";
import { CategoryTreeNode, getTotalProductCount } from "./category-tree-utils";

interface CategoryTreeItemProps {
    category: CategoryTreeNode;
    allCategories: any[]; // Flat array of original categories for dialogs
    level?: number;
}

export function CategoryTreeItem({ category, allCategories, level = 0 }: CategoryTreeItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();
    const deleteCategoryMutation = useDeleteCategory();

    const productCount = category.yprod?.[0]?.count || 0;
    const totalProductCount = getTotalProductCount(category);
    const isInUse = totalProductCount > 0;
    const hasChildren = category.children.length > 0;

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

    return (
        <div className={`ml-${level * 4}`}>
            <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 mb-2">
                <CardContent className="px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Expand/Collapse button */}
                            {hasChildren ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="p-0 h-6 w-6 hover:bg-slate-700/50 flex-shrink-0"
                                >
                                    {isOpen ? (
                                        <ChevronDown className="h-4 w-4 text-gray-300" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                    )}
                                </Button>
                            ) : (
                                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    <Tag className="h-3 w-3 text-gray-400" />
                                </div>
                            )}
                            
                            {/* Category icon */}
                            <div className="flex-shrink-0">
                                {hasChildren ? (
                                    isOpen ? (
                                        <FolderOpen className="h-4 w-4 text-morpheus-gold-light" />
                                    ) : (
                                        <Folder className="h-4 w-4 text-morpheus-gold-light" />
                                    )
                                ) : (
                                    <Tag className="h-4 w-4 text-blue-400" />
                                )}
                            </div>
                            
                            {/* Category info - name, code, and description in one line */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
                                <h3 className="text-white text-sm font-medium truncate">
                                    {category.xcategprodintitule}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex-shrink-0">
                                        <span className="font-medium">{t("admin.categories.code")}:</span>
                                        <span className="text-white ml-1">{category.xcategprodcode}</span>
                                    </span>
                                    {category.xcategprodinfobulle && (
                                        <span className="truncate">
                                            <span className="font-medium">{t("admin.categories.description")}:</span>
                                            <span className="text-white ml-1">{category.xcategprodinfobulle}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Product count badge */}
                            {totalProductCount > 0 && (
                                <Badge className="px-2 py-1 text-xs font-medium flex items-center gap-1 border text-green-400 bg-green-400/10 border-green-400/20">
                                    <Package className="h-3 w-3" />
                                    {totalProductCount}
                                    {hasChildren && productCount !== totalProductCount && (
                                        <span className="text-gray-400">({productCount})</span>
                                    )}
                                </Badge>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-1">
                                {/* Add subcategory */}
                                <CreateCategoryDialog categories={allCategories} defaultParentId={category.xcategprodid}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-6 w-6 text-gray-400 hover:text-morpheus-gold-light hover:bg-morpheus-gold-light/10"
                                        title={t("admin.categories.addSubcategory")}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </CreateCategoryDialog>

                                {/* Edit category */}
                                <UpdateCategoryDialog category={category} categories={allCategories}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-6 w-6 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                                        title={t("common.edit")}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                </UpdateCategoryDialog>

                                {/* Delete category */}
                                <span className={isInUse ? "cursor-not-allowed" : ""}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(category.xcategprodid)}
                                        disabled={deleteCategoryMutation.isPending || isInUse}
                                        className={`p-1 h-6 w-6 ${isInUse
                                            ? "text-gray-500 cursor-not-allowed"
                                            : "text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                                        }`}
                                        title={isInUse
                                            ? `${t("admin.categories.cannotDelete")}: ${t("admin.categories.categoryUsedBy")} ${totalProductCount} ${t("admin.categories.product")}${totalProductCount !== 1 ? 's' : ''}`
                                            : t("admin.categories.deleteCategory")
                                        }
                                    >
                                        {isInUse ? (
                                            <AlertTriangle className="h-3 w-3" />
                                        ) : (
                                            <Trash2 className="h-3 w-3" />
                                        )}
                                    </Button>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Collapsible children */}
                    {hasChildren && (
                        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                            <CollapsibleContent className="mt-3">
                                <div className="space-y-1 border-l-2 border-slate-600/50 pl-3">
                                    {category.children.map((child) => (
                                        <CategoryTreeItem
                                            key={child.xcategprodid}
                                            category={child}
                                            allCategories={allCategories}
                                            level={level + 1}
                                        />
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}