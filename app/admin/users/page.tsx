'use client'

import { useState, useEffect } from 'react'
import { UserRole, Store } from '@/lib/types/user'
import { useUserManagement } from '@/hooks/useUserManagement'

interface StoreAssignmentModalProps {
  user: UserRole | null
  stores: Store[]
  isOpen: boolean
  onClose: () => void
  onAssign: (email: string, storeIds: number[]) => Promise<void>
  loading: boolean
}

function StoreAssignmentModal({ user, stores, isOpen, onClose, onAssign, loading }: StoreAssignmentModalProps) {
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) {
      setSelectedStoreIds(user.assigned_stores || [])
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      await onAssign(user.email, selectedStoreIds)
      onClose()
    }
  }

  const toggleStore = (storeId: number) => {
    setSelectedStoreIds(prev =>
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    )
  }

  const selectAllStores = () => {
    setSelectedStoreIds(filteredStores.map(store => store.id))
  }

  const clearAllStores = () => {
    setSelectedStoreIds([])
  }

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">
          Assign Boutiques to {user.email}
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({selectedStoreIds.length} selected)
          </span>
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Search and bulk actions */}
          <div className="mb-4 space-y-2">
            <input
              type="text"
              placeholder="Search boutiques by name, code, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={selectAllStores}
                className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded"
              >
                Select All ({filteredStores.length})
              </button>
              <button
                type="button"
                onClick={clearAllStores}
                className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Store list */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 max-h-96">
            {filteredStores.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                {searchTerm ? 'No boutiques found matching your search.' : 'No boutiques available.'}
              </div>
            ) : (
              filteredStores.map((store) => (
                <label
                  key={store.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStoreIds.includes(store.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStoreIds.includes(store.id)}
                    onChange={() => toggleStore(store.id)}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">{store.name}</h4>
                      <span className="text-sm text-gray-500 font-mono">{store.code}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                    {store.mallId && (
                      <p className="text-xs text-gray-500 mt-1">Mall ID: {store.mallId}</p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedStoreIds.length} boutique{selectedStoreIds.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Assigning...' : `Assign ${selectedStoreIds.length} Boutique${selectedStoreIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

interface QuickAssignProps {
  users: UserRole[]
  stores: Store[]
  onAssign: (email: string, storeIds: number[]) => Promise<void>
  loading: boolean
}

function QuickAssignSection({ users, stores, onAssign, loading }: QuickAssignProps) {
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedStores, setSelectedStores] = useState<number[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const storeAdminUsers = users.filter(user => user.roles.includes('store_admin'))

  const handleQuickAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUser && selectedStores.length > 0) {
      await onAssign(selectedUser, selectedStores)
      setSelectedUser('')
      setSelectedStores([])
    }
  }

  const toggleStore = (storeId: number) => {
    setSelectedStores(prev =>
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h2 className="text-lg font-semibold text-gray-900">Quick Boutique Assignment</h2>
        <span className="text-gray-500">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {isExpanded && (
        <form onSubmit={handleQuickAssign} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Store Admin User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a store admin...</option>
                {storeAdminUsers.map((user) => (
                  <option key={user.id} value={user.email}>
                    {user.email} ({user.assigned_stores?.length || 0} boutiques assigned)
                  </option>
                ))}
              </select>
            </div>

            {/* Store selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Boutiques ({selectedStores.length} selected)
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                {stores.map((store) => (
                  <label key={store.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store.id)}
                      onChange={() => toggleStore(store.id)}
                      className="rounded text-blue-600"
                    />
                    <span className="truncate">
                      <strong>{store.name}</strong> ({store.code})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedUser || selectedStores.length === 0}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Assigning...' : `Quick Assign ${selectedStores.length} Boutique${selectedStores.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserRole[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null)
  const [showStoreModal, setShowStoreModal] = useState(false)

  const { 
    fetchUsers, 
    updateUserRole, 
    fetchStores, 
    assignStores, 
    loading, 
    error, 
    clearError 
  } = useUserManagement()

  // Fetch all users and stores
  const loadData = async () => {
    try {
      const [usersData, storesData] = await Promise.all([
        fetchUsers(),
        fetchStores()
      ])
      setUsers(usersData)
      setStores(storesData)
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  // Update user role
  const handleUpdateUserRole = async (email: string, newRole: 'user' | 'store_admin') => {
    try {
      setUpdating(email)
      await updateUserRole(email, newRole)
      await loadData() // Refresh data
    } catch (err) {
      console.error('Error updating user role:', err)
    } finally {
      setUpdating(null)
    }
  }

  // Handle store assignment
  const handleAssignStores = async (email: string, storeIds: number[]) => {
    try {
      await assignStores(email, storeIds)
      await loadData() // Refresh data
    } catch (err) {
      console.error('Error assigning stores:', err)
    }
  }

  // Open store assignment modal
  const openStoreModal = (user: UserRole) => {
    setSelectedUser(user)
    setShowStoreModal(true)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="text-center">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-900 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <QuickAssignSection
        users={users}
        stores={stores}
        onAssign={handleAssignStores}
        loading={loading}
      />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Stores
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : role === 'store_admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.store_details && user.store_details.length > 0 ? (
                    <div className="space-y-1">
                      {user.store_details.map((store) => (
                        <div key={store.id} className="text-xs">
                          <span className="font-medium">{store.name}</span> ({store.code})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No stores assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {!user.roles.includes('admin') && (
                    <div className="flex space-x-2">
                      {user.roles.includes('store_admin') ? (
                        <>
                          <button
                            onClick={() => handleUpdateUserRole(user.email, 'user')}
                            disabled={updating === user.email}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {updating === user.email ? 'Updating...' : 'Remove Store Admin'}
                          </button>
                          <button
                            onClick={() => openStoreModal(user)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Assign Stores
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpdateUserRole(user.email, 'store_admin')}
                          disabled={updating === user.email}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          {updating === user.email ? 'Updating...' : 'Make Store Admin'}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button
          onClick={loadData}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <StoreAssignmentModal
        user={selectedUser}
        stores={stores}
        isOpen={showStoreModal}
        onClose={() => {
          setShowStoreModal(false)
          setSelectedUser(null)
        }}
        onAssign={handleAssignStores}
        loading={loading}
      />
    </div>
  )
}