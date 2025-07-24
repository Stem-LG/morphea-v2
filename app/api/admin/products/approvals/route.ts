import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/server'

// Helper function to check if user has admin role
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// GET /api/admin/products/approvals - Get pending products for approval
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
        yobjet3d(*)
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

    return NextResponse.json({ products: products || [] })
    
  } catch (error) {
    console.error('Error in GET /api/admin/products/approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/products/approvals - Approve or reject a product
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
    const { productId, action } = body

    if (!productId || !action) {
      return NextResponse.json(
        { error: 'Product ID and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Use admin client to update product status
    const adminSupabase = createAdminClient()
    
    if (action === 'approve') {
      // Approve the product
      const currentTime = new Date().toISOString()
      
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
        console.error('Error updating product status:', updateError)
        return NextResponse.json(
          { error: 'Failed to update product status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        product: updatedProduct,
        message: `Product approved successfully`
      })
    } else {
      // For reject, we could either delete the product or keep it as not_approved
      // Since there's no rejected status, let's keep it as not_approved but add a note
      return NextResponse.json({
        message: `Product remains as not approved. Consider deleting if needed.`
      })
    }

    
  } catch (error) {
    console.error('Error in PATCH /api/admin/products/approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}