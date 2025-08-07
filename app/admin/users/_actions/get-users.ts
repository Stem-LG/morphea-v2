"use server"
import { createAdminClient } from '@/lib/supabase-admin'
import { User } from '@supabase/supabase-js'
import { getIsAdmin } from '../_lib/is_admin'


interface GetUsersParams {
  page?: number
  limit?: number
  role?: string
  search?: string
}

// List users with pagination and filtering
export async function getUsersAction({
  page = 0,
  limit = 10,
  role,
  search
}: GetUsersParams) {
  try {
    // Check if current user is admin
    const { isAdmin, error } = await getIsAdmin()

    if (!isAdmin) {
      return {
        error: error || 'Access denied. Admin role required.',
        status: 403
      }
    }

    // Use admin client to list all users
    const adminSupabase = createAdminClient()

    const { data, error: listError } = await adminSupabase.auth.admin.listUsers({
      page: 1,
      perPage: 10000000000
    })

    if (listError) {
      console.error('Error listing users:', listError)
      return {
        error: 'Failed to fetch users',
        status: 500
      }
    }

    // Transform users and apply filtering
    let filteredUsers = data.users.filter((user) => {
      if (user && !(user as User).is_anonymous) {
        return true
      }
      return false
    }).map((user) => {
      const userMetadata = user.app_metadata || {}
      const userRawMetadata = user.user_metadata || {}
      return {
        id: user.id,
        email: user.email,
        name: userRawMetadata.full_name || userRawMetadata.name || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        roles: userMetadata.roles || ['user'],
      }
    })

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(user =>
        user.email?.toLowerCase().includes(searchLower) ||
        user.name?.toLowerCase().includes(searchLower)
      )
    }

    // Apply role filter
    if (role) {
      filteredUsers = filteredUsers.filter(user =>
        user.roles.includes(role)
      )
    }

    // Calculate pagination (0-based)
    const total = filteredUsers.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = page * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)


    return {
      users: paginatedUsers,
      total,
      totalPages,
      page,
      limit
    }

  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}