import { createClient } from '@/lib/supabase/server'
import type { ProfilePreview } from '@/types/database'

export type CommentWithProfile = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: ProfilePreview
}

export async function getComments(promptId: string): Promise<CommentWithProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, profiles!comments_user_id_fkey(id, username, display_name, avatar_url)')
    .eq('prompt_id', promptId)
    .order('created_at', { ascending: true })

  if (error) return []
  return (data ?? []) as unknown as CommentWithProfile[]
}
