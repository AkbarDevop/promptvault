import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getFeedPrompts, getUserInteractions } from '@/lib/queries/prompts'
import { PromptGrid } from '@/components/prompt/prompt-grid'
import { FeedTabs } from '@/components/feed/feed-tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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

  // Fetch all prompts up to current page so Server Component can render them
  const prompts = await getFeedPrompts({
    tab,
    category,
    viewerId: userId,
    limit: PAGE_SIZE * (page + 1),
    page: 0,
  })

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
        emptyMessage={
          tab === 'following'
            ? 'No prompts from people you follow yet. Follow more creators to personalize your feed.'
            : 'No prompts yet. Be the first to share one!'
        }
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
