import { createClient } from '@/lib/supabase/server'
import type { Profile, ProfilePreview } from '@/types/database'

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

export async function getFollowStats(userId: string): Promise<{ followers: number; following: number }> {
  const supabase = await createClient()

  const [followersResult, followingResult] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])

  return {
    followers: followersResult.count ?? 0,
    following: followingResult.count ?? 0,
  }
}

export async function getFollowers(userId: string, limit = 8): Promise<ProfilePreview[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('follows')
    .select('follower:profiles!follows_follower_id_fkey(id, username, display_name, avatar_url)')
    .eq('followed_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const rows = (data ?? []) as Array<{ follower: ProfilePreview | null }>
  return rows.flatMap((row) => (row.follower ? [row.follower] : []))
}

export async function getFollowing(userId: string, limit = 8): Promise<ProfilePreview[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('follows')
    .select('followed:profiles!follows_followed_id_fkey(id, username, display_name, avatar_url)')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const rows = (data ?? []) as Array<{ followed: ProfilePreview | null }>
  return rows.flatMap((row) => (row.followed ? [row.followed] : []))
}
