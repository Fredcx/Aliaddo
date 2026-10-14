import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isPublicAuthRoute } from '@/lib/auth-validation'

export async function updateSession(request: NextRequest) {
    // Public, fictional sandbox. It never reads or writes account data.
    if (request.nextUrl.pathname === '/demo') return NextResponse.next({ request });
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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isPublicRoute = isPublicAuthRoute(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith('/f/') || request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname === '/'

    if (
        !user &&
        !isPublicRoute
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = request.nextUrl.pathname === '/reset-password' ? '/forgot-password' : '/login'
        url.search = ''
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
        return response
    }

    // If user is logged in and tries to access /login or /
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/')) {
        const url = request.nextUrl.clone()
        url.pathname = '/home'
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
        return response
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
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
