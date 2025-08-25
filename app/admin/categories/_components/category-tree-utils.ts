import { Database } from "@/lib/supabase";

type Category = Database['morpheus']['Tables']['xcategprod']['Row'] & { 
    parent?: Pick<Database['morpheus']['Tables']['xcategprod']['Row'], 'xcategprodid' | 'xcategprodintitule' | 'xcategprodcode'> | null; 
    yprod: { count: number }[] 
};

export interface CategoryTreeNode extends Category {
    children: CategoryTreeNode[];
}

// Helper function to organize categories into a hierarchical tree structure
export function organizeCategoriesIntoTree(categories: Category[]): CategoryTreeNode[] {
    // Create a map of all categories for quick lookup
    const categoryMap = new Map<number, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: Create nodes for all categories
    categories.forEach(category => {
        categoryMap.set(category.xcategprodid, {
            ...category,
            children: []
        });
    });

    // Second pass: Build the tree structure
    categories.forEach(category => {
        const node = categoryMap.get(category.xcategprodid);
        if (!node) return;

        if (category.xcategparentid === null) {
            // Root category
            rootCategories.push(node);
        } else {
            // Child category
            const parentNode = categoryMap.get(category.xcategparentid);
            if (parentNode) {
                parentNode.children.push(node);
            }
        }
    });

    // Sort root categories and their children alphabetically
    sortCategoriesAlphabetically(rootCategories);
    
    return rootCategories;
}

// Helper function to sort categories and their children alphabetically
function sortCategoriesAlphabetically(categories: CategoryTreeNode[]): void {
    categories.sort((a, b) => 
        a.xcategprodintitule.localeCompare(b.xcategprodintitule)
    );
    
    categories.forEach(category => {
        if (category.children.length > 0) {
            sortCategoriesAlphabetically(category.children);
        }
    });
}

// Helper function to filter categories based on search term
export function filterCategoriesTree(
    categories: CategoryTreeNode[], 
    searchTerm: string
): CategoryTreeNode[] {
    if (!searchTerm) return categories;

    const searchLower = searchTerm.toLowerCase();
    
    return categories.reduce<CategoryTreeNode[]>((filtered, category) => {
        // Check if current category matches
        const categoryMatches = 
            category.xcategprodintitule?.toLowerCase().includes(searchLower) ||
            category.xcategprodcode?.toLowerCase().includes(searchLower) ||
            category.xcategprodinfobulle?.toLowerCase().includes(searchLower);

        // Recursively filter children
        const filteredChildren = filterCategoriesTree(category.children, searchTerm);

        // Include category if it matches OR has matching children
        if (categoryMatches || filteredChildren.length > 0) {
            filtered.push({
                ...category,
                children: filteredChildren
            });
        }

        return filtered;
    }, []);
}

// Helper function to get total product count for a category and its children
export function getTotalProductCount(category: CategoryTreeNode): number {
    const currentCount = category.yprod?.[0]?.count || 0;
    const childrenCount = category.children.reduce(
        (total, child) => total + getTotalProductCount(child), 
        0
    );
    return currentCount + childrenCount;
}
