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

export async function toggleFollow(followedUserId: string, followedUsername: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (user.id === followedUserId) return { error: 'You cannot follow yourself' }

  const { data: existing } = await supabase
    .from('follows')
    .select('followed_id')
    .eq('follower_id', user.id)
    .eq('followed_id', followedUserId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followed_id', followedUserId)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, followed_id: followedUserId })

    if (error) return { error: error.message }
  }

  revalidatePath('/feed')
  revalidatePath(`/profile/${followedUsername}`)
  return { success: true, followed: !existing }
}
