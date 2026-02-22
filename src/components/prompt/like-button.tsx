'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleLike } from '@/lib/actions/interactions'
import { toast } from 'sonner'

interface LikeButtonProps {
  promptId: string
  initialLiked: boolean
  initialCount: number
  isAuthenticated: boolean
}

export function LikeButton({ promptId, initialLiked, initialCount, isAuthenticated }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isAuthenticated) {
      toast.error('Sign in to like prompts')
      return
    }

    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((prev) => (wasLiked ? prev - 1 : prev + 1))

    startTransition(async () => {
      const result = await toggleLike(promptId)
      if (result?.error) {
        setLiked(wasLiked)
        setCount((prev) => (wasLiked ? prev + 1 : prev - 1))
        toast.error('Something went wrong')
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-1.5"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : ''}`}
      />
      <span className="text-sm">{count}</span>
    </Button>
  )
}
