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

// GET /api/admin/products/stats - Get product approval statistics
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

    // Use admin client to query product statistics from morpheus schema
    const adminSupabase = createAdminClient()
    
    const { data: products, error: productsError } = await adminSupabase
      .schema('morpheus')
      .from('yproduit')
      .select('ystatus')

    if (productsError) {
      console.error('Error fetching product statistics:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch product statistics' },
        { status: 500 }
      )
    }

    // Count products by status
    const stats = (products || []).reduce((acc: Record<string, number>, product) => {
      const status = product.ystatus || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Calculate totals and common statuses
    const total = products?.length || 0
    const pending = stats.not_approved || 0
    const approved = stats.approved || 0
    const rejected = 0 // No rejected status, only not_approved and approved

    const response = {
      total,
      pending,
      approved,
      rejected,
      not_approved: pending,
      ...stats
    }

    return NextResponse.json({ stats: response })
    
  } catch (error) {
    console.error('Error in GET /api/admin/products/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}