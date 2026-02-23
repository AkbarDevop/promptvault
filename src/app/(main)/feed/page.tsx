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
  tab, category, page,
}: {
  tab: string; category?: string; page: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all prompts up to current page so Server Component can render them
  const prompts = await getFeedPrompts({
    tab: tab as 'latest' | 'trending',
    category,
    limit: PAGE_SIZE * (page + 1),
    page: 0,
  })

  const promptIds = prompts.map((p) => p.id)
  const { likes, bookmarks } = user
    ? await getUserInteractions(user.id, promptIds)
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
        isAuthenticated={!!user}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discover Prompts</h1>
        <Suspense>
          <FeedTabs />
        </Suspense>
      </div>
      <Suspense fallback={<FeedSkeleton />}>
        <FeedContent tab={tab} category={category} page={Number(page)} />
      </Suspense>
    </div>
  )
}
