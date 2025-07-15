export interface Store {
  id: number
  name: string
  code: string
  address: string
  mallId?: number
}

export interface UserRole {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  roles: string[]
  provider: string
  providers: string[]
  assigned_stores?: number[]
  store_details?: Store[]
}

export interface UpdateRoleRequest {
  email: string
  role: 'user' | 'store_admin'
}

export interface UpdateRoleResponse {
  message: string
  user: {
    id: string
    email: string
    roles: string[]
  }
}

export interface UsersListResponse {
  users: UserRole[]
}

export interface AssignStoresRequest {
  email: string
  storeIds: number[]
}

export interface AssignStoresResponse {
  message: string
  user: {
    id: string
    email: string
    roles: string[]
    assigned_stores: number[]
    store_details: Store[]
  }
}

export interface UserStoresResponse {
  user: {
    id: string
    email: string
    assigned_stores: number[]
    store_details: Store[]
  }
}

export interface StoresListResponse {
  stores: Store[]
}

export interface ErrorResponse {
  error: string
}