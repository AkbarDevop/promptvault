'use client'

import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Trash2, MessageCircle } from 'lucide-react'
import { addComment, deleteComment } from '@/lib/actions/comments'
import type { CommentWithProfile } from '@/lib/queries/comments'

interface CommentSectionProps {
  promptId: string
  initialComments: CommentWithProfile[]
  currentUserId?: string
  isAuthenticated: boolean
}

export function CommentSection({
  promptId,
  initialComments,
  currentUserId,
  isAuthenticated,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    if (!text.trim()) return
    setError('')

    const optimistic: CommentWithProfile = {
      id: `temp-${Date.now()}`,
      content: text.trim(),
      created_at: new Date().toISOString(),
      user_id: currentUserId ?? '',
      profiles: { id: currentUserId ?? '', username: '', display_name: null, avatar_url: null },
    }

    setComments((prev) => [...prev, optimistic])
    const saved = text.trim()
    setText('')

    startTransition(async () => {
      const result = await addComment(promptId, saved)
      if (result.error) {
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
        setError(result.error)
        setText(saved)
      }
    })
  }

  function handleDelete(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
    startTransition(async () => {
      const result = await deleteComment(commentId, promptId)
      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">
          Comments <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        </h3>
      </div>

      {/* Comment list */}
      {comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.profiles.username}`} className="shrink-0">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={comment.profiles.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {(comment.profiles.display_name ?? comment.profiles.username ?? 'U')[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <Link
                    href={`/profile/${comment.profiles.username}`}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {comment.profiles.display_name ?? comment.profiles.username}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
              {currentUserId === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={isPending}
                  className="shrink-0 self-start p-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      )}

      {/* Add comment form */}
      {isAuthenticated ? (
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            maxLength={500}
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
          />
          <div className="flex items-center justify-between">
            {error && <p className="text-xs text-destructive">{error}</p>}
            <span className="text-xs text-muted-foreground ml-auto mr-2">{text.length}/500</span>
            <Button size="sm" onClick={handleSubmit} disabled={!text.trim() || isPending}>
              Post
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">Sign in</Link> to leave a comment.
        </p>
      )}
    </div>
  )
}
