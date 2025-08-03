'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClientSupabase } from '@/lib/supabase'
import { User } from '@/lib/database.types'

export default function AdminUploadPage() {
  const [title, setTitle] = useState('')
  const [frameCount, setFrameCount] = useState(1)
  const [tags, setTags] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [creators, setCreators] = useState<User[]>([])
  const [selectedCreator, setSelectedCreator] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)
  
  const { user, dbUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientSupabase()

  useEffect(() => {
    if (!authLoading && (!user || dbUser?.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, dbUser, authLoading, router])

  useEffect(() => {
    const fetchCreators = async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
      
      setCreators(data || [])
      if (data && data.length > 0) {
        setSelectedCreator(data[0].id)
      }
    }

    if (dbUser?.role === 'admin') {
      fetchCreators()
    }
  }, [dbUser])

  const fetchDebugInfo = async () => {
    console.log('🔍 AdminUpload: Fetching debug information...')
    try {
      // Get comics count
      const { count: comicsCount, error: comicsError } = await supabase
        .from('comics')
        .select('*', { count: 'exact', head: true })

      // Get recent comics
      const { data: recentComics, error: recentError } = await supabase
        .from('comics')
        .select('id, title, created_at, creator_id')
        .order('created_at', { ascending: false })
        .limit(5)

      // Get storage info
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      // Get comics in storage
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('comics')
        .list('comics', { limit: 10 })

      const debugData = {
        database: {
          comicsCount: comicsError ? `Error: ${comicsError.message}` : comicsCount,
          recentComics: recentError ? `Error: ${recentError.message}` : recentComics,
        },
        storage: {
          buckets: bucketsError ? `Error: ${bucketsError.message}` : buckets,
          comicsFiles: storageError ? `Error: ${storageError.message}` : storageFiles,
        },
        user: {
          currentUser: user?.id,
          dbUser: dbUser,
        },
        timestamp: new Date().toISOString()
      }

      console.log('📊 AdminUpload: Debug info collected:', debugData)
      setDebugInfo(debugData)
    } catch (error) {
      console.error('❌ AdminUpload: Failed to fetch debug info:', error)
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        setError('')
      } else {
        setError('Please select an image file (PNG, JPG, etc.)')
        setSelectedFile(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📤 AdminUpload: Starting upload process...')
    
    if (!selectedFile || !selectedCreator) {
      const errorMsg = 'Please select a file and creator'
      console.error('❌ AdminUpload: Validation failed:', errorMsg)
      setError(errorMsg)
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      console.log('📤 AdminUpload: Preparing file upload...')
      console.log('📝 AdminUpload: File details:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      })
      console.log('📝 AdminUpload: Comic details:', {
        title,
        creator_id: selectedCreator,
        frame_count: frameCount,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      })

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = fileName // Remove the extra "comics/" since we're already uploading to the comics bucket

      console.log('☁️ AdminUpload: Uploading file to storage...')
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('comics')
        .upload(filePath, selectedFile)

      if (uploadError) {
        console.error('❌ AdminUpload: Storage upload failed:', uploadError)
        throw uploadError
      }

      console.log('✅ AdminUpload: File uploaded to storage successfully')
      console.log('📝 AdminUpload: Upload data:', uploadData)

      console.log('🔗 AdminUpload: Getting public URL...')
      const { data: { publicUrl } } = supabase.storage
        .from('comics')
        .getPublicUrl(filePath)

      console.log('✅ AdminUpload: Public URL generated:', publicUrl)

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

      console.log('💾 AdminUpload: Inserting comic record into database...')
      const { error: insertError, data: insertData } = await supabase
        .from('comics')
        .insert({
          title,
          image_url: publicUrl,
          creator_id: selectedCreator,
          frame_count: frameCount,
          tags: tagsArray
        })
        .select()

      if (insertError) {
        console.error('❌ AdminUpload: Database insert failed:', insertError)
        throw insertError
      }

      console.log('✅ AdminUpload: Comic record created successfully!')
      console.log('📝 AdminUpload: Created comic:', insertData)

      // Verify the comic was actually created by fetching it
      console.log('🔍 AdminUpload: Verifying comic creation...')
      const { data: verifyData, error: verifyError } = await supabase
        .from('comics')
        .select('*')
        .eq('image_url', publicUrl)
        .single()

      if (verifyError || !verifyData) {
        console.error('❌ AdminUpload: Failed to verify comic creation:', verifyError)
        throw new Error('Comic upload failed - could not verify creation')
      }

      console.log('✅ AdminUpload: Comic creation verified!')
      console.log('📝 AdminUpload: Verified comic data:', verifyData)

      setSuccess(`Comic "${title}" uploaded successfully! Comic ID: ${verifyData.id}`)
      setTitle('')
      setFrameCount(1)
      setTags('')
      setSelectedFile(null)
      
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      console.log('🎉 AdminUpload: Upload process completed successfully!')

    } catch (err: unknown) {
      console.error('❌ AdminUpload: Upload process failed:', err)
      setError((err as Error).message || 'An error occurred while uploading')
    } finally {
      setUploading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (!user || dbUser?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Upload New Comic</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors"
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
            <button
              onClick={fetchDebugInfo}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Refresh Debug
            </button>
          </div>
        </div>

        {showDebug && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🐛 Debug Information</h3>
            {debugInfo ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700">Database Status:</h4>
                  <p className="text-sm text-gray-600">Total Comics: {debugInfo.database?.comicsCount}</p>
                  {debugInfo.database?.recentComics && Array.isArray(debugInfo.database.recentComics) && (
                    <div>
                      <p className="text-sm text-gray-600">Recent Comics:</p>
                      <ul className="text-xs text-gray-500 ml-4">
                        {debugInfo.database.recentComics.map((comic: any) => (
                          <li key={comic.id}>{comic.title} ({comic.id})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Storage Status:</h4>
                  <p className="text-sm text-gray-600">
                    Buckets: {Array.isArray(debugInfo.storage?.buckets) ? debugInfo.storage.buckets.length : 'Error'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Comics Files: {Array.isArray(debugInfo.storage?.comicsFiles) ? debugInfo.storage.comicsFiles.length : 'Error'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">User Info:</h4>
                  <p className="text-sm text-gray-600">User ID: {debugInfo.user?.currentUser}</p>
                  <p className="text-sm text-gray-600">Role: {debugInfo.user?.dbUser?.role}</p>
                </div>
                <div className="text-xs text-gray-500">
                  Last Updated: {debugInfo.timestamp}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Click "Refresh Debug" to load information</p>
            )}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Comic Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter comic title"
            />
          </div>

          <div>
            <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
              Comic Image
            </label>
            <input
              type="file"
              id="file-input"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div>
            <label htmlFor="creator" className="block text-sm font-medium text-gray-700 mb-2">
              Creator
            </label>
            <select
              id="creator"
              value={selectedCreator}
              onChange={(e) => setSelectedCreator(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a creator</option>
              {creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="frame-count" className="block text-sm font-medium text-gray-700 mb-2">
              Frame Count
            </label>
            <input
              type="number"
              id="frame-count"
              value={frameCount}
              onChange={(e) => setFrameCount(parseInt(e.target.value) || 1)}
              min="1"
              max="50"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              Number of frames for stall/handicapped viewing modes
            </p>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="funny, bathroom, humor (comma-separated)"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile || !selectedCreator}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload Comic'}
          </button>
        </form>
      </div>
    </div>
  )
}