'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Navigation() {
  const { user, dbUser, signOut, loading } = useAuth()

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800">
            💩 PissHappens
          </Link>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Profile
                </Link>
                {dbUser?.role === 'admin' && (
                  <Link 
                    href="/admin/upload" 
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button 
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}