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

// PUT /api/admin/users/role - Update user role
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
    const { email, role } = body

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate role values
    if (!['user', 'store_admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "user" or "store_admin"' },
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

    // Get current metadata
    const currentMetadata = targetUser.app_metadata || {}
    const currentRoles = currentMetadata.roles || ['user']
    
    // Update roles array
    let newRoles: string[]
    if (role === 'store_admin') {
      // Add store_admin role if not present, keep user role
      newRoles = currentRoles.includes('store_admin') 
        ? currentRoles 
        : [...currentRoles.filter(r => r !== 'store_admin'), 'store_admin']
    } else {
      // Remove store_admin role, keep only user role
      newRoles = ['user']
    }

    // Update user metadata
    const { data: updatedUser, error: updateError } = await adminSupabase.auth.admin.updateUserById(
      targetUser.id,
      {
        app_metadata: {
          ...currentMetadata,
          roles: newRoles
        }
      }
    )

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        roles: newRoles
      }
    })
    
  } catch (error) {
    console.error('Error in PUT /api/admin/users/role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}