import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables. Please check your .env.local file.')
}

// Only log in development and only once
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase Config: Environment variables loaded')
}

export const createClientSupabase = () => createClientComponentClient<Database>()

export const createAdminSupabase = () => {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable for admin operations.')
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)