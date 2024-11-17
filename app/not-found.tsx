// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="mb-4">The page you're looking for doesn't exist.</p>
        <Link 
          href="/" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}