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

// GET /api/admin/stores - List all available stores
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

    // Use admin client to query stores from morpheus schema
    const adminSupabase = createAdminClient()
    
    const { data: stores, error: storesError } = await adminSupabase
      .schema('morpheus')
      .from('yboutique')
      .select('yboutiqueid, yboutiqueintitule, yboutiquecode, yboutiqueadressemall, ymallidfk')
      .order('yboutiqueintitule')

    if (storesError) {
      console.error('Error fetching stores:', storesError)
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      )
    }

    // Format store data for response
    const formattedStores = stores.map((store: any) => ({
      id: store.yboutiqueid,
      name: store.yboutiqueintitule,
      code: store.yboutiquecode,
      address: store.yboutiqueadressemall,
      mallId: store.ymallidfk
    }))

    return NextResponse.json({ stores: formattedStores })
    
  } catch (error) {
    console.error('Error in GET /api/admin/stores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}