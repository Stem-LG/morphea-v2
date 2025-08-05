import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getUsersAction } from "../_actions/get-users"

interface FetchUsersParams {
  page?: number
  limit?: number
  role?: string
  search?: string
}

export function useUsers(params: FetchUsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsersAction(params),
    placeholderData: keepPreviousData
  })
}