// middleware.ts
import { NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  // If no token exists, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    // Verify the token
    verify(token, process.env.JWT_SECRET || 'fallback-secret')
    return NextResponse.next()
  } catch (error) {
    // Token is invalid or expired
    const response = NextResponse.redirect(new URL('/', request.url))
    // Clear the invalid cookie
    response.cookies.delete('auth_token')
    return response
  }
}

// Update the matcher to catch ALL variations of the journal path
export const config = {
  matcher: [
    // Match all paths starting with /journal
    '/journal',
    '/journal/:path*',
    // Add common misspellings
    '/jornal',
    '/jornal/:path*'
  ]
}