import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const correctPassword = process.env.JOURNAL_PASSWORD

    if (password === correctPassword) {
      // Create a session token
      const token = sign(
        { authenticated: true },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '4h' }
      )

      // Create response with cookie
      const response = NextResponse.json({ success: true })
      
      // Set HTTP-only cookie
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 4 // 4 hours in seconds
      })

      return response
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
