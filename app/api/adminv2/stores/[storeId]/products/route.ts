import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/server'
import { checkStoreAccess } from '@/lib/store-access'

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

// GET /api/adminv2/stores/[storeId]/products - Get products for a specific store
export async function GET(
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'yprodid'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Use admin client to query products from morpheus schema
    const adminSupabase = createAdminClient()
    
    let query = adminSupabase
      .schema('morpheus')
      .from('yprod')
      .select(`
        *,
        yobjet3d(*)
      `)

    // Filter by status if specified
    if (status !== 'all') {
      const statusMap: { [key: string]: string } = {
        'approved': 'approved',
        'pending': 'not_approved',
        'rejected': 'rejected'
      }
      if (statusMap[status]) {
        query = query.eq('yprodstatut', statusMap[status])
      }
    }

    // Filter by category if specified
    if (categoryId) {
      query = query.eq('xcategprodidfk', parseInt(categoryId))
    }

    // Apply search filter
    if (search) {
      query = query.or(`yprodintitule.ilike.%${search}%,yprodcode.ilike.%${search}%,yproddetailstech.ilike.%${search}%`)
    }

    // Apply sorting
    const validSortColumns = ['yprodid', 'yprodintitule', 'yprodcode', 'sysdate', 'yprodstatut']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'yprodid'
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: products, error: productsError } = await query

    if (productsError) {
      console.error('Error fetching store products:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = adminSupabase
      .schema('morpheus')
      .from('yprod')
      .select('*', { count: 'exact', head: true })

    // Apply same filters for count
    if (status !== 'all') {
      const statusMap: { [key: string]: string } = {
        'approved': 'approved',
        'pending': 'not_approved',
        'rejected': 'rejected'
      }
      if (statusMap[status]) {
        countQuery = countQuery.eq('yprodstatut', statusMap[status])
      }
    }

    if (categoryId) {
      countQuery = countQuery.eq('xcategprodidfk', parseInt(categoryId))
    }

    if (search) {
      countQuery = countQuery.or(`yprodintitule.ilike.%${search}%,yprodcode.ilike.%${search}%,yproddetailstech.ilike.%${search}%`)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error getting products count:', countError)
    }

    return NextResponse.json({
      products: products || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/adminv2/stores/[storeId]/products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/adminv2/stores/[storeId]/products - Create a new product for the store
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
    const { 
      yprodintitule, 
      yprodcode, 
      yproddetailstech, 
      yprodinfobulle,
      xcategprodidfk,
      objects3d = []
    } = body

    if (!yprodintitule || !yprodcode) {
      return NextResponse.json(
        { error: 'Product name and code are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Create the product
    const { data: newProduct, error: productError } = await adminSupabase
      .schema('morpheus')
      .from('yprod')
      .insert({
        yprodid: Date.now(), // Generate unique ID
        yprodintitule,
        yprodcode,
        yproddetailstech,
        yprodinfobulle,
        xcategprodidfk: xcategprodidfk ? parseInt(xcategprodidfk) : null,
        ydesignidfk: parseInt(storeId), // Link to store/design
        yprodstatut: 'not_approved', // New products start as pending approval
        sysdate: new Date().toISOString(),
        sysaction: 'insert',
        sysuser: user?.email || 'system'
      })
      .select()
      .single()

    if (productError) {
      console.error('Error creating product:', productError)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    // Create 3D objects if provided
    if (objects3d.length > 0) {
      const objects3dData = objects3d.map((obj: any, index: number) => ({
        yobjet3durl: obj.url,
        yobjet3dcouleur: obj.couleur || '',
        yobjet3dorder: index,
        yvarprodidfk: newProduct.yprodid,
        yobjet3daction: 'insert'
      }))

      const { error: objects3dError } = await adminSupabase
        .schema('morpheus')
        .from('yobjet3d')
        .insert(objects3dData)

      if (objects3dError) {
        console.error('Error creating 3D objects:', objects3dError)
        // Don't fail the entire request, just log the error
      }
    }

    return NextResponse.json({
      product: newProduct,
      message: 'Product created successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/adminv2/stores/[storeId]/products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/adminv2/stores/[storeId]/products - Bulk update products
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
    const { productIds, updates } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // Update products
    const { data: updatedProducts, error: updateError } = await adminSupabase
      .schema('morpheus')
      .from('yprod')
      .update({
        ...updates,
        sysdate: new Date().toISOString(),
        sysaction: 'update',
        sysuser: user?.email || 'system'
      })
      .in('yprodid', productIds)
      .select()

    if (updateError) {
      console.error('Error updating products:', updateError)
      return NextResponse.json(
        { error: 'Failed to update products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      products: updatedProducts,
      message: `${updatedProducts?.length || 0} products updated successfully`
    })

  } catch (error) {
    console.error('Error in PATCH /api/adminv2/stores/[storeId]/products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}