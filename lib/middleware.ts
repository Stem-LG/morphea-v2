import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check coming soon mode
  const { data: comingSoonSetting } = await supabase
    .schema('morpheus')
    .from('settings')
    .select('value')
    .eq('key', 'coming_soon_date')
    .single()

  const comingSoonDate = comingSoonSetting?.value

  if (comingSoonDate) {
    const now = new Date()
    const targetDate = new Date(comingSoonDate)

    if (now > targetDate) {
      // Site is in coming soon mode
      const isLoginPage = request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname === '/login'
      const isAdminPage = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname === '/admin'
      const isComingSoonPage = request.nextUrl.pathname === '/comingsoon'
      const isAdmin = user?.user_metadata?.role === 'admin'

      if (!isLoginPage && !isAdminPage && !isComingSoonPage && !isAdmin) {
        // Redirect to coming soon page
        const url = request.nextUrl.clone()
        url.pathname = '/comingsoon'
        return NextResponse.redirect(url)
      }
    }
  }

  // Explicitly protect profile routes - ensure user is authenticated for any profile page
  if (user && user.is_anonymous && request.nextUrl.pathname.startsWith('/profile')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // General protection for other authenticated routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/shop') &&
    !request.nextUrl.pathname.startsWith('/profile') && // Already handled above
    !request.nextUrl.pathname.startsWith('/a-lorigine-de-morphea') &&
    !request.nextUrl.pathname.startsWith('/contact') &&
    !request.nextUrl.pathname.startsWith('/api/unsubscribe') &&
    !request.nextUrl.pathname.startsWith('/comingsoon') &&
    request.nextUrl.pathname !== '/' &&
    request.nextUrl.pathname !== '/main'
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
