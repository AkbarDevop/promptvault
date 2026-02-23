import { createClient } from '@/lib/supabase/server'
import type { NotificationType, ProfilePreview } from '@/types/database'

type PromptPreview = { id: string; title: string }

export type NotificationWithRelations = {
  id: string
  type: NotificationType
  is_read: boolean
  read_at: string | null
  created_at: string
  actor: ProfilePreview | null
  prompt: PromptPreview | null
}

export async function getNotifications(
  recipientId: string,
  { page = 0, limit = 20 }: { page?: number; limit?: number } = {}
): Promise<NotificationWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id, type, is_read, read_at, created_at,
      actor:profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url),
      prompt:prompts!notifications_prompt_id_fkey(id, title)
    `)
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (error) return []

  return (data ?? []) as unknown as NotificationWithRelations[]
}

export async function getUnreadNotificationCount(recipientId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .eq('is_read', false)

  if (error) return 0
  return count ?? 0
}
