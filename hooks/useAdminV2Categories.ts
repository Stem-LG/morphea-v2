import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

// For now, we'll use a mock interface since the category structure isn't fully defined in the schema
interface Category {
    id: string;
    name: string;
    description?: string;
    storeId: string;
    productCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface CategoryInsert {
    name: string;
    description?: string;
    storeId: string;
    isActive?: boolean;
}

interface CategoryUpdate {
    name?: string;
    description?: string;
    isActive?: boolean;
}

// Hook for getting categories for a specific store
export function useStoreCategories(storeId: string | null, options?: {
    includeInactive?: boolean;
    search?: string;
}) {
    return useQuery({
        queryKey: ['adminv2-store-categories', storeId, options],
        queryFn: async () => {
            if (!storeId) return [];

            // Mock data for now - in a real implementation, this would query the database
            const mockCategories: Category[] = [
                {
                    id: "1",
                    name: "Electronics",
                    description: "Electronic devices and accessories",
                    storeId,
                    productCount: 15,
                    isActive: true,
                    createdAt: "2024-01-15T00:00:00Z"
                },
                {
                    id: "2", 
                    name: "Fashion",
                    description: "Clothing and fashion accessories",
                    storeId,
                    productCount: 23,
                    isActive: true,
                    createdAt: "2024-01-20T00:00:00Z"
                },
                {
                    id: "3",
                    name: "Home & Garden",
                    description: "Home decor and garden supplies",
                    storeId,
                    productCount: 8,
                    isActive: true,
                    createdAt: "2024-02-01T00:00:00Z"
                },
                {
                    id: "4",
                    name: "Sports",
                    description: "Sports equipment and accessories",
                    storeId,
                    productCount: 12,
                    isActive: false,
                    createdAt: "2024-02-10T00:00:00Z"
                }
            ];

            let filteredCategories = mockCategories;

            // Filter by active status
            if (!options?.includeInactive) {
                filteredCategories = filteredCategories.filter(cat => cat.isActive);
            }

            // Filter by search term
            if (options?.search) {
                const searchTerm = options.search.toLowerCase();
                filteredCategories = filteredCategories.filter(cat =>
                    cat.name.toLowerCase().includes(searchTerm) ||
                    cat.description?.toLowerCase().includes(searchTerm)
                );
            }

            return filteredCategories;
        },
        enabled: !!storeId,
    });
}

// Hook for getting category statistics
export function useCategoryStats(storeId: string | null) {
    return useQuery({
        queryKey: ['adminv2-category-stats', storeId],
        queryFn: async () => {
            if (!storeId) return null;

            // Mock data - in a real implementation, this would calculate from the database
            const mockStats = {
                totalCategories: 4,
                activeCategories: 3,
                inactiveCategories: 1,
                totalProducts: 58,
                averageProductsPerCategory: 14.5,
                mostPopularCategory: {
                    name: "Fashion",
                    productCount: 23
                },
                leastPopularCategory: {
                    name: "Home & Garden",
                    productCount: 8
                },
                recentlyAdded: 2,
                categoryGrowth: 15 // percentage growth this month
            };

            return mockStats;
        },
        enabled: !!storeId,
    });
}

// Hook for creating a new category
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (category: CategoryInsert) => {
            // Mock implementation - in a real app, this would call an API
            const newCategory: Category = {
                id: Date.now().toString(),
                name: category.name,
                description: category.description,
                storeId: category.storeId,
                productCount: 0,
                isActive: category.isActive ?? true,
                createdAt: new Date().toISOString()
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            return newCategory;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-categories'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-category-stats'] });
        },
    });
}

// Hook for updating a category
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: CategoryUpdate }) => {
            // Mock implementation - in a real app, this would call an API
            const updatedCategory = {
                id,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            return updatedCategory;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-categories'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-category-stats'] });
        },
    });
}

// Hook for deleting a category
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryId: string) => {
            // Mock implementation - in a real app, this would call an API
            // and handle product reassignment or deletion
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            return categoryId;
        },
        onSuccess: (categoryId) => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-categories'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-category-stats'] });
        },
    });
}

// Hook for bulk category operations
export function useBulkCategoryOperations() {
    const queryClient = useQueryClient();

    const bulkUpdateStatus = useMutation({
        mutationFn: async ({ categoryIds, isActive }: { categoryIds: string[], isActive: boolean }) => {
            // Mock implementation
            await new Promise(resolve => setTimeout(resolve, 500));
            return categoryIds;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-categories'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-category-stats'] });
        },
    });

    const bulkDelete = useMutation({
        mutationFn: async (categoryIds: string[]) => {
            // Mock implementation
            await new Promise(resolve => setTimeout(resolve, 500));
            return categoryIds;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminv2-store-categories'] });
            queryClient.invalidateQueries({ queryKey: ['adminv2-category-stats'] });
        },
    });

    return {
        bulkUpdateStatus,
        bulkDelete
    };
}

// Hook for category analytics
export function useCategoryAnalytics(storeId: string | null, timeRange?: '7d' | '30d' | '90d' | '1y') {
    return useQuery({
        queryKey: ['adminv2-category-analytics', storeId, timeRange],
        queryFn: async () => {
            if (!storeId) return null;

            // Mock analytics data
            const mockAnalytics = {
                categoryPerformance: [
                    { categoryId: "1", name: "Electronics", views: 1250, conversions: 89, revenue: 15420 },
                    { categoryId: "2", name: "Fashion", views: 2100, conversions: 156, revenue: 23890 },
                    { categoryId: "3", name: "Home & Garden", views: 890, conversions: 45, revenue: 8750 },
                    { categoryId: "4", name: "Sports", views: 650, conversions: 32, revenue: 5680 }
                ],
                trends: {
                    totalViews: 4890,
                    totalConversions: 322,
                    totalRevenue: 53740,
                    averageConversionRate: 6.6,
                    topGrowingCategory: "Fashion",
                    growthRate: 23.5
                },
                timeSeriesData: [
                    { date: "2024-01-01", views: 450, conversions: 28 },
                    { date: "2024-01-02", views: 520, conversions: 35 },
                    { date: "2024-01-03", views: 480, conversions: 31 },
                    // ... more data points
                ]
            };

            return mockAnalytics;
        },
        enabled: !!storeId,
    });
}

// Hook for category search and filtering
export function useCategorySearch() {
    return useMutation({
        mutationFn: async (searchParams: {
            storeId: string;
            query?: string;
            isActive?: boolean;
            sortBy?: 'name' | 'productCount' | 'createdAt';
            sortOrder?: 'asc' | 'desc';
            limit?: number;
            offset?: number;
        }) => {
            // Mock implementation - in a real app, this would query the database
            const mockCategories: Category[] = [
                {
                    id: "1",
                    name: "Electronics",
                    description: "Electronic devices and accessories",
                    storeId: searchParams.storeId,
                    productCount: 15,
                    isActive: true,
                    createdAt: "2024-01-15T00:00:00Z"
                },
                // ... more categories
            ];

            let filteredCategories = mockCategories;

            // Apply filters
            if (searchParams.query) {
                const query = searchParams.query.toLowerCase();
                filteredCategories = filteredCategories.filter(cat =>
                    cat.name.toLowerCase().includes(query) ||
                    cat.description?.toLowerCase().includes(query)
                );
            }

            if (searchParams.isActive !== undefined) {
                filteredCategories = filteredCategories.filter(cat => cat.isActive === searchParams.isActive);
            }

            // Apply sorting
            if (searchParams.sortBy) {
                filteredCategories.sort((a, b) => {
                    let aValue: any, bValue: any;
                    
                    switch (searchParams.sortBy) {
                        case 'name':
                            aValue = a.name;
                            bValue = b.name;
                            break;
                        case 'productCount':
                            aValue = a.productCount;
                            bValue = b.productCount;
                            break;
                        case 'createdAt':
                            aValue = new Date(a.createdAt);
                            bValue = new Date(b.createdAt);
                            break;
                        default:
                            return 0;
                    }

                    if (searchParams.sortOrder === 'desc') {
                        return bValue > aValue ? 1 : -1;
                    }
                    return aValue > bValue ? 1 : -1;
                });
            }

            // Apply pagination
            if (searchParams.offset || searchParams.limit) {
                const start = searchParams.offset || 0;
                const end = start + (searchParams.limit || 10);
                filteredCategories = filteredCategories.slice(start, end);
            }

            return filteredCategories;
        },
    });
}

export type { Category, CategoryInsert, CategoryUpdate };