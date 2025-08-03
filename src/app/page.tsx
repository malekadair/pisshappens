'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClientSupabase } from "@/lib/supabase"
import { Comic } from "@/lib/database.types"
import ComicCard from "@/components/comics/ComicCard"

export default function Home() {
  const [recentComics, setRecentComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabase()

  useEffect(() => {
    const fetchRecentComics = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error: queryError } = await supabase
          .from('comics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)
        
        if (queryError) {
          console.error('Error fetching comics:', queryError)
          setError(`Database error: ${queryError.message}`)
          setRecentComics([])
        } else {
          setRecentComics(data || [])
          setError(null)
        }
      } catch (exception) {
        console.error('Exception while fetching comics:', exception)
        setError(`Connection error: ${exception instanceof Error ? exception.message : 'Unknown error'}`)
        setRecentComics([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentComics()
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">
          Welcome to the Restroom!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Choose your preferred viewing experience
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Link href="/browse?mode=urinal" className="group">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-blue-200 group-hover:border-blue-400">
            <div className="text-6xl mb-4">🚹</div>
            <h2 className="text-2xl font-bold text-blue-600 mb-3">Urinal Mode</h2>
            <p className="text-gray-600">
              Quick and easy - see the full comic at once
            </p>
            <div className="mt-4 text-blue-500 group-hover:text-blue-700">
              Quick View →
            </div>
          </div>
        </Link>

        <Link href="/browse?mode=stall" className="group">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-green-200 group-hover:border-green-400">
            <div className="text-6xl mb-4">🚪</div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">Stall Mode</h2>
            <p className="text-gray-600">
              Take your time - click through frame by frame
            </p>
            <div className="mt-4 text-green-500 group-hover:text-green-700">
              Frame by Frame →
            </div>
          </div>
        </Link>

        <Link href="/browse?mode=handicapped" className="group">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow border-2 border-purple-200 group-hover:border-purple-400">
            <div className="text-6xl mb-4">♿</div>
            <h2 className="text-2xl font-bold text-purple-600 mb-3">Accessible Mode</h2>
            <p className="text-gray-600">
              Sit back and relax - auto-play slideshow
            </p>
            <div className="mt-4 text-purple-500 group-hover:text-purple-700">
              Auto-Play →
            </div>
          </div>
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Fresh from the Bowl
        </h2>
        
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : recentComics.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🚽</div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">The bowl is empty!</h3>
            <p className="text-blue-600 mb-4">No comics have been uploaded yet. Check back soon for fresh content!</p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/browse" 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Browse All Comics
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {recentComics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
