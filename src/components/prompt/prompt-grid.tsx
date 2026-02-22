import { PromptCard } from '@/components/prompt/prompt-card'
import { Sparkles } from 'lucide-react'
import type { PromptWithProfile } from '@/types/database'

interface PromptGridProps {
  prompts: PromptWithProfile[]
  likedIds: Set<string>
  bookmarkedIds: Set<string>
  isAuthenticated: boolean
  emptyMessage?: string
}

export function PromptGrid({
  prompts,
  likedIds,
  bookmarkedIds,
  isAuthenticated,
  emptyMessage = 'No prompts found.',
}: PromptGridProps) {
  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <div className="rounded-full bg-muted p-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="font-medium">Nothing here yet</p>
        <p className="text-sm text-muted-foreground max-w-xs">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          isLiked={likedIds.has(prompt.id)}
          isBookmarked={bookmarkedIds.has(prompt.id)}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}
