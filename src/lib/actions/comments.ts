'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(promptId: string, content: string): Promise<{ error?: string }> {
  if (!content.trim() || content.trim().length > 500) {
    return { error: 'Comment must be between 1 and 500 characters.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in to comment.' }

  const { error } = await supabase.from('comments').insert({
    prompt_id: promptId,
    user_id: user.id,
    content: content.trim(),
  })

  if (error) return { error: 'Failed to post comment.' }

  revalidatePath(`/prompts/${promptId}`)
  return {}
}

export async function deleteComment(commentId: string, promptId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized.' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to delete comment.' }

  revalidatePath(`/prompts/${promptId}`)
  return {}
}
