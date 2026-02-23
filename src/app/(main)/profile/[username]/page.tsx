import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  getFollowers,
  getFollowing,
  getFollowStats,
  getIsFollowing,
  getProfileByUsername,
} from '@/lib/queries/profiles'
import { getUserPrompts, getUserInteractions } from '@/lib/queries/prompts'
import { ProfileHeader } from '@/components/profile/profile-header'
import { FollowListSection } from '@/components/profile/follow-list-section'
import { PromptGrid } from '@/components/prompt/prompt-grid'
import { Separator } from '@/components/ui/separator'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) return { title: 'User Not Found — PromptVault' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://promptvaultt.netlify.app'
  const name = profile.display_name ?? profile.username
  const ogUrl = `${siteUrl}/api/og?type=profile&name=${encodeURIComponent(name)}&username=${encodeURIComponent(profile.username)}&followers=${profile.follower_count}`

  return {
    title: `${name} — PromptVault`,
    description: profile.bio ?? `${profile.username}'s prompts on PromptVault`,
    openGraph: {
      title: `${name} on PromptVault`,
      description: profile.bio ?? `Follow ${name} for the best AI prompts`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} on PromptVault`,
      images: [ogUrl],
    },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === profile.id

  const [prompts, followStats, followers, following, isFollowing] = await Promise.all([
    getUserPrompts(profile.id),
    getFollowStats(profile.id),
    getFollowers(profile.id),
    getFollowing(profile.id),
    user && !isOwner ? getIsFollowing(user.id, profile.id) : Promise.resolve(false),
  ])
  const promptIds = prompts.map((p) => p.id)

  const { likes, bookmarks } = user
    ? await getUserInteractions(user.id, promptIds)
    : { likes: new Set<string>(), bookmarks: new Set<string>() }

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile}
        promptCount={prompts.length}
        followerCount={followStats.followers}
        followingCount={followStats.following}
        isOwner={isOwner}
        isAuthenticated={!!user}
        isFollowing={isFollowing}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <FollowListSection
          id="followers"
          title="Followers"
          users={followers}
          count={followStats.followers}
          emptyMessage={`${isOwner ? 'You have' : 'This user has'} no followers yet.`}
        />
        <FollowListSection
          id="following"
          title="Following"
          users={following}
          count={followStats.following}
          emptyMessage={`${isOwner ? 'You are' : 'This user is'} not following anyone yet.`}
        />
      </div>
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
