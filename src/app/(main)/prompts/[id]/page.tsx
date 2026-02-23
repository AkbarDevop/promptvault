import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { getPromptById, getUserInteractions } from '@/lib/queries/prompts'
import { getComments } from '@/lib/queries/comments'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LikeButton } from '@/components/prompt/like-button'
import { BookmarkButton } from '@/components/prompt/bookmark-button'
import { TagBadge } from '@/components/prompt/tag-badge'
import { DeletePromptButton } from '@/components/prompt/delete-prompt-button'
import { CopyButton } from '@/components/prompt/copy-button'
import { ShareButton } from '@/components/prompt/share-button'
import { PromptVariables } from '@/components/prompt/prompt-variables'
import { CommentSection } from '@/components/prompt/comment-section'
import { ArrowLeft, Pencil, Eye } from 'lucide-react'
import type { Metadata } from 'next'

const MODEL_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  grok: 'Grok',
  llama: 'Llama',
  mistral: 'Mistral',
  other: 'Other',
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const prompt = await getPromptById(id)
  if (!prompt) return { title: 'Prompt Not Found — PromptVault' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://promptvaultt.netlify.app'
  const author = prompt.profiles.display_name ?? prompt.profiles.username
  const ogUrl = `${siteUrl}/api/og?type=prompt&title=${encodeURIComponent(prompt.title)}&author=${encodeURIComponent(author)}&category=${prompt.category}&model=${MODEL_LABELS[prompt.model] ?? prompt.model}`

  return {
    title: `${prompt.title} — PromptVault`,
    description: prompt.description ?? `A ${MODEL_LABELS[prompt.model]} prompt for ${prompt.category}`,
    openGraph: {
      title: prompt.title,
      description: prompt.description ?? `A ${MODEL_LABELS[prompt.model]} prompt by ${author}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: prompt.title,
      images: [ogUrl],
    },
  }
}

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prompt = await getPromptById(id)

  if (!prompt) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ likes, bookmarks }, comments] = await Promise.all([
    user
      ? getUserInteractions(user.id, [prompt.id])
      : Promise.resolve({ likes: new Set<string>(), bookmarks: new Set<string>() }),
    getComments(prompt.id),
  ])

  const isOwner = user?.id === prompt.user_id
  const profile = prompt.profiles
  const hasTips = !!prompt.usage_tips?.trim()
  const hasExampleOutput = !!prompt.example_output?.trim()
  const showRichTabs = hasTips || hasExampleOutput

  // Fire-and-forget — don't block render, don't count owner views
  if (!isOwner) {
    supabase.rpc('increment_view_count', { prompt_id: id }).then(() => {})
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/feed">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-snug">{prompt.title}</h1>
          <div className="flex shrink-0 gap-2">
            {isOwner && (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/prompts/${prompt.id}/edit`}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Link>
                </Button>
                <DeletePromptButton promptId={prompt.id} />
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{MODEL_LABELS[prompt.model] ?? prompt.model}</Badge>
          <Badge variant="secondary">{prompt.category}</Badge>
          {prompt.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>

        <Separator />

        {showRichTabs ? (
          <Tabs defaultValue="prompt" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="prompt">Prompt</TabsTrigger>
              {hasTips && <TabsTrigger value="tips">Usage Tips</TabsTrigger>}
              {hasExampleOutput && <TabsTrigger value="example">Example Output</TabsTrigger>}
            </TabsList>
            <TabsContent value="prompt" className="space-y-4">
              {prompt.description && (
                <p className="text-muted-foreground">{prompt.description}</p>
              )}
              <div className="rounded-lg border bg-muted/30 p-4 relative">
                <div className="absolute top-2 right-2">
                  <CopyButton text={prompt.content} />
                </div>
                <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed pr-20">{prompt.content}</p>
              </div>
            </TabsContent>
            {hasTips && (
              <TabsContent value="tips">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{prompt.usage_tips}</p>
                </div>
              </TabsContent>
            )}
            {hasExampleOutput && (
              <TabsContent value="example">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{prompt.example_output}</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="space-y-4">
            {prompt.description && (
              <p className="text-muted-foreground">{prompt.description}</p>
            )}
            <div className="rounded-lg border bg-muted/30 p-4 relative">
              <div className="absolute top-2 right-2">
                <CopyButton text={prompt.content} />
              </div>
              <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed pr-20">{prompt.content}</p>
            </div>
          </div>
        )}

        <PromptVariables content={prompt.content} />

        <div className="flex items-center justify-between">
          <Link href={`/profile/${profile.username}`} className="flex items-center gap-2 group">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback>
                {(profile.display_name ?? profile.username ?? 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {profile.display_name ?? profile.username}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {prompt.view_count > 0 && (
              <span className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                {prompt.view_count.toLocaleString()}
              </span>
            )}
            <ShareButton promptId={prompt.id} />
            <LikeButton
              promptId={prompt.id}
              initialLiked={likes.has(prompt.id)}
              initialCount={prompt.like_count}
              isAuthenticated={!!user}
            />
            <BookmarkButton
              promptId={prompt.id}
              initialBookmarked={bookmarks.has(prompt.id)}
              isAuthenticated={!!user}
            />
          </div>
        </div>

        <CommentSection
          promptId={prompt.id}
          initialComments={comments}
          currentUserId={user?.id}
          isAuthenticated={!!user}
        />
      </div>
    </div>
  )
}
