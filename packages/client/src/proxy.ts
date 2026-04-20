import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define which paths require authentication
const protectedPaths = [
    '/chat',
    '/profile',
    '/settings'
]

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the current path requires authentication
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

    if (isProtectedPath) {
        // Since the JWT is in localStorage (or an HTTP-only root cookie `refreshToken`),
        // we primarily rely on the `refreshToken` cookie for edge presence checking.
        const hasSession = request.cookies.has('refreshToken')

        if (!hasSession) {
            // Redirect to home if trying to access a protected route without a session
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    // Only run middleware on requests to our actual application routes
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
