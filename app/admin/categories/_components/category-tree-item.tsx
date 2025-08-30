'use client'
import React, { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
    Plus,
    Image as ImageIcon,
} from 'lucide-react'
import { useDeleteCategory } from '@/hooks/useCategories'
import { CreateCategoryDialog } from './create-category-dialog'
import { UpdateCategoryDialog } from './update-category-dialog'
import { CategoryTreeNode, getTotalProductCount } from './category-tree-utils'

interface CategoryTreeItemProps {
    category: CategoryTreeNode
    allCategories: any[] // Flat array of original categories for dialogs
    level?: number
}

export function CategoryTreeItem({
    category,
    allCategories,
    level = 0,
}: CategoryTreeItemProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { t } = useLanguage()
    const deleteCategoryMutation = useDeleteCategory()

    const productCount = category.yprod?.[0]?.count || 0
    const totalProductCount = getTotalProductCount(category)
    const isInUse = totalProductCount > 0
    const hasChildren = category.children.length > 0

    const handleDelete = async (categoryId: number) => {
        if (confirm(t('admin.categories.confirmDelete'))) {
            try {
                await deleteCategoryMutation.mutateAsync(categoryId)
            } catch (error) {
                console.error('Failed to delete category:', error)
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : t('admin.categories.deleteError')
                alert(errorMessage)
            }
        }
    }

    return (
        <div className={`ml-${level * 4}`}>
            <Card className="border-gray-200 bg-white mb-2 shadow-sm transition-all duration-300 hover:shadow-md">
                <CardContent className="px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            {/* Expand/Collapse button */}
                            {hasChildren ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="h-6 w-6 flex-shrink-0 p-0 hover:bg-gray-100"
                                >
                                    {isOpen ? (
                                        <ChevronDown className="h-4 w-4 text-gray-600" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-600" />
                                    )}
                                </Button>
                            ) : (
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                                    <Tag className="h-3 w-3 text-gray-600" />
                                </div>
                            )}

                            {/* Category image or icon */}
                            <div className="flex-shrink-0">
                                {(category as any).media?.ymediaurl ? (
                                    <div className="relative">
                                        <img
                                            src={
                                                (category as any).media
                                                    .ymediaurl
                                            }
                                            alt={category.xcategprodintitule}
                                            className="h-8 w-8 rounded border border-gray-300 object-cover"
                                        />
                                        <div className="absolute -top-1 -right-1 rounded-full bg-green-500 p-0.5">
                                            <ImageIcon className="h-2 w-2 text-white" />
                                        </div>
                                    </div>
                                ) : hasChildren ? (
                                    isOpen ? (
                                        <FolderOpen className="text-blue-600 h-4 w-4" />
                                    ) : (
                                        <Folder className="text-blue-600 h-4 w-4" />
                                    )
                                ) : (
                                    <Tag className="h-4 w-4 text-blue-600" />
                                )}
                            </div>

                            {/* Category info - name, code, and description in one line */}
                            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                <h3 className="truncate text-sm font-medium text-gray-900">
                                    {category.xcategprodintitule}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                    <span className="flex-shrink-0">
                                        <span className="font-medium">
                                            {t('admin.categories.code')}:
                                        </span>
                                        <span className="ml-1 text-gray-900">
                                            {category.xcategprodcode}
                                        </span>
                                    </span>
                                    {category.xcategprodinfobulle && (
                                        <span className="truncate">
                                            <span className="font-medium">
                                                {t(
                                                    'admin.categories.description'
                                                )}
                                                :
                                            </span>
                                            <span className="ml-1 text-gray-900">
                                                {category.xcategprodinfobulle}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-2">
                            {/* Product count badge */}
                            {totalProductCount > 0 && (
                                <Badge className="flex items-center gap-1 border border-green-200 bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                    <Package className="h-3 w-3" />
                                    {totalProductCount}
                                    {hasChildren &&
                                        productCount !== totalProductCount && (
                                            <span className="text-gray-600">
                                                ({productCount})
                                            </span>
                                        )}
                                </Badge>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-1">
                                {/* Add subcategory */}
                                <CreateCategoryDialog
                                    categories={allCategories}
                                    defaultParentId={category.xcategprodid}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:text-blue-600 hover:bg-blue-50 h-6 w-6 p-1 text-gray-600"
                                        title={t(
                                            'admin.categories.addSubcategory'
                                        )}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </CreateCategoryDialog>

                                {/* Edit category */}
                                <UpdateCategoryDialog
                                    category={category}
                                    categories={allCategories}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-1 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                        title={t('common.edit')}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                </UpdateCategoryDialog>

                                {/* Delete category */}
                                <span
                                    className={
                                        isInUse ? 'cursor-not-allowed' : ''
                                    }
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleDelete(category.xcategprodid)
                                        }
                                        disabled={
                                            deleteCategoryMutation.isPending ||
                                            isInUse
                                        }
                                        className={`h-6 w-6 p-1 ${
                                            isInUse
                                                ? 'cursor-not-allowed text-gray-400'
                                                : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                        title={
                                            isInUse
                                                ? `${t('admin.categories.cannotDelete')}: ${t('admin.categories.categoryUsedBy')} ${totalProductCount} ${t('admin.categories.product')}${totalProductCount !== 1 ? 's' : ''}`
                                                : t(
                                                      'admin.categories.deleteCategory'
                                                  )
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
                                <div className="space-y-1 border-l-2 border-gray-300 pl-3">
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
    )
}
