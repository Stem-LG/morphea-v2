'use client'
import React, { useState, useMemo } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Plus, Tag, Search, Package, TreePine } from 'lucide-react'
import { useCategoriesWithStats } from '@/hooks/useCategories'
import { CreateCategoryDialog } from './create-category-dialog'
import { CategoryTree } from './category-tree'
import {
    organizeCategoriesIntoTree,
    filterCategoriesTree,
    getTotalProductCount,
} from './category-tree-utils'

export function CategoryManagement() {
    const [searchTerm, setSearchTerm] = useState('')
    const { t } = useLanguage()
    const { data: categories, isLoading } = useCategoriesWithStats()

    // Organize categories into tree structure and apply filtering
    const { categoryTree, stats } = useMemo(() => {
        if (!categories) {
            return {
                categoryTree: [],
                stats: {
                    totalCategories: 0,
                    categoriesInUse: 0,
                    searchResults: 0,
                },
            }
        }

        // Convert flat list to tree structure
        const tree = organizeCategoriesIntoTree(categories)

        // Apply search filter
        const filteredTree = filterCategoriesTree(tree, searchTerm)

        // Calculate stats
        const totalCategories = categories.length
        const categoriesInUse = categories.filter(
            (cat) => (cat.yprod?.[0]?.count || 0) > 0
        ).length

        // Count filtered results (flattened)
        const countFilteredCategories = (nodes: typeof tree): number => {
            return nodes.reduce((count, node) => {
                return count + 1 + countFilteredCategories(node.children)
            }, 0)
        }
        const searchResults = countFilteredCategories(filteredTree)

        return {
            categoryTree: filteredTree,
            stats: {
                totalCategories,
                categoriesInUse,
                searchResults,
            },
        }
    }, [categories, searchTerm])

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
                        <p className="text-lg text-gray-900">
                            {t('admin.categories.loadingCategories')}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
                            {t('admin.categories.title')}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {t('admin.categories.subtitle')}
                        </p>
                    </div>
                    <CreateCategoryDialog categories={categories || []}>
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:from-blue-700 hover:to-blue-600">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('admin.categories.addCategory')}
                        </Button>
                    </CreateCategoryDialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 rounded-lg p-2">
                                    <Tag className="text-blue-600 h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {t('admin.categories.totalCategories')}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalCategories}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <Package className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {t('admin.categories.categoriesInUse')}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.categoriesInUse}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Search className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {t('admin.categories.searchResults')}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.searchResults}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-600" />
                    <Input
                        placeholder={t('admin.categories.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-gray-300 pl-10 text-gray-900 placeholder-gray-500"
                    />
                </div>

                {/* Categories Tree */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <TreePine className="text-blue-600 h-5 w-5" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            {t('admin.categories.hierarchicalView')}
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
    )
}
