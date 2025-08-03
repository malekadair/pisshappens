'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'
import { createClientSupabase } from '@/lib/supabase'
import { User as DbUser } from '@/lib/database.types'

interface AuthContextType {
  user: User | null
  dbUser: DbUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabase()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          // Don't log the expected "Auth session missing" error
          if (error.message !== 'Auth session missing!') {
            console.error('AuthContext: Error getting user:', error)
          }
        } else {
          setUser(user)
        }
        
        if (user) {
          try {
            const { data: dbUser, error: dbError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (dbError) {
              console.error('AuthContext: Error fetching user data:', dbError)
            } else {
              setDbUser(dbUser)
            }
          } catch (dbError) {
            console.error('AuthContext: Exception fetching user data:', dbError)
          }
        }
      } catch (error) {
        // Don't log the expected "Auth session missing" error
        if (error instanceof Error && error.message !== 'Auth session missing!') {
          console.error('AuthContext: Exception getting user:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const { data: dbUser, error: dbError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (dbError) {
              console.error('AuthContext: Error fetching session user data:', dbError)
            } else {
              setDbUser(dbUser)
            }
          } catch (dbError) {
            console.error('AuthContext: Exception fetching session user data:', dbError)
          }
        } else {
          setDbUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('AuthContext: Sign in error:', error)
        return { error }
      } else {
        return { error: null }
      }
    } catch (error) {
      console.error('AuthContext: Sign in exception:', error)
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        console.error('AuthContext: Sign up error:', error)
        return { error }
      } else {
        return { error: null }
      }
    } catch (error) {
      console.error('AuthContext: Sign up exception:', error)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('AuthContext: Sign out error:', error)
      }
    } catch (error) {
      console.error('AuthContext: Sign out exception:', error)
    }
  }

  const isAdmin = dbUser?.role === 'admin'

  const value = {
    user,
    dbUser,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}