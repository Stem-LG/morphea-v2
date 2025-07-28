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

// PUT /api/admin/users/stores - Assign stores to a store_admin user
export async function PUT(request: NextRequest) {
  try {
    // Check if current user is admin
    const { isAdmin, error } = await checkAdminRole(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, storeIds } = body

    // Validate input
    if (!email || !Array.isArray(storeIds)) {
      return NextResponse.json(
        { error: 'Email and storeIds array are required' },
        { status: 400 }
      )
    }

    // Validate store IDs are numbers
    const validStoreIds = storeIds.filter(id => typeof id === 'number' && id > 0)
    if (validStoreIds.length !== storeIds.length) {
      return NextResponse.json(
        { error: 'All store IDs must be valid positive numbers' },
        { status: 400 }
      )
    }

    // Use admin client to find and update user
    const adminSupabase = createAdminClient()
    
    // First, find the user by email
    const { data: users, error: listError } = await adminSupabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to find user' },
        { status: 500 }
      )
    }

    const targetUser = users.users.find((user: any) => user.email === email)
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get current metadata and roles
    const currentMetadata = targetUser.app_metadata || {}
    const currentRoles = currentMetadata.roles || ['user']

    // Verify that all store IDs exist in the database
    if (validStoreIds.length > 0) {
      const { data: existingStores, error: storeCheckError } = await adminSupabase
        .schema('morpheus')
        .from('yboutique')
        .select('yboutiqueid')
        .in('yboutiqueid', validStoreIds)

      if (storeCheckError) {
        console.error('Error checking stores:', storeCheckError)
        return NextResponse.json(
          { error: 'Failed to validate store IDs' },
          { status: 500 }
        )
      }

      const existingStoreIds = existingStores.map((store: any) => store.yboutiqueid)
      const invalidStoreIds = validStoreIds.filter(id => !existingStoreIds.includes(id))
      
      if (invalidStoreIds.length > 0) {
        return NextResponse.json(
          { error: `Invalid store IDs: ${invalidStoreIds.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Determine new roles based on store assignments
    let newRoles = [...currentRoles]
    
    if (validStoreIds.length > 0) {
      // User has stores assigned, ensure they have store_admin role
      if (!newRoles.includes('store_admin')) {
        newRoles.push('store_admin')
      }
    } else {
      // User has no stores assigned, remove store_admin role if present
      newRoles = newRoles.filter(role => role !== 'store_admin')
      // Ensure user role is present
      if (!newRoles.includes('user')) {
        newRoles.push('user')
      }
    }

    // Update user metadata with assigned stores and updated roles
    const { data: updatedUser, error: updateError } = await adminSupabase.auth.admin.updateUserById(
      targetUser.id,
      {
        app_metadata: {
          ...currentMetadata,
          assigned_stores: validStoreIds,
          roles: newRoles
        }
      }
    )

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign stores to user' },
        { status: 500 }
      )
    }

    // Get store details for response
    let assignedStoreDetails = []
    if (validStoreIds.length > 0) {
      const { data: storeDetails } = await adminSupabase
        .schema('morpheus')
        .from('yboutique')
        .select('yboutiqueid, yboutiqueintitule, yboutiquecode')
        .in('yboutiqueid', validStoreIds)

      assignedStoreDetails = storeDetails?.map((store: any) => ({
        id: store.yboutiqueid,
        name: store.yboutiqueintitule,
        code: store.yboutiquecode
      })) || []
    }

    return NextResponse.json({
      message: 'Stores assigned successfully',
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        roles: newRoles,
        assigned_stores: validStoreIds,
        store_details: assignedStoreDetails
      }
    })
    
  } catch (error) {
    console.error('Error in PUT /api/admin/users/stores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/admin/users/stores?email=user@example.com - Get user's assigned stores
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

    // Get email from query parameters
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Use admin client to find user
    const adminSupabase = createAdminClient()
    
    const { data: users, error: listError } = await adminSupabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to find user' },
        { status: 500 }
      )
    }

    const targetUser = users.users.find((user: any) => user.email === email)
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userMetadata = targetUser.app_metadata || {}
    const assignedStoreIds = userMetadata.assigned_stores || []

    // Get store details if user has assigned stores
    let storeDetails = []
    if (assignedStoreIds.length > 0) {
      const { data: stores, error: storesError } = await adminSupabase
        .schema('morpheus')
        .from('yboutique')
        .select('yboutiqueid, yboutiqueintitule, yboutiquecode, yboutiqueadressemall')
        .in('yboutiqueid', assignedStoreIds)

      if (storesError) {
        console.error('Error fetching store details:', storesError)
        return NextResponse.json(
          { error: 'Failed to fetch store details' },
          { status: 500 }
        )
      }

      storeDetails = stores.map((store: any) => ({
        id: store.yboutiqueid,
        name: store.yboutiqueintitule,
        code: store.yboutiquecode,
        address: store.yboutiqueadressemall
      }))
    }

    return NextResponse.json({
      user: {
        id: targetUser.id,
        email: targetUser.email,
        assigned_stores: assignedStoreIds,
        store_details: storeDetails
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/admin/users/stores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}