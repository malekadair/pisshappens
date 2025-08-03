'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { Comic } from '@/lib/database.types'
import ComicCard from '@/components/comics/ComicCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

type ViewMode = 'urinal' | 'stall' | 'handicapped'

function BrowsePageContent() {
  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') as ViewMode) || 'urinal'
  const supabase = createClientSupabase()

  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true)
      setError(null)
      
      try {
        let query = supabase
          .from('comics')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
        }
        
        const { data, error: queryError } = await query
        
        if (queryError) {
          console.error('Error fetching comics:', queryError)
          setError(`Database error: ${queryError.message}`)
          setComics([])
        } else {
          setComics(data || [])
          setError(null)
        }
      } catch (exception) {
        console.error('Exception while fetching comics:', exception)
        setError(`Connection error: ${exception instanceof Error ? exception.message : 'Unknown error'}`)
        setComics([])
      } finally {
        setLoading(false)
      }
    }

    fetchComics()
  }, [searchTerm, mode])

  const modeConfig = {
    urinal: {
      title: 'Urinal Mode 🚹',
      description: 'Quick viewing - see the full comic at once',
      color: 'blue'
    },
    stall: {
      title: 'Stall Mode 🚪',
      description: 'Take your time - frame by frame viewing',
      color: 'green'
    },
    handicapped: {
      title: 'Accessible Mode ♿',
      description: 'Sit back and relax - auto-play slideshow',
      color: 'purple'
    }
  }

  const currentMode = modeConfig[mode]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-4xl font-bold text-${currentMode.color}-600 mb-2`}>
              {currentMode.title}
            </h1>
            <p className="text-gray-600">{currentMode.description}</p>
          </div>
          <Link 
            href="/"
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="flex space-x-4 mb-6">
          <Link 
            href="/browse?mode=urinal"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'urinal' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🚹 Urinal
          </Link>
          <Link 
            href="/browse?mode=stall"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'stall' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🚪 Stall
          </Link>
          <Link 
            href="/browse?mode=handicapped"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'handicapped' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ♿ Accessible
          </Link>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search comics by title or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading comics...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">Failed to load comics</h3>
          <p className="text-red-600 mb-4">{error}</p>
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
      ) : comics.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm ? 'No comics found' : 'No comics available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Check back later for new content!'}
          </p>
          {!searchTerm && (
            <Link 
              href="/" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Back to Home
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {comics.map((comic) => (
            <div key={comic.id}>
              <ComicCard comic={comic} />
              <div className="mt-2 text-center">
                <Link 
                  href={`/comic/${comic.id}?mode=${mode}`}
                  className={`inline-block px-3 py-1 text-sm rounded-lg font-medium text-white ${
                    mode === 'urinal' ? 'bg-blue-500 hover:bg-blue-600' :
                    mode === 'stall' ? 'bg-green-500 hover:bg-green-600' :
                    'bg-purple-500 hover:bg-purple-600'
                  } transition-colors`}
                >
                  View in {currentMode.title.split(' ')[0]} Mode
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <BrowsePageContent />
    </Suspense>
  )
}