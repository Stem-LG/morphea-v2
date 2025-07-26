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
        yvarprod(
          *,
          yobjet3d(*)
        )
      `)
      .in('yprodstatut', ['not_approved', 'approved', 'needs_revision'])
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
    console.error('Error in GET /api/admin/products/approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/approvals - Delete a product and its associated data
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
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // First, get all variants for this product
    const { data: variants } = await adminSupabase
      .schema('morpheus')
      .from('yvarprod')
      .select('yvarprodid')
      .eq('yprodidfk', parseInt(productId))

    // Delete all 3D objects associated with these variants
    if (variants && variants.length > 0) {
      const variantIds = variants.map(v => v.yvarprodid)
      
      const { error: objectsError } = await adminSupabase
        .schema('morpheus')
        .from('yobjet3d')
        .delete()
        .in('yvarprodidfk', variantIds)

      if (objectsError) {
        console.error('Error deleting 3D objects:', objectsError)
        return NextResponse.json(
          { error: 'Failed to delete associated 3D objects' },
          { status: 500 }
        )
      }
    }

    // Delete all variants for this product
    const { error: variantsError } = await adminSupabase
      .schema('morpheus')
      .from('yvarprod')
      .delete()
      .eq('yprodidfk', parseInt(productId))

    if (variantsError) {
      console.error('Error deleting product variants:', variantsError)
      return NextResponse.json(
        { error: 'Failed to delete product variants' },
        { status: 500 }
      )
    }

    // Finally delete the product
    const { error: productError } = await adminSupabase
      .schema('morpheus')
      .from('yprod')
      .delete()
      .eq('yprodid', parseInt(productId))

    if (productError) {
      console.error('Error deleting product:', productError)
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Product and associated data deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/products/approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/products/approvals - Approve, reject, or mark for revision a product
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
    const { productId, action, approvalData, comments } = body

    if (!productId || !action) {
      return NextResponse.json(
        { error: 'Product ID and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject', 'needs_revision'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve", "reject", or "needs_revision"' },
        { status: 400 }
      )
    }

    // Use admin client to update product status
    const adminSupabase = createAdminClient()
    const currentTime = new Date().toISOString()
    
    if (action === 'approve') {
      if (!approvalData) {
        return NextResponse.json(
          { error: 'Approval data is required for approval' },
          { status: 400 }
        )
      }

      // Start a transaction to update product, category, and variants
      try {
        // 1. Update product status and category
        const { data: updatedProduct, error: updateError } = await adminSupabase
          .schema('morpheus')
          .from('yprod')
          .update({
            yprodstatut: 'approved',
            xcategprodidfk: approvalData.categoryId,
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

        // 2. Update variants with pricing and delivery information
        if (approvalData.variants && approvalData.variants.length > 0) {
          for (const variant of approvalData.variants) {
            const { error: variantError } = await adminSupabase
              .schema('morpheus')
              .from('yvarprod')
              .update({
                yvarprodprixcatalogue: variant.yvarprodprixcatalogue,
                yvarprodprixpromotion: variant.yvarprodprixpromotion,
                yvarprodpromotiondatedeb: variant.yvarprodpromotiondatedeb,
                yvarprodpromotiondatefin: variant.yvarprodpromotiondatefin,
                yvarprodnbrjourlivraison: variant.yvarprodnbrjourlivraison,
                sysdate: currentTime,
                sysaction: 'update',
                sysuser: user?.email || 'admin'
              })
              .eq('yvarprodid', variant.yvarprodid)

            if (variantError) {
              console.error('Error updating variant:', variantError)
              return NextResponse.json(
                { error: `Failed to update variant ${variant.yvarprodid}` },
                { status: 500 }
              )
            }
          }
        }

        return NextResponse.json({
          product: updatedProduct,
          message: `Product approved successfully with ${approvalData.variants?.length || 0} variants updated`
        })

      } catch (transactionError) {
        console.error('Transaction error:', transactionError)
        return NextResponse.json(
          { error: 'Failed to complete approval transaction' },
          { status: 500 }
        )
      }

    } else if (action === 'needs_revision') {
      // Mark product as needs revision
      const { data: updatedProduct, error: updateError } = await adminSupabase
        .schema('morpheus')
        .from('yprod')
        .update({
          yprodstatut: 'needs_revision',
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
        message: `Product marked as needs revision`
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