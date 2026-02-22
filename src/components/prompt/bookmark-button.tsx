'use client'

import { useState, useTransition } from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleBookmark } from '@/lib/actions/interactions'
import { toast } from 'sonner'

interface BookmarkButtonProps {
  promptId: string
  initialBookmarked: boolean
  isAuthenticated: boolean
}

export function BookmarkButton({ promptId, initialBookmarked, isAuthenticated }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isAuthenticated) {
      toast.error('Sign in to bookmark prompts')
      return
    }

    const wasBookmarked = bookmarked
    setBookmarked(!wasBookmarked)

    startTransition(async () => {
      const result = await toggleBookmark(promptId)
      if (result?.error) {
        setBookmarked(wasBookmarked)
        toast.error('Something went wrong')
      } else {
        toast.success(wasBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks')
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      <Bookmark
        className={`h-4 w-4 transition-colors ${bookmarked ? 'fill-primary text-primary' : ''}`}
      />
    </Button>
  )
}
