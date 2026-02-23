import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyPrompts, getUserInteractions } from '@/lib/queries/prompts'
import { PromptGrid } from '@/components/prompt/prompt-grid'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const metadata = { title: 'My Prompts — PromptVault' }

export default async function MyPromptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/my-prompts')

  const prompts = await getMyPrompts(user.id)
  const promptIds = prompts.map((p) => p.id)
  const { likes, bookmarks } = await getUserInteractions(user.id, promptIds)

  const publicCount = prompts.filter((p) => p.is_public).length
  const privateCount = prompts.length - publicCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Prompts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {publicCount} public · {privateCount} private
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/prompts/new">
            <Plus className="mr-1 h-4 w-4" />
            New Prompt
          </Link>
        </Button>
      </div>
      <PromptGrid
        prompts={prompts}
        likedIds={likes}
        bookmarkedIds={bookmarks}
        isAuthenticated={true}
        emptyMessage="You haven't created any prompts yet. Share your first one!"
      />
    </div>
  )
}
