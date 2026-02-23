'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { markAllNotificationsRead, markNotificationRead } from '@/lib/actions/notifications'

export function MarkNotificationReadButton({ notificationId }: { notificationId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      const result = await markNotificationRead(notificationId)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      router.refresh()
      window.dispatchEvent(new Event('promptvault:notifications-updated'))
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? 'Saving…' : 'Mark read'}
    </Button>
  )
}

export function MarkAllNotificationsReadButton({ disabled }: { disabled: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      const result = await markAllNotificationsRead()

      if (result?.error) {
        toast.error(result.error)
        return
      }

      router.refresh()
      window.dispatchEvent(new Event('promptvault:notifications-updated'))
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || pending}
    >
      {pending ? 'Marking…' : 'Mark all read'}
    </Button>
  )
}
