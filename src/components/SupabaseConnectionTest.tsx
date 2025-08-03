'use client'

import { useEffect, useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [errorDetails, setErrorDetails] = useState<string>('')
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    const testConnection = async () => {
      console.log('🔍 ConnectionTest: Starting simple connection test...')
      
      try {
        const supabase = createClientSupabase()
        
        // Simple timeout test
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection test timed out after 5 seconds')), 5000)
        )
        
        // Only test the most basic connection
        const basicTest = supabase.auth.getSession()
        
        await Promise.race([basicTest, timeout])
        
        console.log('✅ ConnectionTest: Basic connection successful')
        setConnectionStatus('success')
        setTestResults(['✅ Basic Connection: Working'])
        
      } catch (error) {
        console.error('❌ ConnectionTest: Connection failed:', error)
        setConnectionStatus('error')
        setErrorDetails(error instanceof Error ? error.message : 'Unknown error')
        setTestResults(['❌ Connection: Failed'])
      }
    }

    // Delay the test slightly to not block initial render
    const timer = setTimeout(testConnection, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Don't render anything if we're still testing or if successful
  if (connectionStatus === 'testing') {
    return null // Don't show anything while testing
  }

  if (connectionStatus === 'success') {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-800 px-3 py-2 rounded text-sm z-50">
        ✅ Connected
      </div>
    )
  }

  // Only show error state
  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-800 px-3 py-2 rounded max-w-xs text-sm z-50">
      <div className="font-bold">❌ Connection Issue</div>
      <div className="text-xs">{errorDetails}</div>
    </div>
  )
} 