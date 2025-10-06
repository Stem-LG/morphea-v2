import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/lib/server'

// Helper function to check if user has admin role
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

// GET /api/admin/newsletter/export - Export newsletter subscribers to CSV
export async function GET(request: NextRequest) {
  try {
    // Check if current user is admin
    const { isAdmin, error } = await checkAdminRole(request)

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeUnsubscribed = searchParams.get('includeUnsubscribed') === 'true'

    // Use admin client to query newsletter data
    const adminSupabase = createAdminClient()

    let query = adminSupabase
      .schema('morpheus')
      .from('xnewsletter')
      .select(includeUnsubscribed ? 'email, subscribed, unsubscription_token' : 'email, unsubscription_token')
      .order('email', { ascending: true })

    // Filter by subscribed status if not including unsubscribed
    if (!includeUnsubscribed) {
      query = query.eq('subscribed', true)
    }

    const { data: subscribers, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching newsletter subscribers:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch newsletter subscribers' },
        { status: 500 }
      )
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No subscribers found' },
        { status: 404 }
      )
    }

    // Create CSV content
    const csvHeaders = includeUnsubscribed ? ['email', 'unsubscription_token', 'subscribed'] : ['email', 'unsubscription_token']
    const csvRows = subscribers.map((subscriber: any) => 
      includeUnsubscribed 
        ? [subscriber.email, subscriber.unsubscription_token, subscriber.subscribed ? '1' : '0']
        : [subscriber.email, subscriber.unsubscription_token]
    )

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Unexpected error in newsletter export:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}