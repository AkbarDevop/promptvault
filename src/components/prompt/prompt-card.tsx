import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LikeButton } from '@/components/prompt/like-button'
import { BookmarkButton } from '@/components/prompt/bookmark-button'
import { TagBadge } from '@/components/prompt/tag-badge'
import { CopyButton } from '@/components/prompt/copy-button'
import { Lock } from 'lucide-react'
import { CATEGORY_META } from '@/lib/category-icons'
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
  const profile = prompt.profiles
  const categoryMeta = CATEGORY_META[prompt.category as keyof typeof CATEGORY_META]

  return (
    <Card className="flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative group/card cursor-pointer">
      {/* Invisible full-card link — sits behind all interactive elements */}
      <Link href={`/prompts/${prompt.id}`} className="absolute inset-0 z-0" aria-label={prompt.title} />

      <CardHeader className="pb-3">
        {/* Author row — top of card, prominent */}
        <Link
          href={`/profile/${profile.username}`}
          className="flex items-center gap-2.5 group/author relative z-10 mb-3"
        >
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-semibold">
              {(profile.display_name ?? profile.username ?? 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold leading-tight truncate group-hover/author:text-primary transition-colors">
              {profile.display_name ?? profile.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
            </span>
          </div>
        </Link>

        {/* Title + badges */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold leading-snug group-hover/card:text-primary transition-colors line-clamp-2 flex-1">
            {prompt.title}
          </h2>
          <div className="flex shrink-0 gap-1 relative z-10">
            {prompt.is_public === false && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
            {categoryMeta && (
              <Badge variant="secondary" className={`text-xs gap-1 ${categoryMeta.color}`}>
                <categoryMeta.Icon className="h-3 w-3" />
                {categoryMeta.label}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {MODEL_LABELS[prompt.model] ?? prompt.model}
            </Badge>
          </div>
        </div>

        {prompt.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{prompt.description}</p>
        )}
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        <div className="rounded-md bg-muted/50 p-3 relative group/content">
          <p className="text-sm font-mono leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {prompt.content}
          </p>
          <div className="absolute top-1 right-1 opacity-0 group-hover/content:opacity-100 transition-opacity z-10">
            <CopyButton text={prompt.content} />
          </div>
        </div>
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 relative z-10">
            {prompt.tags.slice(0, 4).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-end">
        <div className="flex items-center relative z-10">
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
