import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Comic } from '@/lib/database.types'
import FavoriteButton from './FavoriteButton'
import { useAuth } from '@/hooks/useAuth'

interface ComicCardProps {
  comic: Comic
  showFavoriteButton?: boolean
  onRemoveFavorite?: (comicId: string) => void
}

export default function ComicCard({ 
  comic, 
  showFavoriteButton = true, 
  onRemoveFavorite 
}: ComicCardProps) {
  const { user } = useAuth()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = (error: any) => {
    console.error(`Failed to load image for comic "${comic.title}":`, comic.image_url)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <Link href={`/comic/${comic.id}`}>
        <div className="aspect-video bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative">
          {comic.image_url && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <Image
                src={comic.image_url} 
                alt={comic.title}
                fill
                className="object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </>
          ) : (
            <div className="text-center">
              <span className="text-4xl block mb-2">🎭</span>
              {imageError && (
                <p className="text-xs text-gray-500">Image not available</p>
              )}
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/comic/${comic.id}`}>
            <h3 className="font-bold text-lg text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
              {comic.title}
            </h3>
          </Link>
          {user && showFavoriteButton && (
            <FavoriteButton 
              comicId={comic.id} 
              onRemoveFavorite={onRemoveFavorite}
            />
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-3">
          {comic.frame_count} frame{comic.frame_count !== 1 ? 's' : ''}
        </p>
        
        {comic.tags && comic.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {comic.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {comic.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{comic.tags.length - 3} more</span>
            )}
          </div>
        )}
        
        <Link 
          href={`/comic/${comic.id}`}
          className="text-blue-500 hover:text-blue-600 font-medium text-sm"
        >
          View Comic →
        </Link>
      </div>
    </div>
  )
}