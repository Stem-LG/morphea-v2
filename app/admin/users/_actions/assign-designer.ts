"use server"

import { createAdminClient } from '@/lib/supabase-admin'
import { getIsAdmin } from '../_lib/is_admin'

interface DesignerData {
  // Designer info
  nom: string
  marque: string
  contactpersonne: string
  contactemail: string
  contacttelephone: string
  pays: string
  specialite: string
  
  // Colors (optional)
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

export async function assignDesigner(userId: string, data: DesignerData) {
  try {
    // Check if current user is admin
    const { isAdmin, error } = await getIsAdmin()
    
    if (!isAdmin) {
      return {
        success: false,
        error: error || 'Access denied. Admin role required.'
      }
    }

    // Use admin client for user management
    const adminSupabase = createAdminClient()
    
    // Get the user to check current roles
    const { data: { user }, error: getUserError } = await adminSupabase.auth.admin.getUserById(userId)
    
    if (getUserError || !user) {
      return {
        success: false,
        error: 'User not found'
      }
    }
    
    // Check if user already has store_admin role
    const currentRoles = user.app_metadata?.roles || []
    if (currentRoles.includes('store_admin')) {
      return {
        success: false,
        error: 'User is already a designer'
      }
    }
    
    // Add store_admin role to user
    const updatedRoles = [...currentRoles, 'store_admin']
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      {
        app_metadata: {
          ...user.app_metadata,
          roles: updatedRoles
        }
      }
    )
    
    if (updateError) {
      console.error('Error updating user roles:', updateError)
      return {
        success: false,
        error: 'Failed to update user roles'
      }
    }
    
    // Create ydesign record - use admin client for morpheus schema
    // Generate designer code based on timestamp
    const designerCode = Date.now().toString()
    const activiteDate = new Date().toISOString()
    
    const { error: insertError } = await adminSupabase
      .schema('morpheus')
      .from('ydesign')
      .insert({
        ydesigncode: designerCode,
        ydesignnom: data.nom,
        ydesignmarque: data.marque,
        ydesigncontactpersonne: data.contactpersonne,
        ydesigncontactemail: data.contactemail,
        ydesigncontacttelephone: data.contacttelephone,
        ydesignpays: data.pays,
        ydesignspecialite: data.specialite,
        ydesignactivitedate: activiteDate,
        ydesignmorpheusdate: activiteDate,
        yuseridfk: userId,
        // Colors
        ydesigncouleur1codehexa: data.couleur1?.hexa || null,
        ydesigncouleur1codervb: data.couleur1?.rvb || null,
        ydesigncouleur1dsg: data.couleur1?.dsg || null,
        ydesigncouleur2codehexa: data.couleur2?.hexa || null,
        ydesigncouleur2codervb: data.couleur2?.rvb || null,
        ydesigncouleur2dsg: data.couleur2?.dsg || null,
        ydesigncouleur3codehexa: data.couleur3?.hexa || null,
        ydesigncouleur3codervb: data.couleur3?.rvb || null,
        ydesigncouleur3dsg: data.couleur3?.dsg || null,
      })
    
    if (insertError) {
      console.error('Error creating designer record:', insertError)
      
      // Rollback role change if designer record creation fails
      await adminSupabase.auth.admin.updateUserById(
        userId,
        {
          app_metadata: {
            ...user.app_metadata,
            roles: currentRoles
          }
        }
      )
      
      return {
        success: false,
        error: 'Failed to create designer record'
      }
    }
    
    return {
      success: true,
      message: 'Designer role assigned successfully'
    }
    
  } catch (error) {
    console.error('Error in assignDesigner:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}