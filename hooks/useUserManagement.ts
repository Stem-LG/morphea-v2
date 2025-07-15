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

  const fetchUsers = async (): Promise<UserRole[]> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new Error(errorData.error || 'Failed to fetch users')
      }

      const successData = data as UsersListResponse
      return successData.users
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