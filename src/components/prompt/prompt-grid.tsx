import { PromptCard } from '@/components/prompt/prompt-card'
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
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
