'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { Comic } from '@/lib/database.types'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

type ViewMode = 'urinal' | 'stall' | 'handicapped'

function ComicPageContent() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const [comic, setComic] = useState<Comic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFrame, setCurrentFrame] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const { user } = useAuth()
  
  const mode = (searchParams.get('mode') as ViewMode) || 'urinal'
  const supabase = createClientSupabase()

  useEffect(() => {
    const fetchComic = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error: queryError } = await supabase
          .from('comics')
          .select('*')
          .eq('id', id)
          .single()
        
        if (queryError) {
          console.error('Error fetching comic:', queryError)
          setError(`Failed to load comic: ${queryError.message}`)
          setComic(null)
        } else if (!data) {
          setError('Comic not found')
          setComic(null)
        } else {
          setComic(data)
          setError(null)
        }
      } catch (exception) {
        console.error('Exception while fetching comic:', exception)
        setError(`Connection error: ${exception instanceof Error ? exception.message : 'Unknown error'}`)
        setComic(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchComic()
    }
  }, [id, mode])

  useEffect(() => {
    const checkFavorite = async () => {
      if (user && comic) {
        const { data } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('comic_id', comic.id)
          .single()
        
        setIsFavorited(!!data)
      }
    }

    checkFavorite()
  }, [user, comic])

  useEffect(() => {
    if (mode === 'handicapped' && comic) {
      setIsPlaying(true)
      const interval = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= comic.frame_count) {
            return 1
          }
          return prev + 1
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [mode, comic])

  const toggleFavorite = async () => {
    if (!user || !comic) return

    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('comic_id', comic.id)
      setIsFavorited(false)
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, comic_id: comic.id })
      setIsFavorited(true)
    }
  }

  const nextFrame = () => {
    if (comic && currentFrame < comic.frame_count) {
      setCurrentFrame(prev => prev + 1)
    }
  }

  const prevFrame = () => {
    if (currentFrame > 1) {
      setCurrentFrame(prev => prev - 1)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Failed to load comic</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
            <Link 
              href="/" 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!comic) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Comic not found</h1>
          <p className="text-blue-600 mb-6">The comic you're looking for doesn't exist or has been removed.</p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/browse" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Browse Comics
            </Link>
            <Link 
              href="/" 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{comic.title}</h1>
          {user && (
            <button
              onClick={toggleFavorite}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isFavorited
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isFavorited ? '♥ Favorited' : '♡ Add to Favorites'}
            </button>
          )}
        </div>
        
        <div className="flex space-x-4 mb-4">
          <Link 
            href={`/comic/${comic.id}?mode=urinal`}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'urinal' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🚹 Urinal Mode
          </Link>
          <Link 
            href={`/comic/${comic.id}?mode=stall`}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'stall' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🚪 Stall Mode
          </Link>
          <Link 
            href={`/comic/${comic.id}?mode=handicapped`}
            className={`px-4 py-2 rounded-lg font-medium ${
              mode === 'handicapped' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ♿ Accessible Mode
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {mode === 'urinal' && (
          <div className="text-center">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative mb-4">
              {comic.image_url ? (
                <Image
                  src={comic.image_url}
                  alt={comic.title}
                  fill
                  className="object-contain"
                  onError={(e) => console.error('Failed to load comic image:', comic.image_url)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🎭</div>
                    <p className="text-gray-600">No image available</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-gray-600">Viewing full comic in urinal mode</p>
          </div>
        )}

        {mode === 'stall' && (
          <div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative mb-4">
              {comic.image_url ? (
                <Image
                  src={comic.image_url}
                  alt={`${comic.title} - Frame ${currentFrame}`}
                  fill
                  className="object-contain"
                  onError={(e) => console.error('Failed to load comic image:', comic.image_url)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🎭</div>
                    <p className="text-gray-600">Frame {currentFrame} of {comic.frame_count}</p>
                    <p className="text-sm text-gray-500 mt-2">No image available</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={prevFrame}
                disabled={currentFrame === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 bg-gray-100 rounded-lg">
                {currentFrame} / {comic.frame_count}
              </span>
              <button
                onClick={nextFrame}
                disabled={currentFrame === comic.frame_count}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {mode === 'handicapped' && (
          <div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative mb-4">
              {comic.image_url ? (
                <Image
                  src={comic.image_url}
                  alt={`${comic.title} - Auto-playing Frame ${currentFrame}`}
                  fill
                  className="object-contain"
                  onError={(e) => console.error('Failed to load comic image:', comic.image_url)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🎭</div>
                    <p className="text-gray-600">Auto-playing Frame {currentFrame} of {comic.frame_count}</p>
                    <p className="text-sm text-gray-500 mt-2">No image available</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <span className="px-4 py-2 bg-gray-100 rounded-lg">
                {currentFrame} / {comic.frame_count}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <Link href="/" className="text-blue-500 hover:text-blue-600 font-medium">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function ComicPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <ComicPageContent />
    </Suspense>
  )
}