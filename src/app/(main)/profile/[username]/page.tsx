import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getIsFollowing, getProfileByUsername } from '@/lib/queries/profiles'
import { getUserPrompts, getUserInteractions } from '@/lib/queries/prompts'
import { ProfileHeader } from '@/components/profile/profile-header'
import { PromptGrid } from '@/components/prompt/prompt-grid'
import { Separator } from '@/components/ui/separator'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) return { title: 'User Not Found — PromptVault' }

  return {
    title: `${profile.display_name ?? profile.username} — PromptVault`,
    description: profile.bio ?? `${profile.username}'s prompts on PromptVault`,
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const prompts = await getUserPrompts(profile.id)
  const promptIds = prompts.map((p) => p.id)

  const { likes, bookmarks } = user
    ? await getUserInteractions(user.id, promptIds)
    : { likes: new Set<string>(), bookmarks: new Set<string>() }

  const isOwner = user?.id === profile.id
  const isFollowing =
    user && !isOwner
      ? await getIsFollowing(user.id, profile.id)
      : false

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile}
        promptCount={prompts.length}
        isOwner={isOwner}
        isAuthenticated={!!user}
        isFollowing={isFollowing}
      />
      <Separator />
      <PromptGrid
        prompts={prompts}
        likedIds={likes}
        bookmarkedIds={bookmarks}
        isAuthenticated={!!user}
        emptyMessage="No public prompts yet."
      />
    </div>
  )
}
