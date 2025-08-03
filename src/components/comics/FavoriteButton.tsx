'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClientSupabase } from '@/lib/supabase'

interface FavoriteButtonProps {
  comicId: string
  onRemoveFavorite?: (comicId: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function FavoriteButton({ 
  comicId, 
  onRemoveFavorite,
  size = 'md'
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClientSupabase()

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return
      
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('comic_id', comicId)
        .single()
      
      setIsFavorited(!!data)
    }

    checkFavorite()
  }, [user, comicId])

  const toggleFavorite = async () => {
    if (!user || loading) return
    
    setLoading(true)
    
    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('comic_id', comicId)
        
        setIsFavorited(false)
        onRemoveFavorite?.(comicId)
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, comic_id: comicId })
        
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${
        isFavorited
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
      } transition-colors disabled:opacity-50 font-medium ${sizeClasses[size]}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? '⏳' : (isFavorited ? '♥' : '♡')}
    </button>
  )
}