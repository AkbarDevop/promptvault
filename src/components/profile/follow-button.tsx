'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from '@/lib/actions/interactions'
import { toast } from 'sonner'

interface FollowButtonProps {
  profileId: string
  profileUsername: string
  initialFollowing: boolean
  isAuthenticated: boolean
}

export function FollowButton({
  profileId,
  profileUsername,
  initialFollowing,
  isAuthenticated,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isAuthenticated) {
      toast.error('Sign in to follow creators')
      return
    }

    const wasFollowing = isFollowing
    setIsFollowing(!wasFollowing)

    startTransition(async () => {
      const result = await toggleFollow(profileId, profileUsername)

      if (result?.error) {
        setIsFollowing(wasFollowing)
        toast.error(result.error)
        return
      }

      toast.success(wasFollowing ? 'Unfollowed' : 'Now following')
    })
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
