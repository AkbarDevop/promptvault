'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleLike(promptId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('likes')
    .select('prompt_id')
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('user_id', user.id).eq('prompt_id', promptId)
  } else {
    await supabase.from('likes').insert({ user_id: user.id, prompt_id: promptId })
  }

  revalidatePath(`/prompts/${promptId}`)
}

export async function toggleBookmark(promptId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('prompt_id')
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)
    .single()

  if (existing) {
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('prompt_id', promptId)
  } else {
    await supabase.from('bookmarks').insert({ user_id: user.id, prompt_id: promptId })
  }

  revalidatePath('/bookmarks')
}
