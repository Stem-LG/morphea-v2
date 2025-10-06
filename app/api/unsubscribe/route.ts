import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

// GET /api/unsubscribe?token=... - Unsubscribe from newsletter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find and update the newsletter subscription
    const { data, error } = await supabase
      .schema('morpheus')
      .from('xnewsletter')
      .update({ subscribed: false })
      .eq('unsubscription_token', token)
      .select('email')

    if (error) {
      console.error('Error unsubscribing from newsletter:', error)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // Return success page or redirect
    return new Response(
      `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Désabonnement</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Vous avez été désabonné</h1>
    <p>Vous ne recevrez plus nos emails de newsletter.</p>
    <p>Si vous changez d'avis, vous pouvez toujours vous réabonner sur <a href="/#footer" style="color: #007bff; text-decoration: underline;">notre site</a>.</p>
  </div>
</body>
</html>
      `,
      {
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
        },
      }
    )
  } catch (error) {
    console.error('Unexpected error in unsubscribe:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}