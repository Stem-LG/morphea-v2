import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/server'

// Helper function to check if user has access to the store
async function checkUserStoreAccess(request: NextRequest, storeId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { hasAccess: false, error: 'Unauthorized' }
  }

  const userMetadata = user.app_metadata as { roles?: string[], assigned_stores?: number[] }
  const roles = userMetadata?.roles || []
  const assignedStores = userMetadata?.assigned_stores || []

  // Admin users have access to all stores
  if (roles.includes('admin')) {
    return { hasAccess: true, error: null, user }
  }

  // Store admin users only have access to their assigned stores
  if (roles.includes('store_admin')) {
    const hasAccess = assignedStores.includes(parseInt(storeId))
    return { hasAccess, error: hasAccess ? null : 'Access denied to this store', user }
  }

  return { hasAccess: false, error: 'Insufficient permissions' }
}

// GET /api/adminv2/stores/[storeId]/categories - Get categories for a specific store
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const storeId = params.storeId

    // Check if current user has access to this store
    const { hasAccess, error } = await checkUserStoreAccess(request, storeId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: error || 'Access denied' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // For now, return mock data since the category structure isn't fully defined
    // In a real implementation, this would query the actual category table
    const mockCategories = [
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
    if (!includeInactive) {
      filteredCategories = filteredCategories.filter(cat => cat.isActive);
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCategories = filteredCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm) ||
        cat.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const paginatedCategories = filteredCategories.slice(offset, offset + limit);

    return NextResponse.json({
      categories: paginatedCategories,
      pagination: {
        total: filteredCategories.length,
        limit,
        offset,
        hasMore: filteredCategories.length > offset + limit
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/adminv2/stores/[storeId]/categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/adminv2/stores/[storeId]/categories - Create a new category for the store
export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const storeId = params.storeId

    // Check if current user has access to this store
    const { hasAccess, error, user } = await checkUserStoreAccess(request, storeId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: error || 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, isActive = true } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Mock implementation - in a real app, this would create in the database
    const newCategory = {
      id: Date.now().toString(),
      name,
      description,
      storeId,
      productCount: 0,
      isActive,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      category: newCategory,
      message: 'Category created successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/adminv2/stores/[storeId]/categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/adminv2/stores/[storeId]/categories - Bulk update categories
export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const storeId = params.storeId

    // Check if current user has access to this store
    const { hasAccess, error, user } = await checkUserStoreAccess(request, storeId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: error || 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { categoryIds, updates } = body

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'Category IDs are required' },
        { status: 400 }
      )
    }

    // Mock implementation - in a real app, this would update in the database
    const updatedCategories = categoryIds.map((id: string) => ({
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    }));

    return NextResponse.json({
      categories: updatedCategories,
      message: `${updatedCategories.length} categories updated successfully`
    })

  } catch (error) {
    console.error('Error in PATCH /api/adminv2/stores/[storeId]/categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/adminv2/stores/[storeId]/categories - Delete categories
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const storeId = params.storeId

    // Check if current user has access to this store
    const { hasAccess, error, user } = await checkUserStoreAccess(request, storeId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: error || 'Access denied' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const categoryIds = searchParams.get('categoryIds')?.split(',') || []

    if (categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'Category IDs are required' },
        { status: 400 }
      )
    }

    // Mock implementation - in a real app, this would:
    // 1. Check if categories have products
    // 2. Handle product reassignment or prevent deletion
    // 3. Delete from database

    return NextResponse.json({
      deletedIds: categoryIds,
      message: `${categoryIds.length} categories deleted successfully`
    })

  } catch (error) {
    console.error('Error in DELETE /api/adminv2/stores/[storeId]/categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}