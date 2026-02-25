import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getFeedPrompts, getUserInteractions } from '@/lib/queries/prompts'
import { getTopCreators, getFollowing } from '@/lib/queries/profiles'
import { PromptGrid } from '@/components/prompt/prompt-grid'
import { FeedTabs } from '@/components/feed/feed-tabs'
import { FollowButton } from '@/components/profile/follow-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'

export const metadata = { title: 'Feed — PromptVault' }

const PAGE_SIZE = 20

function FeedSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function FollowingSuggestions({ userId }: { userId: string }) {
  const [topCreators, following] = await Promise.all([
    getTopCreators(12),
    getFollowing(userId, 100),
  ])

  const followingIds = new Set(following.map((f) => f.id))
  const suggestions = topCreators
    .filter((c) => c.id !== userId && !followingIds.has(c.id))
    .slice(0, 6)

  if (suggestions.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Suggested creators to follow</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((creator) => (
          <div key={creator.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <Link href={`/profile/${creator.username}`} className="shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={creator.avatar_url ?? undefined} />
                <AvatarFallback className="text-sm font-semibold">
                  {(creator.display_name ?? creator.username ?? 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${creator.username}`} className="hover:text-primary transition-colors">
                <p className="text-sm font-semibold truncate">{creator.display_name ?? creator.username}</p>
                <p className="text-xs text-muted-foreground">
                  {creator.follower_count.toLocaleString()} follower{creator.follower_count !== 1 ? 's' : ''}
                </p>
              </Link>
            </div>
            <FollowButton
              profileId={creator.id}
              profileUsername={creator.username}
              initialFollowing={false}
              isAuthenticated={true}
            />
          </div>
        ))}
      </div>
      <div className="text-center">
        <Button asChild variant="outline" size="sm">
          <Link href="/creators">Browse all creators</Link>
        </Button>
      </div>
    </div>
  )
}

async function FeedContent({
  tab, category, page, userId,
}: {
  tab: 'latest' | 'trending' | 'following'
  category?: string
  page: number
  userId?: string
}) {
  if (tab === 'following' && !userId) {
    return (
      <div className="rounded-lg border p-8 text-center space-y-3">
        <h2 className="text-lg font-semibold">Sign in to see your Following feed</h2>
        <p className="text-sm text-muted-foreground">
          Follow creators you like, then this tab will show their latest prompts.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/login?next=/feed?tab=following">Sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  const prompts = await getFeedPrompts({
    tab,
    category,
    viewerId: userId,
    limit: PAGE_SIZE * (page + 1),
    page: 0,
  })

  // Following tab with no results — show creator suggestions instead of dead-end
  if (tab === 'following' && prompts.length === 0 && userId) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-dashed p-8 text-center space-y-2">
          <h2 className="text-lg font-semibold">Your Following feed is empty</h2>
          <p className="text-sm text-muted-foreground">
            Follow some creators below to see their latest prompts here.
          </p>
        </div>
        <Suspense>
          <FollowingSuggestions userId={userId} />
        </Suspense>
      </div>
    )
  }

  const promptIds = prompts.map((p) => p.id)
  const { likes, bookmarks } = userId
    ? await getUserInteractions(userId, promptIds)
    : { likes: new Set<string>(), bookmarks: new Set<string>() }

  const hasMore = prompts.length === PAGE_SIZE * (page + 1)

  const nextParams = new URLSearchParams({
    tab,
    ...(category ? { category } : {}),
    page: String(page + 1),
  })

  return (
    <div className="space-y-6">
      <PromptGrid
        prompts={prompts}
        likedIds={likes}
        bookmarkedIds={bookmarks}
        isAuthenticated={!!userId}
        emptyMessage="No prompts yet. Be the first to share one!"
      />
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button asChild variant="outline">
            <Link href={`/feed?${nextParams}`}>Load more</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; category?: string; page?: string }>
}) {
  const { tab = 'latest', category, page = '0' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const normalizedTab =
    tab === 'trending' || tab === 'following'
      ? tab
      : 'latest'

  const parsedPage = Number.parseInt(page, 10)
  const safePage = Number.isFinite(parsedPage) && parsedPage >= 0 ? parsedPage : 0

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border border-primary/10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Discover Prompts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Browse the best prompts for Claude, ChatGPT, Gemini &amp; more</p>
          </div>
          <Suspense>
            <FeedTabs isAuthenticated={!!user} />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedContent tab={normalizedTab} category={category} page={safePage} userId={user?.id} />
      </Suspense>
    </div>
  )
}
