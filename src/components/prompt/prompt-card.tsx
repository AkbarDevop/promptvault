import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LikeButton } from '@/components/prompt/like-button'
import { BookmarkButton } from '@/components/prompt/bookmark-button'
import { TagBadge } from '@/components/prompt/tag-badge'
import type { PromptWithProfile } from '@/types/database'

const MODEL_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  grok: 'Grok',
  llama: 'Llama',
  mistral: 'Mistral',
  other: 'Other',
}

interface PromptCardProps {
  prompt: PromptWithProfile
  isLiked: boolean
  isBookmarked: boolean
  isAuthenticated: boolean
}

export function PromptCard({ prompt, isLiked, isBookmarked, isAuthenticated }: PromptCardProps) {
  const profile = prompt.profiles as any

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/prompts/${prompt.id}`} className="flex-1 group">
            <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {prompt.title}
            </h2>
          </Link>
          <Badge variant="outline" className="shrink-0 text-xs">
            {MODEL_LABELS[prompt.model] ?? prompt.model}
          </Badge>
        </div>
        {prompt.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{prompt.description}</p>
        )}
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-sm font-mono leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {prompt.content}
          </p>
        </div>
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {prompt.tags.slice(0, 4).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        <Link href={`/profile/${profile.username}`} className="flex items-center gap-2 group">
          <Avatar className="h-6 w-6">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">
              {(profile.display_name ?? profile.username ?? 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {profile.display_name ?? profile.username}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
          </span>
        </Link>

        <div className="flex items-center">
          <LikeButton
            promptId={prompt.id}
            initialLiked={isLiked}
            initialCount={prompt.like_count}
            isAuthenticated={isAuthenticated}
          />
          <BookmarkButton
            promptId={prompt.id}
            initialBookmarked={isBookmarked}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </CardFooter>
    </Card>
  )
}
