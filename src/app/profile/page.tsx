'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClientSupabase } from '@/lib/supabase'
import { Comic } from '@/lib/database.types'
import Link from 'next/link'

export default function ProfilePage() {
  const [favoriteComics, setFavoriteComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientSupabase()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return
      
      // Get favorite comic IDs first
      const { data: favoriteData } = await supabase
        .from('favorites')
        .select('comic_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (!favoriteData || favoriteData.length === 0) {
        setLoading(false)
        return
      }
      
      // Then get the actual comics
      const comicIds = favoriteData.map(fav => fav.comic_id)
      const { data: comicsData } = await supabase
        .from('comics')
        .select('*')
        .in('id', comicIds)
      
      setFavoriteComics(comicsData || [])
      setLoading(false)
    }

    if (user) {
      fetchFavorites()
    }
  }, [user, supabase])

  const removeFavorite = async (comicId: string) => {
    if (!user) return
    
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('comic_id', comicId)
    
    setFavoriteComics(prev => prev.filter(comic => comic.id !== comicId))
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in</h1>
        <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
        <Link 
          href="/login" 
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Welcome back!</h2>
              <p className="text-gray-600">{user.email}</p>
              {dbUser?.role === 'admin' && (
                <span className="inline-block bg-red-100 text-red-800 text-sm px-2 py-1 rounded mt-2">
                  Admin
                </span>
              )}
            </div>
            {dbUser?.role === 'admin' && (
              <Link 
                href="/admin/upload"
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium"
              >
                Upload Comic
              </Link>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Your Favorited Comics ({favoriteComics.length})
        </h2>
        
        {favoriteComics.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">😭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No favorites yet!</h3>
            <p className="text-gray-600 mb-6">
              Start exploring comics and add some to your favorites.
            </p>
            <Link 
              href="/"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium inline-block"
            >
              Browse Comics
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {favoriteComics.map((comic) => (
              <div key={comic.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">🎭</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    {comic.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {comic.frame_count} frames
                  </p>
                  
                  {comic.tags && comic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {comic.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Link 
                      href={`/comic/${comic.id}`}
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      View Comic →
                    </Link>
                    <button
                      onClick={() => removeFavorite(comic.id)}
                      className="text-red-500 hover:text-red-600 font-medium text-sm"
                    >
                      Remove ♥
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}