import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { redirect } from 'next/navigation'

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')

  if (!token) {
    redirect('/')
  }

  try {
    verify(token.value, process.env.JWT_SECRET || 'fallback-secret')
  } catch (error) {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      
      <main className="">
        {children}
      </main>
    </div>
  )
}