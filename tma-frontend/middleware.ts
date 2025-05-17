import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that should be accessible without authentication
const publicPaths = ['/login', '/api/auth/login', '/api/users']

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Allow public paths
    if (publicPaths.includes(pathname)) {
        return NextResponse.next()
    }

    // Redirect to login if no token is present
    if (!token) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - register page
         */
        '/((?!_next/static|_next/image|favicon.ico|public|register).*)',
    ],
} 