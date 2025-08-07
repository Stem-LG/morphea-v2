"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { assignDesigner } from "../_actions/assign-designer"
import { toast } from "sonner"

interface AssignDesignerData {
  userId: string
  designerData: {
    nom: string
    marque: string
    contactpersonne: string
    contactemail: string
    contacttelephone: string
    pays: string
    specialite: string
    couleur1?: {
      hexa?: string
      rvb?: string
      dsg?: string
    }
    couleur2?: {
      hexa?: string
      rvb?: string
      dsg?: string
    }
    couleur3?: {
      hexa?: string
      rvb?: string
      dsg?: string
    }
  }
}

export function useAssignDesigner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assign-designer'],
    mutationFn: async ({ userId, designerData }: AssignDesignerData) => {
      const result = await assignDesigner(userId, designerData)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      toast.success("Designer role assigned successfully")
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign designer role")
    }
  })
}