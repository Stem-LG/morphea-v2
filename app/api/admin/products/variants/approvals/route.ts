import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/server'

// Helper function to check if user has admin role
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkAdminRole(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { isAdmin: false, error: 'Unauthorized' }
  }

  // Check if user has admin role in app_metadata
  const userMetadata = user.app_metadata as { roles?: string[] }
  const isAdmin = userMetadata?.roles?.includes('admin') || false

  return { isAdmin, error: null, user }
}

// PATCH /api/admin/products/variants/approvals - Approve, reject, or mark for revision a variant
export async function PATCH(request: NextRequest) {
  try {
    // Check if current user is admin
    const { isAdmin, error, user } = await checkAdminRole(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { variantId, action, approvalData, variants } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject', 'needs_revision', 'bulk_approve'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve", "reject", "needs_revision", or "bulk_approve"' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()
    const currentTime = new Date().toISOString()
    
    if (action === 'bulk_approve') {
      if (!variants || !Array.isArray(variants)) {
        return NextResponse.json(
          { error: 'Variants array is required for bulk approval' },
          { status: 400 }
        )
      }

      const results = []
      
      for (const variant of variants) {
        const { variantId: vId, approvalData: vApprovalData } = variant
        
        try {
          const { data: updatedVariant, error: updateError } = await adminSupabase
            .schema('morpheus')
            .from('yvarprod')
            .update({
              yvarprodstatut: 'approved',
              yvarprodprixcatalogue: vApprovalData.yvarprodprixcatalogue,
              yvarprodprixpromotion: vApprovalData.yvarprodprixpromotion,
              yvarprodpromotiondatedeb: vApprovalData.yvarprodpromotiondatedeb,
              yvarprodpromotiondatefin: vApprovalData.yvarprodpromotiondatefin,
              yvarprodnbrjourlivraison: vApprovalData.yvarprodnbrjourlivraison,
              xdeviseidfk: vApprovalData.currencyId,
              sysdate: currentTime,
              sysaction: 'update',
              sysuser: user?.email || 'admin'
            })
            .eq('yvarprodid', vId)
            .select()
            .single()

          if (updateError) {
            console.error(`Error updating variant ${vId}:`, updateError)
            results.push({ variantId: vId, success: false, error: updateError.message })
          } else {
            results.push({ variantId: vId, success: true, variant: updatedVariant })
          }
        } catch (error) {
          console.error(`Error processing variant ${vId}:`, error)
          results.push({ variantId: vId, success: false, error: 'Processing error' })
        }
      }

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      return NextResponse.json({
        message: `Bulk approval completed: ${successCount} successful, ${failCount} failed`,
        results,
        successCount,
        failCount
      })
    }
    
    if (action === 'approve') {
      if (!variantId) {
        return NextResponse.json(
          { error: 'Variant ID is required' },
          { status: 400 }
        )
      }

      if (!approvalData) {
        return NextResponse.json(
          { error: 'Approval data is required for approval' },
          { status: 400 }
        )
      }

      const { data: updatedVariant, error: updateError } = await adminSupabase
        .schema('morpheus')
        .from('yvarprod')
        .update({
          yvarprodstatut: 'approved',
          yvarprodprixcatalogue: approvalData.yvarprodprixcatalogue,
          yvarprodprixpromotion: approvalData.yvarprodprixpromotion,
          yvarprodpromotiondatedeb: approvalData.yvarprodpromotiondatedeb,
          yvarprodpromotiondatefin: approvalData.yvarprodpromotiondatefin,
          yvarprodnbrjourlivraison: approvalData.yvarprodnbrjourlivraison,
          xdeviseidfk: approvalData.currencyId,
          sysdate: currentTime,
          sysaction: 'update',
          sysuser: user?.email || 'admin'
        })
        .eq('yvarprodid', variantId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating variant status:', updateError)
        return NextResponse.json(
          { error: 'Failed to approve variant' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        variant: updatedVariant,
        message: 'Variant approved successfully'
      })

    } else if (action === 'needs_revision') {
      if (!variantId) {
        return NextResponse.json(
          { error: 'Variant ID is required' },
          { status: 400 }
        )
      }

      const { data: updatedVariant, error: updateError } = await adminSupabase
        .schema('morpheus')
        .from('yvarprod')
        .update({
          yvarprodstatut: 'needs_revision',
          sysdate: currentTime,
          sysaction: 'update',
          sysuser: user?.email || 'admin'
        })
        .eq('yvarprodid', variantId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating variant status:', updateError)
        return NextResponse.json(
          { error: 'Failed to mark variant as needs revision' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        variant: updatedVariant,
        message: 'Variant marked as needs revision'
      })

    } else if (action === 'reject') {
      if (!variantId) {
        return NextResponse.json(
          { error: 'Variant ID is required' },
          { status: 400 }
        )
      }

      const { data: updatedVariant, error: updateError } = await adminSupabase
        .schema('morpheus')
        .from('yvarprod')
        .update({
          yvarprodstatut: 'rejected',
          sysdate: currentTime,
          sysaction: 'update',
          sysuser: user?.email || 'admin'
        })
        .eq('yvarprodid', variantId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating variant status:', updateError)
        return NextResponse.json(
          { error: 'Failed to reject variant' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        variant: updatedVariant,
        message: 'Variant rejected successfully'
      })
    }

  } catch (error) {
    console.error('Error in PATCH /api/admin/products/variants/approvals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
