import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBookmarkedPrompts, getUserInteractions } from '@/lib/queries/prompts'
import { PromptGrid } from '@/components/prompt/prompt-grid'

export const metadata = { title: 'Bookmarks — PromptVault' }

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/bookmarks')

  const prompts = await getBookmarkedPrompts(user.id)
  const promptIds = prompts.map((p) => p.id)
  const { likes, bookmarks } = await getUserInteractions(user.id, promptIds)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <p className="mt-1 text-sm text-muted-foreground">Prompts you&apos;ve saved for later.</p>
      </div>
      <PromptGrid
        prompts={prompts}
        likedIds={likes}
        bookmarkedIds={bookmarks}
        isAuthenticated={true}
        emptyMessage="No bookmarks yet. Browse the feed and save prompts you love."
      />
    </div>
  )
}
