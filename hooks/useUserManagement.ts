import { useState } from 'react'
import {
  UserRole,
  UpdateRoleRequest,
  UsersListResponse,
  UpdateRoleResponse,
  ErrorResponse,
  Store,
  StoresListResponse,
  AssignStoresRequest,
  AssignStoresResponse,
  UserStoresResponse
} from '@/lib/types/user'

export function useUserManagement() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  interface FetchUsersParams {
    page?: number
    limit?: number
    email?: string
    role?: string
  }

  interface PaginatedUsersResponse {
    users: UserRole[]
    total: number
    page: number
    limit: number
    totalPages: number
  }

  const fetchUsers = async (params: FetchUsersParams = {}): Promise<PaginatedUsersResponse> => {
    try {
      setLoading(true)
      setError(null)
      
      const searchParams = new URLSearchParams()
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.email) searchParams.append('email', params.email)
      if (params.role) searchParams.append('role', params.role)
      
      const url = `/api/admin/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.error || 'Failed to fetch users')
      }

      // Handle both old and new response formats for backward compatibility
      if (data.users && Array.isArray(data.users) && data.total !== undefined) {
        // New paginated response
        return data as PaginatedUsersResponse
      } else if (data.users && Array.isArray(data.users)) {
        // Old response format - convert to paginated format
        const users = data.users as UserRole[]
        return {
          users,
          total: users.length,
          page: 1,
          limit: users.length,
          totalPages: 1
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (email: string, role: 'user' | 'store_admin'): Promise<UpdateRoleResponse> => {
    try {
      setLoading(true)
      setError(null)
      
      const requestBody: UpdateRoleRequest = { email, role }
      
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.error || 'Failed to update user role')
      }

      const successData = data as UpdateRoleResponse
      return successData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchStores = async (): Promise<Store[]> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/stores')
      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.error || 'Failed to fetch stores')
      }

      const successData = data as StoresListResponse
      return successData.stores
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const assignStores = async (email: string, storeIds: number[]): Promise<AssignStoresResponse> => {
    try {
      setLoading(true)
      setError(null)
      
      const requestBody: AssignStoresRequest = { email, storeIds }
      
      const response = await fetch('/api/admin/users/stores', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.error || 'Failed to assign stores')
      }

      const successData = data as AssignStoresResponse
      return successData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getUserStores = async (email: string): Promise<UserStoresResponse> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/users/stores?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.error || 'Failed to fetch user stores')
      }

      const successData = data as UserStoresResponse
      return successData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    fetchUsers,
    updateUserRole,
    fetchStores,
    assignStores,
    getUserStores,
    loading,
    error,
    clearError
  }
}