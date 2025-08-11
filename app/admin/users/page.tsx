"use client"

import { useState } from "react"
import { useLanguage } from "@/hooks/useLanguage"
import { useUsers } from "./_hooks/use-users"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SuperSelect } from "@/components/super-select"
import { AssignDesignerDialog } from "./_components/assign-designer-dialog"
import { UserPlus, Shield, User } from "lucide-react"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"
import { Toaster } from "sonner"

interface UserRow {
  id: string
  email: string
  name?: string
  created_at: string
  last_sign_in_at: string | null
  roles: string[]
}

export default function UsersPage() {
  const { t } = useLanguage()
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // URL state management
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0))
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''))
  const [roleFilter, setRoleFilter] = useQueryState('role', parseAsString.withDefault(''))
  
  const { data, isLoading } = useUsers({
    page,
    limit: 8,
    search: search || undefined,
    role: roleFilter || undefined
  })

  const handleAssignDesigner = (user: UserRow) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "email",
      header: t("admin.users.email"),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.email}</div>
          {row.original.name && (
            <div className="text-sm text-muted-foreground">{row.original.name}</div>
          )}
        </div>
      )
    },
    {
      accessorKey: "roles",
      header: t("admin.users.roles"),
      cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap">
          {row.original.roles.map((role) => (
            <Badge 
              key={role} 
              variant={role === 'admin' ? 'destructive' : role === 'store_admin' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
              {role === 'store_admin' && <UserPlus className="w-3 h-3 mr-1" />}
              {role === 'user' && <User className="w-3 h-3 mr-1" />}
              {role === 'store_admin' ? t("admin.users.designer") : role === 'admin' ? t("admin.users.admin") : t("admin.users.user")}
            </Badge>
          ))}
        </div>
      )
    },
    {
      accessorKey: "created_at",
      header: t("admin.users.createdAt"),
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      accessorKey: "last_sign_in_at",
      header: t("admin.users.lastSignIn"),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.last_sign_in_at 
            ? new Date(row.original.last_sign_in_at).toLocaleDateString()
            : t("admin.users.never")
          }
        </div>
      )
    },
    {
      id: "actions",
      header: t("admin.users.actions"),
      cell: ({ row }) => {
        const hasOnlyUserRole = row.original.roles.length === 1 && row.original.roles[0] === 'user'
        
        return (
          <div className="flex gap-2">
            {hasOnlyUserRole && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAssignDesigner(row.original)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                {t("admin.users.makeDesigner")}
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  const roleOptions = [
    { value: '', label: t("admin.users.allRoles") },
    { value: 'user', label: t("admin.users.user") },
    { value: 'store_admin', label: t("admin.users.designer") },
    { value: 'admin', label: t("admin.users.admin") }
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("admin.users.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("admin.users.subtitle")}
        </p>
      </div>

      <DataTable<UserRow>
        columns={columns}
        data={data?.users}
        isLoading={isLoading}
        globalFilter={search}
        onGlobalFilterChange={(value) => setSearch(value)}
        filters={
          <SuperSelect
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as string)}
            options={roleOptions}
            placeholder={t("admin.users.filterByRole")}
            className="w-48"
          />
        }
        pagination={
          data ? {
            total: data.total,
            perPage: data.limit,
            pages: data.totalPages,
            currentPage: page + 1 ,
            onPageChange: setPage,
            maxVisiblePages: 5
          } : undefined
        }
      />

      <AssignDesignerDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      
      <Toaster position="top-right" />
    </div>
  )
}