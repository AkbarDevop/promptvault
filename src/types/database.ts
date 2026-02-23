export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AiModel = 'chatgpt' | 'claude' | 'gemini' | 'grok' | 'llama' | 'mistral' | 'other'
export type PromptCategory =
  | 'coding'
  | 'writing'
  | 'marketing'
  | 'design'
  | 'business'
  | 'education'
  | 'productivity'
  | 'creative'
  | 'research'
  | 'other'
export type NotificationType = 'like' | 'follow'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          website_url: string | null
          follower_count: number
          following_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          follower_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          follower_count?: number
          following_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          description: string | null
          model: AiModel
          category: PromptCategory
          tags: string[]
          is_public: boolean
          like_count: number
          bookmark_count: number
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          description?: string | null
          model?: AiModel
          category?: PromptCategory
          tags?: string[]
          is_public?: boolean
          like_count?: number
          bookmark_count?: number
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          description?: string | null
          model?: AiModel
          category?: PromptCategory
          tags?: string[]
          is_public?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prompts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      likes: {
        Row: {
          user_id: string
          prompt_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          prompt_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          prompt_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'likes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'likes_prompt_id_fkey'
            columns: ['prompt_id']
            isOneToOne: false
            referencedRelation: 'prompts'
            referencedColumns: ['id']
          }
        ]
      }
      bookmarks: {
        Row: {
          user_id: string
          prompt_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          prompt_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          prompt_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookmarks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookmarks_prompt_id_fkey'
            columns: ['prompt_id']
            isOneToOne: false
            referencedRelation: 'prompts'
            referencedColumns: ['id']
          }
        ]
      }
      follows: {
        Row: {
          follower_id: string
          followed_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          followed_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          followed_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follows_followed_id_fkey'
            columns: ['followed_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          actor_id: string
          type: NotificationType
          prompt_id: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          actor_id: string
          type: NotificationType
          prompt_id?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          recipient_id?: string
          actor_id?: string
          type?: NotificationType
          prompt_id?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_recipient_id_fkey'
            columns: ['recipient_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_prompt_id_fkey'
            columns: ['prompt_id']
            isOneToOne: false
            referencedRelation: 'prompts'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_view_count: {
        Args: { prompt_id: string }
        Returns: undefined
      }
    }
    Enums: {
      ai_model: AiModel
      prompt_category: PromptCategory
    }
    CompositeTypes: Record<string, never>
  }
}

// Form state type shared by all Server Actions
export type FormState = {
  error?: Record<string, string[] | undefined>
  success?: string
} | undefined

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Prompt = Database['public']['Tables']['prompts']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type ProfilePreview = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>

export type PromptWithProfile = Prompt & {
  profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
}
