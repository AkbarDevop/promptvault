import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTopCreators } from '@/lib/queries/profiles'
import { getIsFollowing } from '@/lib/queries/profiles'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FollowButton } from '@/components/profile/follow-button'
import { Users } from 'lucide-react'

export const metadata = { title: 'Top Creators — PromptVault' }

export default async function CreatorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const creators = await getTopCreators(20)

  // Check which ones the current user is following
  const followingSet = new Set<string>()
  if (user) {
    await Promise.all(
      creators.map(async (c) => {
        if (c.id !== user.id) {
          const following = await getIsFollowing(user.id, c.id)
          if (following) followingSet.add(c.id)
        }
      })
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Top Creators</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The most followed prompt engineers on PromptVault.
        </p>
      </div>

      {creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium">No creators yet</p>
          <p className="text-sm text-muted-foreground">Be the first to share prompts and build a following.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {creators.map((creator, index) => (
            <div
              key={creator.id}
              className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/30 transition-colors"
            >
              {/* Rank */}
              <span className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground">
                {index + 1}
              </span>

              {/* Avatar + info */}
              <Link href={`/profile/${creator.username}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={creator.avatar_url ?? undefined} />
                  <AvatarFallback className="font-semibold">
                    {(creator.display_name ?? creator.username)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight truncate group-hover:text-primary transition-colors">
                    {creator.display_name ?? creator.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">@{creator.username}</p>
                  {creator.bio && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{creator.bio}</p>
                  )}
                </div>
              </Link>

              {/* Follower count */}
              <div className="shrink-0 text-center hidden sm:block">
                <p className="font-bold text-sm">{creator.follower_count.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">followers</p>
              </div>

              {/* Follow button */}
              {user?.id !== creator.id && (
                <div className="shrink-0">
                  <FollowButton
                    profileId={creator.id}
                    profileUsername={creator.username}
                    initialFollowing={followingSet.has(creator.id)}
                    isAuthenticated={!!user}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
