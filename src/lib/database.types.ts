export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'admin'
          created_at?: string
        }
      }
      comics: {
        Row: {
          id: string
          title: string
          image_url: string
          creator_id: string
          frame_count: number
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          creator_id: string
          frame_count: number
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          creator_id?: string
          frame_count?: number
          tags?: string[]
          created_at?: string
        }
      }
      favorites: {
        Row: {
          user_id: string
          comic_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          comic_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          comic_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type User = Tables<'users'>
export type Comic = Tables<'comics'>
export type Favorite = Tables<'favorites'>