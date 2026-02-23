import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { searchPrompts, getUserInteractions } from '@/lib/queries/prompts'
import { PromptGrid } from '@/components/prompt/prompt-grid'
import { ExploreFilters } from '@/components/feed/explore-filters'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Explore — PromptVault' }

const CATEGORIES = [
  'all', 'coding', 'writing', 'marketing', 'design', 'business',
  'education', 'productivity', 'creative', 'research', 'other',
]

function ExploreSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  )
}

async function ExploreResults({ query, category, tag }: { query?: string; category?: string; tag?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const prompts = await searchPrompts(query ?? '', category, tag)
  const promptIds = prompts.map((p) => p.id)

  const { likes, bookmarks } = user
    ? await getUserInteractions(user.id, promptIds)
    : { likes: new Set<string>(), bookmarks: new Set<string>() }

  return (
    <PromptGrid
      prompts={prompts}
      likedIds={likes}
      bookmarkedIds={bookmarks}
      isAuthenticated={!!user}
      emptyMessage="No prompts found. Try a different search or category."
    />
  )
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; tag?: string }>
}) {
  const { q, category, tag } = await searchParams

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search and filter prompts by category, keyword, or tag.
        </p>
      </div>

      <Suspense>
        <ExploreFilters categories={CATEGORIES} currentCategory={category} currentQuery={q ?? tag} />
      </Suspense>

      <Suspense fallback={<ExploreSkeleton />}>
        <ExploreResults query={q} category={category} tag={tag} />
      </Suspense>
    </div>
  )
}
