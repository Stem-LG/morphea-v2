import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/server'

// Helper function to check if user has admin role
async function checkAdminRole(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { isAdmin: false, error: 'Unauthorized' }
  }

  // Check if user has admin role in app_metadata
  const userMetadata = user.app_metadata as { roles?: string[] }
  const isAdmin = userMetadata?.roles?.includes('admin') || false

  return { isAdmin, error: null, user }
}

// GET /api/admin/approvals - Get pending products for approval
export async function GET(request: NextRequest) {
  try {
    // Check if current user is admin
    const { isAdmin, error } = await checkAdminRole(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    // Use admin client to query pending products from morpheus schema
    const adminSupabase = createAdminClient()
    
    const { data: products, error: productsError } = await adminSupabase
      .schema('morpheus')
      .from('yprod')
      .select(`
        *,
        yvarprod(
          *,
          yobjet3d(*)
        )
      `)
      .eq('yprodstatut', 'not_approved')
      .order('sysdate', { ascending: false })

    if (productsError) {
      console.error('Error fetching pending products:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch pending products' },
        { status: 500 }
      )
    }

    // Transform the data to flatten 3D objects from variants
    const transformedProducts = products?.map(product => ({
      ...product,
      yobjet3d: product.yvarprod?.flatMap(variant => variant.yobjet3d || []) || []
    })) || []

    return NextResponse.json({ products: transformedProducts })
    
  } catch (error) {
    console.error('Error in GET /api/admin/approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/approvals - Bulk approve products
export async function PATCH(request: NextRequest) {
  try {
    // Check if current user is admin
    const { isAdmin, error, user } = await checkAdminRole(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { productIds, action } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      )
    }

    if (action !== 'approve') {
      return NextResponse.json(
        { error: 'Only approve action is supported' },
        { status: 400 }
      )
    }

    // Use admin client to update product statuses
    const adminSupabase = createAdminClient()
    const currentTime = new Date().toISOString()
    
    const results = []
    
    for (const productId of productIds) {
      const { data: updatedProduct, error: updateError } = await adminSupabase
        .schema('morpheus')
        .from('yprod')
        .update({
          yprodstatut: 'approved',
          sysdate: currentTime,
          sysaction: 'update',
          sysuser: user?.email || 'admin'
        })
        .eq('yprodid', productId)
        .select()
        .single()

      if (updateError) {
        console.error(`Error approving product ${productId}:`, updateError)
        results.push({ productId, success: false, error: updateError.message })
      } else {
        results.push({ productId, success: true, product: updatedProduct })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      message: `Bulk approval completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: productIds.length,
        successful: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    console.error('Error in PATCH /api/admin/approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/approvals - Bulk delete products
export async function DELETE(request: NextRequest) {
  try {
    // Check if current user is admin
    const { isAdmin, error } = await checkAdminRole(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productIdsParam = searchParams.get('productIds')
    
    if (!productIdsParam) {
      return NextResponse.json(
        { error: 'Product IDs are required' },
        { status: 400 }
      )
    }

    const productIds = productIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    
    if (productIds.length === 0) {
      return NextResponse.json(
        { error: 'Valid product IDs are required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()
    const results = []

    for (const productId of productIds) {
      try {
        // First, get all variants for this product
        const { data: variants } = await adminSupabase
          .schema('morpheus')
          .from('yvarprod')
          .select('yvarprodid')
          .eq('yprodidfk', productId)

        // Delete all 3D objects associated with these variants
        if (variants && variants.length > 0) {
          const variantIds = variants.map(v => v.yvarprodid)
          
          await adminSupabase
            .schema('morpheus')
            .from('yobjet3d')
            .delete()
            .in('yvarprodidfk', variantIds)
        }

        // Delete all variants for this product
        await adminSupabase
          .schema('morpheus')
          .from('yvarprod')
          .delete()
          .eq('yprodidfk', productId)

        // Finally delete the product
        const { error: productError } = await adminSupabase
          .schema('morpheus')
          .from('yprod')
          .delete()
          .eq('yprodid', productId)

        if (productError) {
          results.push({ productId, success: false, error: productError.message })
        } else {
          results.push({ productId, success: true })
        }
      } catch (err) {
        results.push({ productId, success: false, error: (err as Error).message })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      message: `Bulk delete completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: productIds.length,
        successful: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}