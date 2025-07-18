import { createClient } from '@/lib/server'
import { createAdminClient } from '@/lib/supabase-admin'

export interface StoreAccessResult {
  hasAccess: boolean
  userStores: number[]
  error?: string
}

/**
 * Check if the current user has access to a specific store
 * @param storeId - The store ID to check access for
 * @returns Promise<StoreAccessResult>
 */
export async function checkStoreAccess(storeId: number): Promise<StoreAccessResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { hasAccess: false, userStores: [], error: 'Unauthorized' }
    }

    const userMetadata = user.app_metadata as { roles?: string[], assigned_stores?: number[] }
    const roles = userMetadata?.roles || []
    const assignedStores = userMetadata?.assigned_stores || []

    // Admin users have access to all stores
    if (roles.includes('admin')) {
      return { hasAccess: true, userStores: assignedStores }
    }

    // Store admin users only have access to their assigned stores
    if (roles.includes('store_admin')) {
      const hasAccess = assignedStores.includes(storeId)
      return { hasAccess, userStores: assignedStores }
    }

    // Regular users have no store access
    return { hasAccess: false, userStores: [] }

  } catch (error) {
    console.error('Error checking store access:', error)
    return { hasAccess: false, userStores: [], error: 'Internal server error' }
  }
}

/**
 * Get all stores that the current user has access to
 * @returns Promise<{ stores: any[], error?: string }>
 */
export async function getUserAccessibleStores(): Promise<{ stores: any[], error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { stores: [], error: 'Unauthorized' }
    }

    const userMetadata = user.app_metadata as { roles?: string[], assigned_stores?: number[] }
    const roles = userMetadata?.roles || []
    const assignedStores = userMetadata?.assigned_stores || []

    const adminSupabase = createAdminClient()

    // Admin users can access all stores
    if (roles.includes('admin')) {
      const { data: allStores, error: storesError } = await adminSupabase
        .schema('morpheus')
        .from('yboutique')
        .select('yboutiqueid, yboutiqueintitule, yboutiquecode, yboutiqueadressemall, ymallidfk')
        .order('yboutiqueintitule')

      if (storesError) {
        return { stores: [], error: 'Failed to fetch stores' }
      }

      return { stores: allStores || [] }
    }

    // Store admin users can only access their assigned stores
    if (roles.includes('store_admin') && assignedStores.length > 0) {
      const { data: userStores, error: storesError } = await adminSupabase
        .schema('morpheus')
        .from('yboutique')
        .select('yboutiqueid, yboutiqueintitule, yboutiquecode, yboutiqueadressemall, ymallidfk')
        .in('yboutiqueid', assignedStores)
        .order('yboutiqueintitule')

      if (storesError) {
        return { stores: [], error: 'Failed to fetch assigned stores' }
      }

      return { stores: userStores || [] }
    }

    // Regular users have no store access
    return { stores: [] }

  } catch (error) {
    console.error('Error getting user accessible stores:', error)
    return { stores: [], error: 'Internal server error' }
  }
}

/**
 * Middleware helper to validate store access in API routes
 * @param storeId - The store ID to validate
 * @returns Promise<{ authorized: boolean, error?: string }>
 */
export async function validateStoreAccess(storeId: number): Promise<{ authorized: boolean, error?: string }> {
  const result = await checkStoreAccess(storeId)
  
  if (result.error) {
    return { authorized: false, error: result.error }
  }

  if (!result.hasAccess) {
    return { authorized: false, error: 'Access denied to this store' }
  }

  return { authorized: true }
}

/**
 * Get user role and store access information
 * @returns Promise<{ role: string, storeAccess: StoreAccessResult }>
 */
export async function getUserRoleAndAccess(): Promise<{
  role: string
  assignedStores: number[]
  isAdmin: boolean
  isStoreAdmin: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        role: 'guest',
        assignedStores: [],
        isAdmin: false,
        isStoreAdmin: false,
        error: 'Unauthorized'
      }
    }

    const userMetadata = user.app_metadata as { roles?: string[], assigned_stores?: number[] }
    const roles = userMetadata?.roles || ['user']
    const assignedStores = userMetadata?.assigned_stores || []

    const isAdmin = roles.includes('admin')
    const isStoreAdmin = roles.includes('store_admin')
    const primaryRole = isAdmin ? 'admin' : isStoreAdmin ? 'store_admin' : 'user'

    return {
      role: primaryRole,
      assignedStores,
      isAdmin,
      isStoreAdmin
    }

  } catch (error) {
    console.error('Error getting user role and access:', error)
    return {
      role: 'guest',
      assignedStores: [],
      isAdmin: false,
      isStoreAdmin: false,
      error: 'Internal server error'
    }
  }
}