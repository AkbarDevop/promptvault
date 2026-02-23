import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) return null
  return data as unknown as Profile
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as Profile
}

export async function getIsFollowing(followerId: string, followedId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('follows')
    .select('followed_id')
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
    .single()

  if (error) return false
  return !!data
}
