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

  // Check if user has admin role in raw_app_meta_data
  const userMetadata = user.app_metadata as { roles?: string[] }
  const isAdmin = userMetadata?.roles?.includes('admin') || false

  return { isAdmin, error: null, user }
}

// GET /api/admin/users - List all users
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

    // Use admin client to list all users
    const adminSupabase = createAdminClient()
    
    const { data, error: listError } = await adminSupabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get all users with their assigned stores
    const usersWithStores = await Promise.all(
      data.users.map(async (user) => {
        const userMetadata = user.app_metadata || {}
        const assignedStoreIds = userMetadata.assigned_stores || []
        
        let storeDetails = []
        if (assignedStoreIds.length > 0) {
          const { data: stores } = await adminSupabase
            .schema('morpheus')
            .from('yboutique')
            .select('yboutiqueid, yboutiqueintitule, yboutiquecode, yboutiqueadressemall')
            .in('yboutiqueid', assignedStoreIds)

          storeDetails = stores?.map((store: any) => ({
            id: store.yboutiqueid,
            name: store.yboutiqueintitule,
            code: store.yboutiquecode,
            address: store.yboutiqueadressemall
          })) || []
        }

        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          roles: userMetadata.roles || ['user'],
          provider: userMetadata.provider || 'email',
          providers: userMetadata.providers || ['email'],
          assigned_stores: assignedStoreIds,
          store_details: storeDetails
        }
      })
    )

    return NextResponse.json({ users: usersWithStores })
    
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}